// src/screens/ChatbotScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
  Linking, // AÑADIDO: Importar Linking
} from 'react-native';
import * as DocumentPicker from '@react-native-documents/picker'; // CAMBIADO: Importar con *
import { styles } from '../styles/global';
import { apiBilly } from '../services/apiBilly';
import { ChatMessage } from '../types/chat';

// Interfaz extendida para la respuesta de PDF
interface PdfApiResponse {
  success: boolean;
  response?: string;
  analysis?: string;
  preview?: string;
  pages?: number;
  size_kb?: number;
  user_id?: string;
}

const ChatbotScreen: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: Date.now(),
      text: '¡Hola! Soy Billy, tu asistente de investigación académica. Puedo ayudarte a:\n\n' +
            '📄 **Analizar PDFs** - Sube cualquier paper académico\n' +
            '💬 **Chat académico** - Responde preguntas sobre investigación\n' +
            '📚 **Explicar conceptos** - De cualquier área del conocimiento\n\n' +
            '¿En qué puedo ayudarte hoy?', 
      isBot: true, 
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isServerConnected, setIsServerConnected] = useState<boolean | null>(null);
  const [currentPDF, setCurrentPDF] = useState<{
    name: string;
    analysis?: string;
    preview?: string;
    pages?: number;
    size_kb?: number;
  } | null>(null);
  const [uploadingPDF, setUploadingPDF] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    checkServerConnection();
  }, []);

  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const checkServerConnection = async () => {
    try {
      const connected = await apiBilly.checkHealth();
      setIsServerConnected(connected);
      
      if (connected) {
        addMessage('✅ Servidor conectado. ¡Puedes subir PDFs y usar todas las funcionalidades!', true);
      } else {
        addMessage('⚠️ Servidor no disponible. Para analizar PDFs, asegúrate de que el servidor esté corriendo.', true);
      }
    } catch {
      setIsServerConnected(false);
      addMessage('❌ No se pudo conectar con el servidor. Usando modo local.', true);
    }
  };

  const addMessage = (
    text: string, 
    isBot: boolean, 
    type: 'text' | 'pdf' | 'error' | 'pdf_upload' | 'pdf_analysis' = 'text', 
    data?: any
  ) => {
    const newMessage: ChatMessage = {
      id: Date.now() + Math.random(),
      text,
      isBot,
      timestamp: new Date(),
      type,
      data,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const sendMessage = async () => {
    if (inputText.trim() === '') return;
    
    const userMessage = inputText;
    addMessage(userMessage, false);
    setInputText('');
    setIsLoading(true);

    try {
      if (currentPDF) {
        await handlePDFQuestion(userMessage);
      } else {
        await handleNormalChat(userMessage);
      }
    } catch (error: any) {
      addMessage(`❌ Error: ${error.message}`, true, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNormalChat = async (message: string) => {
    if (isServerConnected === false) {
      addMessage('Estoy procesando tu consulta académica. Para analizar PDFs, asegúrate de que el servidor esté corriendo.', true);
      return;
    }

    try {
      const response = await apiBilly.sendMessage(message);
      if (response.success && response.response) {
        addMessage(response.response, true);
      } else {
        addMessage('No recibí una respuesta válida del servidor.', true, 'error');
      }
    } catch (error: any) {
      addMessage(`Error: ${error.message}`, true, 'error');
    }
  };

  const handlePDFQuestion = async (question: string) => {
    if (!currentPDF) {
      addMessage('Primero debes subir un PDF para hacer preguntas sobre él.', true);
      return;
    }

    if (isServerConnected === false) {
      addMessage('Para analizar PDFs, necesito conectarme al servidor. Asegúrate de que esté corriendo.', true);
      return;
    }

    try {
      addMessage(`🤔 Preguntando sobre el PDF: "${question}"...`, true, 'pdf_upload');
      
      const response = await apiBilly.askPDF(question);
      
      if (response.success && response.response) {
        addMessage(`📄 **Respuesta basada en el PDF:**\n\n${response.response}`, true, 'pdf_analysis');
      } else {
        addMessage('No pude analizar el PDF. Asegúrate de que esté bien formateado.', true, 'error');
      }
    } catch (error: any) {
      addMessage(`Error analizando PDF: ${error.message}`, true, 'error');
    }
  };



  const pickPDF = async () => {
    try {
      setUploadingPDF(true);
      
      // En versiones modernas de Android y con el nuevo DocumentPicker,
      // el selector del sistema maneja los permisos automáticamente.
      // No necesitamos solicitar permisos explícitos de almacenamiento.

      // IMPORTANTE: Usar DocumentPicker como objeto
      const [result] = await DocumentPicker.pick({
        type: ['application/pdf'],
        mode: 'open',
      });

      console.log("📄 Archivo seleccionado (nuevo picker):", {
        uri: result.uri,
        name: result.name,
        type: result.type,
        size: result.size,
      });
      
      // Usar uri directamente
      const fileUri = result.uri;
      const fileName = result.name || "documento.pdf";
      
      await uploadPDF(fileUri, fileName);
      
    } catch (error: any) {
      // IMPORTANTE: Manejo de errores diferente
      if (error.code === 'DOCUMENT_PICKER_CANCELED') {
        console.log("Usuario canceló la selección");
      } else if (error.code === 'PERMISSION_DENIED') {
        Alert.alert(
          'Permiso denegado',
          'Necesitas otorgar permisos para acceder a archivos.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Configuración', 
              onPress: () => {
                if (Platform.OS === 'android') {
                  // Abrir configuración de la app en Android
                  Linking.openSettings();
                } else if (Platform.OS === 'ios') {
                  // Para iOS
                  Linking.openURL('app-settings:');
                }
              }
            }
          ]
        );
      } else if (error.code === 'UNSUPPORTED_TYPE') {
        Alert.alert(
          'Formato no soportado',
          'Por favor selecciona solo archivos PDF.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Error',
          'No se pudo seleccionar el archivo: ' + (error.message || 'Error desconocido'),
          [{ text: 'OK' }]
        );
        console.error("❌ Error seleccionando PDF:", error);
      }
    } finally {
      setUploadingPDF(false);
    }
  };

  const uploadPDF = async (fileUri: string, fileName: string) => {
    if (isServerConnected === false) {
      Alert.alert(
        'Servidor no disponible',
        'Para analizar PDFs necesitas:\n\n1. Ejecutar el servidor backend\n2. Asegurar la conexión\n3. Intentar de nuevo'
      );
      return;
    }

    try {
      addMessage(`📤 Subiendo PDF: ${fileName}...`, true, 'pdf_upload');
      
      const response = await apiBilly.uploadPDF(fileUri, fileName) as PdfApiResponse;
      
      if (response.success) {
        setCurrentPDF({
          name: fileName,
          analysis: response.analysis,
          preview: response.preview,
          pages: response.pages,
          size_kb: response.size_kb,
        });
        
        addMessage(
          `✅ **PDF subido exitosamente!**\n\n` +
          `📄 **Archivo:** ${fileName}\n` +
          `📑 **Páginas:** ${response.pages || 'N/A'}\n` +
          `📊 **Tamaño:** ${response.size_kb ? `${response.size_kb} KB` : 'N/A'}\n\n` +
          `💡 Ahora puedes hacer preguntas sobre este documento.`,
          true,
          'pdf'
        );
        
        if (response.analysis) {
          addMessage(`📋 **Análisis inicial del PDF:**\n\n${response.analysis}`, true, 'pdf_analysis');
        }
        
      } else {
        addMessage('Error al subir el PDF. Intenta con otro archivo.', true, 'error');
      }
    } catch (error: any) {
      addMessage(`Error subiendo PDF: ${error.message}`, true, 'error');
    }
  };

  const clearPDF = () => {
    if (currentPDF) {
      Alert.alert(
        'Limpiar PDF actual',
        `¿Quieres eliminar el PDF "${currentPDF.name}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Limpiar', 
            style: 'destructive',
            onPress: () => {
              setCurrentPDF(null);
              addMessage('📄 PDF eliminado. Puedes subir otro documento cuando quieras.', true);
            }
          }
        ]
      );
    } else {
      addMessage('No hay PDF cargado actualmente.', true);
    }
  };

  const showPDFInfo = () => {
    if (currentPDF) {
      Alert.alert(
        '📄 PDF Actual',
        `Archivo: ${currentPDF.name}\n` +
        `Páginas: ${currentPDF.pages || 'N/A'}\n` +
        `Tamaño: ${currentPDF.size_kb ? `${currentPDF.size_kb} KB` : 'N/A'}\n\n` +
        `Puedes hacer preguntas sobre este documento en el chat.`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Sin PDF',
        'No hay PDF cargado actualmente. Usa el botón "📄 PDF" para subir uno.',
        [{ text: 'OK' }]
      );
    }
  };

  const clearChat = () => {
    Alert.alert(
      'Limpiar conversación',
      '¿Estás seguro de que quieres limpiar toda la conversación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Limpiar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await apiBilly.clearHistory();
            } catch {
              // No es crítico si falla
            }
            
            setMessages([
              { 
                id: Date.now(),
                text: '¡Hola! Soy Billy, tu asistente de investigación académica. La conversación ha sido reiniciada.\n\n' +
                      '📄 Puedes subir PDFs usando el botón de abajo.', 
                isBot: true, 
                timestamp: new Date(),
                type: 'text'
              }
            ]);
            setCurrentPDF(null);
          }
        }
      ]
    );
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.screenContainer}>
      <KeyboardAvoidingView 
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.screenScrollContent}>
          {/* Header del Chatbot */}
          <View style={[styles.horizontalLayout, styles.justifyContentBetween, styles.marginBottom20]}>
            <View style={styles.horizontalLayout}>
              <View style={styles.chatbotHeaderIcon}>
                <Text style={styles.chatbotHeaderIconText}>
                  {isServerConnected === true ? '🤖' : '⚠️'}
                </Text>
              </View>
              <View>
                <Text style={styles.chatbotHeaderTitle}>Billy - Asistente Académico</Text>
                <Text style={[
                  styles.chatbotHeaderSubtitle,
                  isServerConnected === true ? styles.textSuccess :
                  isServerConnected === false ? styles.textDanger :
                  styles.text
                ]}>
                  {isServerConnected === true ? 'Conectado' :
                   isServerConnected === false ? 'Sin conexión' :
                   'Conectando...'}
                </Text>
              </View>
            </View>
            
            <View style={styles.horizontalLayout}>
              {currentPDF && (
                <TouchableOpacity 
                  onPress={showPDFInfo}
                  style={[styles.clearChatButton, styles.marginRight10]}
                >
                  <Text style={styles.clearChatButtonText}>📄</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                onPress={clearChat}
                style={styles.clearChatButton}
              >
                <Text style={styles.clearChatButtonText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Indicador de PDF activo */}
          {currentPDF && (
            <View style={[styles.horizontalLayout, styles.marginBottom15, styles.padding10, styles.backgroundColorLightBlue]}>
              <Text style={styles.marginRight10}>📄</Text>
              <View style={styles.flex1}>
                <Text style={[styles.text, styles.fontWeightBold, styles.textSuccess]}>
                  PDF activo: {currentPDF.name}
                </Text>
                <Text style={[styles.textSmall]}>
                  {currentPDF.pages || 'N/A'} páginas • {currentPDF.size_kb ? `${currentPDF.size_kb} KB` : 'N/A'} • Haz preguntas sobre este documento
                </Text>
              </View>
              <TouchableOpacity onPress={clearPDF}>
                <Text style={[styles.textDanger, styles.fontWeightBold]}>✕</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Historial del Chat */}
          <View style={styles.chatHistoryContainer}>
            <ScrollView
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.padding20}
            >
              {messages.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.chatMessageContainer,
                    item.isBot ? styles.chatMessageBotContainer : styles.chatMessageUserContainer
                  ]}
                >
                  <View style={[
                    styles.chatMessageBubble,
                    item.isBot ? styles.chatMessageBotBubble : styles.chatMessageUserBubble,
                  ]}>
                    <Text style={[
                      styles.chatMessageText,
                      item.isBot ? styles.chatMessageBotText : styles.chatMessageUserText,
                    ]}>
                      {item.text}
                    </Text>
                    <Text style={[
                      styles.chatMessageTime,
                      item.isBot ? styles.chatMessageBotTime : styles.chatMessageUserTime,
                    ]}>
                      {formatTime(item.timestamp)}
                    </Text>
                  </View>
                </View>
              ))}
              
              {isLoading && (
                <View style={styles.chatMessageBotContainer}>
                  <View style={styles.chatMessageBotBubble}>
                    <View style={styles.typingIndicator}>
                      <Text style={styles.typingText}>Billy está pensando</Text>
                      <View style={styles.typingDots}>
                        <View style={styles.typingDot} />
                        <View style={styles.typingDot} />
                        <View style={styles.typingDot} />
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>

          {/* Input del Chat */}
          <View style={styles.chatInputContainer}>
            <TextInput
              style={styles.chatInput}
              placeholder={
                currentPDF 
                  ? "Pregunta sobre el PDF o escribe un mensaje..." 
                  : "Escribe tu pregunta académica aquí..."
              }
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
              onSubmitEditing={sendMessage}
              blurOnSubmit={false}
              editable={!isLoading && !uploadingPDF}
              placeholderTextColor="#999"
            />
            
            <TouchableOpacity 
              style={[
                styles.chatSendButton,
                (!inputText.trim() || isLoading || uploadingPDF) && styles.chatSendButtonDisabled
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading || uploadingPDF}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.chatSendButtonText}>➤</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Botón de PDF */}
          <View style={[styles.horizontalLayout, styles.justifyContentCenter, styles.marginTop15, styles.marginBottom10]}>
            <TouchableOpacity 
              style={[
                styles.materiaFilterButton, 
                styles.materiaFilterButtonSelected,
                styles.paddingHorizontal16,
                styles.paddingVertical12,
                styles.widthFull
              ]}
              onPress={pickPDF}
              disabled={uploadingPDF || isLoading}
            >
              {uploadingPDF ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <View style={styles.horizontalLayout}>
                  <Text style={[styles.textWhite, styles.marginRight8]}>📄</Text>
                  <Text style={styles.textWhite}>
                    {currentPDF ? 'Cambiar PDF' : 'Subir PDF'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Nota informativa */}
          <View style={styles.chatInfoContainer}>
            <Text style={styles.chatInfoText}>
              {currentPDF 
                ? `💡 PDF activo: "${currentPDF.name}". Haz preguntas sobre este documento.`
                : '💡 Sube un PDF académico para analizarlo. También puedes hacer preguntas generales.'
              }
              {isServerConnected === false && '\n⚠️ Para PDFs, necesita servidor conectado.'}
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChatbotScreen;
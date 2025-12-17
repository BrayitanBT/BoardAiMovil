// src/screens/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from '../styles/global';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';
import { getMisEntregas } from '../api';
import { HomeScreenProps, User, Entrega } from '../types';
import { useAuth } from '../context/AuthContext';

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [user, setUser] = useState<User | null>(null);
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const { signOut } = useAuth(); 

  useEffect(() => {
    loadUser();
    loadData();
  }, []);

  const loadUser = async (): Promise<void> => {
    const userJson = await AsyncStorage.getItem('user');
    if (userJson) {
      setUser(JSON.parse(userJson));
    }
  };

  const loadData = async (): Promise<void> => {
    setLoading(true);

    // Solo cargar entregas si es estudiante
    if (user?.rol === 'estudiante') {
      const entregasResult = await getMisEntregas();
      if (entregasResult.success && entregasResult.entregas) {
        setEntregas(entregasResult.entregas);
      }
    }
    
    setLoading(false);
  };

  const handleLogout = (): void => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Salir', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
          }
        }
      ]
    );
  };

  const navigateToProfile = (): void => {
    navigation.navigate('Perfil');
  };

  const navigateToChatbot = (): void => {
    navigation.navigate('Chatbot');
  };

  if (loading || !user) {
    return <Loading message="Cargando..." />;
  }

  return (
    <View style={styles.screenContainer}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.screenScrollContent}
      >
        {/* Sección de Bienvenida y Explicación */}
        <Card 
          style={[styles.welcomeCard, styles.marginBottom20]}
        >
          <View style={[styles.horizontalLayout, styles.alignItemsCenter, styles.marginBottom15]}>
            <View style={styles.welcomeIconContainer}>
              <Text style={styles.welcomeIcon}>🚀</Text>
            </View>
            <View>
              <Text style={styles.welcomeTitle}>Bienvenido a Board AI</Text>
              <Text style={styles.welcomeSubtitle}>Tu Classroom Inteligente</Text>
            </View>
          </View>
          
          <Text style={[styles.welcomeDescription, styles.marginBottom15]}>
            Board AI combina la gestión tradicional de clases con inteligencia artificial para revolucionar tu experiencia educativa.
          </Text>
          
          <View style={styles.featuresGrid}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🤖</Text>
              <Text style={styles.featureTitle}>Asistente IA</Text>
              <Text style={styles.featureDescription}>
                Billy te ayuda con dudas y tareas
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📚</Text>
              <Text style={styles.featureTitle}>Gestión Sencilla</Text>
              <Text style={styles.featureDescription}>
                Organiza materias y tareas fácilmente
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📊</Text>
              <Text style={styles.featureTitle}>Seguimiento</Text>
              <Text style={styles.featureDescription}>
                Monitorea tu progreso académico
              </Text>
            </View>
          </View>
        </Card>

        {/* Información del Usuario */}
        <Card 
          style={[styles.userCard, styles.marginBottom20]}
        >
          <View style={[styles.horizontalLayout, styles.alignItemsCenter]}>
            <View style={[
              styles.avatarContainerMedium,
              user.rol === 'profesor' && styles.avatarProfesor
            ]}>
              <Text style={styles.avatarTextMedium}>
                {user.nombre.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userGreeting}>
                Hola, {user.nombre.split(' ')[0]}
              </Text>
              <Text style={styles.userRole}>
                {user.rol === 'estudiante' ? 'Estudiante' : 'Profesor'}
              </Text>
              <Text style={styles.userEmail}>
                {user.email}
              </Text>
            </View>
          </View>
          
          <View style={[styles.horizontalLayout, styles.justifyContentBetween, styles.marginTop15]}>
            <TouchableOpacity 
              onPress={navigateToProfile}
              style={[styles.userActionButton, styles.profileActionButton]}
            >
              <Text style={styles.userActionButtonText}>👤 Perfil</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleLogout}
              style={[styles.userActionButton, styles.logoutActionButton]}
            >
              <Text style={styles.userActionButtonText}>🚪 Salir</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Acciones rápidas */}
        <Card title="📋 Acciones rápidas" style={styles.marginBottom20}>
          <Button
            title="📚 Mis materias"
            onPress={() => navigation.navigate('Materias', { tipo: 'mis-materias' })}
            style={styles.marginBottom10}
          />
          <Button
            title="🔍 Otras materias"
            onPress={() => navigation.navigate('Materias', { tipo: 'todas' })}
            type="secondary"
          />
        </Card>

        {/* Panel del Chatbot */}
        <Card 
          style={[styles.chatbotPreview, styles.marginBottom20]}
          onPress={navigateToChatbot}
        >
          <View style={[styles.horizontalLayout, styles.alignItemsCenter]}>
            <View style={styles.chatbotIconContainer}>
              <Text style={styles.chatbotIcon}>🤖</Text>
            </View>
            <View style={styles.chatbotContent}>
              <Text style={styles.chatbotTitle}>Billy - Tu Asistente IA</Text>
              <Text style={styles.chatbotSubtitle}>
                Haz preguntas, resuelve dudas y mejora tu aprendizaje con inteligencia artificial.
              </Text>
              <View style={[styles.horizontalLayout, styles.marginTop5]}>
                <View style={[styles.chatFeatureBadge, styles.marginRight8]}>
                  <Text style={styles.chatFeatureText}>📝 Respuestas IA</Text>
                </View>
                <View style={styles.chatFeatureBadge}>
                  <Text style={styles.chatFeatureText}>📄 Análisis PDF</Text>
                </View>
              </View>
            </View>
            <Text style={styles.chevronIcon}>›</Text>
          </View>
        </Card>

        {/* Para estudiantes: últimas entregas */}
        {user.rol === 'estudiante' && entregas.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, styles.marginTop20]}>
              📝 Mis últimas entregas
            </Text>
            {entregas.slice(0, 2).map((entrega) => (
              <Card
                key={entrega.id}
                title={entrega.titulo || 'Tarea'}
                description={`Calificación: ${entrega.calificacion || 'Pendiente'}`}
                style={[styles.materiaItem, styles.marginBottom10]}
              />
            ))}
          </>
        )}

        {/* Tips para usar la app */}
        <Card 
          title="💡 Tips para aprovechar Board AI" 
          style={[styles.tipsCard, styles.marginTop20]}
        >
          <View style={[styles.tipItem, styles.marginBottom10]}>
            <Text style={styles.tipNumber}>1.</Text>
            <Text style={[styles.text, styles.tipText]}>
              Usa a Billy para resolver dudas rápidas sobre tus tareas
            </Text>
          </View>
          <View style={[styles.tipItem, styles.marginBottom10]}>
            <Text style={styles.tipNumber}>2.</Text>
            <Text style={[styles.text, styles.tipText]}>
              Sube PDFs de estudio para obtener resúmenes automáticos
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>3.</Text>
            <Text style={[styles.text, styles.tipText]}>
              Revisa tus entregas pendientes regularmente
            </Text>
          </View>
        </Card>

        {/* Footer informativo */}
        <View style={[styles.footerContainer, styles.marginTop20, styles.marginBottom20]}>
          <Text style={[styles.textCenter, styles.textSmall, styles.footerText]}>
            Board AI v1.0 • Educación Inteligente • 2024
          </Text>
          <Text style={[styles.textCenter, styles.textSmall, styles.footerSubtext]}>
            Transformando la educación con inteligencia artificial
          </Text>
        </View>
        
        {/* Espacio al final */}
        <View style={{height: 30}} />
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
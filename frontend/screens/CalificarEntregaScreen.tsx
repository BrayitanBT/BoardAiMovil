// src/screens/CalificarEntregaScreen.tsx (CON ESTILOS GLOBALES)
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from '../styles/global';
import Button from '../components/Button';
import Input from '../components/Input';
import Loading from '../components/Loading';
import { getEntregaById, calificarEntrega } from '../api';
import { CalificarEntregaScreenProps, User, Entrega } from '../types';

const CalificarEntregaScreen: React.FC<CalificarEntregaScreenProps> = ({ route, navigation }) => {
  const { entregaId } = route.params;
  
  const [entrega, setEntrega] = useState<Entrega | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [calificacion, setCalificacion] = useState<string>('');
  const [comentario, setComentario] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    loadUser();
    loadEntrega();
  }, []);

  const loadUser = async (): Promise<void> => {
    const userJson = await AsyncStorage.getItem('user');
    if (userJson) {
      const userData = JSON.parse(userJson);
      setUser(userData);
      
      if (userData.rol !== 'profesor') {
        Alert.alert('Acceso denegado', 'Solo los profesores pueden calificar entregas');
        navigation.goBack();
      }
    }
  };

  const loadEntrega = async (): Promise<void> => {
    setLoading(true);
    const result = await getEntregaById(entregaId);
    
    if (result.success && result.entrega) {
      setEntrega(result.entrega);
      
      if (result.entrega.calificacion) {
        setCalificacion(result.entrega.calificacion.toString());
      }
      if (result.entrega.comentario) {
        setComentario(result.entrega.comentario);
      }
    } else {
      Alert.alert('Error', 'No se pudo cargar la entrega');
      navigation.goBack();
    }
    
    setLoading(false);
  };

  const handleCalificar = async (): Promise<void> => {
    if (!calificacion.trim()) {
      Alert.alert('Error', 'Por favor ingresa una calificación');
      return;
    }

    const calificacionNum = parseInt(calificacion, 10);
    if (isNaN(calificacionNum) || calificacionNum < 0 || calificacionNum > 100) {
      Alert.alert('Error', 'La calificación debe ser un número entre 0 y 100');
      return;
    }

    setSubmitting(true);
    
    const result = await calificarEntrega(entregaId, calificacionNum, comentario);
    
    if (result.success) {
      Alert.alert('Éxito', 'Calificación guardada correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } else {
      Alert.alert('Error', result.message || 'Error al guardar la calificación');
    }
    
    setSubmitting(false);
  };

  if (loading || !entrega || !user) {
    return <Loading message="Cargando..." />;
  }

  return (
    <View style={styles.screenContainer}>
      <ScrollView 
        contentContainerStyle={styles.screenScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado */}
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>Calificar Entrega</Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{entrega.titulo || 'Tarea sin título'}</Text>
          <Text style={[styles.cardText, styles.marginTop5]}>Materia: {entrega.materia_nombre}</Text>
          <Text style={[styles.cardText, styles.marginTop10]}>Estudiante: {entrega.estudiante_nombre || 'Desconocido'}</Text>
        </View>

        <View style={[styles.card, styles.marginTop15]}>
          <Text style={styles.sectionTitle}>Contenido entregado</Text>
          <Text style={[styles.text, styles.marginTop10]}>
            {entrega.contenido || 'No hay contenido escrito'}
          </Text>
        </View>

        <View style={[styles.card, styles.marginTop15]}>
          <Text style={styles.sectionTitle}>Calificación</Text>
          
          <View style={styles.marginTop10}>
            <Input
              label="Calificación (0-100)"
              value={calificacion}
              onChangeText={setCalificacion}
              placeholder="Ingresa la calificación"
              keyboardType="numeric"
              maxLength={3}
            />
          </View>
          
          <View style={styles.marginTop15}>
            <Input
              label="Comentario (opcional)"
              value={comentario}
              onChangeText={setComentario}
              placeholder="Agrega un comentario para el estudiante"
              multiline
              numberOfLines={4}
            />
          </View>
          
          <Button
            title={submitting ? "Guardando..." : "📝 Guardar Calificación"}
            onPress={handleCalificar}
            disabled={submitting}
            style={styles.marginTop20}
          />
        </View>

        <Button
          title="← Cancelar"
          onPress={() => navigation.goBack()}
          type="secondary"
          style={styles.marginTop15}
        />
        
        {/* Espacio al final */}
        <View style={styles.marginTop20} />
      </ScrollView>
    </View>
  );
};

export default CalificarEntregaScreen;
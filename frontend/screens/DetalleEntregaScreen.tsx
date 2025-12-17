// src/screens/DetalleEntregaScreen.tsx (CON ESTILOS GLOBALES EXISTENTES)
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Alert,
  Linking,
  TouchableOpacity 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from '../styles/global';
import Button from '../components/Button';
import Loading from '../components/Loading';
import { getEntregaById } from '../api';
import { DetalleEntregaScreenProps, User, Entrega } from '../types';

const DetalleEntregaScreen: React.FC<DetalleEntregaScreenProps> = ({ route, navigation }) => {
  const { entregaId } = route.params;
  
  const [entrega, setEntrega] = useState<Entrega | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadUser();
    loadEntrega();
  }, []);

  const loadUser = async (): Promise<void> => {
    const userJson = await AsyncStorage.getItem('user');
    if (userJson) {
      setUser(JSON.parse(userJson));
    }
  };

  const loadEntrega = async (): Promise<void> => {
    setLoading(true);
    const result = await getEntregaById(entregaId);
    
    if (result.success && result.entrega) {
      setEntrega(result.entrega);
    } else {
      Alert.alert('Error', 'No se pudo cargar la entrega');
      navigation.goBack();
    }
    
    setLoading(false);
  };

  const handleOpenArchivo = (): void => {
    if (entrega?.archivo_url) {
      Linking.openURL(entrega.archivo_url).catch(err => 
        Alert.alert('Error', 'No se pudo abrir el archivo',err)
      );
    }
  };

  const handleGoToCalificacion = (): void => {
    if (!entrega?.calificacion) {
      navigation.navigate('CalificarEntrega', { entregaId });
    }
  };

  if (loading || !entrega || !user) {
    return <Loading message="Cargando detalles..." />;
  }

  const isProfesor = user.rol === 'profesor';
  const isCalificada = entrega.calificacion !== null && entrega.calificacion !== undefined;

  return (
    <View style={styles.screenContainer}>
      <ScrollView 
        contentContainerStyle={styles.screenScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado */}
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>Detalles de la Entrega</Text>
        </View>
      
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Información de la Tarea</Text>
          <Text style={styles.cardTitle}>{entrega.titulo || 'Tarea sin título'}</Text>
          <Text style={[styles.cardText, styles.marginTop5]}>Materia: {entrega.materia_nombre}</Text>
          
          {isProfesor && (
            <Text style={[styles.cardText, styles.marginTop10]}>
              Estudiante: {entrega.estudiante_nombre || 'Desconocido'}
            </Text>
          )}
          
          <Text style={[styles.cardText, styles.marginTop10]}>
            Fecha de entrega: {new Date(entrega.fecha_entrega).toLocaleDateString()}
          </Text>
        </View>

        <View style={[styles.card, styles.marginTop15]}>
          <Text style={styles.sectionTitle}>Contenido</Text>
          <Text style={[styles.text, styles.marginTop10]}>
            {entrega.contenido || 'No hay contenido escrito'}
          </Text>
        </View>

        {entrega.archivo_url && (
          <View style={[styles.card, styles.marginTop15]}>
            <Text style={styles.sectionTitle}>Archivo Adjunto</Text>
            <TouchableOpacity onPress={handleOpenArchivo} style={styles.marginTop10}>
              <Text style={[styles.text, styles.textPrimary]}>
                📎 Abrir archivo adjunto
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={[styles.card, styles.marginTop15]}>
          <Text style={styles.sectionTitle}>Calificación</Text>
          {isCalificada ? (
            <>
              <View style={[styles.horizontalLayout, styles.marginTop10]}>
                <Text style={styles.text}>Calificación: </Text>
                <Text style={[styles.text, styles.fontWeightBold, styles.textSuccess]}>
                  {entrega.calificacion}/100
                </Text>
              </View>
              {entrega.comentario && (
                <View style={[styles.marginTop10, styles.padding10, styles.backgroundColorLightBlue]}>
                  <Text style={[styles.text, styles.fontWeight600]}>Comentario del profesor:</Text>
                  <Text style={[styles.text, styles.marginTop5]}>
                    "{entrega.comentario}"
                  </Text>
                </View>
              )}
            </>
          ) : (
            <Text style={[styles.text, styles.marginTop10]}>
              {isProfesor 
                ? 'Esta entrega aún no ha sido calificada.' 
                : 'Tu entrega aún no ha sido calificada.'}
            </Text>
          )}
        </View>

        {isProfesor && !isCalificada && (
          <Button
            title="📝 Calificar Entrega"
            onPress={handleGoToCalificacion}
            style={styles.marginTop15}
          />
        )}

        <Button
          title="← Volver"
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

export default DetalleEntregaScreen;
// src/screens/EntregasScreen.tsx (VERSIÓN CON ESTILOS EXISTENTES)
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity
} from 'react-native';
import { styles } from '../styles/global'; 
import { ScreenProps, Entrega, Materia } from '../types'; 
import { getMisEntregas, getMisMaterias, getEntregasTarea } from '../api'; 
import { useAuth } from '../context/AuthContext'; 
import Card from '../components/Card';
import Button from '../components/Button';

// Función helper para asegurar strings
const ensureString = (value: any): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value);
};

const EntregasScreen: React.FC<ScreenProps<'Entregas'>> = ({ navigation, route }) => {
  const { user, loading: authLoading } = useAuth();
  
  const { tareaId } = route.params || {}; 
  
  const isProfesor = user?.rol === 'profesor';

  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedMateriaId, setSelectedMateriaId] = useState<string | null>(null);

  const loadMaterias = useCallback(async () => {
    if (authLoading) return;

    const result = await getMisMaterias();
    if (result.success && result.materias) {
      setMaterias(result.materias);
      
      if (isProfesor && !tareaId && result.materias.length > 0 && selectedMateriaId === null) {
        setSelectedMateriaId(result.materias[0].id.toString());
      }
    } else {
      setError(result.message || 'Error al cargar las materias. ¿Token expirado?');
    }
  }, [isProfesor, authLoading, selectedMateriaId, tareaId]);

  const loadEntregas = useCallback(async () => {
    setLoading(true);
    setError(null);

    let result;

    if (isProfesor) {
      if (tareaId) {
        result = await getEntregasTarea(tareaId);
      } else {
        result = await getMisEntregas(); 
      }
    } else {
      result = await getMisEntregas();
    }

    if (result.success && result.entregas) {
      setEntregas(result.entregas);
    } else {
      setError(result.message || 'Error al cargar las entregas.');
    }
    setLoading(false);
  }, [isProfesor, tareaId]);

  useEffect(() => {
    loadMaterias();
  }, [loadMaterias]);

  useEffect(() => {
    if (!isProfesor || tareaId || (selectedMateriaId !== null && materias.length > 0)) {
      loadEntregas();
    }
  }, [loadEntregas, isProfesor, tareaId, selectedMateriaId, materias.length]);

  const filteredEntregas = entregas.filter(e => {
    if (!selectedMateriaId || tareaId) return true;
    return e.materia_id.toString() === selectedMateriaId;
  });

  const renderHeader = () => {
    const title = isProfesor 
      ? (tareaId ? 'Entregas de Tarea' : 'Entregas Pendientes')
      : 'Mis Entregas';
    
    return (
      <View style={[styles.screenHeader, styles.marginBottom20]}>
        <Text style={styles.screenTitle}>{title}</Text>
        
        {isProfesor && !tareaId && materias.length > 0 && (
          <FlatList
            horizontal
            data={materias}
            keyExtractor={(item) => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            style={styles.marginTop15}
            contentContainerStyle={styles.padding20}
            renderItem={({ item: materia }) => {
              const isSelected = materia.id.toString() === selectedMateriaId;
              
              return (
                <TouchableOpacity
                  key={materia.id}
                  onPress={() => setSelectedMateriaId(materia.id.toString())}
                  style={[
                    styles.materiaFilterButton,
                    isSelected ? styles.materiaFilterButtonSelected : styles.materiaFilterButtonUnselected,
                    styles.marginRight10
                  ]}
                >
                  <Text style={styles.buttonText}>{ensureString(materia.nombre)}</Text>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    );
  };

  const renderEntregaItem = ({ item }: { item: Entrega }) => {
    const isCalificada = item.calificacion !== null && item.calificacion !== undefined;
    
    const getBadgeStyle = () => {
      if (isCalificada) {
        return [styles.badge, styles.badgeSuccess];
      } else if (isProfesor) {
        return [styles.badge, styles.badgeWarning];
      } else {
        return [styles.badge, styles.badgeInfo];
      }
    };

    const getBadgeText = () => {
      if (isCalificada) {
        return `Calificada: ${ensureString(item.calificacion)}`;
      } else if (isProfesor) {
        return 'Pendiente';
      } else {
        return 'Enviada';
      }
    };

    return (
      <Card 
        key={item.id}
        style={[styles.card, styles.marginBottom15]}
        onPress={() => navigation.navigate('DetalleEntrega', { entregaId: item.id })} 
      >
        <View style={[styles.horizontalLayout, styles.justifyContentBetween]}>
          <View style={styles.flex1}>
            <Text style={styles.cardTitle}>{ensureString(item.titulo) || 'Tarea Sin Título'}</Text>
            <View style={styles.marginTop5}>
              <Text style={styles.cardText}>{ensureString(item.materia_nombre)}</Text>
            </View>
          </View>
          <View style={getBadgeStyle()}>
            <Text style={styles.buttonText}>{getBadgeText()}</Text>
          </View>
        </View>
        
        {isProfesor && item.estudiante_nombre && (
          <View style={styles.marginTop10}>
            <Text style={styles.cardText}>
              Estudiante: <Text style={[styles.cardText, styles.fontWeight600]}>{ensureString(item.estudiante_nombre)}</Text>
            </Text>
          </View>
        )}

        <View style={styles.marginTop10}>
          <Text style={[styles.cardText, styles.textDate]}>
            Entregado: {item.fecha_entrega ? new Date(item.fecha_entrega).toLocaleDateString() : 'Fecha no disponible'}
          </Text>
        </View>
        
        {isProfesor && !isCalificada && (
          <View style={styles.marginTop10}>
            <Button 
              title="Calificar" 
              onPress={() => navigation.navigate('CalificarEntrega', { entregaId: item.id })}
              style={styles.smallButton}
            />
          </View>
        )}
      </Card>
    );
  };

  const renderEmptyState = () => {
    return (
      <View style={[styles.centerContainer, styles.padding20, styles.marginTop30]}>
        <Text style={[styles.text, styles.textCenter]}>
          No hay entregas {isProfesor ? 'pendientes de calificar' : 'enviadas'} {selectedMateriaId ? 'para la materia seleccionada.' : '.'}
        </Text>
      </View>
    );
  };

  if (authLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <View style={styles.marginTop10}>
          <Text style={styles.text}>Cargando usuario...</Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <View style={styles.marginTop10}>
          <Text style={styles.text}>Cargando entregas...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.marginBottom20}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
        <Button title="Reintentar" onPress={loadEntregas} />
      </View>
    );
  }

  return (
    <View style={styles.screenContainer}>
      <FlatList
        data={filteredEntregas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderEntregaItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.screenScrollContent, styles.paddingVertical30]}
        ListFooterComponent={<View style={styles.marginTop20} />}
      />
    </View>
  );
};

export default EntregasScreen;
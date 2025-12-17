// src/screens/MateriasScreen.tsx (versión mejorada)
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { styles } from '../styles/global';
import Button from '../components/Button';
import Loading from '../components/Loading';
import { getMaterias, getMisMaterias, inscribirseMateria } from '../api';
import { ScreenProps, Materia } from '../types'; 
import { useAuth } from '../context/AuthContext'; 

type MateriasScreenProps = ScreenProps<'Materias'>;

const MateriasScreen: React.FC<MateriasScreenProps> = ({ route, navigation }) => {
  const { user, loading: authLoading } = useAuth(); 

  const { tipo = 'todas' } = route.params || {};
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [misMaterias, setMisMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = useCallback(async (): Promise<void> => {
    if (authLoading) return;

    setLoading(true);
    
    const misMateriasResult = await getMisMaterias();
    if (misMateriasResult.success && misMateriasResult.materias) {
      setMisMaterias(misMateriasResult.materias);
    } else {
      setMisMaterias([]);
    }

    if (tipo === 'todas') {
      const result = await getMaterias();
      if (result.success && result.materias) {
        const materiasFiltradas = result.materias.filter(m => 
          !misMateriasResult.materias?.some(mm => mm.id === m.id)
        );
        setMaterias(materiasFiltradas);
      } else {
        setMaterias([]);
      }
    } else {
      setMaterias([]); 
    }
    
    setLoading(false);
  }, [tipo, authLoading]); 

  useEffect(() => {
    loadData();
  }, [tipo, loadData]); 

  const handleInscribirse = async (materiaId: number): Promise<void> => {
    const result = await inscribirseMateria(materiaId);
    
    if (result.success) {
      Alert.alert('Éxito', 'Te has inscrito correctamente');
      loadData(); 
    } else {
      Alert.alert('Error', result.message);
    }
  };
  
  const displayList = tipo === 'mis-materias' ? misMaterias : materias;
  
  const puedeCrearMateria = user?.rol === 'profesor' && tipo === 'mis-materias';

  const renderMateria = (materia: Materia, esInscrito: boolean = false): JSX.Element => {
    const puedeVerTareas = esInscrito || (user?.rol === 'profesor' && materia.profesor_id === user?.id);
    
    return (
      <View key={materia.id} style={styles.materiaCard}>
        <Text style={styles.materiaCardTitle}>{materia.nombre}</Text>
        <Text style={styles.materiaCardDescription}>
          {materia.descripcion || 'Sin descripción'}
        </Text>
        <Text style={styles.materiaCardInfo}>
          Profesor: {materia.profesor_nombre || 'Desconocido'}
        </Text>
        
        {/* Badge de estado */}
        <View style={[
          styles.materiaBadge,
          esInscrito ? styles.materiaBadgeInscrito : styles.materiaBadgeNoInscrito
        ]}>
          <Text style={[
            styles.materiaBadgeTexto,
            esInscrito ? styles.materiaBadgeTextoInscrito : styles.materiaBadgeTextoNoInscrito
          ]}>
            {esInscrito ? '✓ Inscrito' : 'Disponible'}
          </Text>
        </View>

        {/* Botones */}
        <View style={styles.materiaButtonsContainer}>
          {tipo === 'todas' && !esInscrito && user?.rol === 'estudiante' ? (
            <>
              <Button
                title="Ver tareas"
                onPress={() => navigation.navigate('Tareas', { materia })} 
                style={[styles.materiaButton, styles.materiaButtonLeft]}
                type="secondary"
                disabled={!puedeVerTareas}
              />
              
              <Button
                title="Inscribirme"
                onPress={() => handleInscribirse(materia.id)}
                style={[styles.materiaButton, styles.materiaButtonRight]}
                type="primary"
              />
            </>
          ) : (
            <Button
              title="Ver tareas y contenido"
              onPress={() => navigation.navigate('Tareas', { materia })} 
              style={[styles.materiaButton, styles.widthFull]}
              type="primary"
              disabled={!puedeVerTareas}
            />
          )}
        </View>
      </View>
    );
  };

  if (authLoading || loading) {
    return <Loading message="Cargando materias..." />;
  }

  return (
    <View style={styles.screenContainer}>
      <ScrollView 
        contentContainerStyle={styles.screenScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.screenHeader, styles.marginBottom20]}>
          <Text style={styles.screenTitle}>
            {tipo === 'mis-materias' ? 'Mis Materias' : 'Todas las Materias'}
          </Text>
          <Text style={styles.screenSubtitle}>
            {tipo === 'mis-materias' 
              ? (user?.rol === 'profesor' 
                ? 'Materias que impartes' 
                : 'Materias en las que estás inscrito') 
              : 'Explora y únete a nuevas materias'
            }
          </Text>
          
          {/* Contador de materias */}
          {displayList.length > 0 && (
            <Text style={[styles.materiasCounter, styles.marginTop10]}>
              {displayList.length} {displayList.length === 1 ? 'materia' : 'materias'} encontrada{displayList.length === 1 ? '' : 's'}
            </Text>
          )}
        </View>
        
        {/* Botón para crear materia (solo para profesores) */}
        {puedeCrearMateria && (
          <View style={[styles.marginBottom20, styles.marginTop10]}>
            <Button
              title="+ Crear Nueva Materia"
              onPress={() => navigation.navigate('CrearMateria')}
              style={[styles.button, styles.widthFull]}
              type="primary"
            />
          </View>
        )}

        {/* Lista de materias o estado vacío */}
        {displayList.length === 0 ? (
          <View style={styles.materiasEmptyState}>
            <Text style={styles.materiasEmptyIcon}>📚</Text>
            <Text style={styles.materiasEmptyText}>
              {tipo === 'mis-materias' 
                ? (user?.rol === 'profesor' 
                  ? 'Aún no has creado ninguna materia.'
                  : 'No estás inscrito en ninguna materia.')
                : 'No hay materias disponibles en este momento.'
              }
            </Text>
            <Text style={styles.materiasEmptySubtext}>
              {tipo === 'mis-materias' && user?.rol === 'profesor' 
                ? 'Crea tu primera materia para empezar a compartir conocimiento.'
                : 'Vuelve más tarde o contacta con un profesor.'
              }
            </Text>
            {tipo === 'mis-materias' && user?.rol === 'profesor' && (
              <Button
                title="Crear mi primera materia"
                onPress={() => navigation.navigate('CrearMateria')}
                style={[styles.button, styles.marginTop20]}
                type="primary"
              />
            )}
          </View>
        ) : (
          <View style={styles.materiasGrid}>
            {displayList.map((materia) => {
              const esInscrito = misMaterias.some(m => m.id === materia.id);
              return renderMateria(materia, esInscrito);
            })}
          </View>
        )}
        
        <View style={styles.marginBottom50} />
      </ScrollView>
    </View>
  );
};

export default MateriasScreen;
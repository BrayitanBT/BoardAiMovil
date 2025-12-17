// src/screens/CrearTareaScreen.tsx (CORREGIDO)
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { styles } from '../styles/global';
import Input from '../components/Input';
import Button from '../components/Button';
import { createTarea, getMisMaterias } from '../api';
import { CrearTareaScreenProps, Materia } from '../types';

const CrearTareaScreen: React.FC<CrearTareaScreenProps> = ({ navigation }) => {
  const [titulo, setTitulo] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [fechaEntrega, setFechaEntrega] = useState<string>('');
  const [materiaId, setMateriaId] = useState<string>('');
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    cargarMisMaterias();
  }, []);

  const cargarMisMaterias = async (): Promise<void> => {
    try {
      const result = await getMisMaterias();
      if (result.success && result.materias && result.materias.length > 0) {
        setMaterias(result.materias);
        setMateriaId(result.materias[0].id.toString());
      } else {
        Alert.alert('Información', 'No tienes materias asignadas');
      }
    } catch (error) {
      console.error('Error al cargar materias:', error);
      Alert.alert('Error', 'No se pudieron cargar las materias');
    }
  };

  const handleCrear = async (): Promise<void> => {
    if (!titulo.trim()) {
      Alert.alert('Error', 'El título de la tarea es requerido');
      return;
    }

    if (!materiaId) {
      Alert.alert('Error', 'Debes seleccionar una materia');
      return;
    }

    setLoading(true);

    try {
      const result = await createTarea({
        materia_id: parseInt(materiaId, 10),
        titulo,
        descripcion: descripcion || undefined,
        fecha_entrega: fechaEntrega || undefined,
      });

      if (result.success) {
        Alert.alert('Éxito', 'Tarea creada correctamente', [
          { 
            text: 'OK', 
            onPress: () => navigation.goBack()
          }
        ]);
      } else {
        Alert.alert('Error', result.message || 'Error al crear la tarea');
      }
    } catch (error) {
      console.error('Error al crear tarea:', error);
      Alert.alert('Error', 'Ocurrió un error al crear la tarea');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView 
        contentContainerStyle={styles.screenScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado */}
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>Crear Nueva Tarea</Text>
          <Text style={styles.screenSubtitle}>Asigna una tarea a tus estudiantes</Text>
        </View>

        <Input
          label="Título de la tarea *"
          value={titulo}
          onChangeText={setTitulo}
          placeholder="Ej: Ejercicios de Álgebra"
          style={styles.marginBottom15}
        />

        {materias.length > 0 ? (
          <View style={[styles.inputContainer, styles.marginBottom15]}>
            <Text style={styles.inputLabel}>Materia *</Text>
            <View style={styles.horizontalLayout}>
              {materias.map((materia) => (
                <Button
                  key={materia.id}
                  title={materia.nombre}
                  onPress={() => setMateriaId(materia.id.toString())}
                  type={materiaId === materia.id.toString() ? 'primary' : 'secondary'}
                  style={[styles.marginRight10, styles.marginBottom10]}
                />
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.marginBottom15}>
            <Text style={styles.text}>Cargando materias...</Text>
          </View>
        )}

        <Input
          label="Descripción (opcional)"
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Instrucciones para la tarea..."
          multiline
          numberOfLines={4}
          style={styles.marginBottom15}
        />

        <Input
          label="Fecha de entrega (opcional)"
          value={fechaEntrega}
          onChangeText={setFechaEntrega}
          placeholder="YYYY-MM-DD HH:MM"
          style={styles.marginBottom20}
        />

        <View style={[styles.horizontalLayout, styles.marginTop20]}>
          <Button
            title="Cancelar"
            onPress={() => navigation.goBack()}
            type="secondary"
            style={[styles.marginRight10, styles.flex1]}
          />
          <Button
            title={loading ? "Creando..." : "Crear Tarea"}
            onPress={handleCrear}
            loading={loading}
            disabled={loading}
            style={[styles.marginLeft10, styles.flex1]}
          />
        </View>
        
        {/* Espacio al final */}
        <View style={styles.marginTop20} />
      </ScrollView>
    </View>
  );
};

export default CrearTareaScreen;
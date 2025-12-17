// src/screens/CrearMateriaScreen.tsx (CORREGIDO)
import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { styles } from '../styles/global';
import Input from '../components/Input';
import Button from '../components/Button';
import { createMateria } from '../api';
import { ScreenProps } from '../types';

const CrearMateriaScreen: React.FC<ScreenProps<'CrearMateria'>> = ({ navigation }) => {
  const [nombre, setNombre] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [codigo, setCodigo] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleCrear = async (): Promise<void> => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre de la materia es requerido');
      return;
    }

    setLoading(true);

    const result = await createMateria({
      nombre,
      descripcion,
      codigo,
    });

    if (result.success) {
      Alert.alert('Éxito', 'Materia creada correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } else {
      Alert.alert('Error', result.message);
    }

    setLoading(false);
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView 
        contentContainerStyle={styles.screenScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado */}
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>Crear Nueva Materia</Text>
          <Text style={styles.screenSubtitle}>Completa los datos de la materia</Text>
        </View>

        <Input
          label="Nombre de la materia *"
          value={nombre}
          onChangeText={setNombre}
          placeholder="Ej: Matemáticas Avanzadas"
          style={styles.marginBottom15} // ✅ Pasa el estilo directamente
        />

        <Input
          label="Código (opcional)"
          value={codigo}
          onChangeText={setCodigo}
          placeholder="Ej: MAT101"
          style={styles.marginBottom15} // ✅ Pasa el estilo directamente
        />

        <Input
          label="Descripción"
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Describe la materia..."
          multiline
          numberOfLines={4}
          style={styles.marginBottom20} // ✅ Pasa el estilo directamente
        />

        <View style={[styles.horizontalLayout, styles.marginTop20]}>
          <Button
            title="Cancelar"
            onPress={() => navigation.goBack()}
            type="secondary"
            style={[styles.marginRight10, styles.flex1]}
          />
          <Button
            title="Crear Materia"
            onPress={handleCrear}
            loading={loading}
            style={[styles.marginLeft10, styles.flex1]}
          />
        </View>
        
        {/* Espacio al final */}
        <View style={styles.marginTop20} />
      </ScrollView>
    </View>
  );
};

export default CrearMateriaScreen;
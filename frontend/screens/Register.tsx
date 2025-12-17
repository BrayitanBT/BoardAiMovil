// screens/Register.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView} from 'react-native';
import { styles } from '../styles/global';
import Input from '../components/Input';
import Button from '../components/Button';
import { registerUser } from '../api';
import { RegisterScreenProps } from '../types';

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [nombre, setNombre] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rol, setRol] = useState<'estudiante' | 'profesor'>('estudiante');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleRegister = async (): Promise<void> => {
    if (!nombre || !email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor ingresa un email válido');
      return;
    }

    // Validación de contraseña
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await registerUser({
        nombre,
        email,
        contrasena: password,
        rol
      });
      
      if (result.success) {
        setSuccess('¡Registro exitoso! Ahora puedes iniciar sesión');
        setTimeout(() => {
          navigation.navigate('Login');
        }, 2000);
      } else {
        setError(result.message || 'Error al registrarse');
      }
    } catch {
      setError('Error de conexión. Por favor intenta de nuevo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Crear Cuenta</Text>
      <Text style={styles.subtitle}>Regístrate como estudiante o profesor</Text>

      {error ? (
        <View style={[styles.card, { backgroundColor: '#ffe6e6' }]}>
          <Text style={[styles.errorText, styles.textCenter]}>{error}</Text>
        </View>
      ) : null}

      {success ? (
        <View style={[styles.card, { backgroundColor: '#e6ffe6' }]}>
          <Text style={[styles.text, { color: '#27ae60', textAlign: 'center' }]}>{success}</Text>
        </View>
      ) : null}

      <Input
        label="Nombre completo"
        value={nombre}
        onChangeText={setNombre}
        placeholder="Juan Pérez"
        autoCapitalize="words"
      />

      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="ejemplo@mail.com"
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Input
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        secureTextEntry
      />

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Rol</Text>
        <View style={[styles.horizontalLayout, styles.justifyContentBetween, styles.marginTop20]}>
          <Button
            title="Estudiante"
            onPress={() => setRol('estudiante')}
            type={rol === 'estudiante' ? 'primary' : 'secondary'}
            style={{ flex: 1, marginRight: 5 }}
          />
          <Button
            title="Profesor"
            onPress={() => setRol('profesor')}
            type={rol === 'profesor' ? 'primary' : 'secondary'}
            style={{ flex: 1, marginLeft: 5 }}
          />
        </View>
      </View>

      <View style={styles.marginVertical10}>
        <Button
          title="Registrarse"
          onPress={handleRegister}
          loading={loading}
          disabled={!!success}
        />
      </View>

      <View style={styles.marginTop20}>
        <Button
          title="Ya tengo cuenta"
          onPress={() => navigation.navigate('Login')}
          type="secondary"
        />
      </View>
    </ScrollView>
  );
};

export default RegisterScreen;
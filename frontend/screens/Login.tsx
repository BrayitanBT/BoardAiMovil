import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { styles } from '../styles/global';
import Input from '../components/Input';
import Button from '../components/Button';
import { loginUser } from '../api'; 
import { LoginScreenProps, User } from '../types';
import { useAuth } from '../context/AuthContext'; 

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { signIn } = useAuth(); 
  
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleLogin = async (): Promise<void> => {
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor ingresa un email válido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const credentials = { email, contrasena: password };
      const result = await loginUser(credentials);
      
      if (result.success && result.token && result.user) {
        await signIn(result.token, result.user as User);
      } else {
        setError(result.message || 'Credenciales incorrectas');
      }
    } catch (err) {
      console.error('Error en login:', err);
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const goToRegister = (): void => {
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.centerContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ width: '100%', maxWidth: 400 }}>
          <Text style={styles.title}>Board Ai</Text>
          <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

          {error ? (
            <View style={[styles.card, { backgroundColor: '#ffe6e6', marginBottom: 16 }]}>
              <Text style={[styles.errorText, styles.textCenter]}>{error}</Text>
            </View>
          ) : null}

          <Input
            label="Email"
            value={email}
            onChangeText={(text: string) => {
              setEmail(text);
              if (error) setError('');
            }}
            placeholder="ejemplo@mail.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!loading}
          />

          <Input
            label="Contraseña"
            value={password}
            onChangeText={(text: string) => {
              setPassword(text);
              if (error) setError('');
            }}
            placeholder="••••••••"
            secureTextEntry
            autoComplete="password"
            editable={!loading}
          />

          <Button
            title={loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={{ marginTop: 8 }}
          />

          <View style={{ marginTop: 24, alignItems: 'center' }}>
            <Text style={[styles.text, { marginBottom: 8 }]}>
              ¿No tienes una cuenta?
            </Text>
            <Button
              title="Crear cuenta nueva"
              onPress={goToRegister}
              type="secondary"
              disabled={loading}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
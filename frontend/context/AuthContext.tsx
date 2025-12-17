// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types'; 
import { logoutUser } from '../api'; 

// 1. Definición de tipos
interface AuthContextType {
  isLoggedIn: boolean;
  loading: boolean;
  user: User | null; 
  token: string | null; 
  signIn: (token: string, userData: User) => void; 
  signOut: () => void;
  updateUserContext: (updatedUser: User) => void; // AÑADIDO
}

// 2. Creación del Contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Definición del Provider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null); 
  const [token, setToken] = useState<string | null>(null); 

  // Carga inicial
  const checkLoginStatus = useCallback(async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      
      if (storedToken && storedUser) {
        const userData: User = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(userData);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (e) {
      console.error("Error al cargar el estado de login:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  // Función para iniciar sesión
  const signIn = async (newToken: string, userData: User) => { 
    try {
      await AsyncStorage.setItem('token', newToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      setToken(newToken);
      setUser(userData);
      setIsLoggedIn(true);
    } catch (e) {
      console.error("Error al guardar la sesión:", e);
    }
  };

  // Función para cerrar sesión
  const signOut = async () => {
    try {
      await logoutUser(); 
      
      setToken(null);
      setUser(null);
      setIsLoggedIn(false); 
    } catch (e) {
      console.error("Error al cerrar sesión:", e);
    }
  };

  // FUNCIÓN NUEVA: Actualizar datos del usuario en el contexto
  const updateUserContext = useCallback(async (updatedUser: User) => {
    try {
      // Actualizar el estado local
      setUser(updatedUser);
      
      // Actualizar en AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      console.log('Usuario actualizado en contexto:', updatedUser);
    } catch (error) {
      console.error('Error al actualizar usuario en contexto:', error);
      throw error;
    }
  }, []);

  const value = {
    isLoggedIn,
    loading,
    user, 
    token, 
    signIn,
    signOut,
    updateUserContext, // AÑADIDO AL VALUE
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. Hook para consumir el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
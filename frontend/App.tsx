// App.tsx (actualizado)
import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { AuthProvider, useAuth } from './context/AuthContext'; 
import { styles, navigationStyles } from './styles/global';
import { RootStackParamList } from './types'; 

import LoginScreen from './screens/Login'; 
import RegisterScreen from './screens/Register';
import HomeScreen from './screens/Home';
import MateriasScreen from './screens/Materias';
import TareasScreen from './screens/Tareas';
import CrearMateriaScreen from './screens/CrearMateria';
import CrearTareaScreen from './screens/CrearTarea';
import EntregasScreen from './screens/Entregas';
import PerfilScreen from './screens/Perfil';
import DetalleEntregaScreen from './screens/DetalleEntregaScreen';
import CalificarEntregaScreen from './screens/CalificarEntregaScreen';
import ChatbotScreen from './screens/ChatbotScreen'; // Añade esta importación

const Stack = createStackNavigator<RootStackParamList>();

const NavigationRoot: React.FC = () => {
  const { isLoggedIn, loading } = useAuth(); 

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator 
      initialRouteName={isLoggedIn ? "Home" : "Login"}
      screenOptions={navigationStyles.screenOptions}
    >
      {!isLoggedIn ? (
        // Usuario NO autenticado
        <>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={navigationStyles.screenOptionsByRoute.Login}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={navigationStyles.screenOptionsByRoute.Register}
          />
        </>
      ) : (
        // Usuario SÍ autenticado
        <>
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={navigationStyles.screenOptionsByRoute.Home}
          />
          
          <Stack.Screen 
            name="Materias" 
            component={MateriasScreen} 
            options={navigationStyles.screenOptionsByRoute.Materias}
          />
          
          <Stack.Screen 
            name="Tareas" 
            component={TareasScreen} 
            options={navigationStyles.screenOptionsByRoute.Tareas}
          />
          
          <Stack.Screen 
            name="CrearMateria" 
            component={CrearMateriaScreen} 
            options={navigationStyles.screenOptionsByRoute.CrearMateria}
          />
          
          <Stack.Screen 
            name="CrearTarea" 
            component={CrearTareaScreen} 
            options={navigationStyles.screenOptionsByRoute.CrearTarea}
          />
          
          <Stack.Screen 
            name="Entregas" 
            component={EntregasScreen} 
            options={navigationStyles.screenOptionsByRoute.Entregas}
          />
          
          <Stack.Screen 
            name="Perfil" 
            component={PerfilScreen} 
            options={navigationStyles.screenOptionsByRoute.Perfil}
          />
          
          <Stack.Screen 
            name="DetalleEntrega" 
            component={DetalleEntregaScreen} 
            options={navigationStyles.screenOptionsByRoute.DetalleEntrega}
          />
          
          <Stack.Screen 
            name="CalificarEntrega" 
            component={CalificarEntregaScreen}
            options={navigationStyles.screenOptionsByRoute.CalificarEntrega}
          />
          
          {/* Nueva pantalla del Chatbot */}
          <Stack.Screen 
            name="Chatbot" 
            component={ChatbotScreen}
            options={navigationStyles.screenOptionsByRoute.Chatbot}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider> 
      <NavigationContainer>
        <NavigationRoot />
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
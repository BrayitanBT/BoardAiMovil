// src/types.ts
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// ============ TIPOS DE DATOS DE RESPUESTA ============

// Tipos de usuario
export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: 'estudiante' | 'profesor';
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}

// Tipos de materia
export interface Materia {
  id: number;
  nombre: string;
  descripcion?: string;
  codigo?: string;
  profesor_id: number;
  profesor_nombre?: string;
}

export interface MateriaResponse {
  success: boolean;
  message?: string;
  materias?: Materia[];
  materia?: Materia;
}

// Tipos de tarea
export interface Tarea {
  id: number;
  materia_id: number;
  titulo: string;
  descripcion?: string;
  fecha_creacion: string;
  fecha_entrega?: string;
  archivo_url?: string;
  materia_nombre?: string;
}

export interface TareaResponse {
  success: boolean;
  message?: string;
  tareas?: Tarea[];
  tarea?: Tarea;
}

// Tipos de entrega
export interface Entrega {
  id: number;
  tarea_id: number;
  estudiante_id: number;
  contenido?: string;
  archivo_url?: string;
  fecha_entrega: string;
  calificacion?: number;
  comentario?: string;
  titulo: string;
  materia_nombre: string;
  materia_id: number;
  estudiante_nombre?: string;
  estudiante_email?: string;
}

export interface EntregaResponse {
  success: boolean;
  message?: string;
  entregas?: Entrega[];
  entrega?: Entrega;
}

// Tipos de comentario
export interface Comentario {
  id: number;
  tarea_id: number;
  usuario_id: number;
  usuario_nombre: string;
  rol: 'estudiante' | 'profesor';
  comentario: string;
  creado_en: string;
}

export interface ComentarioResponse {
  success: boolean;
  message?: string;
  comentarios?: Comentario[];
}

// ============ TIPOS DE DATOS DE SOLICITUD ============

// Auth
export interface LoginCredentials {
  email: string;
  contrasena: string;
}

export interface RegisterData extends LoginCredentials {
  nombre: string;
  rol: 'estudiante' | 'profesor';
}

// Perfil (NUEVOS TIPOS)
export interface UpdateUserData {
  nombre?: string;
  email?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

// Materias
export interface MateriaData {
  nombre: string;
  descripcion?: string;
  codigo?: string;
}

// Tareas
export interface TareaData {
  materia_id: number;
  titulo: string;
  descripcion?: string;
  fecha_entrega?: string;
  archivo_url?: string;
}

// Entregas
export interface EntregaData {
  tarea_id: number;
  contenido?: string;
  archivo_url?: string;
}

// Calificación
export interface CalificacionData {
  calificacion: number;
  comentario?: string;
}

// Comentarios
export interface ComentarioData {
  comentario: string;
}

// ============ PROPS PARA COMPONENTES ============

export interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  type?: 'primary' | 'secondary' | 'danger' | 'outline' | 'text';
  style?: any;
}

export interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: 'email' | 'password' | 'name' | 'tel' | 'off' | string;
  editable?: boolean;
  maxLength?: number;
  style?: any;
}

export interface CardProps {
  title?: string;
  description?: string;
  onPress?: () => void;
  children?: React.ReactNode;
  style?: any;
}

export interface LoadingProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  type?: 'default' | 'fullscreen' | 'inline';
  containerStyle?: any;
  textStyle?: any;
  showSpinner?: boolean;
}

// ============ TIPOS PARA NAVEGACIÓN ============

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Materias: { tipo: 'todas' | 'mis-materias' };
  Tareas: { materia: Materia };
  CrearMateria: undefined;
  CrearTarea: undefined;
  Entregas: { tipo?: 'mis-entregas' | 'pendientes'; tareaId?: number };
  Perfil: undefined;
  DetalleEntrega: { entregaId: number };
  CalificarEntrega: { entregaId: number };
  Chatbot: undefined;
};

// Props para screens
export type ScreenProps<RouteName extends keyof RootStackParamList> = {
  navigation: NativeStackNavigationProp<RootStackParamList, RouteName>;
  route: RouteProp<RootStackParamList, RouteName>;
};

// Tipos específicos para pantallas
export interface LoginScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
}

export interface RegisterScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
}

export type HomeScreenProps = ScreenProps<'Home'>;
export type MateriasScreenProps = ScreenProps<'Materias'>;
export type TareasScreenProps = ScreenProps<'Tareas'>;
export type CrearMateriaScreenProps = ScreenProps<'CrearMateria'>;
export type CrearTareaScreenProps = ScreenProps<'CrearTarea'>;
export type EntregasScreenProps = ScreenProps<'Entregas'>;
export type PerfilScreenProps = ScreenProps<'Perfil'>;
export type DetalleEntregaScreenProps = ScreenProps<'DetalleEntrega'>;
export type CalificarEntregaScreenProps = ScreenProps<'CalificarEntrega'>;

// ============ TIPOS PARA RESPUESTAS ADICIONALES ============
export interface SimpleResponse {
  success: boolean;
  message?: string;
}

export interface IdResponse {
  success: boolean;
  message?: string;
  materiaId?: number;
  tareaId?: number;
  entregaId?: number;
  comentarioId?: number;
}

// ============ TIPOS PARA API RESPONSES ADICIONALES ============
export interface CalificacionResponse {
  success: boolean;
  message?: string;
  calificacion?: number;
  comentario?: string;
}

export interface StatsResponse {
  success: boolean;
  message?: string;
  totalMaterias?: number;
  totalTareas?: number;
  totalEntregas?: number;
  promedioCalificacion?: number;
}

// ============ TIPOS PARA CONTEXT ============
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateUserContext: (updatedUser: User) => void;
}
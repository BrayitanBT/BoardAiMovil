import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  LoginCredentials, 
  RegisterData, 
  User, 
  AuthResponse, 
  MateriaResponse,
  MateriaData,
  TareaData,
  TareaResponse,
  EntregaData,
  EntregaResponse,
  ComentarioData,
  ComentarioResponse,
  SimpleResponse,
  IdResponse
} from './types'; 

// --- CONFIGURACIÓN DE AXIOS ---
const API_URL = 'http://10.0.2.2:3000'; 

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Función central para limpiar el estado de la sesión local
export const logoutUser = async (): Promise<void> => { 
  try {
    // Opcional: Llamada al backend para invalidar el token
    // await api.post('/logout');
  } catch (error) {
    console.warn("Logout API call failed, but clearing local storage.", error);
  }
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
};

// Interceptor 1: Inyectar el token JWT
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor 2: Manejar errores de autenticación (401/403)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    
    if (status === 401 || status === 403) {
      console.warn("Auth Error (401/403) detected. Forcing local logout.");
      await logoutUser(); 
    }
    return Promise.reject(error);
  }
);

// Helper para manejar errores de API
function handleError(error: any): { success: false, message: string } {
  console.error("API Error:", error.response?.data || error.message);
  return { 
    success: false, 
    message: error.response?.data?.message || 'Error de conexión' 
  };
}

// --- FUNCIONES DE AUTENTICACIÓN ---
export const registerUser = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/register', data);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/login', credentials);
    if (response.data.success && response.data.token && response.data.user) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  const userJson = await AsyncStorage.getItem('user');
  return userJson ? JSON.parse(userJson) : null;
};

// --- FUNCIONES DE USUARIO ---
export const updateUser = async (userId: number, data: Partial<User>): Promise<AuthResponse> => {
  try {
    const response = await api.put<AuthResponse>(`/users/${userId}`, data);
    if (response.data.success && response.data.user && response.data.token) {
      // Actualizar el usuario y token en AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      await AsyncStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const changePassword = async (
  userId: number, 
  currentPassword: string, 
  newPassword: string
): Promise<SimpleResponse> => {
  try {
    const response = await api.put<SimpleResponse>(`/users/${userId}/password`, {
      current_password: currentPassword,
      new_password: newPassword
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getUserById = async (id: number): Promise<AuthResponse> => {
  try {
    const response = await api.get<AuthResponse>(`/users/${id}`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// --- FUNCIONES DE MATERIAS ---
export const getMaterias = async (): Promise<MateriaResponse> => {
  try {
    const response = await api.get<MateriaResponse>('/materias');
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getMisMaterias = async (): Promise<MateriaResponse> => {
  try {
    const response = await api.get<MateriaResponse>('/mi/materias');
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getMateriaById = async (id: number): Promise<MateriaResponse> => {
  try {
    const response = await api.get<MateriaResponse>(`/materias/${id}`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const createMateria = async (data: MateriaData): Promise<IdResponse> => {
  try {
    const response = await api.post<IdResponse>('/materias', data);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const updateMateria = async (id: number, data: Partial<MateriaData>): Promise<SimpleResponse> => {
  try {
    const response = await api.put<SimpleResponse>(`/materias/${id}`, data);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const deleteMateria = async (id: number): Promise<SimpleResponse> => {
  try {
    const response = await api.delete<SimpleResponse>(`/materias/${id}`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const inscribirseMateria = async (materia_id: number): Promise<SimpleResponse> => {
  try {
    const response = await api.post<SimpleResponse>('/inscripciones', { materia_id });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const salirMateria = async (materia_id: number): Promise<SimpleResponse> => {
  try {
    const response = await api.delete<SimpleResponse>(`/inscripciones/${materia_id}`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// --- FUNCIONES DE TAREAS ---
export const getTareasByMateria = async (materiaId: number): Promise<TareaResponse> => {
  try {
    const response = await api.get<TareaResponse>(`/materias/${materiaId}/tareas`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getTareas = getTareasByMateria; // Alias para compatibilidad

export const getTareaById = async (id: number): Promise<TareaResponse> => {
  try {
    const response = await api.get<TareaResponse>(`/tareas/${id}`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const createTarea = async (data: TareaData): Promise<IdResponse> => {
  try {
    const response = await api.post<IdResponse>('/tareas', data);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const updateTarea = async (id: number, data: Partial<TareaData>): Promise<SimpleResponse> => {
  try {
    const response = await api.put<SimpleResponse>(`/tareas/${id}`, data);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const eliminarTarea = async (id: number): Promise<SimpleResponse> => {
  try {
    const response = await api.delete<SimpleResponse>(`/tareas/${id}`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const deleteTarea = eliminarTarea; // Alias para compatibilidad

// --- FUNCIONES DE ENTREGAS ---
export const entregarTarea = async (tareaId: number, contenido: string): Promise<SimpleResponse> => {
  try {
    const response = await api.post<SimpleResponse>('/entregas', {
      tarea_id: tareaId,
      contenido: contenido
    });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Error al entregar la tarea'
    };
  }
};

export const createEntrega = async (data: EntregaData): Promise<IdResponse> => {
  try {
    const response = await api.post<IdResponse>('/entregas', data);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getMisEntregas = async (): Promise<EntregaResponse> => {
  try {
    const response = await api.get<EntregaResponse>('/mi/entregas');
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getEntregasTarea = async (tareaId: number): Promise<EntregaResponse> => {
  try {
    const response = await api.get<EntregaResponse>(`/tareas/${tareaId}/entregas`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getEntregaById = async (id: number): Promise<EntregaResponse> => {
  try {
    const response = await api.get<EntregaResponse>(`/entregas/${id}`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const calificarEntrega = async (
  entregaId: number, 
  calificacion: number, 
  comentario: string 
): Promise<SimpleResponse> => {
  try {
    const data = { calificacion, comentario_profesor: comentario };
    const response = await api.put<SimpleResponse>(`/entregas/${entregaId}/calificar`, data);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// --- FUNCIONES DE COMENTARIOS ---
export const getComentariosByTarea = async (tareaId: number): Promise<ComentarioResponse> => {
  try {
    const response = await api.get<ComentarioResponse>(`/tareas/${tareaId}/comentarios`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getComentarios = getComentariosByTarea; // Alias para compatibilidad

export const createComentario = async (
  tareaId: number, 
  data: ComentarioData
): Promise<IdResponse> => {
  try {
    const response = await api.post<IdResponse>(`/tareas/${tareaId}/comentarios`, data);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const eliminarComentario = async (id: number): Promise<SimpleResponse> => {
  try {
    const response = await api.delete<SimpleResponse>(`/comentarios/${id}`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const deleteComentario = eliminarComentario; // Alias para compatibilidad

// --- FUNCIONES ADICIONALES ---
export const getTodasTareas = async (): Promise<TareaResponse> => {
  try {
    const response = await api.get<TareaResponse>('/tareas');
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};
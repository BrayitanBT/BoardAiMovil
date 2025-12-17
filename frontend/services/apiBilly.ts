// src/services/apiBilly.ts
import axios, { AxiosInstance } from 'axios';

// Configuración de la API - IMPORTANTE: Para el emulador de Android
const API_BASE_URL = 'http://10.0.2.2:8000';
// Para iOS Simulator: 'http://localhost:8000'

// Interfaz para los tipos de datos
export interface ApiPaper {
  titulo: string;
  autores: string | string[];
  año: string;
  revista: string;
  resumen: string;
  citacion?: number;
  url?: string;
}

export interface ApiResponse {
  success: boolean;
  response?: string;
  results?: ApiPaper[];
  count?: number;
  analysis?: string;
  citation?: string;
  user_id?: string;
  preview?: string;
  pages?: number;
  size_kb?: number;
}

interface ChatRequest {
  message: string;
  user_id?: string;
  clear_history?: boolean;
}

interface SearchRequest {
  query: string;
  max_results?: number;
}

interface CitationRequest {
  paper_index: number;
}

interface ClearHistoryRequest {
  user_id: string;
}

class ApiBillyService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 60000, // 60 segundos para respuestas largas (especialmente PDFs)
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para logging de requests
    this.client.interceptors.request.use(
      (config) => {
        console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
        if (config.data && !(config.data instanceof FormData)) {
          console.log('📦 Request data:', config.data);
        }
        return config;
      },
      (error) => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
      }
    );

    // Interceptor para logging de responses
    this.client.interceptors.response.use(
      (response) => {
        console.log(`📥 Response ${response.status} from ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('❌ Response error:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        return Promise.reject(error);
      }
    );
  }

  // Verificar conexión con el servidor
  async checkHealth(): Promise<boolean> {
    try {
      console.log('🔍 Checking server health...');
      const response = await this.client.get('/health', { timeout: 10000 });
      const isHealthy = response.data.status === 'healthy';
      console.log(isHealthy ? '✅ Server is healthy' : '⚠️ Server reported issues');
      return isHealthy;
    } catch (error: any) {
      console.error('❌ Server health check failed:', {
        message: error.message,
        code: error.code,
        url: API_BASE_URL
      });
      return false;
    }
  }

  // Chat principal con el asistente
  async sendMessage(
    message: string, 
    userId: string = 'default'
  ): Promise<ApiResponse> {
    try {
      const requestData: ChatRequest = {
        message,
        user_id: userId,
        clear_history: false,
      };

      console.log('💬 Sending chat message:', { message, userId });
      
      const response = await this.client.post<ApiResponse>('/chat', requestData);
      console.log('✅ Chat response received');
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Chat error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      let errorMessage = 'Error al enviar mensaje';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Error de red. Verifica tu conexión.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Tiempo de espera agotado. Intenta nuevamente.';
      }
      
      throw new Error(errorMessage);
    }
  }

  // Buscar papers académicos
  async searchPapers(
    query: string, 
    maxResults: number = 5
  ): Promise<ApiResponse> {
    try {
      const requestData: SearchRequest = {
        query,
        max_results: maxResults,
      };

      console.log('🔍 Searching papers:', { query, maxResults });
      
      const response = await this.client.post<ApiResponse>('/search', requestData);
      console.log('✅ Search response received');
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Search error:', error.response?.data || error.message);
      
      let errorMessage = 'Error al buscar papers';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      throw new Error(errorMessage);
    }
  }

  // Subir y analizar PDF
  async uploadPDF(fileUri: string, fileName: string): Promise<ApiResponse> {
    try {
      console.log('📤 Uploading PDF:', { fileName, fileUri: fileUri.substring(0, 50) + '...' });
      
      // FormData para enviar archivos
      const formData = new FormData();
      
      // Crear objeto file para React Native
      // IMPORTANTE: En React Native, el objeto file debe tener esta estructura
      const file = {
        uri: fileUri,
        type: 'application/pdf',
        name: fileName || 'document.pdf',
      };
      
      formData.append('file', file as any);
      
      const response = await this.client.post<ApiResponse>('/upload-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutos para subir PDFs grandes
      });
      
      console.log('✅ PDF upload successful:', {
        success: response.data.success,
        pages: response.data.pages,
        size_kb: response.data.size_kb,
        hasAnalysis: !!response.data.analysis
      });
      
      return response.data;
    } catch (error: any) {
      console.error('❌ PDF upload error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        fileName
      });
      
      let errorMessage = 'Error al subir PDF';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Error de red al subir PDF. Verifica tu conexión.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'El PDF es demasiado grande o el servidor está tardando demasiado.';
      } else if (error.response?.status === 413) {
        errorMessage = 'El PDF es demasiado grande. Intenta con un archivo más pequeño.';
      } else if (error.response?.status === 415) {
        errorMessage = 'Formato de archivo no soportado. Asegúrate de que sea un PDF válido.';
      }
      
      throw new Error(errorMessage);
    }
  }

  // Generar cita APA
  async generateCitation(paperIndex: number): Promise<ApiResponse> {
    try {
      const requestData: CitationRequest = {
        paper_index: paperIndex,
      };

      console.log('📝 Generating citation for paper:', paperIndex);
      
      const response = await this.client.post<ApiResponse>('/citation', requestData);
      console.log('✅ Citation generated');
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Citation error:', error.response?.data || error.message);
      
      let errorMessage = 'Error al generar cita';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      throw new Error(errorMessage);
    }
  }

  // Preguntar sobre PDF cargado
  async askPDF(question: string): Promise<ApiResponse> {
    try {
      console.log('🤔 Asking PDF question:', question);
      
      const formData = new FormData();
      formData.append('question', question);
      
      const response = await this.client.post<ApiResponse>('/ask-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('✅ PDF question answered');
      
      return response.data;
    } catch (error: any) {
      console.error('❌ PDF question error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        question
      });
      
      let errorMessage = 'Error al hacer pregunta sobre PDF';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message.includes('No PDF loaded')) {
        errorMessage = 'No hay PDF cargado. Primero sube un PDF.';
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Error de red. Verifica tu conexión.';
      }
      
      throw new Error(errorMessage);
    }
  }

  // Limpiar historial de chat
  async clearHistory(userId: string = 'default'): Promise<ApiResponse> {
    try {
      const requestData: ClearHistoryRequest = {
        user_id: userId,
      };

      console.log('🗑️ Clearing chat history for user:', userId);
      
      const response = await this.client.post<ApiResponse>('/clear-history', requestData);
      console.log('✅ Chat history cleared');
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Clear history error:', error.response?.data || error.message);
      
      let errorMessage = 'Error al limpiar historial';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      throw new Error(errorMessage);
    }
  }

  // Método para probar la conexión con más detalles
  async testConnection(): Promise<{
    connected: boolean;
    message: string;
    url: string;
    status?: number;
  }> {
    try {
      console.log('🔄 Testing connection to:', API_BASE_URL);
      const startTime = Date.now();
      
      const response = await this.client.get('/health', { timeout: 10000 });
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      console.log(`✅ Connection successful (${responseTime}ms)`);
      
      return {
        connected: true,
        message: `Conectado al servidor (${responseTime}ms)`,
        url: API_BASE_URL,
        status: response.status
      };
    } catch (error: any) {
      console.error('❌ Connection test failed:', {
        url: API_BASE_URL,
        message: error.message,
        code: error.code
      });
      
      return {
        connected: false,
        message: `No se pudo conectar a ${API_BASE_URL}: ${error.message}`,
        url: API_BASE_URL,
        status: error.response?.status
      };
    }
  }
}

// Exportar una instancia única del servicio
export const apiBilly = new ApiBillyService();
export default apiBilly;
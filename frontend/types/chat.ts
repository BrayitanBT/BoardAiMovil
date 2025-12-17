// src/types/chat.ts
// src/types/chat.ts
export interface ChatMessage {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
  type?: 'text' | 'search' | 'pdf' | 'citation' | 'error'| 'pdf_upload' | 'pdf_analysis';
  data?: any;
}

export interface PaperResult {
  titulo: string;
  autores: string | string[];
  año: string;
  revista: string;
  resumen: string;
  citacion?: number;
  url?: string;
}
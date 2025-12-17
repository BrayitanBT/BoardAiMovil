# IAServer.py - Versión mejorada
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
import uvicorn
import ollama
import fitz  # PyMuPDF
import json
import os
from Buscar_papers import buscar_papers, resumen_paper
from Generar_Citas import generar_cita_apa, generar_bibliografia_apa
from Lector_PDF import crear_analisis

app = FastAPI(
    title="Billy AI - API Académica",
    description="API para asistente académico con IA",
    version="1.0.0"
)

# Modelos Pydantic para validación
class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = "default"
    clear_history: Optional[bool] = False

class SearchRequest(BaseModel):
    query: str
    max_results: Optional[int] = 5

class CitationRequest(BaseModel):
    paper_index: int

# Permitir que tu frontend (React Native) se conecte
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especifica tu dominio
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Almacenamiento en memoria (para producción usa Redis)
chat_histories = {}
ultimo_resultado = []
pdf_actual = None

# Instrucciones del sistema
instrucciones = """
Eres Billy, un asistente experto en investigación académica y científica.

Tus funciones principales:
1. Ayudar a buscar y analizar literatura científica.
2. Generar citas bibliográficas en formato APA.
3. Resumir papers y artículos académicos.
4. Ayudar a estructurar proyectos de investigación.
5. Explicar conceptos científicos de forma clara.

Tono: Amable, educativo y preciso. Siempre cita fuentes cuando sea posible.
"""

def get_user_history(user_id: str = "default"):
    """Obtener historial de usuario"""
    if user_id not in chat_histories:
        chat_histories[user_id] = []
    return chat_histories[user_id]

def add_to_history(user_id: str, role: str, content: str):
    """Agregar mensaje al historial"""
    history = get_user_history(user_id)
    history.append({"role": role, "content": content})
    
    # Limitar historial a 20 mensajes
    if len(history) > 20:
        chat_histories[user_id] = history[-20:]
    
    return history

def clear_user_history(user_id: str):
    """Limpiar historial de usuario"""
    if user_id in chat_histories:
        chat_histories[user_id] = []
    return True

@app.get("/")
async def root():
    """Endpoint raíz"""
    return {
        "service": "Billy AI - API Académica",
        "version": "1.0.0",
        "endpoints": {
            "chat": "/chat (POST)",
            "search": "/search (POST)",
            "upload_pdf": "/upload-pdf (POST)",
            "citation": "/citation (POST)",
            "clear_history": "/clear-history (POST)",
            "health": "/health (GET)"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Probar conexión con Ollama
        test_response = ollama.chat(
            model="gemma3:1b",
            messages=[{"role": "user", "content": "Hola"}],
            stream=False
        )
        
        return {
            "status": "healthy",
            "ollama": "connected",
            "model": "gemma3:1b"
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Ollama connection failed: {str(e)}")

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """Chat principal con el asistente"""
    try:
        user_id = request.user_id
        
        # Limpiar historial si se solicita
        if request.clear_history:
            clear_user_history(user_id)
            return JSONResponse(content={
                "success": True,
                "response": "Historial limpiado. ¿En qué puedo ayudarte ahora?"
            })
        
        # Obtener historial del usuario
        history = get_user_history(user_id)
        
        # Construir mensajes para Ollama
        messages = [{"role": "system", "content": instrucciones}]
        messages.extend(history)
        messages.append({"role": "user", "content": request.message})
        
        # Obtener respuesta
        response = ollama.chat(
            model="gemma3:1b",
            messages=messages,
            stream=False
        )
        
        bot_response = response["message"]["content"]
        
        # Guardar en historial
        add_to_history(user_id, "user", request.message)
        add_to_history(user_id, "assistant", bot_response)
        
        return {
            "success": True,
            "response": bot_response,
            "user_id": user_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en el chat: {str(e)}")

@app.post("/search")
async def search_papers(request: SearchRequest):
    """Buscar papers académicos"""
    try:
        global ultimo_resultado
        
        resultados = buscar_papers(request.query, max_resultados=request.max_results)
        
        if not resultados:
            return {
                "success": True,
                "count": 0,
                "message": f"No se encontraron papers para '{request.query}'",
                "results": []
            }
        
        # Guardar para futuras citas
        ultimo_resultado = resultados
        
        # Generar resumen para análisis
        resumen = resumen_paper(resultados)
        
        # Pedir análisis al modelo
        analisis = ollama.chat(
            model="gemma3:1b",
            messages=[
                {"role": "system", "content": instrucciones},
                {"role": "user", "content": f"Analiza brevemente estos {len(resultados)} papers sobre '{request.query}':\n{resumen}"}
            ]
        )
        
        analysis_text = analisis["message"]["content"]
        
        return {
            "success": True,
            "count": len(resultados),
            "query": request.query,
            "analysis": analysis_text,
            "results": resultados
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en la búsqueda: {str(e)}")

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    """Subir y analizar PDF"""
    global pdf_actual
    
    try:
        # Leer contenido del PDF
        contenido = await file.read()
        
        # Abrir PDF con PyMuPDF
        doc = fitz.open(stream=contenido, filetype="pdf")
        
        texto = ""
        for pagina in doc:
            texto += pagina.get_text()
        
        pdf_actual = {
            "texto": texto,
            "paginas": len(doc),
            "metadata": doc.metadata,
            "filename": file.filename
        }
        
        doc.close()
        
        # Crear prompt para análisis
        prompt = crear_analisis(pdf_actual)
        
        # Analizar con el modelo
        analisis = ollama.chat(
            model="gemma3:1b",
            messages=[
                {"role": "system", "content": instrucciones},
                {"role": "user", "content": "Analiza este documento académico:"},
                {"role": "user", "content": prompt}
            ]
        )
        
        respuesta = analisis["message"]["content"]
        
        return {
            "success": True,
            "filename": file.filename,
            "pages": pdf_actual["paginas"],
            "analysis": respuesta,
            "preview": texto[:500] + "..." if len(texto) > 500 else texto
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al procesar PDF: {str(e)}")

@app.post("/citation")
async def generate_citation(request: CitationRequest):
    """Generar cita APA para un paper"""
    global ultimo_resultado
    
    try:
        if not ultimo_resultado:
            raise HTTPException(status_code=400, detail="Primero debes buscar papers.")
        
        if request.paper_index < 1 or request.paper_index > len(ultimo_resultado):
            raise HTTPException(
                status_code=400, 
                detail=f"Índice inválido. Debe estar entre 1 y {len(ultimo_resultado)}"
            )
        
        paper = ultimo_resultado[request.paper_index - 1]
        cita = generar_cita_apa(paper)
        
        return {
            "success": True,
            "citation": cita,
            "paper_index": request.paper_index,
            "paper_title": paper.get("titulo", "Sin título"),
            "format": "APA 7"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando cita: {str(e)}")

@app.post("/clear-history")
async def clear_history(user_id: str = Form("default")):
    """Limpiar historial de chat"""
    try:
        clear_user_history(user_id)
        return {"success": True, "message": f"Historial de usuario {user_id} limpiado"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error limpiando historial: {str(e)}")

@app.post("/ask-pdf")
async def ask_about_pdf(question: str = Form(...)):
    """Hacer preguntas sobre el PDF cargado"""
    global pdf_actual
    
    try:
        if not pdf_actual:
            raise HTTPException(status_code=400, detail="No hay PDF cargado.")
        
        contexto = f"Contenido del PDF '{pdf_actual['filename']}':\n{pdf_actual['texto'][:4000]}"
        
        response = ollama.chat(
            model="gemma3:1b",
            messages=[
                {"role": "system", "content": instrucciones},
                {"role": "user", "content": contexto},
                {"role": "user", "content": question}
            ]
        )
        
        return {
            "success": True,
            "question": question,
            "response": response["message"]["content"],
            "source": "PDF analysis"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analizando PDF: {str(e)}")

# Iniciar servidor
if __name__ == "__main__":
    uvicorn.run(
        "IAServer:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
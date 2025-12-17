# IAServer.py - VERSIÓN FINAL CORREGIDA
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
import time
import random
from fake_useragent import UserAgent

# Importar módulos
try:
    from Buscar_papers import buscar_papers, resumen_paper, generar_simulados
    from Generar_Citas import generar_cita_apa, generar_bibliografia_apa
    from Lector_PDF import crear_analisis
except ImportError:
    # Si los módulos no existen, crear funciones dummy
    print("⚠️  Módulos no encontrados, creando funciones dummy...")
    
    def buscar_papers(query, max_resultados=5):
        """Función dummy para desarrollo"""
        return generar_simulados(query, max_resultados)
    
    def resumen_paper(resultados):
        return "Datos simulados para desarrollo"
    
    def generar_simulados(query, max_resultados):
        """Genera datos simulados cuando falla Google Scholar"""
        papers = []
        temas = ["machine learning", "deep learning", "inteligencia artificial", "redes neuronales"]
        
        for i in range(max_resultados):
            paper = {
                'titulo': f"{query.capitalize()} en {random.choice(temas)}: Un estudio experimental",
                'autores': [f"Autor {i+1}", f"Investigador {i+2}"],
                'año': str(random.randint(2018, 2024)),
                'revista': f"Journal of {query.capitalize()} Research",
                'resumen': f"Este artículo explora las aplicaciones de {query} en contextos académicos...",
                'citacion': random.randint(5, 150),
                'url': f"https://example.com/paper/{i+1}",
            }
            papers.append(paper)
        
        return papers
    
    def generar_cita_apa(paper):
        return f"{paper['autores'][0]} et al. ({paper['año']}). {paper['titulo']}. {paper['revista']}."
    
    def generar_bibliografia_apa(papers):
        return "\n".join([generar_cita_apa(p) for p in papers])
    
    def crear_analisis(pdf_info):
        return f"PDF con {pdf_info.get('paginas', 0)} páginas analizado."

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

# Permitir CORS para React Native
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Almacenamiento en memoria
chat_histories = {}
ultimo_resultado = []
pdf_actual = None

# Instrucciones del sistema
instrucciones = """
Eres Billy, un asistente experto en investigación académica y científica.
Eres amable, educativo y siempre intentas ayudar con precisión.
Si no sabes algo, lo admites honestamente.
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
    
    # Limitar historial
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
        "status": "running",
        "model": "gemma3:1b",
        "endpoints": {
            "chat": "/chat (POST)",
            "search": "/search (POST)",
            "upload_pdf": "/upload-pdf (POST)",
            "citation": "/citation (POST)",
            "clear_history": "/clear-history (POST)",
            "health": "/health (GET)",
            "ask_pdf": "/ask-pdf (POST)"
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
            "model": "gemma3:1b",
            "timestamp": time.time()
        }
    except Exception as e:
        return {
            "status": "degraded",
            "ollama": "disconnected",
            "error": str(e),
            "timestamp": time.time()
        }

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """Chat principal con el asistente"""
    try:
        user_id = request.user_id
        
        # Limpiar historial si se solicita
        if request.clear_history:
            clear_user_history(user_id)
            return {
                "success": True,
                "response": "✅ Historial limpiado. ¿En qué puedo ayudarte ahora?",
                "user_id": user_id
            }
        
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
        return {
            "success": False,
            "error": f"Error en el chat: {str(e)}",
            "response": "Lo siento, hubo un error procesando tu mensaje. Por favor intenta de nuevo."
        }

@app.post("/search")
async def search_papers(request: SearchRequest):
    """Buscar papers académicos con fallback a simulados"""
    try:
        global ultimo_resultado
        
        print(f"🔍 Buscando: '{request.query}' (max: {request.max_results})")
        
        # Intentar búsqueda real
        resultados = buscar_papers(request.query, max_resultados=request.max_results)
        
        usar_simulados = False
        
        # Si no hay resultados o Google Scholar falló
        if not resultados:
            print("⚠️  No hay resultados, usando datos simulados")
            usar_simulados = True
            # Importar aquí para evitar circular imports
            from Buscar_papers import generar_simulados
            resultados = generar_simulados(request.query, request.max_results)
        
        # Guardar para futuras citas
        ultimo_resultado = resultados
        
        # Generar análisis
        analisis_prompt = f"""
        Se encontraron {len(resultados)} papers sobre "{request.query}".
        
        {'⚠️  NOTA: Se están usando datos simulados porque Google Scholar no está disponible.' if usar_simulados else ''}
        
        Por favor, da un breve análisis educativo sobre estos hallazgos.
        Incluye posibles aplicaciones prácticas y áreas de investigación futura.
        """
        
        response = ollama.chat(
            model="gemma3:1b",
            messages=[
                {"role": "system", "content": instrucciones},
                {"role": "user", "content": analisis_prompt}
            ],
            stream=False
        )
        
        analysis_text = response["message"]["content"]
        
        return {
            "success": True,
            "count": len(resultados),
            "query": request.query,
            "analysis": analysis_text,
            "results": resultados,
            "simulated": usar_simulados,
            "message": "⚠️ Datos simulados" if usar_simulados else "✅ Búsqueda completada"
        }
        
    except Exception as e:
        print(f"❌ Error en búsqueda: {e}")
        return {
            "success": False,
            "error": str(e),
            "count": 0,
            "results": [],
            "analysis": f"No se pudo completar la búsqueda: {str(e)}"
        }

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    """Subir y analizar PDF"""
    global pdf_actual
    
    try:
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Solo se aceptan archivos PDF")
        
        # Leer contenido del PDF
        contenido = await file.read()
        
        # Guardar temporalmente
        temp_path = f"temp_{file.filename}"
        with open(temp_path, "wb") as f:
            f.write(contenido)
        
        # Analizar PDF
        try:
            doc = fitz.open(temp_path)
            
            texto = ""
            for pagina in doc:
                texto += pagina.get_text()
            
            pdf_actual = {
                "texto": texto,
                "paginas": len(doc),
                "metadata": doc.metadata,
                "filename": file.filename,
                "size": len(contenido)
            }
            
            doc.close()
            
            # Eliminar archivo temporal
            os.remove(temp_path)
            
            # Crear análisis
            from Lector_PDF import crear_analisis
            prompt_analisis = crear_analisis(pdf_actual)
            
            # Analizar con IA
            analisis = ollama.chat(
                model="gemma3:1b",
                messages=[
                    {"role": "system", "content": instrucciones},
                    {"role": "user", "content": prompt_analisis}
                ],
                stream=False
            )
            
            respuesta = analisis["message"]["content"]
            
            return {
                "success": True,
                "filename": file.filename,
                "pages": pdf_actual["paginas"],
                "analysis": respuesta,
                "preview": texto[:300] + "..." if len(texto) > 300 else texto,
                "size_kb": len(contenido) // 1024
            }
            
        except Exception as e:
            # Limpiar en caso de error
            if os.path.exists(temp_path):
                os.remove(temp_path)
            raise e
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al procesar PDF: {str(e)}")

@app.post("/citation")
async def generate_citation(request: CitationRequest):
    """Generar cita APA para un paper"""
    global ultimo_resultado
    
    try:
        if not ultimo_resultado:
            return {
                "success": False,
                "error": "Primero debes buscar papers usando /search",
                "citation": None
            }
        
        if request.paper_index < 1 or request.paper_index > len(ultimo_resultado):
            return {
                "success": False,
                "error": f"Índice inválido. Debe estar entre 1 y {len(ultimo_resultado)}",
                "citation": None
            }
        
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
        return {
            "success": False,
            "error": f"Error generando cita: {str(e)}",
            "citation": None
        }

@app.post("/clear-history")
async def clear_history(user_id: str = Form("default")):
    """Limpiar historial de chat"""
    try:
        clear_user_history(user_id)
        return {
            "success": True, 
            "message": f"✅ Historial de usuario '{user_id}' limpiado"
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Error limpiando historial: {str(e)}"
        }

@app.post("/ask-pdf")
async def ask_about_pdf(question: str = Form(...)):
    """Hacer preguntas sobre el PDF cargado"""
    global pdf_actual
    
    try:
        if not pdf_actual:
            return {
                "success": False,
                "error": "No hay PDF cargado. Primero sube un PDF usando /upload-pdf",
                "response": None
            }
        
        # Limitar el contexto para no saturar la memoria
        contexto = f"Contenido del PDF '{pdf_actual['filename']}' ({pdf_actual['paginas']} páginas):\n"
        contexto += pdf_actual['texto'][:3000]  # Limitar a 3000 caracteres
        
        response = ollama.chat(
            model="gemma3:1b",
            messages=[
                {"role": "system", "content": instrucciones},
                {"role": "user", "content": contexto},
                {"role": "user", "content": f"Pregunta sobre el PDF: {question}"}
            ],
            stream=False
        )
        
        return {
            "success": True,
            "question": question,
            "response": response["message"]["content"],
            "source": "PDF analysis"
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Error analizando PDF: {str(e)}",
            "response": None
        }

# Endpoint para obtener bibliografía
@app.get("/bibliography")
async def get_bibliography():
    """Obtener bibliografía completa de los últimos papers buscados"""
    global ultimo_resultado
    
    try:
        if not ultimo_resultado:
            return {
                "success": False,
                "error": "No hay papers disponibles. Primero busca papers.",
                "bibliography": None
            }
        
        bibliografia = generar_bibliografia_apa(ultimo_resultado)
        
        return {
            "success": True,
            "count": len(ultimo_resultado),
            "bibliography": bibliografia,
            "format": "APA 7"
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Error generando bibliografía: {str(e)}",
            "bibliography": None
        }

if __name__ == "__main__":
    print("🚀 Iniciando servidor Billy AI...")
    print("📚 Modelo: gemma3:1b")
    print("🌐 URL: http://0.0.0.0:8000")
    print("📄 Documentación: http://0.0.0.0:8000/docs")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
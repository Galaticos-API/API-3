from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from api.routes import database, etl, data

# Instância da aplicação
app = FastAPI(
    title="API - Crédito Inclusivo",
    description="Serviço Backend Python para processamento ETL e DB",
    version="1.0.0"
)

# =========================================================
# CORS Configuração 
# =========================================================
origens_permitidas = [
    "http://localhost:5173", # Porta padrão do Vite (React)
    "http://localhost:3000", # Porta clássica do React e Next.js
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origens_permitidas,
    allow_credentials=True,
    allow_methods=["*"],  # Autoriza todos os métodos (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],  # Autoriza envio de Content-Type e Authorization headers
)

# Roteadores
app.include_router(database.router)
app.include_router(etl.router)
app.include_router(data.router)

# =========================================================
# GLOBAL EXCEPTION HANDLER (Ocultar Stack Trace)
# =========================================================
# Configuração de Logger para erro interno
logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Oculta o stack trace da resposta e logs somente no servidor, sem vazar
    dados sensíveis do backend ao mundo exteno.
    """
    # Exibe o log no terminal para debugging do desenvolvedor
    logger.error(f"Stack Trace de Erro Interno: {exc}", exc_info=True)
    
    # Retorna uma mensagem amigável para a API
    return JSONResponse(
        status_code=500,
        content={"detail": "Erro interno do servidor. Por favor, tente novamente mais tarde."},
    )

@app.get("/")
def home():
    return {"message": "Bem-vindo à API do Crédito Inclusivo - Segurança aprimorada."}

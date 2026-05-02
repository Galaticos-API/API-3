from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import graficos, etl

app = FastAPI(
    title="API — Crédito Inclusivo",
    description="Backend para orquestração ETL, banco SQLite e endpoints de visualização.",
    version="1.0.0",
)

# ─── CORS ────────────────────────────────────────────────────────────────────
# Aceita requisições do frontend em dev (Vite :5173) e em prod (Docker :80)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:80", "http://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Roteadores ──────────────────────────────────────────────────────────────
app.include_router(graficos.router, prefix="/api/v1/graficos", tags=["Gráficos Prontos"])
app.include_router(etl.router,      prefix="/api/v1/etl",      tags=["ETL"])


@app.get("/", tags=["Root"])
def read_root():
    return {
        "message": "API do Mapa de Crédito Inclusivo — v1",
        "docs": "/docs",
        "prefixo": "/api/v1",
    }

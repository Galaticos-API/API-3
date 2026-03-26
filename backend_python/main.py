from fastapi import FastAPI
from api.routes import database, etl

app = FastAPI(
    title="API - Crédito Inclusivo",
    description="Backend estruturado para realizar orquestração de rotinas ETL e Bancos de Dados SQLite.",
    version="1.0.0"
)

# Adicionando os roteadores na aplicação global
app.include_router(database.router, prefix="/api/database", tags=["Database"])
app.include_router(etl.router, prefix="/api/etl", tags=["ETL"])

@app.get("/")
def read_root():
    return {"message": "Bem-vindo à API do projeto Mapa de Crédito Inclusivo. Acesse /docs para Swagger UI."}

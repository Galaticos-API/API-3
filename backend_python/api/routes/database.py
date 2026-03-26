from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
import sqlite3
import re
from pathlib import Path
from api.config import DB_FILENAME

# Validação de Entrada usando Pydantic
class DatabaseConfig(BaseModel):
    # Exemplo: permitindo forçar recriação (validação rigorosa booleana)
    force_recreate: bool = Field(default=False, description="Força exclusão e recriação do banco de dados")

router = APIRouter(prefix="/database", tags=["Database"])

@router.post("/create")
def setup_database(config: DatabaseConfig):
    """
    Endpoint seguro para criar o banco de dados.
    """
    from criar_banco_dados import criar_banco_dados
    
    # Validações extras de segurança se tivéssemos parâmetros textuais
    # Pydantic já impede Injections na estrutura JSON recebida
    
    sucesso = criar_banco_dados()
    if not sucesso:
        raise HTTPException(status_code=500, detail="Erro interno ao criar banco de dados.")
    
    return {"status": "success", "message": "Banco de dados criado com sucesso!"}

# Exemplo de Rota usando parametro (prevenindo SQL Injection)
@router.get("/uf/{sigla_uf}")
def get_uf_details(sigla_uf: str = Path(..., min_length=2, max_length=2, regex="^[A-Z]{2}$")):
    """
    Exemplo prático de proteção contra SQL Injection com validação de entrada rigorosa
    e parameterized query.
    """
    diretorio_banco = Path(__file__).parent.parent.parent.parent / "database"
    caminho_banco = diretorio_banco / DB_FILENAME
    
    try:
        conn = sqlite3.connect(caminho_banco)
        cursor = conn.cursor()
        
        # SQL Parametrizado: PREVINE SQL INJECTION
        cursor.execute("SELECT * FROM dim_uf WHERE sigla_uf = ?", (sigla_uf,))
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="UF não encontrada.")
            
        return {"sigla_uf": row[0], "nome": row[1], "codigo_ibge": row[2], "regiao_br": row[3]}
    except sqlite3.Error:
        raise HTTPException(status_code=500, detail="Database Error")
    finally:
        conn.close()

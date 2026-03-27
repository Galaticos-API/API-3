from fastapi import APIRouter, HTTPException, Depends, Query, Path as APIPath
import sqlite3
from typing import List, Optional
from pathlib import Path
from api.config import DB_FILENAME
from pydantic import BaseModel

router = APIRouter(prefix="/data", tags=["Data"])

def get_db_connection():
    diretorio_banco = Path(__file__).parent.parent.parent.parent / "database"
    caminho_banco = diretorio_banco / DB_FILENAME
    conn = sqlite3.connect(caminho_banco)
    conn.row_factory = sqlite3.Row  # Retorna resultados como dicionários
    return conn

@router.get("/ufs")
def listar_ufs():
    """Retorna todos os estados do Brasil para popular Selects e Filtros."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT sigla_uf, nome, codigo_ibge, regiao_br FROM dim_uf ORDER BY nome ASC")
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro no banco de dados")
    finally:
        conn.close()

@router.get("/series")
def listar_series_disponiveis(
    abrangencia: Optional[str] = Query(None, description="Filtre por 'Brasil' ou por uma UF específica")
):
    """Retorna o catálogo de séries/indicadores do BCB disponíveis no banco."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        if abrangencia:
            cursor.execute("""
                SELECT id_serie, nome_indicador, categoria, subcategoria, periodicidade, unidade_medida 
                FROM dim_serie 
                WHERE ativo = 1 AND abrangencia = ?
                ORDER BY categoria, nome_indicador
            """, (abrangencia,))
        else:
            cursor.execute("""
                SELECT id_serie, nome_indicador, categoria, subcategoria, periodicidade, unidade_medida, abrangencia 
                FROM dim_serie 
                WHERE ativo = 1
                ORDER BY categoria, abrangencia, nome_indicador
            """)
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro no banco de dados")
    finally:
        conn.close()

@router.get("/history/{id_serie}")
def historico_serie(
    id_serie: int = APIPath(..., description="ID da série no BCB ou dim_serie"),
    sigla_uf: Optional[str] = Query(None, min_length=2, max_length=2, pattern="^[A-Z]{2}$", description="UF para indicadores estaduais")
):
    """
    Lista o histórico completo de dados de uma série temporal.
    Se a série for nacional (abrangencia='Brasil'), sigla_uf deve ser Omitido.
    """
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        if sigla_uf:
            cursor.execute("""
                SELECT data_referencia as data, valor 
                FROM fact_serie_temporal 
                WHERE id_serie = ? AND sigla_uf = ?
                ORDER BY data_referencia ASC
            """, (id_serie, sigla_uf))
        else:
            cursor.execute("""
                SELECT data_referencia as data, valor 
                FROM fact_serie_temporal 
                WHERE id_serie = ? AND sigla_uf IS NULL
                ORDER BY data_referencia ASC
            """, (id_serie,))
            
        rows = cursor.fetchall()
        if not rows:
            # Retorna matriz vazia para facilitar a plotagem caso não tenha extraído os dados ainda
            return []
            
        return [dict(row) for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro interno na construção do histórico.")
    finally:
        conn.close()

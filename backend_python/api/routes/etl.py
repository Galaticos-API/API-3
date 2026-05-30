from fastapi import APIRouter, HTTPException
import logging
from pathlib import Path
import sqlite3

from fastapi.responses import StreamingResponse
from etl_bcb import rodar_etl, rodar_etl_generator
from api.config import DB_FILENAME

router = APIRouter()
logger = logging.getLogger(__name__)

DB_PATH = Path(__file__).resolve().parent.parent.parent.parent / "database" / DB_FILENAME


def _get_conn():
    if not DB_PATH.exists():
        raise HTTPException(status_code=503, detail="Banco de dados não encontrado.")
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


@router.post("/executar")
def executar_etl():
    """
    Dispara a atualização completa de dados via API do BCB.
    """
    try:
        rodar_etl()
        return {"status": "success", "message": "ETL executado com sucesso."}
    except Exception as e:
        logger.error(f"Erro ao rodar ETL: {e}")
        raise HTTPException(status_code=500, detail=f"O processo ETL falhou: {str(e)}")

@router.get("/stream")
def executar_etl_stream():
    """
    Dispara a atualização completa de dados via API do BCB e retorna stream de progresso.
    """
    return StreamingResponse(rodar_etl_generator(), media_type="text/event-stream")


@router.get("/status")
def status_etl():
    """
    Retorna a data da última ingestão por categoria de série.
    """
    conn = _get_conn()
    try:
        rows = conn.execute("""
            SELECT d.categoria, MAX(f.data_ingestao) AS ultima_ingestao,
                   COUNT(*) AS total_registros
            FROM fact_serie_temporal f
            JOIN dim_serie d ON d.id_serie = f.id_serie
            GROUP BY d.categoria
            ORDER BY ultima_ingestao DESC
        """).fetchall()
        return {
            "status": "ok" if rows else "sem_dados",
            "categorias": [dict(r) for r in rows]
        }
    finally:
        conn.close()


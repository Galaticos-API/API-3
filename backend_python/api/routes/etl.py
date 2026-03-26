from fastapi import APIRouter, HTTPException
import logging

from etl_bcb import rodar_etl

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/run")
def run_etl():
    """
    Roda os algoritmos de ETL do Banco Central para salvar as taxas e estatísticas no banco de dados.
    """
    try:
        rodar_etl()
        return {"status": "success", "message": "Processo de ETL executado e concluído com sucesso."}
    except Exception as e:
        logger.error(f"Erro ao rodar ETL: {e}")
        raise HTTPException(status_code=500, detail=f"O processo de ingestão ETL falhou: {str(e)}")

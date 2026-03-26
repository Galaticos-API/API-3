from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/etl", tags=["ETL"])

class ETLConfig(BaseModel):
    run_all: bool = True

@router.post("/run")
def trigger_etl(config: ETLConfig):
    """
    Endpoint para execução do script ETL.
    """
    from etl_bcb import rodar_etl
    
    try:
        rodar_etl()
        return {"status": "success", "message": "ETL finalizado com sucesso."}
    except Exception as e:
        # Erro genérico mascarado no main.py (global exception handler)
        raise e

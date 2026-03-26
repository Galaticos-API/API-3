from fastapi import APIRouter, HTTPException, BackgroundTasks, status
from pydantic import BaseModel

router = APIRouter(prefix="/etl", tags=["ETL"])

class ETLConfig(BaseModel):
    run_all: bool = True

@router.post("/run", status_code=status.HTTP_202_ACCEPTED)
def trigger_etl(config: ETLConfig, background_tasks: BackgroundTasks):
    """
    Endpoint para execução do script ETL.
    Retorna 202 Accepted imediatamente, processando os dados do BCB em background 
    para não bloquear (timeout) a conexão com o Frontend.
    """
    from etl_bcb import rodar_etl
    
    try:
        # Enfileira a execução para rodar solta sem travar a thread HTTP principal
        background_tasks.add_task(rodar_etl)
        
        return {
            "status": "processing", 
            "message": "ETL iniciado em segundo plano com sucesso. Esta operação pode demorar alguns minutos."
        }
    except Exception as e:
        # Erro genérico mascarado no main.py (global exception handler)
        raise e

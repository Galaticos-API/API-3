from fastapi import APIRouter, HTTPException
import logging

from criar_banco_dados import criar_banco_dados

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/create")
def create_database():
    """
    Cria ou atualiza o banco de dados e suas tabelas
    """
    try:
        sucesso = criar_banco_dados()
        if sucesso:
            return {"status": "success", "message": "Banco de dados criado e configurado com sucesso."}
        else:
            raise HTTPException(status_code=500, detail="Ocorreu um erro interno ao criar o banco de dados.")
    except Exception as e:
        logger.error(f"Erro na criação do banco de dados: {e}")
        raise HTTPException(status_code=500, detail=f"O processo falhou: {str(e)}")

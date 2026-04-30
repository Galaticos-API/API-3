from fastapi import APIRouter, HTTPException
import logging
from pathlib import Path

from criar_banco_dados import criar_banco_dados
from api.config import DB_FILENAME

router = APIRouter()
logger = logging.getLogger(__name__)

# Caminho do banco de dados (mesmo padrão de criar_banco_dados.py)
DIRETORIO_BANCO = Path(__file__).resolve().parent.parent.parent.parent / "database"


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


@router.delete("/delete")
def delete_database():
    """
    Remove o arquivo do banco de dados SQLite do disco.
    """
    caminho_banco = DIRETORIO_BANCO / DB_FILENAME

    if not caminho_banco.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Banco de dados não encontrado em: {caminho_banco}"
        )

    try:
        tamanho = caminho_banco.stat().st_size
        caminho_banco.unlink()
        logger.info(f"Banco de dados removido: {caminho_banco} ({tamanho} bytes)")
        return {
            "status": "success",
            "message": "Banco de dados deletado com sucesso.",
            "detalhes": {
                "arquivo": DB_FILENAME,
                "tamanho_bytes": tamanho
            }
        }
    except PermissionError:
        logger.error(f"Permissão negada ao tentar deletar: {caminho_banco}")
        raise HTTPException(
            status_code=403,
            detail="Permissão negada. O arquivo pode estar em uso por outro processo."
        )
    except Exception as e:
        logger.error(f"Erro ao deletar banco de dados: {e}")
        raise HTTPException(status_code=500, detail=f"Falha ao deletar o banco de dados: {str(e)}")

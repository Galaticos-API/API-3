import os
from dotenv import load_dotenv

# Carrega variáveis do arquivo .env
load_dotenv()

# Caminho do banco de dados a partir do .env ou valor padrão
DB_FILENAME = os.environ.get("DB_FILENAME", "credito_inclusivo.db")

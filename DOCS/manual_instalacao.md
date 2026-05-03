# 🚀 Manual de Instalação — Mapa de Crédito Inclusivo

**Projeto:** API 3 —  de Crédito Inclusivo (DM Card)  
**Stack:** FastAPI (Python) + React (Frontend) + SQLite  
**Equipe:** Galáticos — FATEC SJC | ADS 3 | 2026-1

---

## Pré-requisitos

Antes de prosseguir, certifique-se de ter instalado:

| Ferramenta | Versão mínima | Verificação |
|---|---|---|
| Docker | 24.x | `docker --version` |
| Docker Compose | 2.x (plugin) | `docker compose version` |
| Git | 2.x | `git --version` |

> **Alternativa sem Docker:** Python 3.11+, Node.js 20+ e npm 10+.

---

## Opção 1 — Execução com Docker (Recomendado)

### 1. Clonar o repositório

```bash
git clone https://github.com/Galaticos-API/API-3.git
cd <repositorio>
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com as configurações do seu ambiente:

```env
# Banco de dados
DB_FILENAME=credito_inclusivo.db

# Autenticação
SECRET_KEY=substitua_por_uma_chave_secreta_forte
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60



### 3. Subir todos os containers

```bash
docker compose up -d --build
```

A flag `-d` executa em modo background. A flag `--build` garante que as imagens reflitam o código mais recente.

### 4. Acessar a aplicação

| Serviço | URL |
|---|---|
| Frontend (React) | http://localhost |
| Backend — Swagger UI | http://localhost:8000/docs |
| Backend — ReDoc | http://localhost:8000/redoc |


### Comandos úteis

```bash
# Ver logs de um serviço
docker compose logs -f backend
docker compose logs -f frontend

# Parar todos os containers
docker compose down

# Reiniciar do zero (apaga volumes e imagens)
docker compose down -v --rmi all
docker compose up -d --build
```

---

## Opção 2 — Execução Manual (sem Docker)

### Backend (FastAPI / Python)

```bash
# 1. Acessar pasta do backend
cd backend_python

# 2. Criar ambiente virtual
python -m venv venv

# 3. Ativar o ambiente virtual
# Windows:
venv\Scripts\activate
# Linux / macOS:
source venv/bin/activate

# 4. Instalar dependências
pip install -r requirements.txt

# 5. Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env conforme necessário

# 6. Criar o banco de dados
python criar_banco_dados.py

# 7. Coletar dados do BCB
python etl_bcb.py

# 8. Iniciar o servidor
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

O backend estará disponível em: http://localhost:8000  
Swagger UI: http://localhost:8000/docs

### Frontend (React + Vite)

```bash
# Em outro terminal, acessar pasta do frontend
cd frontend

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

O frontend estará disponível em: http://localhost:5173



---

## Solução de Problemas

| Erro | Causa | Solução |
|---|---|---|
| `database is locked` | Outro processo acessando o SQLite | Feche DBeavers ou outros clientes e reinicie |
| `permission denied` na pasta `database/` | Permissão de escrita ausente | `chmod 755 database/` |
| ETL retorna 502/503 | API do BCB instável | Aguarde alguns minutos — o ETL tem retry automático |
| Container não sobe | Porta 80 ou 8000 em uso | Mude a porta no `docker-compose.yml` |
| `ModuleNotFoundError` | Ambiente virtual não ativado | Execute `source venv/bin/activate` |

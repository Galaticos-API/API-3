# 🚀 Manual de Instalação — Mapa de Crédito Inclusivo

**Projeto:** API 3 — Crédito Inclusivo (DM Card)  
**Stack:** FastAPI (Python) + React (Frontend) + SQLite  
**Equipe:** Galáticos — FATEC SJC | ADS 3 | 2026-1


---

## Pré-requisitos

Antes de prosseguir, certifique-se de ter instalado:

| Ferramenta | Versão mínima | Verificação |
|---|---|---|
| Docker | 24.x | `docker --version` |
| Docker Compose | plugin do Docker | `docker compose version` |
| Git | 2.x | `git --version` |
| Python | 3.11+ | `python --version` ou `py -3 --version` |
| Node.js | 20+ | `node --version` |
| npm | 10+ | `npm --version` |

> **Alternativa sem Docker:** use Python 3.11+ para o backend e Node.js 20+ para o frontend.

---

## Opção 1 — Execução com Docker (Recomendado)

### 1. Clonar o repositório

```bash
git clone https://github.com/Galaticos-API/API-3.git
cd API-3
```

### 2. Copiar o arquivo de ambiente

```bash
cp .env.example .env
```

O backend lê somente as chaves de API do Groq. Preencha as variáveis abaixo em `.env`:

```env
GroqKey1=token-API-Groq1
GroqKey2=token-API-Groq2
GroqKey3=token-API-Groq3
GroqKey4=token-API-Groq4
GroqKey5=token-API-Groq5
```

> Se o assistente de IA não for usado, essas chaves não são obrigatórias para iniciar o backend.

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

# Reiniciar do zero (remove imagens e volumes)
docker compose down -v --rmi all
docker compose up -d --build
```

---

## Opção 2 — Execução Manual (sem Docker)

### Backend (FastAPI / Python)

```bash
cd backend_python
python -m venv venv
```

#### Ativar o ambiente virtual

```bash
# Windows:
venv\Scripts\activate

# Linux / macOS:
source venv/bin/activate
```

#### Instalar dependências

```bash
pip install -r requirements.txt
```

#### Configurar variáveis de ambiente

```bash
cp ..\.env.example ..\.env
```

Edite o arquivo `.env` na raiz do projeto se quiser usar o assistente de IA.

#### Criar o banco de dados

```bash
python criar_banco_dados.py
```

#### Executar o ETL

```bash
python etl_bcb.py
```

#### Iniciar o backend

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

O backend estará disponível em: http://localhost:8000

---

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

O frontend estará disponível em: http://localhost:5173

---

## Solução de Problemas

| Erro | Causa | Solução |
|---|---|---|
| `database is locked` | Outro processo acessando o SQLite | Feche DBeavers ou outros clientes e reinicie |
| `permission denied` na pasta `database/` | Permissão de escrita ausente | Garanta permissões de escrita na pasta `database` |
| ETL falha | API do BCB instável ou banco ausente | Aguarde, verifique conexão e recarregue o ETL |
| Container não sobe | Porta 80 ou 8000 em uso | Pare o serviço ou ajuste as portas no `docker-compose.yml` |
| `ModuleNotFoundError` | Ambiente virtual não ativado | Ative o `venv` antes de rodar o Python |

---

## Observações

- O backend atual não implementa autenticação JWT.
- O login no frontend está configurado como simulado.
- O arquivo `.env.example` já fornece o template das variáveis necessárias para o LLM.

# Guia de Configuração e Execução via Docker 🐳

Este guia descreve como iniciar todo o ambiente da aplicação (Frontend e Backend) usando apenas um único comando, de forma escalável com **Docker** e **Docker Compose**.

## Pré-requisitos

Certifique-se de ter instalados:

1. **Docker**
2. **Docker Compose** (plugin do Docker)
3. **Git**

---

## Como Rodar a Aplicação

1. Abra o terminal na **pasta raiz do projeto** (onde está o arquivo `docker-compose.yml`).
2. Execute:

```bash
docker compose up -d --build
```

> Se o seu ambiente ainda usa o comando legado, `docker-compose up -d --build` também funciona, mas a recomendação atual é `docker compose`.

### O que esse comando faz

- `-d`: executa os containers em segundo plano.
- `--build`: força a reconstrução das imagens a partir do Dockerfile.

---

## Como Acessar a Aplicação

| Serviço | URL |
|---|---|
| Frontend | http://localhost |
| Backend — Swagger UI | http://localhost:8000/docs |
| Backend — ReDoc | http://localhost:8000/redoc |

---

## Logs e Debug

```bash
docker compose logs -f backend
docker compose logs -f frontend
```

Usar o `-f` mantém a saída em tempo real.

---

## Funcionamento de Hot Reload

O `docker-compose.yml` monta volumes do host para o container.
Isso permite editar arquivos em `backend_python` ou `frontend` e ver as alterações refletidas sem reconstruir a imagem a cada mudança.

---

## Como Parar a Aplicação

```bash
docker compose down
```

---

## Reiniciar do Zero

```bash
docker compose down -v --rmi all
docker compose up -d --build
```

Esse comando remove containers, volumes e imagens antes de recriar tudo.

---

## Observações

- O frontend roda na porta `80`.
- O backend roda na porta `8000`.
- O arquivo `.env` na raiz é usado pelo backend para carregar as chaves Groq.
- Caso a porta `80` ou `8000` esteja em uso, ajuste as portas no `docker-compose.yml`.

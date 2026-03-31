# Guia de Configuração e Execução via Docker 🐳

Este guia descreve como iniciar todo o ambiente da aplicação (Frontend e Backend) usando apenas um único comando, de forma profissional e escalável utilizando **Docker** e **Docker Compose**.

## Pré-requisitos
Antes de prosseguir, certifique-se de ter os seguintes softwares instalados em seu sistema (Windows, Linux ou Mac):
1. **Docker**: Ferramenta de containers.
2. **Docker Compose**: Plugin embutido no Docker para orquestrar múltiplos containers. (Já incluso no Docker Desktop).

---

## Como Rodar a Aplicação

Para iniciar o projeto inteiro através do Docker, apenas siga este passo:

1. Abra o Terminal e certifique-se de estar na **pasta raiz do projeto** (onde fica o arquivo `docker-compose.yml`).
2. Execute o seguinte comando:
   ```bash
   docker-compose up -d --build
   ```

> **Nota:** 
> - A flag `-d` significa *Detached mode*. Isso faz os containers rodarem em segundo plano sem travar seu terminal atual.
> - A flag `--build` garante que suas imagens sejam construídas e fiquem com as modificações mais recentes contidas nas pastas.

---

## Como Acessar a Aplicação

Quando o comando for finalizado com sucesso e os containers estiverem em execução, você poderá acessar:

- 💻 **Frontend (Aplicação Web)**: [http://localhost](http://localhost) (Se o Nginx carregar e tudo ocorrer bem, será hospedado na clássica porta 80).
- ⚙️ **Backend (API)**: [http://localhost:8000/docs](http://localhost:8000/docs) (Para ver a interface Swagger/documentação interativa FastAPI).

## Hot Reload Mágico 🔥

Se você for desenvolver, essa configuração provê suporte para reloads em tempo de código!
No `docker-compose.yml`, o container do backend lê seus arquivos diretamente da pasta `backend_python` através do conceito de *volumes* do Docker.
Isso quer dizer que, caso você faça qualquer alteração no código Python (no FastAPI), a alteração será reiniciada subitamente no servidor sem você precisar desligar os recursos. Além disso, o seu banco de dados em `database/` também persiste dados com o sistema local (uma inserção feita pelo servidor via container pode ser lida por si ou vice-versa)!

---

## Como Encerrar e Reciclar

Seu trabalho acabou e você deseja derrubar os servidores locais? Muito simples:
Ainda na raiz do projeto (mesma pasta do *Compose*), basta rodar:

```bash
docker-compose down
```

### Apagando e Subindo Tudo do Zero
Se você sentiu que as dependências ou instalações desestabilizaram e quer deletar qualquer recarga pré-armazenada em sua máquina local para baixar novamente do zero:

```bash
docker-compose down -v --rmi all
# Após tudo limpo, basta relançar a orquestração de novo.
docker-compose up -d --build
```

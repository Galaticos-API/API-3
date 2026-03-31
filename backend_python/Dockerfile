FROM python:3.11-slim

WORKDIR /app

# Copia as dependências da aplicação
COPY requirements.txt .

# Instala as dependências de forma otimizada
RUN pip install --no-cache-dir -r requirements.txt

# Copia todo o código para dentro do container
COPY . .

# Expõe a porta que a API utiliza
EXPOSE 8000

# Executa o servidor da API
# (Se for usar reload na produção não é ideal, mas usamos para manter as características do seu dev atual)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

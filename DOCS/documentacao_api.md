# Documentação da API — Mapa de Crédito Inclusivo

**Base URL:** `http://localhost:8000`  
**Prefixo da API:** `/api/v1`  
**Formato:** JSON  
**Autenticação:** Não implementada — todas as rotas são públicas.  
**Swagger UI:** `http://localhost:8000/docs`  
**Versão:** 1.0

---

## Roteamento principal

As rotas ativas são agrupadas em quatro routers:
- `GET /api/v1/graficos` — gráficos e dados prontos para o dashboard
- `POST /api/v1/etl` — ETL e ingestão de dados
- `POST /api/v1/database` — criação e remoção do banco SQLite
- `POST /api/v1/llm` — endpoints LLM/Groq

---

## Endpoints de gráficos e dados de apoio

### `GET /api/v1/graficos/ufs`
Lista os 27 estados brasileiros cadastrados na tabela `dim_uf`.

Retorno:
- `sigla_uf`
- `nome`
- `codigo_ibge`
- `regiao_br`

---

### `GET /api/v1/graficos/ufs/{sigla}`
Retorna detalhes de um estado específico.

Parâmetros de rota:
- `sigla`: Sigla do estado, ex: `SP`, `MG`

---

### `GET /api/v1/graficos/credito-sfn`
Retorna a série histórica do saldo de crédito SFN nacional.

Query params:
- `anos` (opcional, default=10, min=1, max=20)

---

### `GET /api/v1/graficos/macro-contexto`
Retorna dados macroeconômicos de Selic, IPCA e inadimplência PF.

Query params:
- `anos` (opcional, default=5, min=1, max=15)

---

### `GET /api/v1/graficos/inadimplencia-regional`
Retorna métricas de inadimplência por macrorregião:
- `boxplot`
- `barras`

---

### `GET /api/v1/graficos/heatmap-estados`
Retorna a matriz UF × mês de inadimplência estadual para os últimos 24 meses.

---

### `GET /api/v1/graficos/scatter-pf-pj`
Retorna dados de dispersão PF vs PJ por estado com os últimos valores disponíveis.

---

### `GET /api/v1/graficos/estudo-estado/{sigla}`
Retorna séries de um estado específico:
- saldo PF
- saldo PJ
- inadimplência PF
- inadimplência PJ

Parâmetros de rota:
- `sigla`: Sigla do estado

Query params:
- `anos` (opcional, default=5, min=1, max=10)

---

### `GET /api/v1/graficos/score-oportunidade`
Retorna o ranking de estados pelo Score IOI.

---

### `POST /api/v1/graficos/monte-carlo`
Executa simulação Monte Carlo e grava o resultado no banco.

Body JSON:
- `sigla_uf`: string de 2 caracteres
- `montante`: float > 0
- `iterations`: int entre 10 e 10000
- `avg_return`: float >= 0
- `volatility`: float >= 0
- `lgd`: float entre 0.0 e 1.0

---

### `GET /api/v1/graficos/monte-carlo/latest`
Retorna a última simulação Monte Carlo salva.

---

### `GET /api/v1/graficos/monte-carlo/historico`
Retorna histórico de simulações salvas.

Query params:
- `limite` (opcional, default=20, min=1, max=100)

---

### `GET /api/v1/graficos/monte-carlo/{id}`
Retorna o resultado de uma simulação salva pelo ID.

---

## Endpoints de ETL

### `POST /api/v1/etl/executar`
Dispara a atualização de dados via API do Banco Central (SGS).

---

### `GET /api/v1/etl/stream`
Executa a atualização via streaming e retorna progresso em `text/event-stream`.

---

### `GET /api/v1/etl/status`
Retorna a data da última ingestão por categoria e o total de registros.

---

## Endpoints de banco de dados

### `POST /api/v1/database/create`
Cria ou atualiza o banco de dados SQLite.

---

### `DELETE /api/v1/database/delete`
Deleta o arquivo SQLite do banco de dados.

---

## Endpoints LLM

### `GET /api/v1/llm/status`
Retorna o status do serviço LLM/Groq.

---

### `POST /api/v1/llm/chat`
Envia uma pergunta ao assistente LLM.

Body JSON:
- `message`: string
- `history`: lista de objetos com `role` e `content`

---

## Códigos de erro

| Código | Significado                                      |
|--------|--------------------------------------------------|
| `404`  | Recurso não encontrado                           |
| `422`  | Erro de validação de dados — schema incorreto    |
| `500`  | Erro interno do servidor                         |

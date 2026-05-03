# Documentação da API — Mapa de Crédito Inclusivo

**Base URL:** `http://localhost:8000/api/v1`  
**Formato:** JSON  
**Autenticação:** Atualmente não implementada — todas as rotas são públicas.  
**Swagger UI:** `http://localhost:8000/docs`  
**Versão:** 1.0

---

## Autenticação

**Nota:** A autenticação JWT está documentada mas não implementada no código atual. Todas as rotas são acessíveis sem autenticação. O frontend utiliza um sistema de login simulado com credenciais fixas.

---

## Módulo 1 — Estados e Regiões

### `GET /ufs`

Lista os 27 estados brasileiros cadastrados na `dim_uf`.

**Parâmetros de consulta:**

| Parâmetro | Tipo   | Descrição                                              |
|-----------|--------|--------------------------------------------------------|
| `regiao`  | string | Filtra por macrorregião: `Norte`, `Nordeste`, `Centro-Oeste`, `Sudeste`, `Sul` |

---

### `GET /ufs/{sigla}`

Retorna detalhes de um estado específico da federação.

**Parâmetros de rota:**

| Parâmetro | Tipo   | Descrição              |
|-----------|--------|------------------------|
| `sigla`   | string | Sigla do estado (ex: `SP`, `MG`) |

---

Invalida o token atual na tabela `sessao`.

**Header obrigatório:**

```http
Authorization: Bearer <token>
```

---

### `GET /me`

Retorna os dados do usuário autenticado a partir da tabela `usuario`.

---

## Módulo 2 — Estados e Regiões

### `GET /estados`

Lista os 27 estados brasileiros cadastrados na `dim_uf`.

**Parâmetros de consulta:**

| Parâmetro | Tipo   | Descrição                                              |
|-----------|--------|--------------------------------------------------------|
| `regiao`  | string | Filtra por macrorregião: `Norte`, `Nordeste`, `Centro-Oeste`, `Sudeste`, `Sul` |

---

### `GET /estados/{sigla}`

Retorna detalhes de um estado específico da federação.

**Parâmetros de rota:**

| Parâmetro | Tipo   | Descrição              |
|-----------|--------|------------------------|
| `sigla`   | string | Sigla do estado (ex: `SP`, `MG`) |

---

## Módulo 2 — Gráficos do Dashboard

### `GET /graficos/credito-sfn`

Dados para evolução do saldo de crédito SFN nacional (PF e PJ).

---

### `GET /graficos/macro-contexto`

Dados consolidados de:

- Selic
- IPCA
- Inadimplência

---

### `GET /graficos/inadimplencia-regional`

Métricas de inadimplência por macrorregião:

- Boxplot
- Barras

---

### `GET /graficos/heatmap-estados`

Matriz de inadimplência por UF nos últimos 24 meses.

---

## Módulo 3 — Ranking de Oportunidades

### `GET /api/v1/graficos/score-oportunidade`

Lista o ranking completo de estados ordenado pelo Score IOI (Índice de Oportunidade Inclusiva).

**Fórmula de negócio:**

```
IOI = (s_inadimplência × 0,60 + s_tendência × 0,40) × 10
```

---

## Módulo 4 — Simulação Monte Carlo

### `GET /api/v1/graficos/monte-carlo/latest`

Retorna os resultados da última simulação de Monte Carlo executada (dados mockados no código atual).

**Nota:** A execução real da simulação via POST não está implementada. O endpoint retorna dados fixos.

```json
{
  "inadimplencia_projetada": 3.8,
  "ioi_score": 6.2,
  "var_95": 12500000,
  "var_99": 18200000
}
```

---

## Módulo 5 — ETL e Ingestão

### `POST /etl/executar`

Gatilho manual para o microserviço Python realizar a coleta de dados da API do Banco Central (SGS). Atualiza as tabelas `fact_serie_temporal`.

---

## Códigos de Erro

| Código | Significado                                      |
|--------|--------------------------------------------------|
| `404`  | Recurso não encontrado                           |
| `422`  | Erro de validação de dados — schema incorreto    |
| `500`  | Erro interno do servidor                         |
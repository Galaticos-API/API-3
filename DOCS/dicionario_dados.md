# 📚 Dicionário de Dados — Mapa de Crédito Inclusivo

**Projeto:** API 3 —  de Crédito Inclusivo (DM Card)  
**Banco de Dados:** SQLite 3 (`credito_inclusivo.db`)  
**Versão:** 1.0 | **Atualizado em:** 2026-05

---

## Visão Geral do Modelo

O banco de dados é organizado em quatro grupos funcionais:

| Grupo | Tabelas | Finalidade |
|---|---|---|
| **Autenticação** | `usuario`, `sessao` | Controle de acesso e sessões JWT |
| **Dimensões** | `dim_uf`, `dim_serie` | Dados de referência (estados e séries do BCB) |
| **Fatos** | `fact_serie_temporal`, `fact_simulacao_risco` | Dados transacionais e simulações |
| **Operacionais** | `ranking_oportunidade`, `consulta_ia`, `log_auditoria` | Resultados calculados e auditoria |

**Nota:** Algumas tabelas (como `usuario`, `sessao`, `consulta_ia`, `log_auditoria`) estão criadas no schema mas não são utilizadas no código atual do sistema. Elas servem como placeholders para futuras implementações de autenticação e auditoria.

## Configurações de PRAGMA

| PRAGMA | Valor | Descrição |
|---|---|---|
| `foreign_keys` | ON | Habilita integridade referencial |
| `journal_mode` | WAL | Write-Ahead Logging — melhora concorrência |

---

## Tabelas

### 1. `usuario`

Armazena os usuários com acesso à plataforma.

| Coluna | Tipo | Restrição | Padrão | Descrição |
|---|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | — | Identificador único |
| `nome` | TEXT | NOT NULL | — | Nome completo do usuário |
| `email` | TEXT | NOT NULL, UNIQUE | — | E-mail de login (único) |
| `senha_hash` | TEXT | NOT NULL | — | Hash bcrypt da senha |
| `papel` | TEXT | CHECK (admin \| analista) | `analista` | Perfil de acesso |
| `ativo` | INTEGER | NOT NULL | `1` | 1 = ativo, 0 = inativo |
| `criado_em` | TEXT | NOT NULL | `datetime('now')` | Timestamp de criação (ISO 8601) |

**Índices:** chave primária em `id`; índice único implícito em `email`.

---

### 2. `sessao`

Registra tokens JWT ativos, permitindo invalidação no logout.

| Coluna | Tipo | Restrição | Padrão | Descrição |
|---|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | — | Identificador da sessão |
| `usuario_id` | INTEGER | NOT NULL, FK → `usuario.id` | — | Usuário proprietário da sessão |
| `token_jwt` | TEXT | NOT NULL, UNIQUE | — | Token JWT assinado |
| `expira_em` | TEXT | NOT NULL | — | Data/hora de expiração (ISO 8601) |
| `criado_em` | TEXT | NOT NULL | `datetime('now')` | Timestamp de criação |

**Índices:** `idx_sessao_token` em `token_jwt` (busca rápida na autenticação).  
**FK:** `ON DELETE CASCADE` — sessão é excluída se o usuário for removido.

---

### 3. `dim_uf`

Dimensão de estados brasileiros.

| Coluna | Tipo | Restrição | Descrição |
|---|---|---|---|
| `sigla_uf` | TEXT | PK | Sigla do estado (ex: SP, MG) |
| `nome` | TEXT | NOT NULL | Nome completo do estado |
| `codigo_ibge` | TEXT | NOT NULL, UNIQUE | Código IBGE do estado |
| `regiao_br` | TEXT | CHECK (Norte \| Nordeste \| Centro-Oeste \| Sudeste \| Sul) | Macrorregião geográfica |

**Registros iniciais:** 27 estados (semeados no script de criação).

---

### 4. `dim_serie`

Catálogo de todas as séries temporais utilizadas (SGS/BCB).

| Coluna | Tipo | Restrição | Padrão | Descrição |
|---|---|---|---|---|
| `id_serie` | INTEGER | PK | — | Código da série no SGS/BCB |
| `nome_indicador` | TEXT | NOT NULL | — | Nome descritivo da série |
| `categoria` | TEXT | NOT NULL | — | Grupo temático (ex: credito, inflacao_precos) |
| `subcategoria` | TEXT | — | NULL | Subgrupo (ex: inadimplencia, saldos_credito) |
| `periodicidade` | TEXT | CHECK (diária \| mensal \| trimestral \| anual) | — | Frequência de publicação |
| `unidade_medida` | TEXT | NOT NULL | — | Unidade do valor (ex: %, R$ mi, % a.a.) |
| `abrangencia` | TEXT | NOT NULL | `Brasil` | `Brasil` ou sigla UF para séries estaduais |
| `descricao` | TEXT | — | NULL | Descrição detalhada |
| `ativo` | INTEGER | NOT NULL | `1` | 1 = ativo para coleta, 0 = desativado |

**Registros iniciais:** 29 séries nacionais + séries estaduais geradas dinamicamente (~191 no total).

**Categorias disponíveis:**

| Categoria | Séries representativas |
|---|---|
| `credito` | Saldos PF/PJ, concessões, inadimplência, spread |
| `inflacao_precos` | IPCA mensal/acumulado, IGP-M |
| `taxas_de_juros` | Selic meta/diária, TR, poupança |
| `cambio` | Dólar venda, PTAX |
| `emprego_e_renda` | Taxa de desemprego PNAD |
| `atividade_economica` | PIB anual e trimestral |
| `mercado_financeiro` | Ibovespa |

---

### 5. `fact_serie_temporal`

Tabela fato principal — armazena os valores históricos de cada série.

| Coluna | Tipo | Restrição | Padrão | Descrição |
|---|---|---|---|---|
| `id_serie` | INTEGER | PK parcial, FK → `dim_serie.id_serie` | — | Código da série |
| `sigla_uf` | TEXT | PK parcial, FK → `dim_uf.sigla_uf` | NULL | Estado (NULL para séries nacionais) |
| `data_referencia` | TEXT | PK parcial, NOT NULL | — | Data no formato `AAAA-MM-DD` |
| `valor` | REAL | NOT NULL | — | Valor numérico da série |
| `data_ingestao` | TEXT | NOT NULL | `datetime('now')` | Timestamp da última ingestão/atualização |

**Chave Primária Composta:** `(id_serie, sigla_uf, data_referencia)` — evita duplicatas automaticamente.  
**Operação de escrita:** `INSERT OR REPLACE` — atualiza se o registro já existir.

**Índices:**

| Índice | Colunas | Uso |
|---|---|---|
| `idx_fst_uf` | `sigla_uf` | Filtros por estado |
| `idx_fst_data` | `data_referencia` | Filtros por período |
| `idx_fst_serie_data` | `(id_serie, data_referencia)` | Séries temporais específicas |
| `idx_fst_uf_data` | `(sigla_uf, data_referencia)` | Dashboard regional com filtro de período |

---

### 6. `fact_simulacao_risco`

Resultados das simulações de Monte Carlo executadas pelos usuários.

| Coluna | Tipo | Restrição | Padrão | Descrição |
|---|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | — | Identificador da simulação |
| `usuario_id` | INTEGER | NOT NULL, FK → `usuario.id` | — | Usuário que executou a simulação |
| `sigla_uf` | TEXT | NOT NULL, FK → `dim_uf.sigla_uf` | — | Estado simulado |
| `data_referencia` | TEXT | NOT NULL | — | Data de referência dos dados base |
| `inadimplencia_projetada` | REAL | NOT NULL | — | Valor central da projeção (%) |
| `ioi_score` | REAL | NOT NULL | — | Índice de Oportunidade Inclusiva calculado (0–10) |
| `var_95` | REAL | NOT NULL | — | Value at Risk com 95% de confiança |
| `var_99` | REAL | NOT NULL | — | Value at Risk com 99% de confiança |
| `parametros_json` | TEXT | NOT NULL | — | JSON com os parâmetros da simulação (montante, LGD, nº iterações) |
| `criado_em` | TEXT | NOT NULL | `datetime('now')` | Timestamp da simulação |

**Parâmetros padrão (em `parametros_json`):** montante = R$ 150M, LGD = 0,65, distribuição Log-normal.

---

### 7. `ranking_oportunidade`

Armazena o ranking calculado do IOI (Índice de Oportunidade Inclusiva) por estado.

| Coluna | Tipo | Restrição | Padrão | Descrição |
|---|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | — | Identificador do registro |
| `sigla_uf` | TEXT | NOT NULL, FK → `dim_uf.sigla_uf` | — | Estado |
| `score_oportunidade` | REAL | NOT NULL | — | Score IOI final (0–10) |
| `componente_demanda` | REAL | — | NULL | Componente de demanda de crédito |
| `componente_risco` | REAL | — | NULL | Componente de risco/inadimplência |
| `componente_mercado` | REAL | — | NULL | Componente de saturação de mercado |
| `data_calculo` | TEXT | NOT NULL | `datetime('now')` | Timestamp do cálculo |

**Fórmula do Score:** `Score_Final = (s_inadim × 0.60 + s_tendencia × 0.40) × 10`  
**Normalização:** MinMax aplicado sobre todos os 27 estados (processamento em batch).

**Índices:**

| Índice | Colunas | Uso |
|---|---|---|
| `idx_rank_score` | `score_oportunidade DESC` | Ordenação do ranking |
| `idx_rank_uf` | `sigla_uf` | Busca por estado |

---

### 8. `consulta_ia`

Histórico de interações com o assistente de Inteligência Artificial.

| Coluna | Tipo | Restrição | Padrão | Descrição |
|---|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | — | Identificador da consulta |
| `usuario_id` | INTEGER | NOT NULL, FK → `usuario.id` | — | Usuário que enviou a pergunta |
| `pergunta` | TEXT | NOT NULL | — | Texto da pergunta enviada |
| `resposta` | TEXT | — | NULL | Resposta gerada pela IA |
| `contexto_json` | TEXT | — | NULL | JSON com os dados injetados no prompt |
| `tokens_usados` | INTEGER | — | NULL | Total de tokens consumidos na chamada |
| `criado_em` | TEXT | NOT NULL | `datetime('now')` | Timestamp da consulta |

---

### 9. `log_auditoria`

Registro de ações relevantes realizadas no sistema para fins de rastreabilidade.

| Coluna | Tipo | Restrição | Padrão | Descrição |
|---|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | — | Identificador do log |
| `usuario_id` | INTEGER | FK → `usuario.id` | NULL | Usuário responsável (NULL = sistema) |
| `acao` | TEXT | NOT NULL | — | Descrição da ação (ex: LOGIN, ETL_EXECUTADO) |
| `tabela_afetada` | TEXT | — | NULL | Tabela impactada pela ação |
| `detalhes_json` | TEXT | — | NULL | JSON com detalhes adicionais |
| `ip_address` | TEXT | — | NULL | IP de origem da requisição |
| `criado_em` | TEXT | NOT NULL | `datetime('now')` | Timestamp da ação |

**Índice:** `idx_log_criado` em `criado_em` — consulta rápida por período.  
**FK:** `ON DELETE SET NULL` — log preservado mesmo se o usuário for excluído.

---

## Relacionamentos (Resumo)

```
usuario (1) ──< sessao (N)                [CASCADE DELETE]
usuario (1) ──< fact_simulacao_risco (N)  [SET NULL]
usuario (1) ──< consulta_ia (N)           [SET NULL]
usuario (1) ──< log_auditoria (N)         [SET NULL]

dim_uf (1) ──< fact_serie_temporal (N)   [SET NULL]
dim_uf (1) ──< fact_simulacao_risco (N)  [CASCADE DELETE]
dim_uf (1) ──< ranking_oportunidade (N)  [CASCADE DELETE]

dim_serie (1) ──< fact_serie_temporal (N) [CASCADE DELETE]
```

---

## Convenções do Projeto

| Convenção | Padrão |
|---|---|
| Timestamps | ISO 8601 — `AAAA-MM-DD HH:MM:SS` |
| Datas de referência | `AAAA-MM-DD` |
| Valores monetários | REAL em R$ milhões (R$ mi) |
| Valores percentuais | REAL em pontos percentuais (ex: 3.5 = 3,5%) |
| Booleanos | INTEGER — 1 (verdadeiro) / 0 (falso) |
| JSON armazenado | TEXT serializado via `json.dumps()` |

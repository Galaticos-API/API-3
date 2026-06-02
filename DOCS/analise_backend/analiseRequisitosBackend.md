## Detalhamento dos Gráficos (Dashboard)
O sistema deve processar dados para 9 visualizações distintas, integrando séries temporais do BCB e resultados estocásticos.

| ID | Tipo de Gráfico | Dados e Contexto |
| :--- | :--- | :--- |
| **GRF-01** | Linha | Saldo de Crédito SFN (Séries 20539, 20540, 20541) em nível nacional. |
| **GRF-02** | Linha + Barras | Contexto Macro: Selic (432), IPCA (433) e Inadimplência (21082) com eixo duplo. |
| **GRF-03** | Boxplot | Inadimplência por Região: Média histórica agrupada por macrorregião. |
| **GRF-04** | Barras | Inadimplência Atual: Último valor médio coletado por macrorregião. |
| **GRF-05** | Heatmap | Inadimplência Estadual: Matriz UF × Mês contemplando os últimos 24 meses. |
| **GRF-06** | Scatter | PF vs PJ por Estado: Dispersão da inadimplência atual por UF e região. |
| **GRF-07** | Linha | Estudo de Caso MG: Saldos de crédito e taxas de inadimplência específicas. |
| **GRF-08** | Barras | **Score IOI**: Ranking de oportunidade (0–10) ordenado por estado. |
| **GRF-09** | Histograma + KDE | Simulação Monte Carlo: Distribuição de perdas simuladas, VaR 95% e média. |

---

## Arquitetura de Rotas Backend
A API atual é organizada em quatro routers principais sob o prefixo `/api/v1`. Não há autenticação JWT implementada no backend atual: todas as rotas são públicas.

### 1. Gráficos Prontos
*Módulo de conveniência para o front-end (JSON estruturado).* 
| Método | Rota | Descrição |
| :--- | :--- | :--- |
| GET | `/api/v1/graficos/credito-sfn` | Dados para o GRF-01 (Saldo Nacional).  |
| GET | `/api/v1/graficos/macro-contexto` | Dados para o GRF-02 (Selic/IPCA/Inadimplência).  |
| GET | `/api/v1/graficos/inadimplencia-regional` | Dados para os GRF-03 e GRF-04 (Regional).  |
| GET | `/api/v1/graficos/heatmap-estados` | Dados para o GRF-05 (Heatmap 24m).  |
| GET | `/api/v1/graficos/scatter-pf-pj` | Dados para o GRF-06 (Dispersão PF vs PJ).  |
| GET | `/api/v1/graficos/estudo-estado/{sigla}` | Dados para o GRF-07 (Dashboard estadual).  |
| GET | `/api/v1/graficos/score-oportunidade` | Dados para o GRF-08 (Ranking IOI).  |
| GET | `/api/v1/graficos/monte-carlo/{id}` | Dados para o GRF-09 (Distribuição Monte Carlo).  |

### 2. Simulação Monte Carlo
| Método | Rota | Descrição |
| :--- | :--- | :--- |
| POST | `/api/v1/graficos/monte-carlo` | Executa a simulação com parâmetros customizados.  |
| GET | `/api/v1/graficos/monte-carlo/historico` | Lista simulações anteriores.  |
| GET | `/api/v1/graficos/monte-carlo/latest` | Retorna a última simulação salva.  |

### 3. ETL e Ingestão de Dados
| Método | Rota | Descrição |
| :--- | :--- | :--- |
| POST | `/api/v1/etl/executar` | Dispara a atualização completa via API do BCB.  |
| GET | `/api/v1/etl/stream` | Executa a atualização via streaming e retorna progresso.  |
| GET | `/api/v1/etl/status` | Mostra a data da última atualização por categoria.  |

### 4. Banco de Dados
| Método | Rota | Descrição |
| :--- | :--- | :--- |
| POST | `/api/v1/database/create` | Cria ou atualiza o banco de dados SQLite.  |
| DELETE | `/api/v1/database/delete` | Remove o arquivo SQLite do banco de dados.  |

### 5. Assistente de IA 
| Método | Rota | Descrição |
| :--- | :--- | :--- |
| POST | `/api/v1/llm/chat` | Envia pergunta e recebe análise baseada nos dados do dashboard.  |
| GET | `/api/v1/llm/status` | Retorna o status do serviço LLM/Groq.  |

---

**Nota:** As rotas de Gráficos Prontos (Módulo 3) são atalhos. Elas evitam que o front-end tenha que fazer 10 requisições diferentes para montar o dashboard principal, o que melhora muito a percepção de velocidade para o cliente.

---

## Lógica de Negócio e Cálculo de Score
O diferencial do backend é o processamento do **IOI (Índice de Oportunidade Inclusiva)** e o modelo de risco.

* **Algoritmo de Score:** O cálculo depende de todos os estados (MinMax) e deve ser processado em batch.
    * $Score\_Final = (s_{inadim} \times 0.60 + s_{tendencia} \times 0.40) \times 10$.
* **Simulação Monte Carlo:** Utiliza distribuição Log-normal para projetar perdas baseadas na volatilidade histórica.
    * **Parâmetros:** Montante padrão de R$ 150M e LGD de 0.65.
    * **Saídas:** Cálculo obrigatório de VaR 95% e VaR 99% para persistência.
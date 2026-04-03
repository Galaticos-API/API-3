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
A API expõe **23 rotas** organizadas sob o prefixo `/api/v1`. A autenticação é obrigatória (JWT) para a maioria dos módulos. 

### 1. Autenticação
| Método | Rota | Descrição |
| :--- | :--- | :--- |
| POST | `/login` | Autentica usuário e gera JWT.  |
| POST | `/logout` | Invalida o token na tabela `sessao`.  |
| GET | `/me` | Retorna o perfil do usuário logado.  |

### 2. Estados e Regiões
| Método | Rota | Descrição |
| :--- | :--- | :--- |
| GET | `/` | Lista os 27 estados (filtro por região opcional).  |
| GET | `/:sigla` | Detalhes de um estado específico (ex: SP).  |

### 3. Gráficos Prontos
*Módulo de conveniência para o front-end (JSON estruturado).* 
| Método | Rota | Descrição |
| :--- | :--- | :--- |
| GET | `/credito-sfn` | Dados para o GRF-01 (Saldo Nacional).  |
| GET | `/macro-contexto` | Dados para o GRF-02 (Selic/IPCA/Inadimplência).  |
| GET | `/inadimplencia-regional` | Dados para os GRF-03 e GRF-04 (Regional).  |
| GET | `/heatmap-estados` | Dados para o GRF-05 (Heatmap 24m).  |
| GET | `/scatter-pf-pj` | Dados para o GRF-06 (Dispersão PF vs PJ).  |
| GET | `/estudo-estado/:sigla` | Dados para o GRF-07 (Dashboard estadual).  |
| GET | `/score-oportunidade` | Dados para o GRF-08 (Ranking IOI).  |
| GET | `/monte-carlo/:id` (rota do módulo 5, apenas chamar internamente) | Dados para o GRF-09 (Distribuição Monte Carlo).  |

### 4. Ranking de Oportunidades 
| Método | Rota | Descrição |
| :--- | :--- | :--- |
| GET | `/` | Lista o ranking de estados ordenado pelo score IOI.  |
| GET | `/:sigla` | Detalhamento dos componentes do score de um estado.  |
| POST | `/recalcular` | Dispara o recálculo do IOI em batch.  |

### 5. Simulação Monte Carlo
| Método | Rota | Descrição |
| :--- | :--- | :--- |
| POST | `/monte-carlo` | Executa a simulação com parâmetros customizados.  |
| GET | `/:id` | Recupera o resultado de uma simulação salva.  |
| GET | `/historico` | Lista simulações anteriores do usuário logado.  |

### 6. Assistente de IA 
| Método | Rota | Descrição |
| :--- | :--- | :--- |
| POST | `/consulta` | Envia pergunta e recebe análise baseada nos dados.  |
| GET | `/historico` | Lista conversas passadas com a IA.  |
| GET | `/consulta/:id` | Recupera uma interação específica.  |

### 7. ETL e Ingestão de Dados
| Método | Rota | Descrição |
| :--- | :--- | :--- |
| POST | `/executar` | Dispara a atualização completa via API do BCB.  |
| GET | `/status` | Mostra a data da última atualização por categoria.  |

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
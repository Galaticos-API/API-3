# 📖 Manual do Usuário — Mapa de Crédito Inclusivo

**Projeto:** API 3 — de Crédito Inclusivo (DM Card)  
**Público-alvo:** Analistas e estrategistas da DM Card  
**Equipe:** Galáticos — FATEC SJC | ADS 3 | 2026-1

---

## Visão Geral

O **Mapa de Crédito Inclusivo** é uma plataforma web de inteligência de dados que consolida indicadores públicos do Banco Central do Brasil (BCB) para identificar oportunidades de expansão de crédito por território. A plataforma oferece:

- Dashboard interativo com gráficos de crédito e inadimplência
- Ranking de estados por Índice de Oportunidade Inclusiva (IOI)
- Mapa do Brasil com dados regionais
- Simulação de cenários de risco (Monte Carlo)
- Assistente de IA com respostas baseadas em dados mockados e palavras-chave

---

## 1. Acesso ao Sistema

### 1.1 Login

**Nota:** Atualmente, o sistema utiliza um login simulado. Qualquer e-mail e senha são aceitos para acessar a plataforma (ex: email: admin@dm.com.br, senha: qualquer).

1. Acesse a URL da plataforma fornecida pelo administrador
2. Informe seu **e-mail** e **senha** nos campos correspondentes (não há validação real)
3. Clique em **Entrar**



### 1.2 Logout

Clique no ícone do seu perfil no canto superior direito e selecione **Sair**.

---

## 2. Dashboard Principal

O dashboard é a tela central da plataforma. Ele exibe os principais indicadores de crédito do Brasil em tempo real (baseados nos dados mais recentes coletados do BCB).

### 2.1 Filtros Globais

No topo da página há um painel de filtros que se aplica a todos os gráficos:

| Filtro | Opções | Padrão |
|---|---|---|
| **Período** | Último 1 ano / 5 anos / 10 anos / Personalizado | Últimos 5 anos |
| **Região** | Norte / Nordeste / Centro-Oeste / Sudeste / Sul / Brasil | Brasil |
| **Estado (UF)** | Qualquer uma das 27 UFs | Todos |

Clique em **Aplicar** para atualizar todos os gráficos com os filtros selecionados.

---

### 2.2 Gráficos Disponíveis

#### GRF-01 — Saldo de Crédito SFN (Linha)
Exibe a evolução do saldo total de crédito do Sistema Financeiro Nacional, com curvas separadas para Pessoa Física (PF) e Pessoa Jurídica (PJ).

**Como interpretar:** Tendência crescente indica expansão do mercado. Divergência entre PF e PJ pode indicar mudança no perfil dos tomadores de crédito.

#### GRF-02 — Contexto Macroeconômico (Linha + Barras)
Combina Selic, IPCA e Inadimplência em um gráfico de eixo duplo.

**Como interpretar:** Períodos de Selic alta geralmente precedem queda na concessão de crédito. Correlação positiva entre IPCA e inadimplência indica deterioração do poder de compra.

#### GRF-03 — Inadimplência por Região (Boxplot)
Mostra a distribuição histórica da inadimplência agrupada por macrorregião.

**Como interpretar:** Regiões com boxplot mais alto e maior amplitude indicam maior risco histórico e variabilidade.

#### GRF-04 — Inadimplência Atual por Região (Barras)
Comparação do último valor médio de inadimplência entre as macrorregiões.

#### GRF-05 — Heatmap de Inadimplência Estadual
Matriz de estados × meses dos últimos 24 meses. Cores mais quentes (vermelho) indicam inadimplência mais alta.

**Como usar:** Identifique estados com cores consistentemente quentes — eles representam risco crônico. Estados com mudança brusca de cor merecem investigação.

#### GRF-06 — Dispersão PF vs PJ por Estado (Scatter)
Cada ponto representa um estado. Eixo X = inadimplência PF; Eixo Y = inadimplência PJ. A cor do ponto indica a macrorregião.

**Como usar:** Estados no canto superior direito têm alto risco em ambos os segmentos. Estados no canto inferior esquerdo são os mais saudáveis.

#### GRF-07 — Estudo de Caso por Estado (Linha)
Selecione um estado específico no filtro para ver o histórico detalhado de saldo de crédito e inadimplência daquele estado.

#### GRF-08 — Score IOI por Estado (Barras)
Ranking visual dos 27 estados pelo Índice de Oportunidade Inclusiva (IOI), de 0 a 10. Quanto maior o score, maior a oportunidade de expansão sustentável de crédito.

#### GRF-09 — Simulação Monte Carlo (Histograma + KDE)
Exibe a distribuição de probabilidade de perdas simuladas para o estado selecionado, com marcadores de VaR 95% e VaR 99%.

---

## 3. Ranking de Oportunidades

Acesse o menu **Ranking** para visualizar a tabela completa dos 27 estados ordenada pelo Score IOI.

### Entendendo o Score IOI

O **Índice de Oportunidade Inclusiva (IOI)** vai de 0 a 10 e combina dois componentes:

| Componente | Peso | O que mede |
|---|---|---|
| Score de Inadimplência | 60% | Nível atual de inadimplência (menor = melhor oportunidade) |
| Score de Tendência | 40% | Direção da inadimplência nos últimos meses |

**Fórmula:** `IOI = (s_inadimplência × 0,60 + s_tendência × 0,40) × 10`

Clique em qualquer estado na tabela para ver o detalhamento dos componentes.

---

## 4. Simulação de Risco (Monte Carlo)

A simulação de Monte Carlo projeta o risco de perdas para uma carteira de crédito em um estado específico.

### Como executar uma simulação

1. Acesse o menu **Simulações**
2. Selecione o **Estado** desejado
3. Ajuste os parâmetros (ou mantenha os padrões):
   - **Montante da carteira:** R$ 150 milhões (padrão)
   - **LGD (Loss Given Default):** 65% (padrão)
   - **Número de iterações:** 10.000 (padrão)
4. Clique em **Executar Simulação**

### Interpretando os resultados

| Métrica | Significado |
|---|---|
| **Perda Média Esperada** | Valor central da distribuição simulada |
| **VaR 95%** | Em 95% dos cenários, a perda não ultrapassará este valor |
| **VaR 99%** | Em 99% dos cenários, a perda não ultrapassará este valor |

---


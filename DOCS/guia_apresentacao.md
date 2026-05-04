# 📊 Guia de Apresentação — Mapa de Oportunidade para Crédito Inclusivo

> **Projeto:** API 3º Semestre — FATEC · **Cliente:** DM (empresa de cartões de crédito)  
> **Missão do projeto:** Usar dados públicos do Banco Central para descobrir *onde* há mais espaço para oferecer crédito às pessoas que normalmente são negadas pelos grandes bancos.

---

## 🧭 Contexto Rápido (1 minuto para entender tudo)

A **DM** é uma empresa de cartões de crédito que foca em quem tem dificuldade de conseguir crédito nos bancos tradicionais. Eles querem crescer, mas precisam saber **onde** crescer com segurança — sem assumir riscos demais.

Nossa solução: um **painel inteligente (dashboard)** que analisa dados públicos do Banco Central e responde, em tempo real, à pergunta: *"Quais regiões do Brasil têm mais oportunidade para expansão de crédito com risco controlado?"*

---

## 📈 Gráfico 1 — Saldo de Crédito SFN

> **Título no sistema:** *Saldo de Crédito SFN — PF, PJ e Total (R$ mi)*

### O que é?
Um gráfico de linha que mostra a **evolução do total de crédito concedido no Brasil** ao longo do tempo — separado em:
- 🔵 **PF** = Pessoa Física (crédito para pessoas comuns, como você e eu)  
- 🟠 **PJ** = Pessoa Jurídica (crédito para empresas)  
- 🟢 **Total** = a soma dos dois

Os valores são em **R$ mi**, ou seja, *milhões de reais*.

### O que o gráfico mostra?
Olhando o gráfico: desde 2016, o crédito no Brasil não parou de crescer. Em 2016, o total era de aproximadamente **R$ 1,5 trilhão** (1,5 mil mihões). Em 2026, já está perto de **R$ 4,5 trilhões**.

Isso é importante porque mostra que o **mercado de crédito está aquecido** — as pessoas estão tomando mais crédito. Para a DM, isso significa que há mercado crescendo para atender.

### Por que isso é relevante para a DM?
A DM precisa saber se o mercado está em expansão ou retraindo. Um mercado em crescimento sinaliza que há clientes em potencial. Mais crédito sendo concedido = mais espaço para novos players entrarem.

---

## 🌡️ Gráfico 2 — Heatmap de Inadimplência Estadual

> **Título no sistema:** *Heatmap de Inadimplência Estadual — Matriz UF x Mês (últimos 24 meses)*

### O que é?
Um **mapa de calor** (heatmap) que mostra, estado por estado e mês por mês, qual é o nível de inadimplência — ou seja, o percentual de pessoas que pegaram crédito e **não conseguiram pagar**. A escala de cor é simples:

- 🟢 **Verde** = inadimplência baixa → baixo risco
- 🟡 **Amarelo** = inadimplência média → risco moderado
- 🔴 **Vermelho** = inadimplência alta → alto risco

### O que o gráfico mostra?
- A maioria dos estados fica em **verde claro ou amarelo** durante a maior parte do período — o que é um bom sinal geral.
- **Tocantins (TO)** e **Maranhão (MA)** aparecem em **vermelho intenso** nos meses mais recentes — são estados com tendência de piora.
- Estados como **Distrito Federal (DF)**, **Santa Catarina (SC)** e **Espírito Santo (ES)** ficam sempre em verde — sinal de boa saúde financeira da população.

### Por que isso é relevante para a DM?
Antes de entrar num mercado, a DM precisa saber se as pessoas daquela região **conseguem pagar suas dívidas**. Vermelho = muito risco. Verde = oportunidade segura. Esse gráfico é o "termômetro de risco" do Brasil mês a mês.

---

## 🏆 Gráfico 3 — Score IOI — Ranking de Oportunidade

> **Título no sistema:** *Score IOI — Índice de Oportunidade Inclusiva (0 a 10)*

### O que é?
Um **ranking de todos os estados brasileiros** em uma escala de 0 a 10, onde **10 = maior oportunidade** para a DM expandir com segurança.

O score IOI (Índice de Oportunidade Inclusiva) é calculado automaticamente combinando dois fatores principais:
1. **Inadimplência atual** — quanto menor, melhor (sinal de que as pessoas pagam suas dívidas)
2. **Tendência** — se o estado está melhorando ou piorando nos últimos meses

A cor das barras indica a classificação:
- 🔵 **Azul** = Alta oportunidade (score ≥ 6)
- 🟠 **Laranja** = Oportunidade média (score entre 4 e 6)
- 🔴 **Vermelho** = Baixa oportunidade (score < 4)

### O que o gráfico mostra?
- **DF, SC e ES** lideram com scores próximos de 7,5 — os melhores mercados
- **SP, PR, PB, MG e SE** também pontuam bem, acima de 6
- **MS, GO** ficam abaixo de 3,5 — mercados arriscados no momento
- **MA** com 0,8 e **TO** com 0,0 — **praticamente inviáveis agora**, confirmando o que o heatmap já mostrou

### Por que isso é relevante para a DM?
Esse é o **coração do projeto**. A DM não precisa analisar planilha por planilha — o sistema já calculou e ordenou quais estados têm mais oportunidade. É a resposta direta à pergunta do cliente.

---

## 📊 Gráfico 4 — Inadimplência Regional

> **Título no sistema:** *Inadimplência Regional — Boxplot histórico + barras do valor atual*

### O que é?
Este gráfico tem **duas partes**:

**Parte de cima (GRF-04 — Barras):** Mostra a inadimplência **atual** de cada uma das 5 macrorregiões do Brasil.

**Parte de baixo (GRF-03 — Boxplot):** Mostra como essa inadimplência se comportou **historicamente**. O "boxplot" pode parecer estranho, mas é fácil de entender:
- A **barra colorida** = valor típico (mediana histórica)
- As **linhas verticais** (whiskers) = variação histórica (mínimo e máximo já registrado)
- Quanto mais alto o whisker, mais volátil/imprevisível aquela região é

### O que o gráfico mostra?
- **Norte** tem a maior inadimplência atual (≈7%) e historicamente já chegou próximo de 7% — consistentemente mais arriscado
- **Nordeste** também está alto (≈6%) com grande variação histórica
- **Sul** e **Sudeste** ficam em torno de 4,5-5% — mais controlado
- **Centro-Oeste** tem inadimplência atual (~6%) mas historicamente ficava em torno de 3% — está acima da sua média histórica, o que é um **sinal de alerta**

### Por que isso é relevante para a DM?
A DM precisa saber não só o risco **hoje**, mas se aquele risco é normal ou é uma anomalia. Centro-Oeste estando acima da sua média histórica é um ponto de atenção para não expandir aggressivamente lá agora.

---

## 🔵 Gráfico 5 — Dispersão PF vs PJ

> **Título no sistema:** *Dispersão PF vs PJ — Inadimplência atual por estado*

### O que é?
Um gráfico de **dispersão** (pontos no plano) onde cada ponto é um estado brasileiro. A posição do ponto indica:
- **Eixo horizontal (X)** = % de inadimplência das **Pessoas Físicas** (PF) naquele estado
- **Eixo vertical (Y)** = % de inadimplência das **Pessoas Jurídicas** (PJ) naquele estado
- **Cor do ponto** = macrorregião do estado

### O que o gráfico mostra?
- A maioria dos estados se concentra na faixa de **4% a 7% de inadimplência PF** e **3% a 6% de inadimplência PJ**
- **PA (Pará)** é um outlier: tem inadimplência PJ muito alta (≈9,5%) mas inadimplência PF em torno de 5% — empresas no Pará estão tendo mais dificuldade que as pessoas físicas
- **RO (Rondônia)** aparece isolado no topo com inadimplência PJ elevada
- Estados do **Sul** (vermelho) tendem a ter os menores valores nos dois eixos — são os mais saudáveis
- O gráfico não mostra uma correlação muito clara entre PF e PJ — o que faz sentido, pois empresas e pessoas enfrentam pressões financeiras diferentes

### Por que isso é relevante para a DM?
Como a DM foca em **crédito para pessoas físicas (PF)**, o eixo X é o mais importante. Estados no canto inferior-esquerdo (baixa inadimplência PF *e* PJ) são os mais seguros. DF e SC aparecem entre os melhores.

---

## 📉 Gráfico 6 — Contexto Macroeconômico

> **Título no sistema:** *Contexto Macroeconômico — Selic, IPCA e Inadimplência PF — eixo duplo*

### O que é?
Um gráfico que mistura três indicadores econômicos nacionais em um só lugar:
- 🔵 **Selic (% ao ano)** — a taxa básica de juros do Brasil. Quando a Selic sobe, o crédito fica mais caro e mais difícil de pagar.
- 🟡 **IPCA (% ao mês)** — a inflação oficial do Brasil (barras douradas). Quando a inflação sobe, o poder de compra cai.
- 🔴 **Inadimplência PF** — % de pessoas físicas que não estão pagando seus créditos.

O gráfico tem **dois eixos verticais**: o da esquerda é para a Selic (escala maior, em %) e o da direita é para IPCA e Inadimplência (escala menor, em %).

### O que o gráfico mostra?
- A **Selic** subiu bruscamente de 2021 (≈4%) até 2022 (≈13%) e se manteve alta até 2026 (≈14,5%) — o Brasil está num ciclo de juros altos
- O **IPCA** ficou mais volátil em 2021-2022 e depois se estabilizou em torno de 0% a 0,5% ao mês — a inflação foi controlada
- A **inadimplência PF** subiu gradualmente de ≈2,5% em 2021 para ≈4,5% em 2026, acompanhando a Selic — isso era esperado: juros mais altos = dívidas mais caras = mais calote

### Por que isso é relevante para a DM?
O ambiente macroeconômico afeta **toda estratégia de crédito**. Com Selic alta e inadimplência em alta, a DM precisa ser criteriosa em quais regiões expandir — e esses dados explicam *por que* alguns estados estão com inadimplência maior agora: é o cenário nacional pesando.

---

## ⚠️ Inconsistências e Pontos de Atenção

### 🔴 Problemas identificados que valem mencionar na apresentação:

**1. Tocantins (TO) com Score 0,0 e MA com 0,8**
O sistema atribui score zero a TO e quase zero ao MA. Isso é consistente com o heatmap (ambos aparecem em vermelho intenso) — portanto os dados são coerentes. **Ponto de destaque para a DM:** essas regiões devem ser evitadas no curto prazo.

**2. Centro-Oeste acima da média histórica**
O boxplot (GRF-03) mostra que Centro-Oeste (GO, MT, MS, DF) costumava ter inadimplência em torno de 3%, mas o valor atual está perto de 6%. O score de **GO = 3,2 e MS = 3,3** confirma essa deterioração. É um alerta de curto prazo.

**3. PA (Pará) tem alta inadimplência PJ mas PF moderada**
No gráfico de dispersão, o PA aparece como outlier em PJ. Isso pode indicar que empresas no Pará estão em maior dificuldade — o que pode ser reflexo de crises setoriais (agronegócio, mineração). Vale monitorar.

**4. Nota de rodapé no Score IOI**
O gráfico mostra um aviso: *"Score calculado dinamicamente — tabela de ranking ainda não populada via recálculo batch"*. Isso significa que o score está sendo calculado em tempo real, mas ainda não foi otimizado via processamento em batch (que seria mais rápido). Para a apresentação, vale mencionar que essa é uma **melhoria planejada** para o futuro.

---

## ✅ Como os Dados Respondem ao Pedido da DM

| O que a DM queria | Como o projeto entrega |
|---|---|
| Identificar territórios com maior potencial para expansão | ✅ Score IOI rankeia todos os 27 estados de 0 a 10 |
| Entender o risco de inadimplência por região | ✅ Heatmap mostra evolução mês a mês por estado |
| Ver dados de volume de crédito no mercado | ✅ Gráfico de Saldo de Crédito SFN mostra crescimento histórico |
| Contexto econômico para entender as tendências | ✅ Gráfico Macro com Selic, IPCA e Inadimplência nacional |
| Comparar regiões lado a lado | ✅ Gráfico de Dispersão PF vs PJ e Inadimplência Regional |
| Expansão sustentável e com risco controlado | ✅ Boxplot histórico permite ver se a situação atual é exceção ou regra |

---

## 💡 O que Destacar na Apresentação

1. **O problema da DM é real**: a inadimplência está em alta no Brasil inteiro (juros altos), então escolher *onde* entrar é crítico.
2. **Nossa solução automatiza essa análise**: ao invés de analisar planilha por planilha, o Score IOI já entrega um ranking pronto.
3. **Os dados são confiáveis**: vêm diretamente da API pública do Banco Central — a mesma fonte que o mercado financeiro usa.
4. **Recomendação concreta que o sistema entrega**: DF, SC e ES são os melhores mercados agora. TO e MA devem ser evitados.

---

*Documento gerado com base nos gráficos do dashboard e no README do projeto — Mapa de Oportunidade para Crédito Inclusivo, FATEC 3º Semestre ADS.*

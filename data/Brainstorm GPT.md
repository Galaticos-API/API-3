Seu projeto é **muito alinhado com como bancos e fintechs realmente analisam mercado de crédito regional**. O Banco Central fornece, via **SGS (Sistema Gerenciador de Séries Temporais)** e estatísticas monetárias/creditícias, dados suficientes para construir **mapas de oportunidade de crédito por região**.

Vou estruturar a resposta em três partes importantes para o seu sistema:

1. **Quais dados da API do Banco Central são úteis**
2. **Quais indicadores realmente determinam oportunidade de crédito**
3. **Como transformar esses dados em um “Mapa de Oportunidade de Crédito”**

---

# 1. Dados do Banco Central úteis para seu projeto

O Banco Central coleta dados do **Sistema de Informações de Crédito (SCR)**, que registra operações de crédito do sistema financeiro brasileiro e permite acompanhar volume, inadimplência e perfil de crédito das regiões. ([Banco Central][1])

Esses dados incluem **mais de um bilhão de operações de crédito** com detalhes sobre tipo de crédito, perfil do tomador e desempenho das operações. ([Banco Central][1])

No **SGS**, os dados mais úteis para seu projeto são:

---

# A) Volume de crédito por região

Séries de **saldo de operações de crédito por UF ou região**.

### Exemplos de métricas

* Saldo total de crédito
* Crédito para **pessoas físicas**
* Crédito para **pessoas jurídicas**
* Crédito por setor econômico
* Crédito rural
* Crédito imobiliário

### Por que é importante

Mostra **penetração de crédito** no mercado.

Exemplo de insight:

| Região | Crédito per capita           | Interpretação |
| ------ | ---------------------------- | ------------- |
| Alto   | mercado saturado             |               |
| Médio  | mercado competitivo          |               |
| Baixo  | **oportunidade de expansão** |               |

---

# B) Concessões de crédito

Fluxo de novos empréstimos concedidos.

### Métricas

* Concessão mensal de crédito
* Concessões PF
* Concessões PJ
* Concessões por modalidade

### Por que importa

Indica **demanda por crédito**.

Exemplo:

| Região                       | Concessão        | Interpretação |
| ---------------------------- | ---------------- | ------------- |
| Alta concessão               | mercado aquecido |               |
| Baixa concessão + renda alta | oportunidade     |               |

---

# C) Taxa de inadimplência

Taxa de operações com atraso superior a 90 dias. ([HEDGEHOG — Séries Temporais do BCB-SGS][2])

### Métricas

* Inadimplência PF
* Inadimplência PJ
* Inadimplência por região
* Inadimplência por modalidade

### Por que importa

É o **principal indicador de risco**.

| Inadimplência | Interpretação |
| ------------- | ------------- |
| Alta          | risco alto    |
| Baixa         | bom mercado   |

---

# D) Taxa média de juros

Média das taxas praticadas em operações de crédito.

### Métricas

* Juros PF
* Juros PJ
* Juros por modalidade

### Por que importa

Mostra **rentabilidade potencial**.

Exemplo:

| Juros       | Significado      |
| ----------- | ---------------- |
| Muito alto  | mercado de risco |
| Moderado    | saudável         |
| Muito baixo | mercado saturado |

---

# E) Endividamento das famílias

Indicador muito importante.

Exemplo:

* Endividamento das famílias
* Comprometimento de renda

No Brasil, o endividamento das famílias chegou perto de **48% da renda** recentemente. ([UOL Economia][3])

### Por que importa

| Endividamento | Interpretação          |
| ------------- | ---------------------- |
| Baixo         | espaço para crédito    |
| Alto          | risco de inadimplência |

---

# F) Spread bancário

Diferença entre custo de captação e taxa de empréstimo.

### Por que importa

Indica **lucratividade do mercado**.

---

# G) Crédito por setor econômico

Exemplo:

* comércio
* indústria
* serviços
* agronegócio

### Por que importa

Permite identificar **economias locais fortes**.

---

# H) Classificação de risco do crédito

O BC classifica operações em níveis:

AA, A, B, C, D, E, F, G, H. ([HEDGEHOG — Séries Temporais do BCB-SGS][4])

### Por que importa

Permite medir **qualidade da carteira da região**.

---

# 2. Indicadores que realmente mostram oportunidade de crédito

Para um **mapa de oportunidade**, você precisa combinar variáveis.

Os bancos normalmente analisam:

---

# 1️⃣ Demanda por crédito

Indicadores:

* crescimento do crédito
* concessões
* consumo
* renda

**Sinal de oportunidade**

```
alta demanda + baixa penetração
```

---

# 2️⃣ Risco

Indicadores:

* inadimplência
* risco de crédito
* renda média

**Sinal de oportunidade**

```
inadimplência baixa
```

---

# 3️⃣ Saturação do mercado

Indicadores:

* crédito per capita
* número de instituições
* volume de crédito

**Sinal de oportunidade**

```
baixa oferta de crédito
```

---

# 4️⃣ Rentabilidade

Indicadores:

* taxa de juros média
* spread bancário

**Sinal de oportunidade**

```
juros relativamente altos
```

---

# 5️⃣ Crescimento econômico regional

Indicadores:

* crescimento do crédito
* atividade econômica
* emprego

**Sinal de oportunidade**

```
região em crescimento
```

---

# 3. Como transformar isso em um “Mapa de Oportunidade de Crédito”

Você pode criar um **score regional**.

Exemplo:

```
Opportunity Score =
+ crescimento_credito
+ demanda_credito
+ renda_media
- inadimplencia
- endividamento
```

---

## Exemplo de score

| Região   | Demanda | Risco | Oferta | Score |
| -------- | ------- | ----- | ------ | ----- |
| Região A | alta    | baixa | baixa  | ⭐⭐⭐⭐  |
| Região B | média   | baixa | média  | ⭐⭐⭐   |
| Região C | alta    | alta  | baixa  | ⭐     |

---

# 4. Visualização ideal para o projeto

Você pode criar:

### 1️⃣ Mapa de calor do Brasil

Cores indicando oportunidade:

```
verde = oportunidade alta
amarelo = médio
vermelho = risco alto
```

---

### 2️⃣ Ranking de cidades/estados

```
TOP oportunidades
1 — interior SP
2 — sul MG
3 — interior PR
```

---

### 3️⃣ Radar de risco

Para cada região:

```
demanda
inadimplência
renda
juros
endividamento
```

---

# 5. Dados extras importantes (fora do BC)

Para melhorar muito seu modelo:

* IBGE (renda e população)
* Serasa (inadimplência)
* Cadastro positivo
* dados de consumo

---

# 6. Estrutura ideal do dataset do seu sistema

Você pode montar algo assim:

```json
{
  "estado": "SP",
  "credito_total": 230000000000,
  "credito_pf": 120000000000,
  "credito_pj": 110000000000,
  "inadimplencia": 3.2,
  "taxa_juros_media": 42,
  "endividamento_familias": 46,
  "concessoes_credito": 15000000000,
  "score_oportunidade": 0.74
}
```

---

# 7. Um insight importante para o seu projeto

Empresas como:

* Nubank
* Mercado Pago
* DM Card
* C6

fazem exatamente isso:

**mapas geográficos de crédito** para decidir:

* onde oferecer cartão
* onde oferecer crédito pessoal
* onde expandir operação

---

✅ **Resumo — dados mais importantes do Banco Central**

Prioridade máxima:

1️⃣ inadimplência por região
2️⃣ saldo de crédito por região
3️⃣ concessões de crédito
4️⃣ juros médios
5️⃣ endividamento das famílias
6️⃣ crescimento do crédito
7️⃣ crédito por setor econômico

---

💡 Se quiser, posso também te mostrar algo **muito mais avançado**:

* **as séries exatas do Banco Central (códigos SGS)** que você deve usar
* cerca de **40 indicadores perfeitos para esse projeto**
* já organizados em **um JSON para API**

Isso aceleraria muito o desenvolvimento do seu sistema.

[1]: https://www.bcb.gov.br/publicacoes/rig23-nossosresultados?utm_source=chatgpt.com "Nossos resultados"
[2]: https://hedgehog.dkko.me/series/15922?utm_source=chatgpt.com "Taxa de inadimplência das operações de crédito do Sistema Financeiro Nacional - Região Centro-Oeste - Pessoas jurídicas | Séries Temporais do BCB-SGS"
[3]: https://economia.uol.com.br/noticias/redacao/2024/12/27/dados-banco-central-27-12.htm?utm_source=chatgpt.com "Banco Central divulga dados de crédito"
[4]: https://hedgehog.dkko.me/series/11703?utm_source=chatgpt.com "Saldo das operações de crédito - Risco D - Setor habitacional | Séries Temporais do BCB-SGS"

Abaixo estão **séries reais do SGS (Sistema Gerenciador de Séries Temporais)** do Banco Central que são **diretamente úteis para um mapa de oportunidade de crédito**.
Vou organizar em **categorias analíticas**, que é exatamente como bancos estruturam modelos de crédito regional.

Também incluo:

* **Código da série SGS**
* **Nome**
* **Por que usar no seu modelo**

---

# 1. DEMANDA POR CRÉDITO

Essas séries medem **quanto crédito está sendo tomado na economia**.

### Concessões de crédito

| Código SGS | Série                                   |
| ---------- | --------------------------------------- |
| 20631      | Concessões de crédito – Total           |
| 20632      | Concessões de crédito – Pessoa Jurídica |
| 20633      | Concessões de crédito – Pessoa Física   |

Essas séries são publicadas mensalmente nas estatísticas monetárias e de crédito do Banco Central. ([Banco Central][1])

### Por que usar

Medem **demanda real por crédito**.

Exemplo de insight:

```
Alta concessão + baixa presença de instituições
= oportunidade comercial
```

---

# 2. TAMANHO DO MERCADO DE CRÉDITO

Mostra **o estoque total de crédito existente**.

| Código SGS | Série                                           |
| ---------- | ----------------------------------------------- |
| 20539      | Saldo de crédito do Sistema Financeiro Nacional |
| 20540      | Saldo de crédito PF                             |
| 20541      | Saldo de crédito PJ                             |

### Por que usar

Permite calcular:

```
Crédito per capita
Penetração de crédito
```

Se uma região tem **baixo saldo de crédito por habitante**, ela pode ter **mercado subexplorado**.

---

# 3. INADIMPLÊNCIA

Esse é o **principal indicador de risco de crédito**.

| Código SGS | Série                                   |
| ---------- | --------------------------------------- |
| 21082      | Taxa de inadimplência – Total           |
| 21083      | Taxa de inadimplência – Pessoa Física   |
| 21084      | Taxa de inadimplência – Pessoa Jurídica |

### Definição

Inadimplência geralmente significa **operações com atraso superior a 90 dias**.

### Por que usar

```
Baixa inadimplência + alta demanda
= oportunidade
```

---

# 4. TAXAS DE JUROS

Mostra **rentabilidade potencial do crédito**.

| Código SGS | Série                       |
| ---------- | --------------------------- |
| 20714      | Taxa média de juros – Total |
| 20715      | Taxa média de juros – PF    |
| 20716      | Taxa média de juros – PJ    |

### Insight

```
Juros muito altos
→ mercado de risco
```

```
Juros moderados + inadimplência baixa
→ mercado ideal
```

---

# 5. ENDIVIDAMENTO DAS FAMÍLIAS

Indicador crítico para crédito ao consumidor.

| Código SGS | Série                                                     |
| ---------- | --------------------------------------------------------- |
| 19882      | Endividamento das famílias / renda                        |
| 20400      | Endividamento das famílias (exceto imobiliário)           |
| 29265      | Comprometimento de renda das famílias – serviço da dívida |

O Banco Central publica essas séries no SGS para acompanhar o peso da dívida das famílias em relação à renda. ([Banco Central][2])

### Insight

```
Endividamento alto
→ risco de inadimplência futura
```

---

# 6. SPREAD BANCÁRIO

Mostra a **margem financeira do crédito**.

| Código SGS | Série                                 |
| ---------- | ------------------------------------- |
| 20783      | Spread médio das operações de crédito |

### Insight

```
Spread alto
→ maior rentabilidade para fintech
```

---

# 7. COMPOSIÇÃO DO CRÉDITO

Permite identificar **perfil econômico da região**.

| Código SGS | Série               |
| ---------- | ------------------- |
| 20726      | Crédito livre PF    |
| 20727      | Crédito livre PJ    |
| 20728      | Crédito direcionado |

### Insight

```
Região com muito crédito livre
→ mercado mais competitivo
```

---

# 8. INDICADORES MACRO IMPORTANTES

Esses ajudam a **avaliar potencial econômico da região**.

### PIB

| Código SGS | Série          |
| ---------- | -------------- |
| 22099      | PIB trimestral |
| 21775      | PIB per capita |

Essas séries também estão disponíveis no SGS. ([Banco Central][3])

### Inflação

| Código SGS | Série |
| ---------- | ----- |
| 433        | IPCA  |

### Juros

| Código SGS | Série |
| ---------- | ----- |
| 11         | Selic |

---

# 9. INDICADORES AVANÇADOS DE CRÉDITO (MUITO ÚTEIS)

Se quiser sofisticar o modelo:

### Concessões por tipo

| Código SGS | Série                              |
| ---------- | ---------------------------------- |
| 28925      | Concessões – recursos livres       |
| 28926      | Concessões – recursos direcionados |

Essas séries foram atualizadas em revisão metodológica do BC. ([Banco Central][4])

---

# 10. ESTRUTURA IDEAL DE BASE DE DADOS PARA O PROJETO

Você pode consolidar os dados assim:

```json
{
  "estado": "SP",
  "credito_total": 500000000000,
  "credito_pf": 320000000000,
  "credito_pj": 180000000000,
  "inadimplencia_pf": 3.5,
  "taxa_juros_pf": 42,
  "endividamento_familias": 48,
  "concessoes_credito_pf": 25000000000,
  "spread": 29
}
```

---

# 11. MODELO DE SCORE DE OPORTUNIDADE

Você pode calcular algo assim:

```
Opportunity Score =
+ crescimento_credito
+ concessoes
+ renda
- inadimplencia
- endividamento
```

---

# 12. VISUALIZAÇÕES IDEAIS

Para o projeto da **DM Card**:

### Mapa de calor

Estados ou cidades:

```
verde = oportunidade alta
amarelo = médio
vermelho = risco alto
```

---

### Ranking de regiões

```
Top regiões para expansão de crédito
```

---

# 13. DICA IMPORTANTE PARA O PROJETO

As séries do BC **normalmente são nacionais**, não por município.

Então o modelo geralmente combina:

Banco Central + IBGE

| Fonte | Dados             |
| ----- | ----------------- |
| BCB   | crédito e risco   |
| IBGE  | renda e população |

---

✅ **Resumo — séries essenciais para começar**

Use pelo menos essas:

```
20631  concessões crédito total
20633  concessões PF
20540  saldo crédito PF
21083  inadimplência PF
20715  juros PF
19882  endividamento famílias
20783  spread bancário
21775  PIB per capita
```

---

💡 Se quiser, posso também te entregar algo **extremamente útil para seu projeto**:

* **um JSON com ~120 séries do Banco Central relevantes**
* classificadas em

  * risco
  * demanda
  * renda
  * mercado

Isso vira praticamente **um data lake pronto para seu sistema de mapas de crédito**.

[1]: https://www.bcb.gov.br/content/publicacoes/notastecnicas/NT_51_Dstat_Dimob_agosto_2019.pdf?utm_source=chatgpt.com "Nota Técnica do Banco Central do Brasil 51"
[2]: https://www.bcb.gov.br/content/estatisticas/hist_estatisticasmonetariascredito/202303_Texto_de_estatisticas_monetarias_e_de_credito.pdf?utm_source=chatgpt.com "29.3.2023"
[3]: https://www.bcb.gov.br/estatisticas/indecoreestruturacao/1000?utm_source=chatgpt.com "Indicadores Econômicos Consolidados – Tabelas que foram descontinuadas"
[4]: https://www.bcb.gov.br/content/estatisticas/hist_estatisticasmonetariascredito/202105_Texto_de_estatisticas_monetarias_e_de_credito.pdf?utm_source=chatgpt.com "28.5.2021"

A resposta curta: **a maioria das séries do SGS do Banco Central é nacional**, não regional.
Isso é um ponto importante no desenho do seu projeto.

Para construir **mapas de oportunidade de crédito por região**, você precisará **combinar dados do Banco Central com outras bases**.

Vou explicar exatamente como funciona.

---

# 1. Séries do SGS: geralmente nacionais

A maior parte das séries disponíveis em
Banco Central do Brasil no **SGS** representa **dados agregados do sistema financeiro brasileiro**.

Exemplos:

| Série                      | Escala |
| -------------------------- | ------ |
| Saldo total de crédito     | Brasil |
| Taxa média de juros        | Brasil |
| Inadimplência              | Brasil |
| Endividamento das famílias | Brasil |
| Spread bancário            | Brasil |

Ou seja:

```
SGS → nível nacional
```

Essas séries são usadas para:

* contexto macroeconômico
* benchmark
* modelagem econômica

Mas **não servem diretamente para mapa regional**.

---

# 2. Onde existem dados regionais do Banco Central

O Banco Central publica dados regionais principalmente em **outras bases**, não no SGS.

## 1️⃣ Estatísticas de crédito por região

Publicação:

**Estatísticas Monetárias e de Crédito**

Alguns dados existem por:

* região
* estado

Exemplos:

| Dado                             | Nível  |
| -------------------------------- | ------ |
| Saldo de crédito                 | região |
| Saldo PF / PJ                    | região |
| Participação regional do crédito | região |

---

## 2️⃣ SCR (Sistema de Informações de Crédito)

Base:

Sistema de Informações de Crédito

Essa é a **base mais rica de crédito do país**.

Contém:

* todas operações de crédito do sistema financeiro
* perfil do tomador
* tipo de crédito
* classificação de risco

Porém:

⚠️ **não é pública em nível micro**.

O BC divulga apenas **agregados estatísticos**.

---

## 3️⃣ IF.Data

Outra base do BC:

IF.Data

Ela possui dados por:

* estado
* região
* instituição financeira

Exemplos de dados regionais:

| Indicador           | Região    |
| ------------------- | --------- |
| Saldo de crédito    | estado    |
| Crédito PF          | estado    |
| Crédito PJ          | estado    |
| Número de agências  | município |
| Volume de operações | estado    |

Essa base é **excelente para seu projeto**.

---

# 3. Dados regionais que realmente existem

Você consegue encontrar regionalmente:

### Crédito

* saldo de crédito por estado
* crédito PF
* crédito PJ
* crédito rural
* crédito imobiliário

---

### Instituições financeiras

* número de agências
* presença bancária
* instituições por município

---

### Cooperativas e financeiras

* distribuição regional

---

# 4. Dados que NÃO existem regionalmente no BC

Esses são quase sempre **apenas nacionais**:

| Indicador               | Disponibilidade |
| ----------------------- | --------------- |
| taxa média de juros     | nacional        |
| spread bancário         | nacional        |
| endividamento famílias  | nacional        |
| inadimplência detalhada | nacional        |

---

# 5. Como bancos resolvem isso

Bancos e fintechs usam **data fusion**.

Misturam dados de várias fontes.

### Exemplo

| Fonte                                           | Dados                |
| ----------------------------------------------- | -------------------- |
| Banco Central                                   | crédito              |
| Instituto Brasileiro de Geografia e Estatística | renda e população    |
| Serasa Experian                                 | inadimplência        |
| Cadastro Positivo                               | histórico de crédito |

---

# 6. Modelo ideal para seu projeto

Um **dataset regional** ficaria assim:

```json
{
  "estado": "MG",
  "populacao": 21000000,
  "renda_media": 2200,
  "credito_total": 320000000000,
  "credito_per_capita": 15238,
  "inadimplencia": 3.8,
  "crescimento_credito": 0.12,
  "score_oportunidade": 0.72
}
```

---

# 7. Indicadores que realmente mostram oportunidade regional

Você deve calcular:

### Penetração de crédito

```
credito_total / população
```

---

### Crédito / PIB regional

```
credito / pib
```

---

### Crescimento do crédito

```
variação anual
```

---

### Risco regional

```
inadimplência
```

---

# 8. Insight importante para DM Card

Empresas de **cartão private label e crédito varejista** normalmente buscam regiões com:

```
baixa penetração de crédito
+
crescimento econômico
+
inadimplência controlada
```

---

# 9. Melhor arquitetura para seu projeto

Você pode montar um **data lake assim**:

```
Banco Central
   |
   |-- SGS (macro)
   |-- IF.DATA (regional)
   |
IBGE
   |
   |-- população
   |-- renda
   |-- PIB
```

---

# 10. Visualização ideal

Mapa com:

```
Oportunidade de crédito por estado
```

Cálculo:

```
Opportunity Score =
+ renda
+ crescimento crédito
+ população
- inadimplência
- saturação crédito
```

---

✅ **Resumo**

| Tipo de dado       | Regional? |
| ------------------ | --------- |
| Saldo de crédito   | ✔         |
| Crédito PF / PJ    | ✔         |
| Número de agências | ✔         |
| Taxa de juros      | ❌         |
| Spread             | ❌         |
| Endividamento      | ❌         |

---

💡 Se quiser, posso te mostrar algo **extremamente útil para esse projeto**:

* **todas as bases do Banco Central que possuem dados regionais**
* cerca de **70 datasets utilizáveis**
* com **links diretos para API**

Isso é basicamente **o mapa completo de dados de crédito do Brasil**, e pouca gente conhece essas bases.


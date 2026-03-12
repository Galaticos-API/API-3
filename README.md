# Projeto Integrador 3º Semestre - Análise e Desenvolvimento de Sistemas (FATEC)

<div align="center">
  <h3>Mapa de Oportunidade para Crédito Inclusivo</h3>
</div>

<br>

<p align="center">
  <a href="#-o-projeto">O Projeto</a> &nbsp;&bull;&nbsp;
  <a href="#-desafio">Desafio</a> &nbsp;&bull;&nbsp;
  <a href="#-solução">Solução</a> &nbsp;&bull;&nbsp;
  <a href="#-backlogs">Backlogs</a> &nbsp;&bull;&nbsp;
  <a href="#-dor-e-dod">DoR e DoD</a> &nbsp;&bull;&nbsp;
  <a href="#-tecnologias">Tecnologias</a> &nbsp;&bull;&nbsp;
  <a href="#-manuais">Manuais</a> &nbsp;&bull;&nbsp;
  <a href="#-equipe">Equipe</a>
</p>

---

## 💻 O Projeto

Projeto API (Aprendizagem por Projetos Integrados) correspondente ao **3º Semestre em Análise e Desenvolvimento de Sistemas (ADS)** da instituição **FATEC**.

O tema é: **"Negado pelo banco. Oportunidade para quem? Inteligência de crédito com Dados Públicos do Banco Central"** em parceria com a empresa **DM**.

## 🎯 Desafio

A DM é uma instituição financeira que atua no mercado de cartões de crédito há mais de 20 anos, focando na democratização do acesso ao crédito, especialmente para populações de menor poder aquisitivo.

**O objetivo é expandir a base de clientes tradicional para perfis que, de modo geral, têm o crédito negado em bancos maiores.**

Para alcançar esse objetivo, fomos desafiados a **analisar exclusivamente dados públicos do Banco Central do Brasil**. Como foco regional, analisaremos indicadores como:

- Volume de concessões de crédito;
- Crescimento da carteira;
- Inadimplência;
- Endividamento das famílias;

O produto final da análise será a construção de um **Mapa de Oportunidade para Crédito Inclusivo** que seja capaz de identificar os territórios com o maior potencial de expansão sustentável para as operações de crédito da DM.

## 💡 Solução

O projeto está no início do desenvolvimento.

## 📋 Backlogs

### Product Backlog

| Rank | Prioridade | User Story | Estimativa | Sprint |
| :---: | :---: | :--- | :---: | :---: |
| 1 | Alta | Como analista de expansão, quero visualizar um mapa interativo do Brasil com indicadores de crédito por estado, para identificar rapidamente regiões com maior potencial para novos cartões | 13 | 2 |
| 2 | Alta | Como estrategista de risco, quero acompanhar o crescimento da carteira de crédito versus o índice de inadimplência das famílias, para evitar a entrada em mercados saturados ou com risco de calote elevado | 13 | 2 |
| 3 | Alta | Como analista financeiro, quero visualizar a evolução do Spread bancário regional em relação à taxa Selic, para encontrar os mercados onde a operação de crédito terá a melhor margem de lucro | 13 | 2 |
| 4 | Média | Como gerente de expansão, quero simular cenários de risco econômico baseados no histórico de dados, para antecipar crises regionais e proteger a carteira de crédito da empresa | 20 | 3 |
| 5 | Média | Como analista de negócios, quero conversar em linguagem natural com um assistente virtual integrado ao dashboard para obter resumos rápidos do mercado, para agilizar a extração de insights sem precisar analisar dezenas de gráficos manualmente | 20 | 3 |
| 6 | Baixa | Como analista, quero aplicar filtros dinâmicos de período e região e exportar os relatórios, para facilitar a criação de apresentações executivas para a diretoria | 8 | 3 |

### Sprint Backlog

#### Sprint 1 — Prototipação, Arquitetura e Prova de Conceito (PoC)

| Rank | Área | Tarefa | Estimativa |
| :---: | :---: | :--- | :---: |
| 1 | Dados | Mapear os códigos das séries temporais no SGS (BaCen) referentes a Volume PF, Inadimplência e Endividamento | 8h |
| 2 | Dados | Desenvolver script em Python (Google Colab/Pandas) para extrair, limpar e cruzar dados do BaCen (PoC do ETL) | 15h |
| 3 | Backend | Criar a modelagem conceitual (MER) e lógica/física (DER) para o banco de dados SQLite | 10h |
| 4 | Backend | Configurar repositório Git, inicializar projeto NestJS (Node.js) e criar a estrutura base da API | 8h |
| 5 | Front-end | Desenhar o wireframe e protótipo navegável do dashboard no Figma, definindo paleta de cores e componentes | 15h |
| 6 | Scrum/PO | Definir o DoR e DoD e configurar o board de tarefas | 6h |

#### Sprint 2 — Desenvolvimento Intensivo

| Rank | Área | Tarefa | Estimativa |
| :---: | :---: | :--- | :---: |
| 1 | Dados | Desenvolver a API em FastAPI para rodar os pipelines de ETL, automatizando a ingestão dos dados no SQLite | 25h |
| 2 | Dados | Criar rotina em Python para calcular o Spread bancário e preparar as bases de simulação estatística | 15h |
| 3 | Backend | Implementar endpoints no NestJS para servir os dados consolidados do SQLite para o Front-end, com filtros dinâmicos | 25h |
| 4 | Front-end | Inicializar projeto em React com TypeScript, configurando Tailwind CSS e Bootstrap para responsividade | 15h |
| 5 | Front-end | Integrar biblioteca Chart.js e desenvolver os gráficos de volume, inadimplência e endividamento | 25h |
| 6 | Front-end | Desenvolver o Mapa interativo do Brasil (Heatmap) consumindo os dados regionais da API Node.js | 20h |

#### Sprint 3 — Refinamento, IA e Entregas Finais

| Rank | Área | Tarefa | Estimativa |
| :---: | :---: | :--- | :---: |
| 1 | Dados/IA | Integrar a API da Groq (LLM) na FastAPI, criando um pipeline de NLP que lê o contexto do SQLite e responde perguntas | 20h |
| 2 | Dados | Implementar a lógica matemática da Simulação de Monte Carlo no backend de dados (Python) e expor via endpoint | 20h |
| 3 | Front-end | Desenvolver a interface do Chatbot (Assistente de IA) e a tela de Simulador de Cenários | 18h |
| 4 | Front-end | Auditar interface, aplicar animações fluidas nos componentes, garantir responsividade e corrigir bugs visuais | 15h |
| 5 | Backend | Gerar a Documentação da API (Swagger) com as rotas finais estabelecidas | 10h |
| 6 | Scrum/PO | Redigir e publicar o Manual de Instalação e o Manual do Usuário no repositório Git | 12h |

## 🛑 DoR e DoD

### Definition of Ready (DoR)

Uma User Story está pronta para desenvolvimento quando os seguintes critérios forem atendidos:

**Sobre a User Story:**

- [ ] Tem título claro, descrição bem definida e objetivo compreendido
- [ ] Tem critérios de aceitação escritos
- [ ] Tem regras de negócio claras
- [ ] Foi estimada pela equipe
- [ ] Sem dependências bloqueadoras
- [ ] Compreensão validada com o time

**Sobre os artefatos correlatos:**

- [ ] Design/documentação disponível (wireframe ou mockup no Figma)
- [ ] Regras de negócio detalhadas (texto ou diagrama)
- [ ] Modelo de dados disponível (MER/DER)
- [ ] Estratégia de testes definida

### Definition of Done (DoD)

Uma User Story é considerada entregue quando todos os critérios abaixo forem satisfeitos:

- [ ] Código devidamente versionado no Git
- [ ] Pull Request aberto antes da liberação para Code Review
- [ ] Fragmentos de código comentados removidos
- [ ] Testes de unidade implementados com cobertura mínima de 70%
- [ ] Feature ou fix branch criada corretamente
- [ ] Funcionalidade validada conforme os critérios de aceitação da User Story

## 🛠 Tecnologias

- **Linguagem Principal**: Javascript, Typescript, Python
- **Banco de Dados**: SQLite
- **Back-end**: NestJS (Node.js), FastAPI (Python)
- **Front-end**: React, TypeScript, Tailwind CSS, Bootstrap, Chart.js
- **IA / NLP**: Groq API (LLM)
- **Dados**: Banco Central do Brasil – SGS (API pública)
- **Prototipação**: Figma

## 📚 Manuais e Documentações

Os artefatos exigidos ao decorrer do projeto estarão listados e disponibilizados aqui:

- [Manual de Instalação (obrigatório, no Git)](#)
- [Manual do Usuário (obrigatório)](#)
- [Documentação API - Application Programming Interface](#)
- [Modelagem de Banco de Dados ou Arquivo de dados](#)

## 👥 Equipe

|       Nome       |     Função     |                                                                            GitHub                                                                             |                                                                                               Linkedin                                                                                               |
| :--------------: | :------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|   Daniel Dias    | Product Owner | <a href='https://github.com/DanielDPereira'><img src="https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white"></a> |      <a href='https://www.linkedin.com/in/daniel-dias-pereira-40219425b/'><img src='https://img.shields.io/badge/linkedin-%230077B5.svg?style=for-the-badge&logo=linkedin&logoColor=white'></a>      |
|   Rafael Matesco   |  Scrum Master  |  <a href='https://github.com/RafaMatesco'><img src="https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white"></a>  |     <a href='https://www.linkedin.com/in/rafael-giordano-matesco/'><img src='https://img.shields.io/badge/linkedin-%230077B5.svg?style=for-the-badge&logo=linkedin&logoColor=white'></a>      |
|  Emmanuel Garakis   | Team Developer  |    <a href='https://github.com/Garakis'><img src="https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white"></a>     |          <a href='https://www.linkedin.com/in/emmanuel-basile-garakis-filho-024572266/'><img src='https://img.shields.io/badge/linkedin-%230077B5.svg?style=for-the-badge&logo=linkedin&logoColor=white'></a>           |
|   Gabriel Lasaro    | Team Developer | <a href='https://github.com/GaelNotFound'><img src="https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white"></a> |      <a href='https://www.linkedin.com/in/gaelslasaro/'><img src='https://img.shields.io/badge/linkedin-%230077B5.svg?style=for-the-badge&logo=linkedin&logoColor=white'></a>      |
|    Giovanni Moretto    | Team Developer |   <a href='https://github.com/Giomoret'><img src="https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white"></a>   |       <a href='https://www.linkedin.com/in/giovanni-moretto-02b754271/'><img src='https://img.shields.io/badge/linkedin-%230077B5.svg?style=for-the-badge&logo=linkedin&logoColor=white'></a>        |
|    Gustavo Bueno    | Team Developer |   <a href='https://github.com/Darkghostly'><img src="https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white"></a>   |       <a href='https://www.linkedin.com/in/gustavo-bueno-da-silva-797292324/'><img src='https://img.shields.io/badge/linkedin-%230077B5.svg?style=for-the-badge&logo=linkedin&logoColor=white'></a>        |
|    Gustavo Monteiro    | Team Developer |   <a href='https://github.com/GustavoMGreco'><img src="https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white"></a>   |       <a href='https://www.linkedin.com/in/gustavomgreco/'><img src='https://img.shields.io/badge/linkedin-%230077B5.svg?style=for-the-badge&logo=linkedin&logoColor=white'></a>        |
|    Vitor    | Team Developer |   <a href='https://github.com/vitorpdim'><img src="https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white"></a>   |       <a href='https://www.linkedin.com/in/user/'><img src='https://img.shields.io/badge/linkedin-%230077B5.svg?style=for-the-badge&logo=linkedin&logoColor=white'></a>        |

---

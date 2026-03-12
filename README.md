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

O projeto visa desenvolver uma plataforma web de inteligência de crédito. Entregaremos um dashboard interativo com um ranking regional, acompanhado de um mapa do Brasil e gráficos dinâmicos. O sistema contará com filtros de tempo e região, simulações de cenários de risco (Monte Carlo) e um assistente de Inteligência Artificial para gerar resumos em linguagem natural. Além do software funcional e seguro, entregaremos a Documentação da API, a Modelagem do Banco de Dados e os Manuais de Instalação e do Usuário exigidos pela Fatec.

## 📋 Backlogs

### 1. Backlog do Produto (Visão do Cliente - DM Card)

| ID | Sprint | Épico | User Story (Visão do Cliente) | Valor Entregue ao Final da Sprint |
| :---: | :---: | :--- | :--- | :--- |
| US-01 | 1 | Validação Visão | Como cliente (DM), quero navegar por um protótipo visual do dashboard (Figma) para aprovar a usabilidade e a disposição das informações antes do desenvolvimento. | Validação da interface, fluxos de tela e design system. |
| US-02 | 1 | Viabilidade Dados | Como analista, quero ver um relatório de Prova de Conceito comprovando que os dados públicos do Banco Central respondem às minhas dúvidas sobre risco de crédito. | Garantia de que a base de dados resolve o problema de negócio. |
| US-03 | 2 | Segurança | Como estrategista da DM, quero acessar a plataforma através de uma tela de login segura, garantindo a proteção da nossa inteligência competitiva. | Acesso restrito e proteção de dados estratégicos. |
| US-04 | 2 | Visualização Core | Como analista de expansão, quero visualizar um mapa interativo e gráficos alimentados com dados do BaCen para identificar rapidamente territórios de oportunidade. | O núcleo do produto funcionando gerando insights diretos. |
| US-05 | 2 | Filtros Dinâmicos | Como gerente, quero aplicar filtros dinâmicos de período (ex: últimos 5 anos), região e estado nos gráficos, para focar minha análise em mercados específicos. | Flexibilidade para análises macro (nacional) e micro (estadual). |
| US-06 | 3 | Assistente de IA | Como analista, quero conversar em linguagem natural com um assistente virtual no sistema, para obter respostas rápidas sobre o cenário de uma região específica. | Agilidade extrema na extração de análises complexas. |
| US-07 | 3 | Simulações | Como estrategista de risco, quero simular cenários econômicos alterando variáveis, para prever o impacto na inadimplência e proteger a carteira de crédito. | Capacidade preditiva e proteção contra crises regionais. |
| US-08 | 3 | Documentação | Como avaliador técnico e usuário final, quero acessar os Manuais de Instalação e Usuário, com a plataforma rodando de forma ágil e sem falhas. | Entrega formal do sistema pronto para uso e implantação. |

### 2. Backlog Técnico & Tasks (Visão da Equipe de Desenvolvimento)

#### Sprint 1: Fundação, Prototipação e Configuração
**Objetivo:** Estruturar a base do projeto. Validações e configurações. Nenhuma regra de negócio definitiva é codificada sem o banco e o design validados.

| ID | Área | Task Técnica | Descrição para o Time | Dependência |
| :---: | :---: | :--- | :--- | :---: |
| TSK-01 | Scrum/PO | Setup de Gestão e Requisitos | Configurar Jira/Trello, criar repositórios no GitHub, redigir DoR e DoD e documentar requisitos ágeis iniciais. | Nenhuma |
| TSK-02 | Front/UI | Desenvolver Protótipos no Figma | Criar wireframes e telas navegáveis de Login e Dashboard, detalhando onde ficarão os componentes de Filtros Dinâmicos (dropdowns, datepickers). | TSK-01 |
| TSK-03 | Dados | PoC Extração de Dados (Colab) | Mapear séries do SGS (BaCen) sobre Volume/Inadimplência e criar script exploratório com Pandas para provar que a extração e limpeza são viáveis. | Nenhuma |
| TSK-04 | Backend | Modelagem de BD (Conceitual/Lógica) | Criar o MER e DER focados nos indicadores do projeto. É vital modelar as tabelas pensando em como os filtros dinâmicos farão as buscas. | TSK-03 |
| TSK-05 | Backend | Criação do BD Físico (SQLite) | Instanciar o banco de dados SQLite aplicando o modelo aprovado na TSK-04. | TSK-04 |
| TSK-06 | Infra/Seg. | Configuração Ambiente Node.js | Inicializar o projeto (NestJS/Express), instalar bibliotecas de segurança (bcrypt, jsonwebtoken, cors) e criar estrutura base de pastas. | Nenhuma |
| TSK-07 | Infra/Dados | Configuração Ambiente Python | Criar ambiente virtual, instalar FastAPI, SQLAlchemy e dependências de dados, criando a estrutura do microserviço que rodará o ETL. | Nenhuma |
| TSK-08 | Infra/Front | Configuração Ambiente React | Inicializar Vite + React + TypeScript, instalar Tailwind CSS e configurar o roteamento (React Router) para as telas públicas e privadas. | Nenhuma |

#### Sprint 2: Desenvolvimento Intensivo e Integração
**Objetivo:** O sistema ganha vida. Dados fluem do BaCen para a tela do usuário.

| ID | Área | Task Técnica | Descrição para o Time | Dependência |
| :---: | :---: | :--- | :--- | :---: |
| TSK-09 | Dados | Pipelines de ETL (FastAPI) | Transformar os scripts do Colab (TSK-03) em rotinas automatizadas no FastAPI que limpam dados do BaCen e os persistem no SQLite. | TSK-03, TSK-05, TSK-07 |
| TSK-10 | Backend | Rotas de Autenticação e JWT | Criar endpoints de Login no Node.js. O sistema deve receber usuário/senha, validar via bcrypt e retornar um Token JWT assinado. | TSK-05, TSK-06 |
| TSK-11 | Backend | Rotas de Dados c/ Filtros Dinâmicos | Desenvolver endpoints no Node.js que consultam o SQLite. Devem aceitar parâmetros de Query (ex: ?estado=SP&anoInicial=2020) para alimentar o front. | TSK-09, TSK-10 |
| TSK-12 | Front/Seg. | Tela de Login Segura (React) | Construir a tela de Login, fazer a requisição à API de Auth, e salvar o JWT de forma segura (SessionStorage/Cookies) gerenciando o estado global. | TSK-08, TSK-10, TSK-02 |
| TSK-13 | Front-end | Dashboard e Filtros Dinâmicos | Implementar componentes de UI para os filtros (Seletor de Estado, Range de Datas) e os gráficos (Chart.js) que se re-renderizam ao mudar o filtro. | TSK-08, TSK-11, TSK-02 |
| TSK-14 | Front-end | Integração do Mapa de Oportunidades | Conectar uma biblioteca de mapas (ex: Leaflet ou react-simple-maps) aos dados regionais vindos da API, criando um Heatmap interativo. | TSK-11, TSK-13 |

#### Sprint 3: IA, Simulação, Refinamento e Entrega
**Objetivo:** Entregar o diferencial tecnológico e garantir estabilidade e documentação.

| ID | Área | Task Técnica | Descrição para o Time | Dependência |
| :---: | :---: | :--- | :--- | :---: |
| TSK-15 | Dados/IA | Integração LLM (Groq API) | Criar endpoint na FastAPI que recebe uma pergunta do Front, injeta o contexto dos dados filtrados no prompt da Groq, e devolve a resposta. | TSK-09 |
| TSK-16 | Dados | Algoritmo de Simulação Monte Carlo | Implementar script estatístico em Python que recebe variáveis de risco e gera projeções futuras de inadimplência, expondo via API. | TSK-09 |
| TSK-17 | Front-end | UI do Chatbot e Simulador | Desenvolver a interface de chat para interagir com a IA (TSK-15) e a tela onde o usuário altera inputs para ver os gráficos de projeção (TSK-16). | TSK-15, TSK-16 |
| TSK-18 | Fullstack | Auditoria de Segurança e Bugfixing | Testar vazamento de dados, garantir que rotas do dashboard redirecionam para o login se o JWT expirar. Ajustar responsividade no CSS. | TSK-12, TSK-13, TSK-14 |
| TSK-19 | PO/Scrum | Manuais e Documentação Final | Escrever Manual do Usuário e de Instalação no Git, exportar Documentação da API (Swagger/Postman) e revisar código. | Todas acima |

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
|    Marya Vitória    | Team Developer |   <a href='https://github.com/mavygarcia'><img src="https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white"></a>   |       <a href='https://www.linkedin.com/in/marya-vit%C3%B3ria-garcia-246b77332/'><img src='https://img.shields.io/badge/linkedin-%230077B5.svg?style=for-the-badge&logo=linkedin&logoColor=white'></a>        |
|    Vitor    | Team Developer |   <a href='https://github.com/vitorpdim'><img src="https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white"></a>   |       <a href='https://www.linkedin.com/in/user/'><img src='https://img.shields.io/badge/linkedin-%230077B5.svg?style=for-the-badge&logo=linkedin&logoColor=white'></a>        |

---
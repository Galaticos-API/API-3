# Prompt Mestre — Geração do Front-end

## Stack Utilizada
- **Framework**: React + TypeScript
- **Estilização**: Tailwind CSS
- **Gráficos**: Recharts
- **Mapa**: react-simple-maps
- **Build**: Vite
- **IA Assistente**: Claude (Anthropic)

## Prompt Base

Gere um dashboard completo em React + TypeScript + Tailwind CSS com tema escuro,
contendo as seguintes páginas e componentes:

### Dashboard de Oportunidades
- 4 cards KPI com gradientes coloridos (verde, azul, roxo, laranja) exibindo:
  Potencial Total, Regiões Mapeadas, Ticket Médio e População Alvo
- Mapa geográfico do Brasil usando react-simple-maps com estados clicáveis,
  coloridos por faixa de score de oportunidade de crédito
- Ranking regional com painel de detalhes ao lado (layout 50/50)
- Gráficos: área (concessões), linha (inadimplência), barra (ticket médio),
  pizza (distribuição por score) usando Recharts com tema escuro
- Tabela de detalhamento regional com colunas: Região, UF, Score,
  População, Bancarização, Inadimplência, Renda Média e Potencial

### Simulação Monte Carlo
- Formulário com parâmetros: capital, taxa de juros, prazo, inadimplência
- Execução da simulação no browser
- Histograma de distribuição de retornos
- Cards com métricas: retorno médio, probabilidade de lucro, VaR 5% e 95%

### Assistente IA
- Chat integrado com API da Anthropic
- System prompt com contexto dos dados do dashboard
- Interface de mensagens com histórico

## Tema Visual
- Fundo: #0b1120
- Cards: #111827
- Sidebar: #0d1526
- Header: gradiente linear de #1a237e para #5c6bc0
- Bordas: rgba(255,255,255,0.07)
- Texto primário: #f1f5f9
- Texto secundário: #94a3b8

## Dados Mockados
- 10 regiões metropolitanas brasileiras com score, população,
  bancarização, inadimplência, renda média e potencial de crédito
- Séries temporais de 15 meses (Jan/25 a Mar/26)

## Resultado
O prompt foi executado com auxílio do Claude (Anthropic) e gerou
a estrutura inicial do front-end validada localmente via Vite
em http://localhost:5173
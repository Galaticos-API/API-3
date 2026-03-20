-- ============================================================
-- BANCO DE DADOS v3 FINAL
-- Mapa de Oportunidade para Crédito Inclusivo - DM Card
-- FATEC - Projeto API 3º Semestre
-- Banco: SQLite | Modelo: Dimensional 
-- ============================================================
--

--
-- No SQLite não existe CREATE DATABASE.
-- O banco de dados É o próprio arquivo .db —
-- ele é criado no momento em que você cria o arquivo.

--
-- COMO CONFIGURAR NA SUA MÁQUINA:
--
-- PASSO 1 — Criar o arquivo do banco no DBeaver:
--   Abrir DBeaver → Nova Conexão → SQLite
--   Em "Caminho" clicar em "Criar..."
--   Navegar até a pasta database/ do projeto
--   Nomear como: credito_inclusivo
--   Clicar em Salvar → Concluir
--
-- PASSO 2 — Executar este script:
--   Clicar direito na conexão → SQL Editor → New SQL Script
--   Colar todo o conteúdo deste arquivo
--   Menu Editor SQL → Executar script SQL (Alt+X)
--
-- PASSO 3 — Popular com dados reais do BCB:
--   No terminal: cd backend_python
--   pip install requests
--   python etl_bcb.py
--
-- ============================================================

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- ============================================================
-- BLOCO 1: AUTENTICAÇÃO
-- ============================================================

CREATE TABLE IF NOT EXISTS usuario (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nome        TEXT    NOT NULL,
    email       TEXT    NOT NULL UNIQUE,
    senha_hash  TEXT    NOT NULL,
    papel       TEXT    NOT NULL DEFAULT 'analista'
                        CHECK (papel IN ('admin', 'analista')),
    ativo       INTEGER NOT NULL DEFAULT 1,
    criado_em   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessao (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id  INTEGER NOT NULL,
    token_jwt   TEXT    NOT NULL UNIQUE,
    expira_em   TEXT    NOT NULL,
    criado_em   TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
);

-- ============================================================
-- BLOCO 2: DIMENSÕES
-- ============================================================

-- Dimensão UF — estados brasileiros
-- sigla_uf pode ser NULL na fact_serie_temporal quando dado é nacional
CREATE TABLE IF NOT EXISTS dim_uf (
    sigla_uf     TEXT PRIMARY KEY,
    nome         TEXT NOT NULL,
    codigo_ibge  TEXT NOT NULL UNIQUE,
    regiao_br    TEXT NOT NULL
                      CHECK (regiao_br IN ('Norte','Nordeste','Centro-Oeste','Sudeste','Sul'))
);

-- Dimensão Série — catálogo de indicadores do BCB/SGS
-- id_serie É o código oficial do BCB (ex: 21082)
-- abrangencia: 'nacional' ou 'regional' — vem do campo "abrangencia" do JSON
CREATE TABLE IF NOT EXISTS dim_serie (
    id_serie        INTEGER PRIMARY KEY,
    nome_indicador  TEXT    NOT NULL,
    categoria       TEXT    NOT NULL,     -- ex: 'credito', 'inadimplencia', 'inflacao_precos'
    subcategoria    TEXT,                 -- ex: 'saldos_credito', 'inadimplencia', 'ipca_geral'
    periodicidade   TEXT    NOT NULL
                            CHECK (periodicidade IN ('diária','mensal','trimestral','anual')),
    unidade_medida  TEXT    NOT NULL,
    abrangencia     TEXT    NOT NULL DEFAULT 'Brasil',  -- 'Brasil' ou 'UF'
    descricao       TEXT,
    ativo           INTEGER NOT NULL DEFAULT 1
);

-- ============================================================
-- BLOCO 3: FATOS (dados que crescem todo mês via ETL)
-- ============================================================

-- fact_serie_temporal — coração do sistema
-- sigla_uf é NULL quando o dado é nacional (ex: IPCA, Selic)
-- sigla_uf tem valor quando o dado é por estado (ex: crédito por UF do IF.Data)
-- PK composta garante unicidade e acelera buscas
CREATE TABLE IF NOT EXISTS fact_serie_temporal (
    id_serie        INTEGER NOT NULL,
    sigla_uf        TEXT    DEFAULT NULL,  -- NULL = dado nacional
    data_referencia TEXT    NOT NULL,      -- formato ISO: '2023-01-01'
    valor           REAL    NOT NULL,
    data_ingestao   TEXT    NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (id_serie, sigla_uf, data_referencia),
    FOREIGN KEY (id_serie)  REFERENCES dim_serie(id_serie) ON DELETE CASCADE,
    FOREIGN KEY (sigla_uf)  REFERENCES dim_uf(sigla_uf)    ON DELETE SET NULL
);

-- fact_simulacao_risco — resultados do modelo Monte Carlo (TSK-16)
CREATE TABLE IF NOT EXISTS fact_simulacao_risco (
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id              INTEGER NOT NULL,
    sigla_uf                TEXT    NOT NULL,
    data_referencia         TEXT    NOT NULL,
    inadimplencia_projetada REAL    NOT NULL,
    ioi_score               REAL    NOT NULL,  -- Índice de Oportunidade Inclusiva
    var_95                  REAL    NOT NULL,  -- Value at Risk 95%
    var_99                  REAL    NOT NULL,  -- Value at Risk 99%
    parametros_json         TEXT    NOT NULL,
    criado_em               TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)       ON DELETE SET NULL,
    FOREIGN KEY (sigla_uf)   REFERENCES dim_uf(sigla_uf)  ON DELETE CASCADE
);

-- ============================================================
-- BLOCO 4: TABELAS OPERACIONAIS
-- ============================================================

CREATE TABLE IF NOT EXISTS ranking_oportunidade (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    sigla_uf            TEXT    NOT NULL,
    score_oportunidade  REAL    NOT NULL,   -- 0 a 100
    componente_demanda  REAL,               -- sub-score de demanda
    componente_risco    REAL,               -- sub-score de risco (invertido)
    componente_mercado  REAL,               -- sub-score de saturação
    data_calculo        TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (sigla_uf) REFERENCES dim_uf(sigla_uf) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS consulta_ia (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id      INTEGER NOT NULL,
    pergunta        TEXT    NOT NULL,
    resposta        TEXT,
    contexto_json   TEXT,
    tokens_usados   INTEGER,
    criado_em       TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS log_auditoria (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id      INTEGER,
    acao            TEXT NOT NULL,  -- 'LOGIN','LOGOUT','SIMULACAO','EXPORT','ERRO'
    tabela_afetada  TEXT,
    detalhes_json   TEXT,
    ip_address      TEXT,
    criado_em       TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE SET NULL
);

-- ============================================================
-- ÍNDICES — baseados nos filtros dinâmicos da TSK-11
-- ?estado=SP&anoInicial=2020&serie=21082
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_fst_uf         ON fact_serie_temporal(sigla_uf);
CREATE INDEX IF NOT EXISTS idx_fst_data        ON fact_serie_temporal(data_referencia);
CREATE INDEX IF NOT EXISTS idx_fst_serie_data  ON fact_serie_temporal(id_serie, data_referencia);
CREATE INDEX IF NOT EXISTS idx_fst_uf_data     ON fact_serie_temporal(sigla_uf, data_referencia);
CREATE INDEX IF NOT EXISTS idx_rank_score      ON ranking_oportunidade(score_oportunidade DESC);
CREATE INDEX IF NOT EXISTS idx_rank_uf         ON ranking_oportunidade(sigla_uf);
CREATE INDEX IF NOT EXISTS idx_sessao_token    ON sessao(token_jwt);
CREATE INDEX IF NOT EXISTS idx_log_criado      ON log_auditoria(criado_em);

-- ============================================================
-- SEEDS: DADOS INICIAIS
-- ============================================================

-- Usuário admin
INSERT OR IGNORE INTO usuario (nome, email, senha_hash, papel)
VALUES ('Administrador', 'admin@dm.com.br', 'SUBSTITUIR_PELO_HASH_BCRYPT', 'admin');

-- Estados (dim_uf)
INSERT OR IGNORE INTO dim_uf VALUES
('AC','Acre','12','Norte'),
('AL','Alagoas','27','Nordeste'),
('AM','Amazonas','13','Norte'),
('AP','Amapá','16','Norte'),
('BA','Bahia','29','Nordeste'),
('CE','Ceará','23','Nordeste'),
('DF','Distrito Federal','53','Centro-Oeste'),
('ES','Espírito Santo','32','Sudeste'),
('GO','Goiás','52','Centro-Oeste'),
('MA','Maranhão','21','Nordeste'),
('MG','Minas Gerais','31','Sudeste'),
('MS','Mato Grosso do Sul','50','Centro-Oeste'),
('MT','Mato Grosso','51','Centro-Oeste'),
('PA','Pará','15','Norte'),
('PB','Paraíba','25','Nordeste'),
('PE','Pernambuco','26','Nordeste'),
('PI','Piauí','22','Nordeste'),
('PR','Paraná','41','Sul'),
('RJ','Rio de Janeiro','33','Sudeste'),
('RN','Rio Grande do Norte','24','Nordeste'),
('RO','Rondônia','11','Norte'),
('RR','Roraima','14','Norte'),
('RS','Rio Grande do Sul','43','Sul'),
('SC','Santa Catarina','42','Sul'),
('SE','Sergipe','28','Nordeste'),
('SP','São Paulo','35','Sudeste'),
('TO','Tocantins','17','Norte');

-- ============================================================
-- SÉRIES DO BCB — extraídas do BCB_sgs_series.json
-- Organizadas por prioridade para o projeto de crédito inclusivo
-- ============================================================

-- PRIORIDADE MÁXIMA: Crédito e inadimplência (core do projeto)
INSERT OR IGNORE INTO dim_serie VALUES
(20542, 'Crédito livre - Total',                  'credito', 'saldos_credito',   'mensal',     'R$ mi',   'Brasil', 'Saldo total de operações de crédito livre', 1),
(20540, 'Saldo crédito PF',                       'credito', 'saldos_credito',   'mensal',     'R$ mi',   'Brasil', 'Saldo total de crédito para pessoas físicas', 1),
(20541, 'Saldo crédito PJ',                       'credito', 'saldos_credito',   'mensal',     'R$ mi',   'Brasil', 'Saldo total de crédito para pessoas jurídicas', 1),
(20631, 'Concessões crédito total',               'credito', 'concessoes',       'mensal',     'R$ mi',   'Brasil', 'Volume total de crédito concedido no mês', 1),
(20633, 'Concessões crédito PF',                  'credito', 'concessoes',       'mensal',     'R$ mi',   'Brasil', 'Concessões mensais para pessoas físicas', 1),
(20634, 'Concessões crédito PJ',                  'credito', 'concessoes',       'mensal',     'R$ mi',   'Brasil', 'Concessões mensais para pessoas jurídicas', 1),
(21082, 'Inadimplência PF',                       'credito', 'inadimplencia',    'mensal',     '%',       'Brasil', 'Inadimplência PF acima de 90 dias', 1),
(21083, 'Inadimplência PJ',                       'credito', 'inadimplencia',    'mensal',     '%',       'Brasil', 'Inadimplência PJ acima de 90 dias', 1),
(21084, 'Inadimplência total',                    'credito', 'inadimplencia',    'mensal',     '%',       'Brasil', 'Inadimplência total do sistema financeiro', 1),
(20714, 'Taxa de juros média PF',                 'credito', 'taxas_juros',      'mensal',     '% a.a.',  'Brasil', 'Taxa média das operações de crédito PF', 1),
(20715, 'Taxa de juros média PJ',                 'credito', 'taxas_juros',      'mensal',     '% a.a.',  'Brasil', 'Taxa média das operações de crédito PJ', 1),
(20783, 'Spread bancário total',                  'credito', 'taxas_juros',      'mensal',     'p.p.',    'Brasil', 'Spread bancário médio das operações de crédito', 1),
(29037, 'Endividamento das famílias',             'credito', 'endividamento',    'mensal',     '%',       'Brasil', 'Relação dívida/renda das famílias brasileiras', 1),
(29038, 'Comprometimento de renda PF',            'credito', 'endividamento',    'mensal',     '%',       'Brasil', 'Parcela da renda comprometida com dívidas', 1),
(19882, 'Endividamento famílias (série antiga)',  'credito', 'endividamento',    'mensal',     '%',       'Brasil', 'Série histórica de endividamento das famílias', 1);

-- PRIORIDADE ALTA: Contexto macroeconômico (necessário para Monte Carlo e IA)
INSERT OR IGNORE INTO dim_serie VALUES
(433,   'IPCA - Variação mensal',                 'inflacao_precos', 'ipca_geral',    'mensal',     '% a.m.', 'Brasil', 'Inflação oficial mensal do Brasil', 1),
(13522, 'IPCA - Acumulado 12 meses',              'inflacao_precos', 'ipca_geral',    'mensal',     '%',      'Brasil', 'IPCA acumulado nos últimos 12 meses', 1),
(11,    'Selic - Taxa diária',                    'taxas_de_juros',  'selic',         'diária',     '% a.a.', 'Brasil', 'Taxa de juros básica da economia brasileira', 1),
(432,   'Selic - Meta',                           'taxas_de_juros',  'selic',         'mensal',     '% a.a.', 'Brasil', 'Meta da taxa Selic definida pelo COPOM', 1),
(4390,  'Selic - Acumulada no mês',               'taxas_de_juros',  'selic',         'mensal',     '% a.m.', 'Brasil', 'Selic acumulada no mês corrente', 1),
(1,     'Dólar (venda) diário',                   'cambio',          'dolar',         'diária',     'R$',     'Brasil', 'Taxa de câmbio dólar americano (venda)', 1),
(3697,  'Dólar PTAX (venda)',                     'cambio',          'dolar',         'diária',     'R$',     'Brasil', 'Dólar PTAX — taxa oficial de fechamento do BC', 1),
(24369, 'Taxa de desemprego (PNAD)',              'emprego_e_renda', 'mercado_trabalho_pnad', 'mensal', '%',  'Brasil', 'Taxa de desocupação — PNAD Contínua/IBGE', 1),
(1207,  'PIB anual',                              'atividade_economica', 'pib',       'anual',      'R$ mi',  'Brasil', 'Produto Interno Bruto a preços de mercado', 1),
(22099, 'PIB trimestral',                         'atividade_economica', 'pib',       'trimestral', 'R$ mi',  'Brasil', 'PIB trimestral a preços de mercado', 1);

-- PRIORIDADE MÉDIA: Mercado financeiro e renda (contexto adicional)
INSERT OR IGNORE INTO dim_serie VALUES
(7,     'Ibovespa',                               'mercado_financeiro', 'bolsa',     'diária',     'pontos', 'Brasil', 'Índice da bolsa de valores brasileira (B3)', 1),
(189,   'IGP-M',                                  'inflacao_precos', 'igp',          'mensal',     '% a.m.','Brasil', 'Índice Geral de Preços do Mercado', 1),
(226,   'TR - Taxa Referencial',                  'taxas_de_juros',  'referencias',  'mensal',     '% a.m.','Brasil', 'Taxa Referencial utilizada em contratos de crédito', 1),
(196,   'Poupança - Rentabilidade',               'taxas_de_juros',  'poupanca',     'mensal',     '% a.m.','Brasil', 'Rentabilidade mensal da caderneta de poupança', 1);

-- ============================================================
-- COMO FUNCIONA A JUNÇÃO 
-- ============================================================
-- Query típica do dashboard: gráfico de inadimplência nacional ao longo do tempo
--
-- SELECT s.nome_indicador, f.data_referencia, f.valor
-- FROM fact_serie_temporal f
-- JOIN dim_serie s ON s.id_serie = f.id_serie
-- WHERE f.id_serie = 21082          -- inadimplência PF
--   AND f.sigla_uf IS NULL           -- dado nacional (sem UF)
--   AND f.data_referencia >= '2019-01-01'
-- ORDER BY f.data_referencia;
--
-- Query com filtro de estado (quando disponível via IF.Data):
-- WHERE f.id_serie = 20540          -- saldo crédito PF
--   AND f.sigla_uf = 'SP'
--   AND f.data_referencia >= '2020-01-01'
-- ============================================================

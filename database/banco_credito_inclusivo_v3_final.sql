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


-- GERAÇÃO DINÂMICA DE SÉRIES ESTADUAIS (162 séries)
INSERT OR IGNORE INTO dim_serie VALUES
(15861, 'Inadimplência PF - AC', 'credito', 'inadimplencia', 'mensal', '%', 'AC', 'Inadimplência PF acima de 90 dias (AC)', 1),
(15862, 'Inadimplência PF - AL', 'credito', 'inadimplencia', 'mensal', '%', 'AL', 'Inadimplência PF acima de 90 dias (AL)', 1),
(15863, 'Inadimplência PF - AP', 'credito', 'inadimplencia', 'mensal', '%', 'AP', 'Inadimplência PF acima de 90 dias (AP)', 1),
(15864, 'Inadimplência PF - AM', 'credito', 'inadimplencia', 'mensal', '%', 'AM', 'Inadimplência PF acima de 90 dias (AM)', 1),
(15865, 'Inadimplência PF - BA', 'credito', 'inadimplencia', 'mensal', '%', 'BA', 'Inadimplência PF acima de 90 dias (BA)', 1),
(15866, 'Inadimplência PF - CE', 'credito', 'inadimplencia', 'mensal', '%', 'CE', 'Inadimplência PF acima de 90 dias (CE)', 1),
(15867, 'Inadimplência PF - DF', 'credito', 'inadimplencia', 'mensal', '%', 'DF', 'Inadimplência PF acima de 90 dias (DF)', 1),
(15868, 'Inadimplência PF - ES', 'credito', 'inadimplencia', 'mensal', '%', 'ES', 'Inadimplência PF acima de 90 dias (ES)', 1),
(15869, 'Inadimplência PF - GO', 'credito', 'inadimplencia', 'mensal', '%', 'GO', 'Inadimplência PF acima de 90 dias (GO)', 1),
(15870, 'Inadimplência PF - MA', 'credito', 'inadimplencia', 'mensal', '%', 'MA', 'Inadimplência PF acima de 90 dias (MA)', 1),
(15871, 'Inadimplência PF - MT', 'credito', 'inadimplencia', 'mensal', '%', 'MT', 'Inadimplência PF acima de 90 dias (MT)', 1),
(15872, 'Inadimplência PF - MS', 'credito', 'inadimplencia', 'mensal', '%', 'MS', 'Inadimplência PF acima de 90 dias (MS)', 1),
(15873, 'Inadimplência PF - MG', 'credito', 'inadimplencia', 'mensal', '%', 'MG', 'Inadimplência PF acima de 90 dias (MG)', 1),
(15874, 'Inadimplência PF - PA', 'credito', 'inadimplencia', 'mensal', '%', 'PA', 'Inadimplência PF acima de 90 dias (PA)', 1),
(15875, 'Inadimplência PF - PB', 'credito', 'inadimplencia', 'mensal', '%', 'PB', 'Inadimplência PF acima de 90 dias (PB)', 1),
(15876, 'Inadimplência PF - PR', 'credito', 'inadimplencia', 'mensal', '%', 'PR', 'Inadimplência PF acima de 90 dias (PR)', 1),
(15877, 'Inadimplência PF - PE', 'credito', 'inadimplencia', 'mensal', '%', 'PE', 'Inadimplência PF acima de 90 dias (PE)', 1),
(15878, 'Inadimplência PF - PI', 'credito', 'inadimplencia', 'mensal', '%', 'PI', 'Inadimplência PF acima de 90 dias (PI)', 1),
(15879, 'Inadimplência PF - RJ', 'credito', 'inadimplencia', 'mensal', '%', 'RJ', 'Inadimplência PF acima de 90 dias (RJ)', 1),
(15880, 'Inadimplência PF - RN', 'credito', 'inadimplencia', 'mensal', '%', 'RN', 'Inadimplência PF acima de 90 dias (RN)', 1),
(15881, 'Inadimplência PF - RS', 'credito', 'inadimplencia', 'mensal', '%', 'RS', 'Inadimplência PF acima de 90 dias (RS)', 1),
(15882, 'Inadimplência PF - RO', 'credito', 'inadimplencia', 'mensal', '%', 'RO', 'Inadimplência PF acima de 90 dias (RO)', 1),
(15883, 'Inadimplência PF - RR', 'credito', 'inadimplencia', 'mensal', '%', 'RR', 'Inadimplência PF acima de 90 dias (RR)', 1),
(15884, 'Inadimplência PF - SC', 'credito', 'inadimplencia', 'mensal', '%', 'SC', 'Inadimplência PF acima de 90 dias (SC)', 1),
(15885, 'Inadimplência PF - SP', 'credito', 'inadimplencia', 'mensal', '%', 'SP', 'Inadimplência PF acima de 90 dias (SP)', 1),
(15886, 'Inadimplência PF - SE', 'credito', 'inadimplencia', 'mensal', '%', 'SE', 'Inadimplência PF acima de 90 dias (SE)', 1),
(15887, 'Inadimplência PF - TO', 'credito', 'inadimplencia', 'mensal', '%', 'TO', 'Inadimplência PF acima de 90 dias (TO)', 1),
(15893, 'Inadimplência PJ - AC', 'credito', 'inadimplencia', 'mensal', '%', 'AC', 'Inadimplência PJ acima de 90 dias (AC)', 1),
(15894, 'Inadimplência PJ - AL', 'credito', 'inadimplencia', 'mensal', '%', 'AL', 'Inadimplência PJ acima de 90 dias (AL)', 1),
(15895, 'Inadimplência PJ - AP', 'credito', 'inadimplencia', 'mensal', '%', 'AP', 'Inadimplência PJ acima de 90 dias (AP)', 1),
(15896, 'Inadimplência PJ - AM', 'credito', 'inadimplencia', 'mensal', '%', 'AM', 'Inadimplência PJ acima de 90 dias (AM)', 1),
(15897, 'Inadimplência PJ - BA', 'credito', 'inadimplencia', 'mensal', '%', 'BA', 'Inadimplência PJ acima de 90 dias (BA)', 1),
(15898, 'Inadimplência PJ - CE', 'credito', 'inadimplencia', 'mensal', '%', 'CE', 'Inadimplência PJ acima de 90 dias (CE)', 1),
(15899, 'Inadimplência PJ - DF', 'credito', 'inadimplencia', 'mensal', '%', 'DF', 'Inadimplência PJ acima de 90 dias (DF)', 1),
(15900, 'Inadimplência PJ - ES', 'credito', 'inadimplencia', 'mensal', '%', 'ES', 'Inadimplência PJ acima de 90 dias (ES)', 1),
(15901, 'Inadimplência PJ - GO', 'credito', 'inadimplencia', 'mensal', '%', 'GO', 'Inadimplência PJ acima de 90 dias (GO)', 1),
(15902, 'Inadimplência PJ - MA', 'credito', 'inadimplencia', 'mensal', '%', 'MA', 'Inadimplência PJ acima de 90 dias (MA)', 1),
(15903, 'Inadimplência PJ - MT', 'credito', 'inadimplencia', 'mensal', '%', 'MT', 'Inadimplência PJ acima de 90 dias (MT)', 1),
(15904, 'Inadimplência PJ - MS', 'credito', 'inadimplencia', 'mensal', '%', 'MS', 'Inadimplência PJ acima de 90 dias (MS)', 1),
(15905, 'Inadimplência PJ - MG', 'credito', 'inadimplencia', 'mensal', '%', 'MG', 'Inadimplência PJ acima de 90 dias (MG)', 1),
(15906, 'Inadimplência PJ - PA', 'credito', 'inadimplencia', 'mensal', '%', 'PA', 'Inadimplência PJ acima de 90 dias (PA)', 1),
(15907, 'Inadimplência PJ - PB', 'credito', 'inadimplencia', 'mensal', '%', 'PB', 'Inadimplência PJ acima de 90 dias (PB)', 1),
(15908, 'Inadimplência PJ - PR', 'credito', 'inadimplencia', 'mensal', '%', 'PR', 'Inadimplência PJ acima de 90 dias (PR)', 1),
(15909, 'Inadimplência PJ - PE', 'credito', 'inadimplencia', 'mensal', '%', 'PE', 'Inadimplência PJ acima de 90 dias (PE)', 1),
(15910, 'Inadimplência PJ - PI', 'credito', 'inadimplencia', 'mensal', '%', 'PI', 'Inadimplência PJ acima de 90 dias (PI)', 1),
(15911, 'Inadimplência PJ - RJ', 'credito', 'inadimplencia', 'mensal', '%', 'RJ', 'Inadimplência PJ acima de 90 dias (RJ)', 1),
(15912, 'Inadimplência PJ - RN', 'credito', 'inadimplencia', 'mensal', '%', 'RN', 'Inadimplência PJ acima de 90 dias (RN)', 1),
(15913, 'Inadimplência PJ - RS', 'credito', 'inadimplencia', 'mensal', '%', 'RS', 'Inadimplência PJ acima de 90 dias (RS)', 1),
(15914, 'Inadimplência PJ - RO', 'credito', 'inadimplencia', 'mensal', '%', 'RO', 'Inadimplência PJ acima de 90 dias (RO)', 1),
(15915, 'Inadimplência PJ - RR', 'credito', 'inadimplencia', 'mensal', '%', 'RR', 'Inadimplência PJ acima de 90 dias (RR)', 1),
(15916, 'Inadimplência PJ - SC', 'credito', 'inadimplencia', 'mensal', '%', 'SC', 'Inadimplência PJ acima de 90 dias (SC)', 1),
(15917, 'Inadimplência PJ - SP', 'credito', 'inadimplencia', 'mensal', '%', 'SP', 'Inadimplência PJ acima de 90 dias (SP)', 1),
(15918, 'Inadimplência PJ - SE', 'credito', 'inadimplencia', 'mensal', '%', 'SE', 'Inadimplência PJ acima de 90 dias (SE)', 1),
(15919, 'Inadimplência PJ - TO', 'credito', 'inadimplencia', 'mensal', '%', 'TO', 'Inadimplência PJ acima de 90 dias (TO)', 1),
(15925, 'Inadimplência Total - AC', 'credito', 'inadimplencia', 'mensal', '%', 'AC', 'Inadimplência total (AC)', 1),
(15926, 'Inadimplência Total - AL', 'credito', 'inadimplencia', 'mensal', '%', 'AL', 'Inadimplência total (AL)', 1),
(15927, 'Inadimplência Total - AP', 'credito', 'inadimplencia', 'mensal', '%', 'AP', 'Inadimplência total (AP)', 1),
(15928, 'Inadimplência Total - AM', 'credito', 'inadimplencia', 'mensal', '%', 'AM', 'Inadimplência total (AM)', 1),
(15929, 'Inadimplência Total - BA', 'credito', 'inadimplencia', 'mensal', '%', 'BA', 'Inadimplência total (BA)', 1),
(15930, 'Inadimplência Total - CE', 'credito', 'inadimplencia', 'mensal', '%', 'CE', 'Inadimplência total (CE)', 1),
(15931, 'Inadimplência Total - DF', 'credito', 'inadimplencia', 'mensal', '%', 'DF', 'Inadimplência total (DF)', 1),
(15932, 'Inadimplência Total - ES', 'credito', 'inadimplencia', 'mensal', '%', 'ES', 'Inadimplência total (ES)', 1),
(15933, 'Inadimplência Total - GO', 'credito', 'inadimplencia', 'mensal', '%', 'GO', 'Inadimplência total (GO)', 1),
(15934, 'Inadimplência Total - MA', 'credito', 'inadimplencia', 'mensal', '%', 'MA', 'Inadimplência total (MA)', 1),
(15935, 'Inadimplência Total - MT', 'credito', 'inadimplencia', 'mensal', '%', 'MT', 'Inadimplência total (MT)', 1),
(15936, 'Inadimplência Total - MS', 'credito', 'inadimplencia', 'mensal', '%', 'MS', 'Inadimplência total (MS)', 1),
(15937, 'Inadimplência Total - MG', 'credito', 'inadimplencia', 'mensal', '%', 'MG', 'Inadimplência total (MG)', 1),
(15938, 'Inadimplência Total - PA', 'credito', 'inadimplencia', 'mensal', '%', 'PA', 'Inadimplência total (PA)', 1),
(15939, 'Inadimplência Total - PB', 'credito', 'inadimplencia', 'mensal', '%', 'PB', 'Inadimplência total (PB)', 1),
(15940, 'Inadimplência Total - PR', 'credito', 'inadimplencia', 'mensal', '%', 'PR', 'Inadimplência total (PR)', 1),
(15941, 'Inadimplência Total - PE', 'credito', 'inadimplencia', 'mensal', '%', 'PE', 'Inadimplência total (PE)', 1),
(15942, 'Inadimplência Total - PI', 'credito', 'inadimplencia', 'mensal', '%', 'PI', 'Inadimplência total (PI)', 1),
(15943, 'Inadimplência Total - RJ', 'credito', 'inadimplencia', 'mensal', '%', 'RJ', 'Inadimplência total (RJ)', 1),
(15944, 'Inadimplência Total - RN', 'credito', 'inadimplencia', 'mensal', '%', 'RN', 'Inadimplência total (RN)', 1),
(15945, 'Inadimplência Total - RS', 'credito', 'inadimplencia', 'mensal', '%', 'RS', 'Inadimplência total (RS)', 1),
(15946, 'Inadimplência Total - RO', 'credito', 'inadimplencia', 'mensal', '%', 'RO', 'Inadimplência total (RO)', 1),
(15947, 'Inadimplência Total - RR', 'credito', 'inadimplencia', 'mensal', '%', 'RR', 'Inadimplência total (RR)', 1),
(15948, 'Inadimplência Total - SC', 'credito', 'inadimplencia', 'mensal', '%', 'SC', 'Inadimplência total (SC)', 1),
(15949, 'Inadimplência Total - SP', 'credito', 'inadimplencia', 'mensal', '%', 'SP', 'Inadimplência total (SP)', 1),
(15950, 'Inadimplência Total - SE', 'credito', 'inadimplencia', 'mensal', '%', 'SE', 'Inadimplência total (SE)', 1),
(15951, 'Inadimplência Total - TO', 'credito', 'inadimplencia', 'mensal', '%', 'TO', 'Inadimplência total (TO)', 1),
(14002, 'Saldo PF - AC', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'AC', 'Saldo total de crédito para pessoas físicas (AC)', 1),
(14003, 'Saldo PF - AL', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'AL', 'Saldo total de crédito para pessoas físicas (AL)', 1),
(14004, 'Saldo PF - AP', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'AP', 'Saldo total de crédito para pessoas físicas (AP)', 1),
(14005, 'Saldo PF - AM', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'AM', 'Saldo total de crédito para pessoas físicas (AM)', 1),
(14006, 'Saldo PF - BA', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'BA', 'Saldo total de crédito para pessoas físicas (BA)', 1),
(14007, 'Saldo PF - CE', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'CE', 'Saldo total de crédito para pessoas físicas (CE)', 1),
(14008, 'Saldo PF - DF', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'DF', 'Saldo total de crédito para pessoas físicas (DF)', 1),
(14009, 'Saldo PF - ES', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'ES', 'Saldo total de crédito para pessoas físicas (ES)', 1),
(14010, 'Saldo PF - GO', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'GO', 'Saldo total de crédito para pessoas físicas (GO)', 1),
(14011, 'Saldo PF - MA', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'MA', 'Saldo total de crédito para pessoas físicas (MA)', 1),
(14012, 'Saldo PF - MT', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'MT', 'Saldo total de crédito para pessoas físicas (MT)', 1),
(14013, 'Saldo PF - MS', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'MS', 'Saldo total de crédito para pessoas físicas (MS)', 1),
(14014, 'Saldo PF - MG', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'MG', 'Saldo total de crédito para pessoas físicas (MG)', 1),
(14015, 'Saldo PF - PA', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'PA', 'Saldo total de crédito para pessoas físicas (PA)', 1),
(14016, 'Saldo PF - PB', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'PB', 'Saldo total de crédito para pessoas físicas (PB)', 1),
(14017, 'Saldo PF - PR', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'PR', 'Saldo total de crédito para pessoas físicas (PR)', 1),
(14018, 'Saldo PF - PE', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'PE', 'Saldo total de crédito para pessoas físicas (PE)', 1),
(14019, 'Saldo PF - PI', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'PI', 'Saldo total de crédito para pessoas físicas (PI)', 1),
(14020, 'Saldo PF - RJ', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'RJ', 'Saldo total de crédito para pessoas físicas (RJ)', 1),
(14021, 'Saldo PF - RN', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'RN', 'Saldo total de crédito para pessoas físicas (RN)', 1),
(14022, 'Saldo PF - RS', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'RS', 'Saldo total de crédito para pessoas físicas (RS)', 1),
(14023, 'Saldo PF - RO', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'RO', 'Saldo total de crédito para pessoas físicas (RO)', 1),
(14024, 'Saldo PF - RR', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'RR', 'Saldo total de crédito para pessoas físicas (RR)', 1),
(14025, 'Saldo PF - SC', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'SC', 'Saldo total de crédito para pessoas físicas (SC)', 1),
(14026, 'Saldo PF - SP', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'SP', 'Saldo total de crédito para pessoas físicas (SP)', 1),
(14027, 'Saldo PF - SE', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'SE', 'Saldo total de crédito para pessoas físicas (SE)', 1),
(14028, 'Saldo PF - TO', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'TO', 'Saldo total de crédito para pessoas físicas (TO)', 1),
(14029, 'Saldo PJ - AC', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'AC', 'Saldo total de crédito para pessoas jurídicas (AC)', 1),
(14030, 'Saldo PJ - AL', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'AL', 'Saldo total de crédito para pessoas jurídicas (AL)', 1),
(14031, 'Saldo PJ - AP', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'AP', 'Saldo total de crédito para pessoas jurídicas (AP)', 1),
(14032, 'Saldo PJ - AM', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'AM', 'Saldo total de crédito para pessoas jurídicas (AM)', 1),
(14033, 'Saldo PJ - BA', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'BA', 'Saldo total de crédito para pessoas jurídicas (BA)', 1),
(14034, 'Saldo PJ - CE', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'CE', 'Saldo total de crédito para pessoas jurídicas (CE)', 1),
(14035, 'Saldo PJ - DF', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'DF', 'Saldo total de crédito para pessoas jurídicas (DF)', 1),
(14036, 'Saldo PJ - ES', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'ES', 'Saldo total de crédito para pessoas jurídicas (ES)', 1),
(14037, 'Saldo PJ - GO', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'GO', 'Saldo total de crédito para pessoas jurídicas (GO)', 1),
(14038, 'Saldo PJ - MA', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'MA', 'Saldo total de crédito para pessoas jurídicas (MA)', 1),
(14039, 'Saldo PJ - MT', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'MT', 'Saldo total de crédito para pessoas jurídicas (MT)', 1),
(14040, 'Saldo PJ - MS', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'MS', 'Saldo total de crédito para pessoas jurídicas (MS)', 1),
(14041, 'Saldo PJ - MG', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'MG', 'Saldo total de crédito para pessoas jurídicas (MG)', 1),
(14042, 'Saldo PJ - PA', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'PA', 'Saldo total de crédito para pessoas jurídicas (PA)', 1),
(14043, 'Saldo PJ - PB', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'PB', 'Saldo total de crédito para pessoas jurídicas (PB)', 1),
(14044, 'Saldo PJ - PR', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'PR', 'Saldo total de crédito para pessoas jurídicas (PR)', 1),
(14045, 'Saldo PJ - PE', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'PE', 'Saldo total de crédito para pessoas jurídicas (PE)', 1),
(14046, 'Saldo PJ - PI', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'PI', 'Saldo total de crédito para pessoas jurídicas (PI)', 1),
(14047, 'Saldo PJ - RJ', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'RJ', 'Saldo total de crédito para pessoas jurídicas (RJ)', 1),
(14048, 'Saldo PJ - RN', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'RN', 'Saldo total de crédito para pessoas jurídicas (RN)', 1),
(14049, 'Saldo PJ - RS', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'RS', 'Saldo total de crédito para pessoas jurídicas (RS)', 1),
(14050, 'Saldo PJ - RO', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'RO', 'Saldo total de crédito para pessoas jurídicas (RO)', 1),
(14051, 'Saldo PJ - RR', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'RR', 'Saldo total de crédito para pessoas jurídicas (RR)', 1),
(14052, 'Saldo PJ - SC', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'SC', 'Saldo total de crédito para pessoas jurídicas (SC)', 1),
(14053, 'Saldo PJ - SP', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'SP', 'Saldo total de crédito para pessoas jurídicas (SP)', 1),
(14054, 'Saldo PJ - SE', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'SE', 'Saldo total de crédito para pessoas jurídicas (SE)', 1),
(14055, 'Saldo PJ - TO', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'TO', 'Saldo total de crédito para pessoas jurídicas (TO)', 1),
(14056, 'Saldo Total - AC', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'AC', 'Saldo total de operações de crédito (AC)', 1),
(14057, 'Saldo Total - AL', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'AL', 'Saldo total de operações de crédito (AL)', 1),
(14058, 'Saldo Total - AP', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'AP', 'Saldo total de operações de crédito (AP)', 1),
(14059, 'Saldo Total - AM', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'AM', 'Saldo total de operações de crédito (AM)', 1),
(14060, 'Saldo Total - BA', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'BA', 'Saldo total de operações de crédito (BA)', 1),
(14061, 'Saldo Total - CE', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'CE', 'Saldo total de operações de crédito (CE)', 1),
(14062, 'Saldo Total - DF', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'DF', 'Saldo total de operações de crédito (DF)', 1),
(14063, 'Saldo Total - ES', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'ES', 'Saldo total de operações de crédito (ES)', 1),
(14064, 'Saldo Total - GO', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'GO', 'Saldo total de operações de crédito (GO)', 1),
(14065, 'Saldo Total - MA', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'MA', 'Saldo total de operações de crédito (MA)', 1),
(14066, 'Saldo Total - MT', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'MT', 'Saldo total de operações de crédito (MT)', 1),
(14067, 'Saldo Total - MS', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'MS', 'Saldo total de operações de crédito (MS)', 1),
(14068, 'Saldo Total - MG', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'MG', 'Saldo total de operações de crédito (MG)', 1),
(14069, 'Saldo Total - PA', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'PA', 'Saldo total de operações de crédito (PA)', 1),
(14070, 'Saldo Total - PB', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'PB', 'Saldo total de operações de crédito (PB)', 1),
(14071, 'Saldo Total - PR', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'PR', 'Saldo total de operações de crédito (PR)', 1),
(14072, 'Saldo Total - PE', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'PE', 'Saldo total de operações de crédito (PE)', 1),
(14073, 'Saldo Total - PI', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'PI', 'Saldo total de operações de crédito (PI)', 1),
(14074, 'Saldo Total - RJ', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'RJ', 'Saldo total de operações de crédito (RJ)', 1),
(14075, 'Saldo Total - RN', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'RN', 'Saldo total de operações de crédito (RN)', 1),
(14076, 'Saldo Total - RS', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'RS', 'Saldo total de operações de crédito (RS)', 1),
(14077, 'Saldo Total - RO', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'RO', 'Saldo total de operações de crédito (RO)', 1),
(14078, 'Saldo Total - RR', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'RR', 'Saldo total de operações de crédito (RR)', 1),
(14079, 'Saldo Total - SC', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'SC', 'Saldo total de operações de crédito (SC)', 1),
(14080, 'Saldo Total - SP', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'SP', 'Saldo total de operações de crédito (SP)', 1),
(14081, 'Saldo Total - SE', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'SE', 'Saldo total de operações de crédito (SE)', 1),
(14082, 'Saldo Total - TO', 'credito', 'saldos_credito', 'mensal', 'R$ mi', 'TO', 'Saldo total de operações de crédito (TO)', 1);

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

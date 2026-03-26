#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para criar o banco de dados SQLite com a estrutura completa do projeto
Crédito Inclusivo - Mapa de Oportunidade para Crédito Inclusivo

Execução:
    python criar_banco_dados.py
"""

import sqlite3
import os
from pathlib import Path


def criar_banco_dados():
    """
    Cria o banco de dados SQLite e executa o script de schema.
    """
    
    # Caminho do banco de dados
    diretorio_banco = Path(__file__).parent.parent / "database"
    caminho_banco = diretorio_banco / "credito_inclusivo.db"
    
    # Garante que o diretório exists
    diretorio_banco.mkdir(parents=True, exist_ok=True)
    
    # Remove banco anterior se existir (comentar a linha se quiser preservar)
    # if caminho_banco.exists():
    #     caminho_banco.unlink()
    #     print(f"✓ Banco anterior removido: {caminho_banco}")
    
    print(f"📁 Criando banco de dados em: {caminho_banco}")
    
    try:
        # Conecta ao banco (cria se não existir)
        conexao = sqlite3.connect(str(caminho_banco))
        cursor = conexao.cursor()
        
        # ============================================================
        # CONFIGURAÇÕES INICIAIS
        # ============================================================
        print("\n⚙️  Configurando pragmas...")
        cursor.execute("PRAGMA foreign_keys = ON;")
        cursor.execute("PRAGMA journal_mode = WAL;")
        
        # ============================================================
        # BLOCO 1: AUTENTICAÇÃO
        # ============================================================
        print("\n📋 Criando tabelas de autenticação...")
        
        cursor.execute("""
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
        """)
        
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessao (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id  INTEGER NOT NULL,
            token_jwt   TEXT    NOT NULL UNIQUE,
            expira_em   TEXT    NOT NULL,
            criado_em   TEXT    NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
        );
        """)
        
        # ============================================================
        # BLOCO 2: DIMENSÕES
        # ============================================================
        print("📋 Criando tabelas de dimensões...")
        
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS dim_uf (
            sigla_uf     TEXT PRIMARY KEY,
            nome         TEXT NOT NULL,
            codigo_ibge  TEXT NOT NULL UNIQUE,
            regiao_br    TEXT NOT NULL
                              CHECK (regiao_br IN ('Norte','Nordeste','Centro-Oeste','Sudeste','Sul'))
        );
        """)
        
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS dim_serie (
            id_serie        INTEGER PRIMARY KEY,
            nome_indicador  TEXT    NOT NULL,
            categoria       TEXT    NOT NULL,
            subcategoria    TEXT,
            periodicidade   TEXT    NOT NULL
                                    CHECK (periodicidade IN ('diária','mensal','trimestral','anual')),
            unidade_medida  TEXT    NOT NULL,
            abrangencia     TEXT    NOT NULL DEFAULT 'Brasil',
            descricao       TEXT,
            ativo           INTEGER NOT NULL DEFAULT 1
        );
        """)
        
        # ============================================================
        # BLOCO 3: FATOS
        # ============================================================
        print("📋 Criando tabelas de fatos...")
        
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS fact_serie_temporal (
            id_serie        INTEGER NOT NULL,
            sigla_uf        TEXT    DEFAULT NULL,
            data_referencia TEXT    NOT NULL,
            valor           REAL    NOT NULL,
            data_ingestao   TEXT    NOT NULL DEFAULT (datetime('now')),
            PRIMARY KEY (id_serie, sigla_uf, data_referencia),
            FOREIGN KEY (id_serie)  REFERENCES dim_serie(id_serie) ON DELETE CASCADE,
            FOREIGN KEY (sigla_uf)  REFERENCES dim_uf(sigla_uf)    ON DELETE SET NULL
        );
        """)
        
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS fact_simulacao_risco (
            id                      INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id              INTEGER NOT NULL,
            sigla_uf                TEXT    NOT NULL,
            data_referencia         TEXT    NOT NULL,
            inadimplencia_projetada REAL    NOT NULL,
            ioi_score               REAL    NOT NULL,
            var_95                  REAL    NOT NULL,
            var_99                  REAL    NOT NULL,
            parametros_json         TEXT    NOT NULL,
            criado_em               TEXT    NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (usuario_id) REFERENCES usuario(id)       ON DELETE SET NULL,
            FOREIGN KEY (sigla_uf)   REFERENCES dim_uf(sigla_uf)  ON DELETE CASCADE
        );
        """)
        
        # ============================================================
        # BLOCO 4: TABELAS OPERACIONAIS
        # ============================================================
        print("📋 Criando tabelas operacionais...")
        
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS ranking_oportunidade (
            id                  INTEGER PRIMARY KEY AUTOINCREMENT,
            sigla_uf            TEXT    NOT NULL,
            score_oportunidade  REAL    NOT NULL,
            componente_demanda  REAL,
            componente_risco    REAL,
            componente_mercado  REAL,
            data_calculo        TEXT    NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (sigla_uf) REFERENCES dim_uf(sigla_uf) ON DELETE CASCADE
        );
        """)
        
        cursor.execute("""
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
        """)
        
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS log_auditoria (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id      INTEGER,
            acao            TEXT NOT NULL,
            tabela_afetada  TEXT,
            detalhes_json   TEXT,
            ip_address      TEXT,
            criado_em       TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE SET NULL
        );
        """)
        
        # ============================================================
        # ÍNDICES
        # ============================================================
        print("📋 Criando índices...")
        
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_fst_uf         ON fact_serie_temporal(sigla_uf);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_fst_data        ON fact_serie_temporal(data_referencia);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_fst_serie_data  ON fact_serie_temporal(id_serie, data_referencia);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_fst_uf_data     ON fact_serie_temporal(sigla_uf, data_referencia);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_rank_score      ON ranking_oportunidade(score_oportunidade DESC);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_rank_uf         ON ranking_oportunidade(sigla_uf);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_sessao_token    ON sessao(token_jwt);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_log_criado      ON log_auditoria(criado_em);")
        
        # ============================================================
        # SEEDS: DADOS INICIAIS
        # ============================================================
        print("📋 Inserindo dados iniciais...")
        
        # Usuário admin
        cursor.execute("""
        INSERT OR IGNORE INTO usuario (nome, email, senha_hash, papel)
        VALUES ('Administrador', 'admin@dm.com.br', 'SUBSTITUIR_PELO_HASH_BCRYPT', 'admin');
        """)
        
        # Estados (dim_uf)
        estados = [
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
            ('TO','Tocantins','17','Norte'),
        ]
        
        cursor.executemany("""
        INSERT OR IGNORE INTO dim_uf VALUES (?, ?, ?, ?)
        """, estados)
        
        # Séries do BCB (todas as séries)
        series_bcb = [
            # PRIORIDADE MÁXIMA: Crédito e inadimplência
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
            (19882, 'Endividamento famílias (série antiga)',  'credito', 'endividamento',    'mensal',     '%',       'Brasil', 'Série histórica de endividamento das famílias', 1),
            
            # PRIORIDADE ALTA: Contexto macroeconômico
            (433,   'IPCA - Variação mensal',                 'inflacao_precos', 'ipca_geral',    'mensal',     '% a.m.', 'Brasil', 'Inflação oficial mensal do Brasil', 1),
            (13522, 'IPCA - Acumulado 12 meses',              'inflacao_precos', 'ipca_geral',    'mensal',     '%',      'Brasil', 'IPCA acumulado nos últimos 12 meses', 1),
            (11,    'Selic - Taxa diária',                    'taxas_de_juros',  'selic',         'diária',     '% a.a.', 'Brasil', 'Taxa de juros básica da economia brasileira', 1),
            (432,   'Selic - Meta',                           'taxas_de_juros',  'selic',         'mensal',     '% a.a.', 'Brasil', 'Meta da taxa Selic definida pelo COPOM', 1),
            (4390,  'Selic - Acumulada no mês',               'taxas_de_juros',  'selic',         'mensal',     '% a.m.', 'Brasil', 'Selic acumulada no mês corrente', 1),
            (1,     'Dólar (venda) diário',                   'cambio',          'dolar',         'diária',     'R$',     'Brasil', 'Taxa de câmbio dólar americano (venda)', 1),
            (3697,  'Dólar PTAX (venda)',                     'cambio',          'dolar',         'diária',     'R$',     'Brasil', 'Dólar PTAX — taxa oficial de fechamento do BC', 1),
            (24369, 'Taxa de desemprego (PNAD)',              'emprego_e_renda', 'mercado_trabalho_pnad', 'mensal', '%',  'Brasil', 'Taxa de desocupação — PNAD Contínua/IBGE', 1),
            (1207,  'PIB anual',                              'atividade_economica', 'pib',       'anual',      'R$ mi',  'Brasil', 'Produto Interno Bruto a preços de mercado', 1),
            (22099, 'PIB trimestral',                         'atividade_economica', 'pib',       'trimestral', 'R$ mi',  'Brasil', 'PIB trimestral a preços de mercado', 1),
            
            # PRIORIDADE MÉDIA: Mercado financeiro e renda
            (7,     'Ibovespa',                               'mercado_financeiro', 'bolsa',     'diária',     'pontos', 'Brasil', 'Índice da bolsa de valores brasileira (B3)', 1),
            (189,   'IGP-M',                                  'inflacao_precos', 'igp',          'mensal',     '% a.m.','Brasil', 'Índice Geral de Preços do Mercado', 1),
            (226,   'TR - Taxa Referencial',                  'taxas_de_juros',  'referencias',  'mensal',     '% a.m.','Brasil', 'Taxa Referencial utilizada em contratos de crédito', 1),
            (196,   'Poupança - Rentabilidade',               'taxas_de_juros',  'poupanca',     'mensal',     '% a.m.','Brasil', 'Rentabilidade mensal da caderneta de poupança', 1),
        ]
        
        cursor.executemany("""
        INSERT OR IGNORE INTO dim_serie VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, series_bcb)
        
        # Commit das alterações
        conexao.commit()
        
        print("\n✅ Banco de dados criado com sucesso!")
        print(f"📍 Localização: {caminho_banco}")
        
        # Estatísticas
        cursor.execute("SELECT COUNT(*) FROM usuario;")
        print(f"👤 Usuários: {cursor.fetchone()[0]}")
        
        cursor.execute("SELECT COUNT(*) FROM dim_uf;")
        print(f"🗺️  Estados: {cursor.fetchone()[0]}")
        
        cursor.execute("SELECT COUNT(*) FROM dim_serie;")
        print(f"📊 Séries do BCB: {cursor.fetchone()[0]}")
        
        conexao.close()
        print("\n✨ Script finalizado com sucesso!")
        
    except sqlite3.Error as e:
        print(f"\n❌ Erro ao criar banco de dados: {e}")
        return False
    except Exception as e:
        print(f"\n❌ Erro inesperado: {e}")
        return False
    
    return True


if __name__ == "__main__":
    criar_banco_dados()

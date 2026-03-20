"""
ETL — Coleta dados do BCB (SGS) e salva no banco SQLite
Projeto: Mapa de Crédito Inclusivo — FATEC API 3º Semestre

Como rodar:
    pip install requests pandas
    python etl_bcb.py

O que este script faz:
    1. Lê as séries cadastradas em dim_serie
    2. Busca os dados de cada série na API do BCB
    3. Salva os valores em fact_serie_temporal
    4. Registra data_ingestao para auditoria de atraso do SGS
"""

import sqlite3
import requests
import time
from datetime import datetime

# ============================================================
# CONFIGURAÇÃO — ajuste o caminho se necessário
# ============================================================
DB_PATH = "../database/credito_inclusivo.db"
BCB_URL = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.{codigo}/dados"

# Séries prioritárias para o projeto (crédito inclusivo)
# Formato: (codigo_serie, sigla_uf_ou_None)
# None = dado nacional (sem UF)
SERIES_PARA_COLETAR = [
    (21082, None),   # Inadimplência PF — nacional
    (21083, None),   # Inadimplência PJ — nacional
    (20631, None),   # Concessões total  — nacional
    (20633, None),   # Concessões PF     — nacional
    (20540, None),   # Saldo crédito PF  — nacional
    (29037, None),   # Endividamento famílias
    (29038, None),   # Comprometimento renda PF
    (20783, None),   # Spread bancário
    (20714, None),   # Juros médios PF
    (433,   None),   # IPCA mensal
    (11,    None),   # Selic diária
    (24369, None),   # Desemprego PNAD
]

# ============================================================
# FUNÇÕES
# ============================================================

def conectar_banco():
    """Abre conexão com o banco SQLite"""
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def buscar_serie_bcb(codigo, data_inicial="01/01/2015"):
    """
    Busca dados de uma série no SGS do BCB.
    Retorna lista de dicts: [{"data": "01/01/2023", "valor": "3.5"}, ...]
    """
    url = BCB_URL.format(codigo=codigo)
    params = {
        "formato": "json",
        "dataInicial": data_inicial,
        "dataFinal": datetime.now().strftime("%d/%m/%Y")
    }

    try:
        resposta = requests.get(url, params=params, timeout=15)
        resposta.raise_for_status()
        dados = resposta.json()
        print(f"  Serie {codigo}: {len(dados)} registros encontrados")
        return dados
    except requests.exceptions.HTTPError as e:
        print(f"  ERRO HTTP na série {codigo}: {e}")
        return []
    except Exception as e:
        print(f"  ERRO na série {codigo}: {e}")
        return []


def converter_data_bcb(data_str):
    """
    Converte data do formato BCB (DD/MM/AAAA) para ISO (AAAA-MM-DD)
    Ex: '01/03/2023' -> '2023-03-01'
    """
    try:
        return datetime.strptime(data_str, "%d/%m/%Y").strftime("%Y-%m-%d")
    except:
        return data_str


def salvar_no_banco(conn, id_serie, sigla_uf, dados):
    """
    Salva os dados coletados em fact_serie_temporal.
    Usa INSERT OR REPLACE para não duplicar dados já existentes.
    """
    if not dados:
        return 0

    agora = datetime.now().isoformat()
    registros = []

    for item in dados:
        data_iso = converter_data_bcb(item.get("data", ""))
        valor_str = item.get("valor", "")

        # Pula registros sem valor ou com valor inválido
        if not data_iso or not valor_str or valor_str.strip() == "":
            continue

        try:
            valor = float(valor_str.replace(",", "."))
            registros.append((id_serie, sigla_uf, data_iso, valor, agora))
        except ValueError:
            continue  # ignora valores que não são número

    if registros:
        conn.executemany("""
            INSERT OR REPLACE INTO fact_serie_temporal
                (id_serie, sigla_uf, data_referencia, valor, data_ingestao)
            VALUES (?, ?, ?, ?, ?)
        """, registros)
        conn.commit()

    return len(registros)


def verificar_serie_existe(conn, id_serie):
    """Verifica se a série está cadastrada em dim_serie"""
    resultado = conn.execute(
        "SELECT id_serie FROM dim_serie WHERE id_serie = ?", (id_serie,)
    ).fetchone()
    return resultado is not None


# ============================================================
# EXECUÇÃO PRINCIPAL
# ============================================================

def rodar_etl():
    print("=" * 50)
    print("ETL — Coleta BCB/SGS iniciada")
    print(f"Banco: {DB_PATH}")
    print(f"Séries para coletar: {len(SERIES_PARA_COLETAR)}")
    print("=" * 50)

    conn = conectar_banco()
    total_inseridos = 0

    for codigo, sigla_uf in SERIES_PARA_COLETAR:
        uf_label = sigla_uf if sigla_uf else "Nacional"
        print(f"\nColetando série {codigo} ({uf_label})...")

        # Verifica se série está no catálogo
        if not verificar_serie_existe(conn, codigo):
            print(f"  AVISO: Série {codigo} não está em dim_serie. Pulando.")
            continue

        # Busca dados na API do BCB
        dados = buscar_serie_bcb(codigo)

        # Salva no banco
        qtd = salvar_no_banco(conn, codigo, sigla_uf, dados)
        total_inseridos += qtd
        print(f"  {qtd} registros salvos no banco")

        # Pausa entre requisições para não sobrecarregar a API do BCB
        time.sleep(0.5)

    conn.close()

    print("\n" + "=" * 50)
    print(f"ETL concluído! Total inserido: {total_inseridos} registros")
    print("=" * 50)


if __name__ == "__main__":
    rodar_etl()

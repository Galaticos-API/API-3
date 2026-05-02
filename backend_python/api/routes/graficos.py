"""
Módulo 3 — Gráficos Prontos
Rotas de conveniência que agregam dados do SQLite e retornam JSON
estruturado para cada um dos 9 gráficos do dashboard.
"""

from fastapi import APIRouter, HTTPException, Query
from pathlib import Path
import sqlite3
from datetime import datetime, timedelta
from typing import Optional
from api.config import DB_FILENAME

router = APIRouter()

# ─────────────────────────────────────────────
# Helper de conexão
# ─────────────────────────────────────────────

def _get_conn():
    db_path = Path(__file__).resolve().parent.parent.parent.parent / "database" / DB_FILENAME
    if not db_path.exists():
        raise HTTPException(
            status_code=503,
            detail="Banco de dados não encontrado. Execute /api/v1/etl/executar com método POST primeiro."
        )
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def _rows(conn, sql, params=()):
    return [dict(r) for r in conn.execute(sql, params).fetchall()]


# ─────────────────────────────────────────────
# UFs (lista de estados — utilitário)
# ─────────────────────────────────────────────

@router.get("/ufs")
def listar_ufs():
    """Lista os 27 estados do Brasil (sigla, nome, região)."""
    conn = _get_conn()
    try:
        return _rows(conn, "SELECT sigla_uf, nome, codigo_ibge, regiao_br FROM dim_uf ORDER BY nome")
    finally:
        conn.close()


@router.get("/ufs/{sigla}")
def detalhe_uf(sigla: str):
    """Detalhes de um estado específico."""
    conn = _get_conn()
    try:
        rows = _rows(conn, "SELECT * FROM dim_uf WHERE sigla_uf = ?", (sigla.upper(),))
        if not rows:
            raise HTTPException(status_code=404, detail=f"Estado '{sigla}' não encontrado.")
        return rows[0]
    finally:
        conn.close()


# ─────────────────────────────────────────────
# GRF-01  Saldo de Crédito SFN (Linha)
# ─────────────────────────────────────────────

@router.get("/credito-sfn")
def credito_sfn(anos: int = Query(10, ge=1, le=20)):
    """
    GRF-01 — Saldo de Crédito do SFN (Linha).
    Séries: 20540 (PF), 20541 (PJ), 20542 (Total).
    """
    conn = _get_conn()
    try:
        data_corte = (datetime.now() - timedelta(days=anos * 365)).strftime("%Y-%m-%d")
        sql = """
            SELECT
                f.data_referencia AS data,
                MAX(CASE WHEN f.id_serie = 20540 THEN f.valor END) AS saldo_pf,
                MAX(CASE WHEN f.id_serie = 20541 THEN f.valor END) AS saldo_pj,
                MAX(CASE WHEN f.id_serie = 20542 THEN f.valor END) AS saldo_total
            FROM fact_serie_temporal f
            WHERE f.id_serie IN (20540, 20541, 20542)
              AND f.sigla_uf IS NULL
              AND f.data_referencia >= ?
            GROUP BY f.data_referencia
            ORDER BY f.data_referencia
        """
        series = _rows(conn, sql, (data_corte,))
        return {"grf": "GRF-01", "titulo": "Saldo de Crédito SFN", "unidade": "R$ milhões", "series": series}
    finally:
        conn.close()


# ─────────────────────────────────────────────
# GRF-02  Contexto Macro (Linha + Barras, eixo duplo)
# ─────────────────────────────────────────────

@router.get("/macro-contexto")
def macro_contexto(anos: int = Query(5, ge=1, le=15)):
    """
    GRF-02 — Contexto Macroeconômico (Selic, IPCA, Inadimplência).
    Séries: 432 (Selic Meta), 433 (IPCA mensal), 21082 (Inadimplência PF).
    """
    conn = _get_conn()
    try:
        data_corte = (datetime.now() - timedelta(days=anos * 365)).strftime("%Y-%m-%d")
        sql = """
            SELECT
                data_referencia AS data,
                MAX(CASE WHEN id_serie = 432  THEN valor END) AS selic,
                MAX(CASE WHEN id_serie = 433  THEN valor END) AS ipca,
                MAX(CASE WHEN id_serie = 21082 THEN valor END) AS inadimplencia_pf
            FROM fact_serie_temporal
            WHERE id_serie IN (432, 433, 21082)
              AND sigla_uf IS NULL
              AND data_referencia >= ?
            GROUP BY data_referencia
            ORDER BY data_referencia
        """
        series = _rows(conn, sql, (data_corte,))
        return {
            "grf": "GRF-02",
            "titulo": "Contexto Macroeconômico",
            "series": series,
            "eixo_esquerdo": "selic (% a.a.)",
            "eixo_direito": "ipca (% a.m.) / inadimplencia (%)"
        }
    finally:
        conn.close()


# ─────────────────────────────────────────────
# GRF-03 + GRF-04  Inadimplência Regional
# ─────────────────────────────────────────────

_REGIOES = {
    "Norte":       ["AC", "AP", "AM", "PA", "RO", "RR", "TO"],
    "Nordeste":    ["AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"],
    "Centro-Oeste":["DF", "GO", "MS", "MT"],
    "Sudeste":     ["ES", "MG", "RJ", "SP"],
    "Sul":         ["PR", "RS", "SC"],
}

_UF_ORDER = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA",
             "MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN",
             "RS","RO","RR","SC","SP","SE","TO"]

def _serie_inad_pf(uf: str) -> int:
    return 15861 + _UF_ORDER.index(uf)

def _quartis(valores: list[float]) -> dict:
    if not valores:
        return {"min": None, "q1": None, "median": None, "q3": None, "max": None}
    s = sorted(valores)
    n = len(s)
    def pct(p):
        idx = (n - 1) * p
        lo, hi = int(idx), min(int(idx) + 1, n - 1)
        return s[lo] + (s[hi] - s[lo]) * (idx - lo)
    return {
        "min":    round(s[0], 4),
        "q1":     round(pct(0.25), 4),
        "median": round(pct(0.50), 4),
        "q3":     round(pct(0.75), 4),
        "max":    round(s[-1], 4),
    }


@router.get("/inadimplencia-regional")
def inadimplencia_regional():
    """
    GRF-03 (Boxplot) + GRF-04 (Barras) — Inadimplência por macrorregião.
    Usa a série estadual de inadimplência PF (base 15861).
    """
    conn = _get_conn()
    try:
        boxplot_out = []
        barras_out  = []

        for regiao, ufs in _REGIOES.items():
            ids = [_serie_inad_pf(uf) for uf in ufs if uf in _UF_ORDER]
            if not ids:
                continue

            placeholders = ",".join("?" * len(ids))

            # Histórico completo para boxplot
            hist_rows = conn.execute(
                f"SELECT valor FROM fact_serie_temporal WHERE id_serie IN ({placeholders})",
                ids
            ).fetchall()
            valores = [r[0] for r in hist_rows if r[0] is not None]

            # Último valor por UF para barras (média da região)
            ultimo_rows = conn.execute(f"""
                SELECT AVG(valor) FROM (
                    SELECT id_serie, MAX(data_referencia) AS maxd
                    FROM fact_serie_temporal
                    WHERE id_serie IN ({placeholders})
                    GROUP BY id_serie
                ) latest
                JOIN fact_serie_temporal f
                  ON f.id_serie = latest.id_serie AND f.data_referencia = latest.maxd
            """, ids).fetchone()

            media_atual = round(ultimo_rows[0], 4) if ultimo_rows and ultimo_rows[0] else None

            boxplot_out.append({"regiao": regiao, **_quartis(valores)})
            barras_out.append({"regiao": regiao, "inadimplencia_media": media_atual})

        return {
            "grf": "GRF-03/04",
            "titulo": "Inadimplência por Macrorregião",
            "boxplot": boxplot_out,
            "barras":  barras_out,
        }
    finally:
        conn.close()


# ─────────────────────────────────────────────
# GRF-05  Heatmap Estadual (UF × Mês, 24m)
# ─────────────────────────────────────────────

@router.get("/heatmap-estados")
def heatmap_estados():
    """
    GRF-05 — Inadimplência Estadual: matriz UF × Mês (últimos 24 meses).
    """
    conn = _get_conn()
    try:
        corte = (datetime.now() - timedelta(days=730)).strftime("%Y-%m-%d")

        ids_pf = {uf: _serie_inad_pf(uf) for uf in _UF_ORDER}
        placeholders = ",".join("?" * len(ids_pf))

        rows = conn.execute(f"""
            SELECT f.id_serie, f.data_referencia, f.valor
            FROM fact_serie_temporal f
            WHERE f.id_serie IN ({placeholders})
              AND f.data_referencia >= ?
            ORDER BY f.data_referencia
        """, list(ids_pf.values()) + [corte]).fetchall()

        id_to_uf = {v: k for k, v in ids_pf.items()}

        # Agrupa por UF e mês (YYYY-MM)
        heat: dict[str, dict[str, float]] = {}
        meses_set: set[str] = set()

        for row in rows:
            uf = id_to_uf.get(row[0])
            if not uf:
                continue
            mes = row[1][:7]  # YYYY-MM
            meses_set.add(mes)
            if uf not in heat:
                heat[uf] = {}
            heat[uf][mes] = round(row[2], 4)

        meses = sorted(meses_set)
        estados_out = [
            {"uf": uf, "valores": [heat.get(uf, {}).get(m) for m in meses]}
            for uf in _UF_ORDER
        ]

        return {
            "grf": "GRF-05",
            "titulo": "Inadimplência Estadual — Últimos 24 meses",
            "meses": meses,
            "estados": estados_out,
        }
    finally:
        conn.close()


# ─────────────────────────────────────────────
# GRF-06  Scatter PF vs PJ por Estado
# ─────────────────────────────────────────────

def _serie_inad_pj(uf: str) -> int:
    return 15893 + _UF_ORDER.index(uf)


@router.get("/scatter-pf-pj")
def scatter_pf_pj():
    """
    GRF-06 — Dispersão Inadimplência PF vs PJ por estado.
    Usa o último valor disponível de cada série.
    """
    conn = _get_conn()
    try:
        uf_regiao = {r[0]: r[1] for r in conn.execute(
            "SELECT sigla_uf, regiao_br FROM dim_uf"
        ).fetchall()}

        pontos = []
        for uf in _UF_ORDER:
            if uf not in _UF_ORDER:
                continue
            id_pf = _serie_inad_pf(uf)
            id_pj = _serie_inad_pj(uf)

            row_pf = conn.execute(
                "SELECT valor FROM fact_serie_temporal WHERE id_serie=? ORDER BY data_referencia DESC LIMIT 1",
                (id_pf,)
            ).fetchone()
            row_pj = conn.execute(
                "SELECT valor FROM fact_serie_temporal WHERE id_serie=? ORDER BY data_referencia DESC LIMIT 1",
                (id_pj,)
            ).fetchone()

            if row_pf and row_pj:
                pontos.append({
                    "uf": uf,
                    "regiao": uf_regiao.get(uf, ""),
                    "inadimplencia_pf": round(row_pf[0], 4),
                    "inadimplencia_pj": round(row_pj[0], 4),
                })

        return {
            "grf": "GRF-06",
            "titulo": "Inadimplência PF vs PJ por Estado",
            "pontos": pontos,
        }
    finally:
        conn.close()


# ─────────────────────────────────────────────
# GRF-07  Estudo de Caso por Estado (Linha)
# ─────────────────────────────────────────────

def _serie_saldo_pf(uf: str) -> int:
    return 14002 + _UF_ORDER.index(uf)

def _serie_saldo_pj(uf: str) -> int:
    return 14029 + _UF_ORDER.index(uf)


@router.get("/estudo-estado/{sigla}")
def estudo_estado(sigla: str, anos: int = Query(5, ge=1, le=10)):
    """
    GRF-07 — Estudo de caso de um estado específico.
    Retorna séries de saldo PF, saldo PJ, inadimplência PF e inadimplência PJ.
    """
    uf = sigla.upper()
    if uf not in _UF_ORDER:
        raise HTTPException(status_code=404, detail=f"UF '{uf}' inválida.")

    conn = _get_conn()
    try:
        nome_uf = conn.execute(
            "SELECT nome FROM dim_uf WHERE sigla_uf=?", (uf,)
        ).fetchone()
        nome_uf = nome_uf[0] if nome_uf else uf

        id_saldo_pf = _serie_saldo_pf(uf)
        id_saldo_pj = _serie_saldo_pj(uf)
        id_inad_pf  = _serie_inad_pf(uf)
        id_inad_pj  = _serie_inad_pj(uf)

        corte = (datetime.now() - timedelta(days=anos * 365)).strftime("%Y-%m-%d")

        sql = """
            SELECT
                data_referencia AS data,
                MAX(CASE WHEN id_serie=? THEN valor END) AS saldo_pf,
                MAX(CASE WHEN id_serie=? THEN valor END) AS saldo_pj,
                MAX(CASE WHEN id_serie=? THEN valor END) AS inadimplencia_pf,
                MAX(CASE WHEN id_serie=? THEN valor END) AS inadimplencia_pj
            FROM fact_serie_temporal
            WHERE id_serie IN (?,?,?,?)
              AND data_referencia >= ?
            GROUP BY data_referencia
            ORDER BY data_referencia
        """
        ids = (id_saldo_pf, id_saldo_pj, id_inad_pf, id_inad_pj,
               id_saldo_pf, id_saldo_pj, id_inad_pf, id_inad_pj, corte)
        series = _rows(conn, sql, ids)

        return {
            "grf": "GRF-07",
            "titulo": f"Estudo de Caso — {nome_uf}",
            "sigla": uf,
            "nome": nome_uf,
            "series": series,
        }
    finally:
        conn.close()


# ─────────────────────────────────────────────
# GRF-08  Score IOI — Ranking de Oportunidade
# ─────────────────────────────────────────────

@router.get("/score-oportunidade")
def score_oportunidade():
    """
    GRF-08 — Ranking de Oportunidade (Score IOI 0–10) por estado.
    Tenta primeiro a tabela ranking_oportunidade. Se vazia, calcula
    o score dinamicamente a partir dos dados de inadimplência.
    """
    conn = _get_conn()
    try:
        # Tenta tabela pré-computada
        rows = _rows(conn, """
            SELECT r.sigla_uf, u.nome, r.score_oportunidade,
                   r.componente_demanda, r.componente_risco, r.componente_mercado,
                   r.data_calculo
            FROM ranking_oportunidade r
            JOIN dim_uf u ON u.sigla_uf = r.sigla_uf
            ORDER BY r.score_oportunidade DESC
        """)

        if rows:
            return {"grf": "GRF-08", "titulo": "Score IOI — Ranking de Oportunidade",
                    "fonte": "pre-computado", "ranking": rows}

        # Cálculo dinâmico (fallback) — usa última inadimplência PF por estado
        uf_rows = conn.execute("SELECT sigla_uf, nome FROM dim_uf").fetchall()
        scores = []
        for uf, nome in uf_rows:
            if uf not in _UF_ORDER:
                continue
            id_pf = _serie_inad_pf(uf)
            # Pega até 12 meses para calcular tendência
            hist = conn.execute("""
                SELECT valor FROM fact_serie_temporal
                WHERE id_serie=? ORDER BY data_referencia DESC LIMIT 12
            """, (id_pf,)).fetchall()
            if not hist:
                continue
            vals = [r[0] for r in hist]
            atual = vals[0]
            media_hist = sum(vals) / len(vals)
            # s_inadim: inversamente proporcional à inadimplência (menor inad → maior score)
            scores.append({"uf": uf, "nome": nome, "atual": atual, "media": media_hist})

        if not scores:
            return {"grf": "GRF-08", "titulo": "Score IOI",
                    "fonte": "sem_dados", "ranking": []}

        # MinMax normalização
        max_i = max(s["atual"] for s in scores)
        min_i = min(s["atual"] for s in scores)
        rng = max_i - min_i if max_i != min_i else 1

        ranking = []
        for s in scores:
            s_inadim   = 1 - (s["atual"] - min_i) / rng   # inversão: menor inadimp = melhor
            tendencia   = s["media"] - s["atual"]
            max_t = max(abs(ss["media"] - ss["atual"]) for ss in scores) or 1
            s_tend = (tendencia + max_t) / (2 * max_t)
            score  = round((s_inadim * 0.60 + s_tend * 0.40) * 10, 2)
            ranking.append({
                "sigla_uf": s["uf"],
                "nome": s["nome"],
                "score_oportunidade": score,
                "componente_risco": round(s_inadim * 10, 2),
                "componente_tendencia": round(s_tend * 10, 2),
            })

        ranking.sort(key=lambda x: x["score_oportunidade"], reverse=True)
        return {"grf": "GRF-08", "titulo": "Score IOI — Ranking de Oportunidade",
                "fonte": "dinamico", "ranking": ranking}
    finally:
        conn.close()


# ─────────────────────────────────────────────
# GRF-09  Monte Carlo (Histograma + KDE)
# ─────────────────────────────────────────────

@router.get("/monte-carlo/latest")
def monte_carlo_latest():
    """
    GRF-09 — Última simulação Monte Carlo salva.
    Retorna os parâmetros e as distribuições de perdas para o histograma + KDE.
    """
    conn = _get_conn()
    try:
        row = conn.execute("""
            SELECT s.id, s.sigla_uf, u.nome, s.inadimplencia_projetada,
                   s.ioi_score, s.var_95, s.var_99,
                   s.parametros_json, s.criado_em
            FROM fact_simulacao_risco s
            JOIN dim_uf u ON u.sigla_uf = s.sigla_uf
            ORDER BY s.criado_em DESC LIMIT 1
        """).fetchone()

        if not row:
            return {
                "grf": "GRF-09",
                "titulo": "Simulação Monte Carlo",
                "encontrado": False,
                "mensagem": "Nenhuma simulação encontrada. Use a página de Simulação Monte Carlo para gerar dados."
            }

        import json, numpy as np

        params = json.loads(row["parametros_json"]) if row["parametros_json"] else {}
        montante = params.get("montante", 150_000_000)
        lgd      = params.get("lgd", 0.65)
        inad     = row["inadimplencia_projetada"] / 100

        rng_np = np.random.default_rng(42)
        mu     = np.log(inad) - 0.5 * 0.3**2
        sigma  = 0.3
        sim    = rng_np.lognormal(mu, sigma, 10_000)
        perdas = (sim * montante * lgd).tolist()

        # Histograma com 50 bins
        counts, edges = np.histogram(perdas, bins=50)
        histogram = [
            {"bin_start": round(edges[i], 2), "bin_end": round(edges[i+1], 2), "contagem": int(counts[i])}
            for i in range(len(counts))
        ]

        return {
            "grf": "GRF-09",
            "titulo": "Simulação Monte Carlo",
            "encontrado": True,
            "simulacao": {
                "id": row["id"],
                "sigla_uf": row["sigla_uf"],
                "nome_uf": row["nome"],
                "inadimplencia_projetada": row["inadimplencia_projetada"],
                "ioi_score": row["ioi_score"],
                "var_95": row["var_95"],
                "var_99": row["var_99"],
                "criado_em": row["criado_em"],
            },
            "histograma": histogram,
            "media_perdas": round(float(np.mean(perdas)), 2),
            "var_95_calculado": round(float(np.percentile(perdas, 95)), 2),
            "var_99_calculado": round(float(np.percentile(perdas, 99)), 2),
        }
    finally:
        conn.close()

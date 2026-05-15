/**
 * Serviço HTTP centralizado para a API do Mapa de Crédito Inclusivo.
 * Base URL configurada via VITE_API_URL no .env.
 */

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `HTTP ${res.status} em ${path}`);
  }
  return res.json() as Promise<T>;
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface UF {
  sigla_uf: string;
  nome: string;
  codigo_ibge: string;
  regiao_br: string;
}

export interface SeriePoint {
  data: string;
  [key: string]: number | string | null;
}

export interface CreditoSfnData {
  grf: string;
  titulo: string;
  unidade: string;
  series: Array<{ data: string; saldo_pf: number | null; saldo_pj: number | null; saldo_total: number | null }>;
}

export interface MacroContextoData {
  grf: string;
  titulo: string;
  series: Array<{ data: string; selic: number | null; ipca: number | null; inadimplencia_pf: number | null }>;
}

export interface BoxplotItem {
  regiao: string;
  min: number | null;
  q1: number | null;
  median: number | null;
  q3: number | null;
  max: number | null;
}

export interface InadimplenciaRegionalData {
  grf: string;
  titulo: string;
  boxplot: BoxplotItem[];
  barras: Array<{ regiao: string; inadimplencia_media: number | null }>;
}

export interface HeatmapEstadosData {
  grf: string;
  titulo: string;
  meses: string[];
  estados: Array<{ uf: string; valores: (number | null)[] }>;
}

export interface ScatterPoint {
  uf: string;
  regiao: string;
  inadimplencia_pf: number;
  inadimplencia_pj: number;
}

export interface ScatterPfPjData {
  grf: string;
  titulo: string;
  pontos: ScatterPoint[];
}

export interface EstudoEstadoData {
  grf: string;
  titulo: string;
  sigla: string;
  nome: string;
  series: Array<{
    data: string;
    saldo_pf: number | null;
    saldo_pj: number | null;
    inadimplencia_pf: number | null;
    inadimplencia_pj: number | null;
  }>;
}

export interface RankingItem {
  sigla_uf: string;
  nome: string;
  score_oportunidade: number;
  componente_demanda?: number;
  componente_risco?: number;
  componente_mercado?: number;
  componente_tendencia?: number;
}

export interface ScoreOportunidadeData {
  grf: string;
  titulo: string;
  fonte: string;
  ranking: RankingItem[];
}

export interface HistBin {
  bin_start: number;
  bin_end: number;
  contagem: number;
}

export interface MonteCarloData {
  grf: string;
  titulo: string;
  encontrado: boolean;
  mensagem?: string;
  simulacao?: {
    id: number;
    sigla_uf: string;
    nome_uf: string;
    inadimplencia_projetada: number;
    ioi_score: number;
    var_95: number;
    var_99: number;
    criado_em: string;
  };
  histograma?: HistBin[];
  media_perdas?: number;
  var_95_calculado?: number;
  var_99_calculado?: number;
}

// ─── API Calls ────────────────────────────────────────────────────────────────

export const api = {
  ufs: {
    listar: ()               => get<UF[]>("/graficos/ufs"),
    detalhe: (sigla: string) => get<UF>(`/graficos/ufs/${sigla}`),
  },
  graficos: {
    creditoSfn:             (anos = 10)    => get<CreditoSfnData>(`/graficos/credito-sfn?anos=${anos}`),
    macroContexto:          (anos = 5)     => get<MacroContextoData>(`/graficos/macro-contexto?anos=${anos}`),
    inadimplenciaRegional:  ()             => get<InadimplenciaRegionalData>("/graficos/inadimplencia-regional"),
    heatmapEstados:         ()             => get<HeatmapEstadosData>("/graficos/heatmap-estados"),
    scatterPfPj:            ()             => get<ScatterPfPjData>("/graficos/scatter-pf-pj"),
    estudioEstado:          (sigla: string, anos = 5) =>
                                             get<EstudoEstadoData>(`/graficos/estudo-estado/${sigla}?anos=${anos}`),
    scoreOportunidade:      ()             => get<ScoreOportunidadeData>("/graficos/score-oportunidade"),
    monteCarlo:             ()             => get<MonteCarloData>("/graficos/monte-carlo/latest"),
  },
  etl: {
    status: () => get<{ status: string; categorias: unknown[] }>("/etl/status"),
  },
  llm: {
    chat: async (message: string, history: any[] = []) => {
      const res = await fetch(`${BASE}/llm/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? `HTTP ${res.status} em /llm/chat`);
      }
      return res.json() as Promise<{ response: string; history: any[] }>;
    },
  },
};

/**
 * GRF-03 (Boxplot) + GRF-04 (Barras) — Inadimplência por Macrorregião.
 * Recharts não tem Boxplot nativo — implementado com composição de barras + linhas.
 */
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ComposedChart, ErrorBar,
} from "recharts";
import type { InadimplenciaRegionalData } from "../../services/api";

const COLORS: Record<string, string> = {
  "Norte":        "#22c55e",
  "Nordeste":     "#3b82f6",
  "Centro-Oeste": "#a855f7",
  "Sudeste":      "#f97316",
  "Sul":          "#ef4444",
};

const tick = { fill: "#64748b", fontSize: 11 };

interface Props { data: InadimplenciaRegionalData }

export function ChartInadimplenciaRegional({ data }: Props) {
  const hasData = data.barras.some(b => b.inadimplencia_media !== null);

  if (!hasData)
    return <EmptyState msg="Sem dados regionais de inadimplência. Execute o ETL." />;

  // ── GRF-04: Barras — atual por região ──────────────────────────────────────
  const barData = data.barras.filter(b => b.inadimplencia_media !== null);

  // ── GRF-03: Boxplot emulado com ErrorBar (whiskers = Q1/Q3, center = median) ─
  const boxData = data.boxplot
    .filter(b => b.median !== null)
    .map(b => ({
      regiao: b.regiao,
      median: b.median!,
      errorDown: b.median! - (b.min ?? b.median!),
      errorUp:   (b.max ?? b.median!) - b.median!,
      q1: b.q1,
      q3: b.q3,
    }));

  return (
    <div className="space-y-6">
      {/* GRF-04 */}
      <div>
        <p className="text-xs text-muted-foreground mb-2 font-medium">GRF-04 · Inadimplência Atual por Macrorregião</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={barData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
            <XAxis dataKey="regiao" tick={tick} />
            <YAxis tick={tick} domain={[0, "auto"]} tickFormatter={v => `${v}%`} width={40} />
            <Tooltip
              contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }}
              formatter={(v: number) => [`${v?.toFixed(2)}%`, "Inadimplência média"]}
            />
            <Bar dataKey="inadimplencia_media" radius={[6, 6, 0, 0]} name="Inadimplência %">
              {barData.map(entry => (
                <Cell key={entry.regiao} fill={COLORS[entry.regiao] ?? "#3b82f6"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* GRF-03 — Boxplot (min-whisker / Q1 / mediana / Q3 / max-whisker) */}
      {boxData.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2 font-medium">GRF-03 · Distribuição Histórica (Boxplot)</p>
          <ResponsiveContainer width="100%" height={180}>
            <ComposedChart data={boxData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="regiao" tick={tick} />
              <YAxis tick={tick} tickFormatter={v => `${v}%`} width={40} domain={[0, "auto"]} />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }}
                formatter={(v: number, name: string) => [
                  `${typeof v === "number" ? v.toFixed(2) : v}%`,
                  name === "median" ? "Mediana" : name
                ]}
              />
              <Bar dataKey="median" radius={[4, 4, 4, 4]} barSize={24} name="Mediana">
                {boxData.map(entry => (
                  <Cell key={entry.regiao} fill={COLORS[entry.regiao] ?? "#3b82f6"} fillOpacity={0.75} />
                ))}
                <ErrorBar dataKey="errorDown" direction="y" stroke="#334155" strokeWidth={2} />
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
          <p className="text-[10px] text-muted-foreground mt-1 text-center">
            Barra = mediana histórica · Whiskers = min/max · Q1/Q3 indicados no tooltip
          </p>
        </div>
      )}
    </div>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <div className="flex items-center justify-center h-52 text-sm text-muted-foreground text-center px-4">
      📭 {msg}
    </div>
  );
}

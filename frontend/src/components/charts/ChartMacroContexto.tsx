/** GRF-02 — Contexto Macroeconômico (Linha + Barras, eixo duplo) */
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { MacroContextoData } from "../../services/api";

const tick = { fill: "#64748b", fontSize: 10 };

interface Props { data: MacroContextoData }

export function ChartMacroContexto({ data }: Props) {
  if (!data.series.length)
    return <EmptyState msg="Sem dados de Selic/IPCA/Inadimplência. Execute o ETL." />;

  const step = Math.max(1, Math.floor(data.series.length / 60));
  const series = data.series.filter((_, i) => i % step === 0);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={series} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
        <XAxis dataKey="data" tick={tick} tickFormatter={d => { const p = d.split('-'); return p.length >= 2 ? `${p[1]}/${p[0]}` : d; }} />
        {/* Eixo esquerdo — Selic (% a.a.) */}
        <YAxis yAxisId="esq" tick={tick} width={40} domain={[0, "auto"]}
               label={{ value: "% a.a.", angle: -90, position: "insideLeft", style: { fontSize: 9, fill: "#94a3b8" } }} />
        {/* Eixo direito — IPCA e Inadimplência (%) */}
        <YAxis yAxisId="dir" orientation="right" tick={tick} width={40}
               label={{ value: "%", angle: 90, position: "insideRight", style: { fontSize: 9, fill: "#94a3b8" } }} />
        <Tooltip
          contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }}
          labelFormatter={d => { const p = d.split('-'); return `Ref: ${p.length >= 3 ? `${p[2]}/${p[1]}/${p[0]}` : (p.length === 2 ? `${p[1]}/${p[0]}` : d)}`; }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line yAxisId="esq" type="monotone" dataKey="selic"            stroke="#6366f1" strokeWidth={2} dot={false} name="Selic (% a.a.)" />
        <Bar  yAxisId="dir" dataKey="ipca"                             fill="#fbbf24" fillOpacity={0.7}             name="IPCA (% a.m.)" />
        <Line yAxisId="dir" type="monotone" dataKey="inadimplencia_pf" stroke="#ef4444" strokeWidth={2} dot={false} name="Inadimpl. PF (%)" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <div className="flex items-center justify-center h-52 text-sm text-muted-foreground text-center px-4">
      📭 {msg}
    </div>
  );
}

/** GRF-07 — Estudo de Caso por Estado (Linha) */
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { EstudoEstadoData } from "../../services/api";

const fmtMi = (v: number) =>
  new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(v);

const tick = { fill: "#64748b", fontSize: 10 };

interface Props { data: EstudoEstadoData }

export function ChartEstudoEstado({ data }: Props) {
  if (!data.series.length)
    return (
      <div className="flex items-center justify-center h-52 text-sm text-muted-foreground text-center px-4">
        📭 Sem dados para <strong className="mx-1">{data.sigla}</strong>. Execute o ETL.
      </div>
    );

  const step = Math.max(1, Math.floor(data.series.length / 60));
  const series = data.series.filter((_, i) => i % step === 0);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={series} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
        <XAxis dataKey="data" tick={tick} tickFormatter={d => { const p = d.split('-'); return p.length >= 2 ? `${p[1]}/${p[0]}` : d; }} />
        <YAxis yAxisId="saldo"  tick={tick} width={56} tickFormatter={fmtMi}
               label={{ value: "R$ mi", angle: -90, position: "insideLeft", style: { fontSize: 9, fill: "#94a3b8" } }} />
        <YAxis yAxisId="inad"   tick={tick} width={36} orientation="right" domain={[0, "auto"]}
               label={{ value: "%", angle: 90, position: "insideRight", style: { fontSize: 9, fill: "#94a3b8" } }} />
        <Tooltip
          contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }}
          labelFormatter={d => { const p = d.split('-'); return `Ref: ${p.length >= 3 ? `${p[2]}/${p[1]}/${p[0]}` : (p.length === 2 ? `${p[1]}/${p[0]}` : d)}`; }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar  yAxisId="saldo" dataKey="saldo_pf"         fill="#bfdbfe" name="Saldo PF (mi)" barSize={6} />
        <Bar  yAxisId="saldo" dataKey="saldo_pj"         fill="#fed7aa" name="Saldo PJ (mi)" barSize={6} />
        <Line yAxisId="inad"  dataKey="inadimplencia_pf" stroke="#ef4444" strokeWidth={2} dot={false} name="Inad. PF (%)" />
        <Line yAxisId="inad"  dataKey="inadimplencia_pj" stroke="#f97316" strokeWidth={2} dot={false} name="Inad. PJ (%)" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

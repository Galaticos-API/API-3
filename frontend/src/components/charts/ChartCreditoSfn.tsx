/** GRF-01 — Saldo de Crédito SFN (Linha) */
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { CreditoSfnData } from "../../services/api";

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(v);

const ttip = {
  contentStyle: { backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 8 },
  formatter: (value: number) => [`R$ ${fmt(value)}`, ""],
};

interface Props { data: CreditoSfnData }

export function ChartCreditoSfn({ data }: Props) {
  if (!data.series.length)
    return <EmptyState msg="Sem dados. Execute o ETL para popular as séries de crédito." />;

  // Reduz para mostrar no máximo 60 pontos no eixo X (evita poluição visual)
  const step = Math.max(1, Math.floor(data.series.length / 60));
  const series = data.series.filter((_, i) => i % step === 0);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={series} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
        <XAxis dataKey="data" tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={d => { const p = d.split('-'); return p.length >= 2 ? `${p[1]}/${p[0]}` : d; }} />
        <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={fmt} width={58} />
        <Tooltip {...ttip} labelFormatter={d => { const p = d.split('-'); return `Ref: ${p.length >= 3 ? `${p[2]}/${p[1]}/${p[0]}` : (p.length === 2 ? `${p[1]}/${p[0]}` : d)}`; }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="saldo_pf"    stroke="#3b82f6" strokeWidth={2} dot={false} name="PF (R$ mi)" />
        <Line type="monotone" dataKey="saldo_pj"    stroke="#f97316" strokeWidth={2} dot={false} name="PJ (R$ mi)" />
        <Line type="monotone" dataKey="saldo_total" stroke="#10b981" strokeWidth={2} dot={false} name="Total (R$ mi)" />
      </LineChart>
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

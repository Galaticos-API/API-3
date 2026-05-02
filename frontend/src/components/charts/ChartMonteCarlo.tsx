/** GRF-09 — Simulação Monte Carlo (Histograma + linha KDE) */
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import type { MonteCarloData } from "../../services/api";

const fmtR = (v: number) =>
  new Intl.NumberFormat("pt-BR", { notation: "compact", style: "currency", currency: "BRL", maximumFractionDigits: 1 }).format(v);

interface Props { data: MonteCarloData }

export function ChartMonteCarlo({ data }: Props) {
  if (!data.encontrado) {
    return (
      <div className="flex flex-col items-center justify-center h-52 gap-2 text-center px-4">
        <span className="text-2xl">🎲</span>
        <p className="text-sm text-muted-foreground">{data.mensagem}</p>
      </div>
    );
  }

  const hist = data.histograma ?? [];
  if (!hist.length)
    return <EmptyState msg="Histograma vazio." />;

  // Ponto central de cada bin para o eixo X
  const chartData = hist.map(b => ({
    x: (b.bin_start + b.bin_end) / 2,
    contagem: b.contagem,
  }));

  const sim = data.simulacao!;

  return (
    <div className="space-y-3">
      {/* KPIs da simulação */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { label: "Estado",       value: sim.nome_uf },
          { label: "Inad. proj.",  value: `${sim.inadimplencia_projetada?.toFixed(2)}%` },
          { label: "VaR 95%",      value: fmtR(data.var_95_calculado ?? sim.var_95), cls: "text-amber-600" },
          { label: "VaR 99%",      value: fmtR(data.var_99_calculado ?? sim.var_99), cls: "text-red-600" },
        ].map(k => (
          <div key={k.label} className="bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
            <p className="text-[10px] text-muted-foreground">{k.label}</p>
            <p className={`text-sm font-bold ${k.cls ?? "text-foreground"}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Histograma */}
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={chartData} margin={{ top: 4, right: 8, bottom: 16, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
          <XAxis dataKey="x" tick={{ fill: "#64748b", fontSize: 9 }}
                 tickFormatter={v => fmtR(v)}
                 label={{ value: "Perda Projetada (R$)", position: "insideBottom", offset: -10, style: { fontSize: 10, fill: "#94a3b8" } }} />
          <YAxis tick={{ fill: "#64748b", fontSize: 9 }} width={40} />
          <Tooltip
            contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }}
            formatter={(v: number, name: string) => [
              name === "contagem" ? `${v} simulações` : fmtR(v),
              name === "contagem" ? "Frequência" : name
            ]}
            labelFormatter={v => `Perda: ${fmtR(v)}`}
          />
          <Bar dataKey="contagem" fill="#6366f1" fillOpacity={0.7} radius={[2, 2, 0, 0]} name="contagem" />
          {/* VaR 95% */}
          {data.var_95_calculado && (
            <ReferenceLine x={data.var_95_calculado} stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 2"
              label={{ value: "VaR 95%", position: "top", fontSize: 9, fill: "#f59e0b" }} />
          )}
          {/* VaR 99% */}
          {data.var_99_calculado && (
            <ReferenceLine x={data.var_99_calculado} stroke="#ef4444" strokeWidth={2} strokeDasharray="4 2"
              label={{ value: "VaR 99%", position: "top", fontSize: 9, fill: "#ef4444" }} />
          )}
          {/* Média */}
          {data.media_perdas && (
            <ReferenceLine x={data.media_perdas} stroke="#10b981" strokeWidth={2}
              label={{ value: "Média", position: "insideTopLeft", fontSize: 9, fill: "#10b981" }} />
          )}
        </ComposedChart>
      </ResponsiveContainer>
      <p className="text-[10px] text-muted-foreground text-center">
        Simulação #{sim.id} · {sim.criado_em?.slice(0, 10)} · Score IOI: {sim.ioi_score?.toFixed(2)}
      </p>
    </div>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">{msg}</div>
  );
}

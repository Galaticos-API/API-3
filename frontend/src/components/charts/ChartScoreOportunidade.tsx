/** GRF-08 — Score IOI: Ranking de Oportunidade por Estado (Barras horizontais) */
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { ScoreOportunidadeData } from "../../services/api";

function scoreColor(s: number): string {
  if (s >= 8) return "#10b981";
  if (s >= 6) return "#3b82f6";
  if (s >= 4) return "#f59e0b";
  return "#ef4444";
}

interface Props { data: ScoreOportunidadeData }

export function ChartScoreOportunidade({ data }: Props) {
  if (!data.ranking.length)
    return (
      <div className="flex items-center justify-center h-52 text-sm text-muted-foreground text-center px-4">
        📭 Sem dados de Score IOI. Execute o ETL e depois o recálculo de ranking.
      </div>
    );

  // Top 27 estados
  const ranking = data.ranking.slice(0, 27).map(r => ({
    ...r,
    label: r.sigla_uf,
  }));

  return (
    <div>
      {data.fonte === "dinamico" && (
        <p className="text-[10px] text-amber-600 mb-1 text-center">
          ⚠ Score calculado dinamicamente (tabela de ranking ainda não populada via recálculo batch)
        </p>
      )}
      <ResponsiveContainer width="100%" height={Math.max(300, ranking.length * 22)}>
        <BarChart
          layout="vertical"
          data={ranking}
          margin={{ top: 4, right: 40, bottom: 0, left: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" horizontal={false} />
          <XAxis type="number" domain={[0, 10]} tick={{ fill: "#64748b", fontSize: 10 }}
                 tickFormatter={v => `${v}`} label={{ value: "Score IOI (0–10)", position: "insideBottom", offset: -8, style: { fontSize: 10, fill: "#94a3b8" } }} />
          <YAxis type="category" dataKey="label" tick={{ fill: "#334155", fontSize: 10 }} width={28} />
          <Tooltip
            contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }}
            formatter={(v: number, _: string, props: any) => [
              `${v.toFixed(2)} / 10`,
              props.payload.nome,
            ]}
          />
          <Bar dataKey="score_oportunidade" radius={[0, 4, 4, 0]} barSize={14} label={{ position: "right", fontSize: 9, fill: "#334155", formatter: (v: number) => v.toFixed(1) }}>
            {ranking.map(r => (
              <Cell key={r.sigla_uf} fill={scoreColor(r.score_oportunidade)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

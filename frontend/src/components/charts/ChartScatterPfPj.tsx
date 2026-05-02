/** GRF-06 — Scatter PF vs PJ por Estado */
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { ScatterPfPjData } from "../../services/api";

const CORES_REGIAO: Record<string, string> = {
  "Norte":        "#22c55e",
  "Nordeste":     "#3b82f6",
  "Centro-Oeste": "#a855f7",
  "Sudeste":      "#f97316",
  "Sul":          "#ef4444",
};

const tick = { fill: "#64748b", fontSize: 10 };

interface Props { data: ScatterPfPjData }

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill={CORES_REGIAO[payload.regiao] ?? "#3b82f6"} fillOpacity={0.8} stroke="#fff" strokeWidth={1.5} />
      <text x={cx + 8} y={cy + 4} fontSize={8} fill="#334155">{payload.uf}</text>
    </g>
  );
};

export function ChartScatterPfPj({ data }: Props) {
  if (!data.pontos.length)
    return <EmptyState msg="Sem dados de dispersão PF vs PJ. Execute o ETL." />;

  return (
    <div>
      <ResponsiveContainer width="100%" height={260}>
        <ScatterChart margin={{ top: 8, right: 32, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
          <XAxis dataKey="inadimplencia_pf" tick={tick} name="Inad. PF"
                 label={{ value: "Inadimpl. PF (%)", position: "insideBottom", offset: -12, style: { fontSize: 10, fill: "#94a3b8" } }}
                 tickFormatter={v => `${v}%`} />
          <YAxis dataKey="inadimplencia_pj" tick={tick} name="Inad. PJ"
                 label={{ value: "Inadimpl. PJ (%)", angle: -90, position: "insideLeft", style: { fontSize: 10, fill: "#94a3b8" } }}
                 tickFormatter={v => `${v}%`} width={44} />
          <Tooltip
            contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }}
            content={({ payload }) => {
              if (!payload?.length) return null;
              const p = payload[0].payload;
              return (
                <div className="p-2 text-xs">
                  <p className="font-semibold">{p.uf} — {p.regiao}</p>
                  <p>PF: {p.inadimplencia_pf?.toFixed(2)}%</p>
                  <p>PJ: {p.inadimplencia_pj?.toFixed(2)}%</p>
                </div>
              );
            }}
          />
          <Scatter data={data.pontos} shape={<CustomDot />}>
            {data.pontos.map((p) => (
              <Cell key={p.uf} fill={CORES_REGIAO[p.regiao] ?? "#3b82f6"} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      {/* Legenda de regiões */}
      <div className="flex flex-wrap gap-3 justify-center mt-2">
        {Object.entries(CORES_REGIAO).map(([r, c]) => (
          <span key={r} className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
            {r}
          </span>
        ))}
      </div>
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

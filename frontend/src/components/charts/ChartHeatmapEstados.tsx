/**
 * GRF-05 — Heatmap Estadual: Matriz UF × Mês (últimos 24 meses).
 * Implementado com células coloridas (sem lib externa).
 */
import type { HeatmapEstadosData } from "../../services/api";

interface Props { data: HeatmapEstadosData }

function colorForValue(v: number | null, min: number, max: number): string {
  if (v === null || v === undefined) return "#f1f5f9";
  const t = max === min ? 0.5 : (v - min) / (max - min);
  // Gradiente: verde (baixa inad) → amarelo → vermelho (alta inad)
  const r = Math.round(255 * Math.min(1, t * 2));
  const g = Math.round(255 * Math.min(1, (1 - t) * 2));
  return `rgb(${r},${g},80)`;
}

export function ChartHeatmapEstados({ data }: Props) {
  if (!data.meses.length || !data.estados.length)
    return <EmptyState msg="Sem dados para o heatmap. Execute o ETL (dados dos últimos 24 meses)." />;

  // Encontra min/max global para escala de cor
  const allVals = data.estados.flatMap(e => e.valores).filter((v): v is number => v !== null);
  const min = Math.min(...allVals);
  const max = Math.max(...allVals);

  // Agrupa meses por label curto (MMM/AA)
  const labelMes = (m: string) => {
    const [y, mo] = m.split("-");
    return `${mo}/${y.slice(2)}`;
  };

  // Mostra apenas o rótulo em meses pares para evitar poluição
  const shouldShowLabel = (i: number) => i % 2 === 0;

  return (
    <div className="overflow-auto">
      <div style={{ minWidth: data.meses.length * 22 + 52 }}>
        {/* Header de meses */}
        <div className="flex" style={{ marginLeft: 48 }}>
          {data.meses.map((m, i) => (
            <div key={m}
              style={{ width: 22, fontSize: 8, color: "#64748b",
                       writingMode: "vertical-rl", transform: "rotate(180deg)",
                       height: 36, textAlign: "center", flexShrink: 0 }}>
              {shouldShowLabel(i) ? labelMes(m) : ""}
            </div>
          ))}
        </div>
        {/* Linhas por UF */}
        {data.estados.map(estado => (
          <div key={estado.uf} className="flex items-center" style={{ marginBottom: 1 }}>
            <span style={{ width: 46, fontSize: 9, color: "#334155", flexShrink: 0, textAlign: "right", paddingRight: 4 }}>
              {estado.uf}
            </span>
            {estado.valores.map((v, i) => (
              <div key={i}
                title={`${estado.uf} · ${data.meses[i]}: ${v !== null ? v.toFixed(2) + "%" : "sem dado"}`}
                style={{
                  width: 20, height: 14, flexShrink: 0, marginRight: 2, borderRadius: 2,
                  backgroundColor: colorForValue(v, min, max),
                  cursor: "default",
                }}
              />
            ))}
          </div>
        ))}
        {/* Legenda */}
        <div className="flex items-center gap-2 mt-3 ml-12" style={{ fontSize: 10, color: "#64748b" }}>
          <span>Baixa</span>
          <div style={{
            width: 80, height: 10, borderRadius: 4,
            background: "linear-gradient(to right, rgb(0,255,80), rgb(255,255,80), rgb(255,0,80))"
          }} />
          <span>Alta inadimplência</span>
        </div>
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

import { useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { regionsData } from "../data/mockData";

const GEO_URL = "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson";

interface BrazilMapProps {
  selectedState?: string;
  onStateClick?: (state: string) => void;
}

function getScoreColor(score: number) {
  if (score >= 85) return { fill: "#f97316", stroke: "#ea580c" };
  if (score >= 75) return { fill: "#3b82f6", stroke: "#2563eb" };
  if (score >= 65) return { fill: "#22c55e", stroke: "#16a34a" };
  if (score > 0) return { fill: "#334155", stroke: "#1e293b" };
  return { fill: "#1e293b", stroke: "#0f172a" };
}

const STATE_CENTROIDS: Record<string, [number, number]> = {
  AC: [-70.5, -9.0], AL: [-36.6, -9.6], AM: [-64.5, -4.0], AP: [-52.0, 1.4],
  BA: [-41.7, -12.5], CE: [-39.3, -5.1], DF: [-47.9, -15.8], ES: [-40.7, -19.6],
  GO: [-49.6, -16.0], MA: [-44.4, -5.4], MG: [-44.7, -18.5], MS: [-54.8, -20.5],
  MT: [-55.9, -12.6], PA: [-52.3, -3.8], PB: [-36.8, -7.1], PE: [-37.9, -8.4],
  PI: [-42.8, -7.7], PR: [-51.6, -24.7], RJ: [-43.2, -22.3], RN: [-36.5, -5.8],
  RO: [-62.9, -10.9], RR: [-61.4, 2.0], RS: [-53.1, -30.0], SC: [-50.5, -27.3],
  SE: [-37.4, -10.6], SP: [-48.5, -22.2], TO: [-48.3, -10.2],
};

const nameToUF: Record<string, string> = {
  "Acre": "AC", "Alagoas": "AL", "Amapá": "AP", "Amazonas": "AM", "Bahia": "BA",
  "Ceará": "CE", "Distrito Federal": "DF", "Espírito Santo": "ES", "Goiás": "GO",
  "Maranhão": "MA", "Mato Grosso": "MT", "Mato Grosso do Sul": "MS", "Minas Gerais": "MG",
  "Pará": "PA", "Paraíba": "PB", "Paraná": "PR", "Pernambuco": "PE", "Piauí": "PI",
  "Rio de Janeiro": "RJ", "Rio Grande do Norte": "RN", "Rio Grande do Sul": "RS",
  "Rondônia": "RO", "Roraima": "RR", "Santa Catarina": "SC", "São Paulo": "SP",
  "Sergipe": "SE", "Tocantins": "TO",
};

export function BrazilMap({ selectedState, onStateClick }: BrazilMapProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const stateScores = regionsData.reduce((acc, r) => {
    if (!acc[r.state] || acc[r.state] < r.score) acc[r.state] = r.score;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="w-full">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: [-54, -15], scale: 900 }}
        style={{ width: "100%", height: "420px" }}
      >
        <defs>
          <filter id="shadow">
            <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.6)" />
          </filter>
          <filter id="glow">
            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="rgba(255,255,255,0.4)" />
          </filter>
        </defs>

        <Geographies geography={GEO_URL}>
          {({ geographies }: { geographies: any[] }) =>
            geographies.map((geo: any) => {
              const uf = nameToUF[geo.properties.name] || "";
              const score = stateScores[uf] || 0;
              const isSelected = selectedState === uf;
              const isHovered = hovered === uf;
              const { fill, stroke } = getScoreColor(score);

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => onStateClick?.(isSelected ? "" : uf)}
                  onMouseEnter={() => setHovered(uf)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    default: {
                      fill: isSelected || isHovered ? stroke : fill,
                      stroke: isSelected ? "#ffffff" : "rgba(255,255,255,0.15)",
                      strokeWidth: isSelected ? 1.5 : 0.5,
                      outline: "none",
                      filter: isSelected ? "url(#glow)" : "url(#shadow)",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    },
                    hover: {
                      fill: stroke,
                      stroke: "rgba(255,255,255,0.5)",
                      strokeWidth: 1,
                      outline: "none",
                      filter: "url(#glow)",
                      cursor: "pointer",
                    },
                    pressed: { fill: stroke, outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>

        {/* Siglas */}
        {Object.entries(STATE_CENTROIDS).map(([uf, coords]) => (
          <Marker key={uf} coordinates={coords}>
            <text
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                fontFamily: "inherit",
                fontSize: 9,
                fontWeight: 700,
                fill: "#ffffff",
                pointerEvents: "none",
                opacity: 0.9,
              }}
            >
              {uf}
            </text>
          </Marker>
        ))}
      </ComposableMap>

      {/* Legenda */}
      <div className="flex items-center justify-center gap-4 flex-wrap -mt-2">
        {[
          { color: "#f97316", label: "Top (≥85)" },
          { color: "#3b82f6", label: "Bom (75–84)" },
          { color: "#22c55e", label: "Médio (65–74)" },
          { color: "#334155", label: "Regular (<65)" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-slate-400">
            <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
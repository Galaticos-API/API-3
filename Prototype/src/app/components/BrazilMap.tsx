import { useState } from "react";
import { stateCoordinates, regionsData } from "../data/mockData";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface BrazilMapProps {
  selectedState?: string;
  onStateClick?: (state: string) => void;
}

export function BrazilMap({ selectedState, onStateClick }: BrazilMapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  // Agrupa dados por estado
  const stateScores = regionsData.reduce((acc, region) => {
    if (!acc[region.state] || acc[region.state] < region.score) {
      acc[region.state] = region.score;
    }
    return acc;
  }, {} as Record<string, number>);

  const getColor = (state: string) => {
    const score = stateScores[state] || 0;
    if (score >= 85) return "#10b981"; // green
    if (score >= 75) return "#3b82f6"; // blue
    if (score >= 65) return "#f59e0b"; // orange
    if (score > 0) return "#ef4444"; // red
    return "#d1d5db"; // gray
  };

  return (
    <TooltipProvider>
      <svg
        viewBox="0 0 800 900"
        className="w-full h-full"
        style={{ maxHeight: "600px" }}
      >
        {/* Renderiza os estados como círculos */}
        {Object.entries(stateCoordinates).map(([state, coords]) => {
          const score = stateScores[state];
          const isSelected = selectedState === state;
          const isHovered = hoveredState === state;
          const hasData = score > 0;

          return (
            <Tooltip key={state}>
              <TooltipTrigger asChild>
                <g
                  onClick={() => hasData && onStateClick?.(state)}
                  onMouseEnter={() => setHoveredState(state)}
                  onMouseLeave={() => setHoveredState(null)}
                  style={{ cursor: hasData ? "pointer" : "default" }}
                >
                  <circle
                    cx={coords.x}
                    cy={coords.y}
                    r={isSelected ? 24 : isHovered ? 20 : 16}
                    fill={getColor(state)}
                    opacity={isSelected ? 1 : isHovered ? 0.9 : 0.7}
                    stroke={isSelected ? "#1e40af" : "#fff"}
                    strokeWidth={isSelected ? 3 : 2}
                    className="transition-all duration-200"
                  />
                  <text
                    x={coords.x}
                    y={coords.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-white font-bold text-xs pointer-events-none"
                    style={{ fontSize: isSelected ? "14px" : "11px" }}
                  >
                    {state}
                  </text>
                </g>
              </TooltipTrigger>
              {hasData && (
                <TooltipContent>
                  <div className="text-sm">
                    <p className="font-semibold">{coords.name}</p>
                    <p className="text-gray-600">Score: {score.toFixed(1)}</p>
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </svg>

      {/* Legenda */}
      <div className="mt-4 flex items-center justify-center gap-4 flex-wrap text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#10b981]"></div>
          <span className="text-gray-700">Excelente (≥85)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#3b82f6]"></div>
          <span className="text-gray-700">Bom (75-84)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#f59e0b]"></div>
          <span className="text-gray-700">Médio (65-74)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#ef4444]"></div>
          <span className="text-gray-700">Baixo (&lt;65)</span>
        </div>
      </div>
    </TooltipProvider>
  );
}

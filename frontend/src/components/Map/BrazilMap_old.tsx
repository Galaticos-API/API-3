import React, { useMemo } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleQuantile } from 'd3-scale';

const geoUrl = "https://raw.githubusercontent.com/luizbills/brasil-topojson/master/topojson/brm.json";


interface MapData {
  estado: string;
  valor: number;
}

interface BrazilMapProps {
  data: MapData[];
  selectedState?: string;
  onStateClick?: (uf: string) => void;
}

export const BrazilMap: React.FC<BrazilMapProps> = ({ data, selectedState, onStateClick }) => {
  const colorScale = useMemo(() => {
    const valores = data.map(d => d.valor);
    return scaleQuantile<string>()
      .domain(valores.length > 0 ? valores : [0, 100])
      .range(["#e5f5e0", "#a1d99b", "#31a354", "#006d2c"]);
  }, [data]);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-md p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
        Mapa de Oportunidades de Crédito
      </h2>
      <ComposableMap projection="geoMercator" projectionConfig={{ scale: 800, center: [-54, -15] }} className="w-full h-auto">
        <Geographies geography={geoUrl}>
          {({ geographies }) => geographies.map((geo) => {
            const stateCode = geo.properties.id;
            const stateData = data.find((s) => s.estado === stateCode);
            return (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                onClick={() => onStateClick && onStateClick(stateCode)}
                fill={selectedState === stateCode ? "#F97316" : (stateData ? colorScale(stateData.valor) : "#EEE")}
                stroke={selectedState === stateCode ? "#FFF" : "#FFF"}
                strokeWidth={selectedState === stateCode ? 1.5 : 0.5}
                style={{
                  default: { outline: "none" },
                  hover: { fill: "#F59E0B", outline: "none", cursor: "pointer" },
                  pressed: { outline: "none" },
                }}
              />
            );
          })}
        </Geographies>
      </ComposableMap>
    </div>
  );
};
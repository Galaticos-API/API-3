import { useEffect, useState } from 'react';
import { BrazilMap } from '../components/Map/BrazilMap';

export const Dashboard = () => {
  const [mapData, setMapData] = useState([]);

  useEffect(() => {
    // chamada pro nestJS
    fetch('http://localhost:3000/api/opportunities/heatmap')
      .then(res => res.json())
      .then(data => setMapData(data))
      .catch(err => console.error("Erro ao buscar dados:", err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Dashboard de crédito DM</h1>
      {mapData.length > 0 ? <BrazilMap data={mapData} /> : <p className="text-center">Carregando mapa...</p>}
    </div>
  );
};
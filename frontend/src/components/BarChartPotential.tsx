import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function BarChartPotential() {
  const data = {
    labels: ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'],
    datasets: [{
      label: 'Potencial (em Bilhões R$)',
      data: [0.8, 1.5, 1.2, 2.8, 0.6], // Dados fictícios
      backgroundColor: '#6366f1', // Roxo combinando com o Dashboard
      borderRadius: 8,
    }]
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <Bar data={data} options={{ responsive: true, plugins: { legend: { display: false } } }} />
    </div>
  );
}
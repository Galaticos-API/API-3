import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export function DoughnutPublic() {
  const data = {
    labels: ['Acessível', 'Em análise', 'Restrito'],
    datasets: [{
      data: [55, 30, 15],
      backgroundColor: ['#22d3ee', '#818cf8', '#f87171'],
      hoverOffset: 4,
      borderWidth: 0,
    }]
  };

  const options = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    cutout: '70%',
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
        {/* Cabeçalho com Título e Legenda */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-gray-500 text-sm font-medium">Perfil da População</h3>
          
          <div className="flex gap-4 flex-wrap justify-end">
            {data.labels.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-sm shadow-sm"
                  style={{ backgroundColor: data.datasets[0].backgroundColor[i] }}
                />
                <span className="text-xs font-semibold text-gray-700 whitespace-nowrap"> 
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div> {/* <-- Esta div fecha o cabeçalho */}
        
        {/* Container do Gráfico */}
        <div className="relative flex-1 min-h-0">
          <Doughnut data={data} options={options} />
        </div>
      </div>
    </div>
  );
}
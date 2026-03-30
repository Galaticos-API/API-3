import { Controller, Get, Post, Body, Query } from '@nestjs/common';

@Controller('api/opportunities')
export class BcbDataController {
  
  // ========================================================
  // 1. Rota do mapa consumida pelo BrazilMap.tsx
  // ========================================================

  @Get('heatmap')
  getHeatmapData(
    @Query('estado') estado?: string,
    @Query('anoInicial') anoInicial?: string,
  ) {
    return [
      { estado: 'SP', valor: 85 },
      { estado: 'MG', valor: 60 },
      { estado: 'RJ', valor: 45 },
      { estado: 'BA', valor: 70 },
      { estado: 'PR', valor: 55 },
      { estado: 'RS', valor: 40 },
      { estado: 'PE', valor: 65 },
      { estado: 'CE', valor: 75 },
      { estado: 'AM', valor: 30 },
    ];
  }

  // ========================================================
  // 2. Rota dos KPIS -- cards superiores no dashboard.tsx
  // ========================================================

  @Get('kpis')
  getKpis(@Query('estado') estado?: string) {
    return {
      volumeConcessoes: "R$ 4.2 Bi",
      inadimplenciaMedia: "4.8%",
      crescimentoAno: "+15.3%",
      riscoGeral: estado === 'SP' ? "Baixo" : "Médio"
    };
  }

  // ========================================================
  // 3. Rota do gráfico de evolução -- LineChart do dashboard
  // ========================================================

  @Get('evolution')
  getEvolutionChart(@Query('estado') estado?: string) {
    return [
      { mes: 'Jan', volume: 1500, inadimplencia: 4.1 },
      { mes: 'Fev', volume: 1650, inadimplencia: 4.0 },
      { mes: 'Mar', volume: 1800, inadimplencia: 4.3 },
      { mes: 'Abr', volume: 1750, inadimplencia: 4.5 },
      { mes: 'Mai', volume: 1900, inadimplencia: 4.2 },
      { mes: 'Jun', volume: 2100, inadimplencia: 4.8 },
    ];
  }

  // ========================================================
  // 4. Rota de ranking regional tabela de oportunidades
  // ========================================================

  @Get('ranking')
  getRanking() {
    return [
      { id: 1, estado: 'SP', score: 98, populacaoDesbancarizada: "2.1M", status: 'Excelente' },
      { id: 2, estado: 'CE', score: 85, populacaoDesbancarizada: "1.5M", status: 'Muito Boa' },
      { id: 3, estado: 'PR', score: 79, populacaoDesbancarizada: "900K", status: 'Boa' },
      { id: 4, estado: 'MG', score: 72, populacaoDesbancarizada: "1.2M", status: 'Boa' },
    ];
  }

  // ========================================================
  // 5. Rota do simulador -- MonteCarloSimulation.tsx
  // ========================================================

  @Post('simulate')
  simulateMonteCarlo(@Body() params: { estado: string; taxaSelicEst: number; desempregoEst: number }) {
    // na prox sprint essa bomba vai chamar o microsserviço do python, por enquanto retorna os cenários mockados pro figma
    return {
      cenarioOtimista: { risco: "3.2%", retornoEsperado: "R$ 1.5 Bi" },
      cenarioBase: { risco: "4.5%", retornoEsperado: "R$ 1.1 Bi" },
      cenarioPessimista: { risco: "6.8%", retornoEsperado: "R$ 700 Mi" }
    };
  }
}
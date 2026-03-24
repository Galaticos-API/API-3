import { Controller, Get, Query } from '@nestjs/common';

@Controller('api/opportunities')
export class BcbDataController {
  // =================================
  // ENDPOINT GET /api/opportunities/heatmap
  // =================================
  @Get('heatmap')
  getHeatmapData(
    @Query('estado') estado?: string,
    @Query('anoInicial') anoInicial?: string,
  ) {
    // retorna os dados no formato exato que o BrazilMap (do front -- TSK 14) espera
    // dps substitui isso pela consulta pronta via TypeORM/Prisma
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
      { estado: 'GO', valor: 50 },
    ];
  }
}

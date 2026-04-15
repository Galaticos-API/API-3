import { Injectable } from '@nestjs/common';

// =======================================
// INTERFACES / TIPAGENS
// =======================================
export interface SimulationParams {
  iterations: number;
  investmentValue: number;
  avgReturn: number;
  volatility: number;
  region: string;
}

// =======================================
// SERVICES
// =======================================
@Injectable()
export class MonteCarloService {
  // =======================================
  // MÉTODOS PRIVADOS
  // =======================================
  private randomNormal(mean: number, stdDev: number): number {
    let u1 = Math.random();
    const u2 = Math.random();

    u1 = u1 === 0 ? 1e-9 : u1;

    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * stdDev + mean;
  }

  // =======================================
  // MÉTODOS PÚBLICOS
  // =======================================
  public simulate(params: SimulationParams) {
    const { iterations, investmentValue, avgReturn, volatility } = params;
    const results = [];
    let successCount = 0;

    for (let i = 0; i < iterations; i++) {
      const simulatedRoi = this.randomNormal(avgReturn, volatility);
      const finalValue = investmentValue * (1 + simulatedRoi / 100);

      const baseDefault = 5.0;
      const simulatedDefault = Math.max(
        0.5,
        this.randomNormal(baseDefault, 1.5) - (simulatedRoi - avgReturn) * 0.2,
      );

      successCount += simulatedRoi > 0 ? 1 : 0;

      results.push({
        scenario: i + 1,
        retorno: finalValue,
        inadimplencia: simulatedDefault,
        roi: simulatedRoi,
      });
    }

    results.sort((a, b) => a.roi - b.roi);

    const summary = {
      cenarioPessimista: results[Math.floor(iterations * 0.1)],
      cenarioBase: results[Math.floor(iterations * 0.5)],
      cenarioOtimista: results[Math.floor(iterations * 0.9)],
      probabilidadeSucesso: (successCount / iterations) * 100,
    };

    const minRoi = results[0].roi;
    const maxRoi = results[results.length - 1].roi;
    const binSize = (maxRoi - minRoi) / 20;
    const distribution = [];

    for (let i = 0; i < 20; i++) {
      const binMin = minRoi + i * binSize;
      const binMax = binMin + binSize;
      const count = results.filter(
        (r) => r.roi >= binMin && r.roi < binMax,
      ).length;

      distribution.push({
        range: `${binMin.toFixed(1)}% a ${binMax.toFixed(1)}%`,
        frequency: count,
      });
    }

    return {
      summary,
      distribution,
      timeSeries: results.slice(0, 100).sort((a, b) => a.scenario - b.scenario),
    };
  }
}

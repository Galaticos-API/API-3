import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Slider } from "../components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Activity, Play, RefreshCw, TrendingUp, AlertTriangle } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";

interface SimulationResult {
  scenario: number;
  retorno: number;
  inadimplencia: number;
  roi: number;
}

interface DistributionData {
  range: string;
  frequency: number;
}

export function MonteCarloSimulation() {
  const [iterations, setIterations] = useState(1000);
  const [investmentValue, setInvestmentValue] = useState(1000000);
  const [avgReturn, setAvgReturn] = useState(12);
  const [volatility, setVolatility] = useState(3.5);
  const [selectedRegion, setSelectedRegion] = useState("SP-1");
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasResults, setHasResults] = useState(false);
  const [results, setResults] = useState<SimulationResult[]>([]);

  // Função para executar simulação Monte Carlo
  const runSimulation = () => {
    setIsRunning(true);
    setProgress(0);
    setHasResults(false);

    // Simula processamento gradual
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    // Simula o cálculo dos resultados
    setTimeout(() => {
      const simulationResults: SimulationResult[] = [];

      for (let i = 0; i < iterations; i++) {
        // Gera números aleatórios usando distribuição normal aproximada
        const randomReturn = avgReturn + (Math.random() - 0.5) * 2 * volatility;
        const randomInadimplencia = Math.max(0, 4 + (Math.random() - 0.5) * 2 * 1.5);
        const retorno = investmentValue * (1 + randomReturn / 100);
        const roi = ((retorno - investmentValue) / investmentValue) * 100;

        simulationResults.push({
          scenario: i + 1,
          retorno: retorno,
          inadimplencia: randomInadimplencia,
          roi: roi,
        });
      }

      setResults(simulationResults);
      setHasResults(true);
      setIsRunning(false);
      clearInterval(interval);
    }, 1200);
  };

  // Calcula estatísticas
  const statistics = useMemo(() => {
    if (results.length === 0) return null;

    const roiValues = results.map((r) => r.roi);
    const retornoValues = results.map((r) => r.retorno);
    const inadimplenciaValues = results.map((r) => r.inadimplencia);

    const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const std = (arr: number[]) => {
      const avg = mean(arr);
      return Math.sqrt(arr.map((x) => Math.pow(x - avg, 2)).reduce((a, b) => a + b) / arr.length);
    };
    const percentile = (arr: number[], p: number) => {
      const sorted = [...arr].sort((a, b) => a - b);
      const index = Math.ceil((p / 100) * sorted.length) - 1;
      return sorted[index];
    };

    return {
      roiMedio: mean(roiValues),
      roiStd: std(roiValues),
      roiMin: Math.min(...roiValues),
      roiMax: Math.max(...roiValues),
      roiP5: percentile(roiValues, 5),
      roiP95: percentile(roiValues, 95),
      retornoMedio: mean(retornoValues),
      inadimplenciaMedia: mean(inadimplenciaValues),
      probabilidadeLucro: (roiValues.filter((r) => r > 0).length / roiValues.length) * 100,
    };
  }, [results]);

  // Prepara dados para distribuição
  const distributionData: DistributionData[] = useMemo(() => {
    if (results.length === 0) return [];

    const roiValues = results.map((r) => r.roi);
    const min = Math.floor(Math.min(...roiValues));
    const max = Math.ceil(Math.max(...roiValues));
    const bucketSize = (max - min) / 20;

    const buckets = Array.from({ length: 20 }, (_, i) => ({
      range: `${(min + i * bucketSize).toFixed(1)}`,
      frequency: 0,
    }));

    roiValues.forEach((roi) => {
      const bucketIndex = Math.min(Math.floor((roi - min) / bucketSize), 19);
      buckets[bucketIndex].frequency++;
    });

    return buckets;
  }, [results]);

  // Dados de exemplo para evolução temporal
  const timeSeriesData = useMemo(() => {
    if (results.length === 0) return [];
    return results.slice(0, 100).map((r, i) => ({
      cenario: i + 1,
      roi: r.roi,
    }));
  }, [results]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Simulação Monte Carlo</h2>
        <p className="text-gray-500 mt-1">Análise de cenários de risco para operações de crédito</p>
      </div>

      {/* Configurações da Simulação */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Parâmetros da Simulação</CardTitle>
            <CardDescription>Configure os parâmetros para análise de cenários</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="investment">Valor do Investimento (R$)</Label>
                <Input
                  id="investment"
                  type="number"
                  value={investmentValue}
                  onChange={(e) => setInvestmentValue(Number(e.target.value))}
                  step={100000}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="iterations">Número de Iterações</Label>
                <Select value={iterations.toString()} onValueChange={(v) => setIterations(Number(v))}>
                  <SelectTrigger id="iterations">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="500">500 iterações</SelectItem>
                    <SelectItem value="1000">1.000 iterações</SelectItem>
                    <SelectItem value="5000">5.000 iterações</SelectItem>
                    <SelectItem value="10000">10.000 iterações</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Região para Análise</Label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger id="region">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SP-1">São Paulo - Zona Leste</SelectItem>
                  <SelectItem value="RJ-1">Rio de Janeiro - Zona Norte</SelectItem>
                  <SelectItem value="MG-1">Belo Horizonte - RM</SelectItem>
                  <SelectItem value="BA-1">Salvador - Subúrbio</SelectItem>
                  <SelectItem value="PE-1">Recife - RM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Retorno Esperado (%)</Label>
                <span className="text-sm font-medium text-blue-600">{avgReturn}%</span>
              </div>
              <Slider value={[avgReturn]} onValueChange={(v) => setAvgReturn(v[0])} min={5} max={25} step={0.5} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Volatilidade (%)</Label>
                <span className="text-sm font-medium text-orange-600">{volatility}%</span>
              </div>
              <Slider value={[volatility]} onValueChange={(v) => setVolatility(v[0])} min={1} max={10} step={0.5} />
            </div>

            <Button onClick={runSimulation} disabled={isRunning} className="w-full" size="lg">
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Simulando...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Executar Simulação
                </>
              )}
            </Button>

            {isRunning && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progresso</span>
                  <span className="font-medium text-blue-600">{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações</CardTitle>
            <CardDescription>Sobre a Simulação Monte Carlo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Análise Probabilística</p>
                <p className="text-xs text-gray-600 mt-1">
                  A simulação gera múltiplos cenários aleatórios para estimar probabilidades de retorno.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Gestão de Risco</p>
                <p className="text-xs text-gray-600 mt-1">
                  Identifica distribuição de resultados possíveis e probabilidade de sucesso.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Cenários Adversos</p>
                <p className="text-xs text-gray-600 mt-1">
                  Avalia impacto de volatilidade e inadimplência em resultados financeiros.
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800">
                <strong>Dica:</strong> Aumente o número de iterações para obter resultados mais precisos e confiáveis.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resultados */}
      {hasResults && statistics && (
        <>
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">ROI Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{statistics.roiMedio.toFixed(2)}%</div>
                <p className="text-xs text-gray-500 mt-1">± {statistics.roiStd.toFixed(2)}% (desvio padrão)</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Retorno Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(statistics.retornoMedio)}</div>
                <p className="text-xs text-gray-500 mt-1">Valor esperado do portfólio</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Prob. de Lucro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{statistics.probabilidadeLucro.toFixed(1)}%</div>
                <p className="text-xs text-gray-500 mt-1">Cenários com ROI positivo</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Inadimplência Média</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{statistics.inadimplenciaMedia.toFixed(2)}%</div>
                <p className="text-xs text-gray-500 mt-1">Taxa esperada nos cenários</p>
              </CardContent>
            </Card>
          </div>

          {/* Intervalos de Confiança */}
          <Card>
            <CardHeader>
              <CardTitle>Intervalos de Confiança</CardTitle>
              <CardDescription>Faixa de valores esperados para ROI</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Intervalo de 90% (P5 - P95)</span>
                    <Badge variant="outline">90% dos cenários</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-8 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-lg relative">
                      <div
                        className="absolute top-0 h-full w-1 bg-red-600"
                        style={{ left: `${((statistics.roiP5 - statistics.roiMin) / (statistics.roiMax - statistics.roiMin)) * 100}%` }}
                      />
                      <div
                        className="absolute top-0 h-full w-1 bg-blue-600"
                        style={{ left: `${((statistics.roiMedio - statistics.roiMin) / (statistics.roiMax - statistics.roiMin)) * 100}%` }}
                      />
                      <div
                        className="absolute top-0 h-full w-1 bg-green-600"
                        style={{ left: `${((statistics.roiP95 - statistics.roiMin) / (statistics.roiMax - statistics.roiMin)) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className="text-red-600 font-medium">P5: {statistics.roiP5.toFixed(2)}%</span>
                    <span className="text-blue-600 font-medium">Média: {statistics.roiMedio.toFixed(2)}%</span>
                    <span className="text-green-600 font-medium">P95: {statistics.roiP95.toFixed(2)}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Melhor Cenário</p>
                    <p className="text-lg font-bold text-green-600">{statistics.roiMax.toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Cenário Mediano</p>
                    <p className="text-lg font-bold text-blue-600">{statistics.roiMedio.toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Pior Cenário</p>
                    <p className="text-lg font-bold text-red-600">{statistics.roiMin.toFixed(2)}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de ROI</CardTitle>
                <CardDescription>Frequência de resultados (histograma)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={distributionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="frequency" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Primeiros 100 Cenários</CardTitle>
                <CardDescription>Evolução do ROI por cenário simulado</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={timeSeriesData}>
                    <defs>
                      <linearGradient id="colorRoi" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="cenario" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="roi" stroke="#10b981" fillOpacity={1} fill="url(#colorRoi)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

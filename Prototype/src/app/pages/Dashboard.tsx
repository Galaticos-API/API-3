import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { BrazilMap } from "../components/BrazilMap";
import { regionsData, timeSeriesData, kpiData } from "../data/mockData";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, Users, DollarSign, Target, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Badge } from "../components/ui/badge";

export function Dashboard() {
  const [selectedState, setSelectedState] = useState<string | undefined>();
  const [timeFilter, setTimeFilter] = useState("12m");

  // Filtra dados baseado no período
  const filteredTimeData = useMemo(() => {
    const monthsMap: Record<string, number> = { "3m": 3, "6m": 6, "12m": 12 };
    const months = monthsMap[timeFilter];
    return timeSeriesData.slice(-months);
  }, [timeFilter]);

  // Filtra regiões por estado selecionado
  const filteredRegions = useMemo(() => {
    if (!selectedState) return regionsData;
    return regionsData.filter((r) => r.state === selectedState);
  }, [selectedState]);

  // Dados para gráfico de pizza - distribuição por faixa de score
  const scoreDistribution = useMemo(() => {
    const ranges = [
      { name: "Excelente (85+)", min: 85, count: 0, color: "#10b981" },
      { name: "Bom (75-84)", min: 75, count: 0, color: "#3b82f6" },
      { name: "Médio (65-74)", min: 65, count: 0, color: "#f59e0b" },
      { name: "Baixo (<65)", min: 0, count: 0, color: "#ef4444" },
    ];

    filteredRegions.forEach((region) => {
      if (region.score >= 85) ranges[0].count++;
      else if (region.score >= 75) ranges[1].count++;
      else if (region.score >= 65) ranges[2].count++;
      else ranges[3].count++;
    });

    return ranges.filter((r) => r.count > 0);
  }, [filteredRegions]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header com filtros */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard de Oportunidades</h2>
          <p className="text-gray-500 mt-1">Análise territorial de potencial de crédito inclusivo</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Período:</label>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3m">3 meses</SelectItem>
                <SelectItem value="6m">6 meses</SelectItem>
                <SelectItem value="12m">12 meses</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Estado:</label>
            <Select value={selectedState || "all"} onValueChange={(v) => setSelectedState(v === "all" ? undefined : v)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="SP">São Paulo</SelectItem>
                <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                <SelectItem value="MG">Minas Gerais</SelectItem>
                <SelectItem value="BA">Bahia</SelectItem>
                <SelectItem value="PE">Pernambuco</SelectItem>
                <SelectItem value="CE">Ceará</SelectItem>
                <SelectItem value="PR">Paraná</SelectItem>
                <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                <SelectItem value="PA">Pará</SelectItem>
                <SelectItem value="GO">Goiás</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Potencial Total</CardTitle>
            <DollarSign className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpiData.totalPotencial)}</div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3" />
              +{kpiData.crescimentoMensal}% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Regiões Mapeadas</CardTitle>
            <Target className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.regioesMapeadas}</div>
            <p className="text-xs text-gray-500 mt-1">Territórios analisados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ticket Médio</CardTitle>
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpiData.ticketMedioNacional)}</div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3" />
              +4.2% vs trimestre anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">População Alvo</CardTitle>
            <Users className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(filteredRegions.reduce((sum, r) => sum + r.population, 0))}</div>
            <p className="text-xs text-gray-500 mt-1">Habitantes nas regiões</p>
          </CardContent>
        </Card>
      </div>

      {/* Mapa e Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mapa do Brasil</CardTitle>
            <CardDescription>Score de oportunidade por estado</CardDescription>
          </CardHeader>
          <CardContent>
            <BrazilMap selectedState={selectedState} onStateClick={setSelectedState} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ranking Regional</CardTitle>
            <CardDescription>Top regiões por potencial de crédito</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {filteredRegions
                .sort((a, b) => b.score - a.score)
                .map((region, index) => (
                  <div key={region.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0
                          ? "bg-yellow-100 text-yellow-700"
                          : index === 1
                          ? "bg-gray-100 text-gray-700"
                          : index === 2
                          ? "bg-orange-100 text-orange-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 truncate">{region.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {region.state}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>Pop: {formatNumber(region.population)}</span>
                        <span>•</span>
                        <span>Banc: {region.bancarizacao}%</span>
                        <span>•</span>
                        <span>Inadimpl: {region.inadimplencia}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-blue-600">{region.score.toFixed(1)}</div>
                      <p className="text-xs text-gray-500">Score</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Séries Temporais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Evolução de Concessões</CardTitle>
            <CardDescription>Volume de operações ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={filteredTimeData}>
                <defs>
                  <linearGradient id="colorConcessoes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="concessoes" stroke="#3b82f6" fillOpacity={1} fill="url(#colorConcessoes)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Taxa de Inadimplência</CardTitle>
            <CardDescription>Evolução do índice de inadimplência (%)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 6]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="inadimplencia" stroke="#ef4444" strokeWidth={2} name="Inadimplência %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Adicionais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ticket Médio</CardTitle>
            <CardDescription>Valor médio das operações (R$)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="ticket_medio" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Score</CardTitle>
            <CardDescription>Classificação das regiões analisadas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={scoreDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, count }) => `${name}: ${count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {scoreDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Detalhes */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento Regional</CardTitle>
          <CardDescription>Indicadores completos por região</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Região</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">UF</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Score</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">População</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Bancarização</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Inadimplência</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Renda Média</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Potencial</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegions
                  .sort((a, b) => b.score - a.score)
                  .map((region) => (
                    <tr key={region.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{region.name}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{region.state}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-right">
                        <span className="font-semibold text-blue-600">{region.score.toFixed(1)}</span>
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-gray-700">{formatNumber(region.population)}</td>
                      <td className="py-3 px-4 text-sm text-right text-gray-700">{region.bancarizacao}%</td>
                      <td className="py-3 px-4 text-sm text-right">
                        <span className={region.inadimplencia < 4 ? "text-green-600" : "text-red-600"}>
                          {region.inadimplencia}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-gray-700">{formatCurrency(region.rendaMedia)}</td>
                      <td className="py-3 px-4 text-sm text-right font-medium text-gray-900">
                        {formatCurrency(region.potencialCredito)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

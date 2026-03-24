import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { BrazilMap } from "../components/BrazilMap";
import { regionsData, timeSeriesData } from "../data/mockData";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, AreaChart, Area, PieChart, Pie, Cell,
} from "recharts";
import { TrendingUp, Users, DollarSign, Target } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "../components/ui/chart";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { DateRange } from "react-day-picker";

import { Button } from "../components/ui/button";
import { Calendar } from "../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { cn } from "../components/ui/utils";

export function Dashboard() {  
  const [selectedState, setSelectedState] = useState<string | undefined>();
  
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2025, 0, 1),
    to: new Date(2026, 2, 31),
  });

  const parseMonthYear = (str: string) => {
    const months: Record<string, number> = { Jan: 0, Fev: 1, Mar: 2, Abr: 3, Mai: 4, Jun: 5, Jul: 6, Ago: 7, Set: 8, Out: 9, Nov: 10, Dez: 11 };
    const [m, y] = str.split("/");
    return new Date(2000 + parseInt(y), months[m], 1);
  };

  const filteredTimeData = useMemo(() => {
    let data = timeSeriesData.filter(d => d.state === (selectedState || "all"));

    if (date?.from) {
      data = data.filter(d => {
        const itemDate = parseMonthYear(d.month);
        const isAfterStart = itemDate >= date.from!;
        const isBeforeEnd = date.to ? itemDate <= date.to : true;
        return isAfterStart && isBeforeEnd;
      });
    }
    return data;
  }, [date, selectedState]);

  const filteredRegions = useMemo(() => {
    if (!selectedState) return regionsData;
    return regionsData.filter(r => r.state === selectedState);
  }, [selectedState]);

  const dynamicKPIs = useMemo(() => {
    const totalPotencial = filteredRegions.reduce((sum, r) => sum + r.potencialCredito, 0);
    const avgTicket = filteredTimeData.length 
      ? filteredTimeData.reduce((sum, t) => sum + t.ticket_medio, 0) / filteredTimeData.length 
      : 0;
    const popAlvo = filteredRegions.reduce((sum, r) => sum + r.population, 0);

    return { 
      totalPotencial, 
      regioesMapeadas: filteredRegions.length, 
      ticketMedioNacional: avgTicket, 
      popAlvo 
    };
  }, [filteredRegions, filteredTimeData]);

  const handleClearFilters = () => {
    setDate(undefined);
    setSelectedState(undefined);
  };

  const allRegionsSorted = useMemo(() => [...regionsData].sort((a, b) => b.score - a.score), []);

  const scoreDistribution = useMemo(() => {
    const ranges = [
      { name: "Excelente (85+)", min: 85, count: 0, color: "#10b981" },
      { name: "Bom (75-84)", min: 75, count: 0, color: "#3b82f6" },
      { name: "Médio (65-74)", min: 65, count: 0, color: "#f59e0b" },
      { name: "Baixo (<65)", min: 0, count: 0, color: "#ef4444" },
    ];
    filteredRegions.forEach(r => {
      if (r.score >= 85) ranges[0].count++;
      else if (r.score >= 75) ranges[1].count++;
      else if (r.score >= 65) ranges[2].count++;
      else ranges[3].count++;
    });
    return ranges.filter(r => r.count > 0);
  }, [filteredRegions]);

  const fmtCurrency = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1 }).format(v);
  const fmtNumber = (v: number) => new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(v);

  const selectedRegion = selectedState ? regionsData.find(r => r.state === selectedState) : null;

  const handleStateClick = (uf: string) => {
    setSelectedState(uf === "" || uf === selectedState ? undefined : uf);
  };

  const detailItems = selectedRegion ? [
    { label: "Score", value: selectedRegion.score.toFixed(1), cls: "text-blue-400 font-bold" },
    { label: "Potencial", value: fmtCurrency(selectedRegion.potencialCredito), cls: "text-white font-bold" },
    { label: "População", value: fmtNumber(selectedRegion.population), cls: "text-slate-200" },
    { label: "Bancarização", value: `${selectedRegion.bancarizacao}%`, cls: "text-slate-200" },
    { label: "Inadimplência", value: `${selectedRegion.inadimplencia}%`, cls: selectedRegion.inadimplencia > 5 ? "text-red-400 font-medium" : "text-green-400 font-medium" },
    { label: "Renda Média", value: fmtCurrency(selectedRegion.rendaMedia), cls: "text-slate-200" },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header & Filtros */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Dashboard de Oportunidades</h2>
          <p className="text-slate-400 mt-1">Análise territorial de potencial de crédito inclusivo</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Picker */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-400">Período:</label>
            <Popover>
              <PopoverTrigger asChild>
                <div>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-[260px] justify-start text-left font-normal bg-[#111827] border-white/10 text-white hover:bg-white/5 hover:text-white",
                      !date && "text-slate-400"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "dd LLL, y", { locale: ptBR })} -{" "}
                          {format(date.to, "dd LLL, y", { locale: ptBR })}
                        </>
                      ) : (
                        format(date.from, "dd LLL, y", { locale: ptBR })
                      )
                    ) : (
                      <span>Selecione um período</span>
                    )}
                  </Button>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#111827] border-white/10 text-white" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                  className="bg-[#111827] text-white"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Seletor de Estado */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-400">Estado:</label>
            <Select value={selectedState || "all"} onValueChange={v => setSelectedState(v === "all" ? undefined : v)}>
              <SelectTrigger className="w-[120px] bg-[#111827] border-white/10 text-white">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent className="bg-[#111827] border-white/10 text-white">
                <SelectItem value="all">Todos</SelectItem>
                {["SP", "RJ", "MG", "BA", "PE", "CE", "PR", "RS", "PA", "GO"].map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Botão de Limpar Filtros */}
          {(date || selectedState) && (
            <Button 
              variant="ghost" 
              onClick={handleClearFilters}
              className="text-slate-400 hover:text-white hover:bg-white/5 h-10 px-3 transition-colors"
            >
              <X className="mr-2 h-4 w-4" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Potencial Total", value: fmtCurrency(dynamicKPIs.totalPotencial), sub: "Com base no filtro atual", icon: <DollarSign className="w-5 h-5 text-white/80" />, grad: "from-green-700 to-green-500" },
          { label: "Regiões Mapeadas", value: String(dynamicKPIs.regioesMapeadas), sub: "Territórios em exibição", icon: <Target className="w-5 h-5 text-white/80" />, grad: "from-blue-700 to-blue-400" },
          { label: "Ticket Médio", value: fmtCurrency(dynamicKPIs.ticketMedioNacional), sub: "Média do período", icon: <TrendingUp className="w-5 h-5 text-white/80" />, grad: "from-purple-700 to-purple-400" },
          { label: "População Alvo", value: fmtNumber(dynamicKPIs.popAlvo), sub: "Habitantes nas regiões", icon: <Users className="w-5 h-5 text-white/80" />, grad: "from-orange-600 to-orange-400" },
        ].map(k => (
          <div key={k.label} className={`rounded-2xl p-5 relative overflow-hidden bg-gradient-to-br ${k.grad}`}>
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-white/90">{k.label}</span>
              {k.icon}
            </div>
            <div className="text-3xl font-bold text-white leading-none mb-1">{k.value}</div>
            <p className="text-xs text-white/80">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Mapa + Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#111827] border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Mapa do Brasil</CardTitle>
            <CardDescription className="text-slate-400">Clique em um estado para ver os indicadores</CardDescription>
          </CardHeader>
          <CardContent>
            <BrazilMap selectedState={selectedState} onStateClick={handleStateClick} />
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Ranking Regional</CardTitle>
            <CardDescription className="text-slate-400">Top regiões por potencial de crédito</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-0" style={{ minHeight: 340 }}>
              {/* Ranking — metade esquerda */}
              <div className="w-1/2 space-y-1 overflow-y-auto pr-2" style={{ maxHeight: 340 }}>
                {allRegionsSorted.map((region, index) => (
                  <div key={region.id}
                    onClick={() => handleStateClick(region.state)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition-colors border-b border-white/5 last:border-0 ${selectedState === region.state ? "bg-blue-500/15" : "hover:bg-white/5"}`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] text-white flex-shrink-0 ${index === 0 ? "bg-orange-500" : index === 1 ? "bg-slate-500" : index === 2 ? "bg-amber-800" : "bg-blue-900"}`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="font-semibold text-white text-[11px] truncate">{region.name}</p>
                        <Badge className="text-[9px] px-1 py-0 bg-blue-900/50 text-blue-300 border border-blue-500/30 hover:bg-blue-900/50 flex-shrink-0">{region.state}</Badge>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Inadimp: {region.inadimplencia}%</div>
                    </div>
                    <div className="font-bold text-xs text-blue-400 flex-shrink-0">{region.score.toFixed(1)}</div>
                  </div>
                ))}
              </div>

              {/* Divisor */}
              <div className="w-px bg-white/10 mx-3 flex-shrink-0" />

              {/* Detalhe — metade direita */}
              <div className="w-1/2 pl-1">
                {selectedRegion ? (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Badge className="bg-blue-900/50 text-blue-300 border border-blue-500/30 text-xs">{selectedRegion.state}</Badge>
                        <span className="text-white text-sm font-semibold truncate">{selectedRegion.name}</span>
                      </div>
                      <button onClick={() => setSelectedState(undefined)} className="text-slate-500 hover:text-white text-xs transition-colors flex-shrink-0 ml-1">✕</button>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {detailItems.map(item => (
                        <div key={item.label} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                          <span className="text-slate-400 text-xs">{item.label}</span>
                          <span className={`text-sm ${item.cls}`}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-2 text-center">
                    <span className="text-3xl">👆</span>
                    <p className="text-[10px] text-slate-500 leading-relaxed px-2">Clique em uma região para ver os detalhes</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#111827] border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Evolução de Concessões</CardTitle>
            <CardDescription className="text-slate-400">Volume de operações ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer 
              config={{ concessoes: { label: "Concessões", color: "#3b82f6" } }} 
              className="h-[240px] w-full"
            >
              <AreaChart data={filteredTimeData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-concessoes)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--color-concessoes)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="concessoes" stroke="var(--color-concessoes)" strokeWidth={2} fill="url(#cg)" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Taxa de Inadimplência</CardTitle>
            <CardDescription className="text-slate-400">Evolução do índice (%)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer 
              config={{ inadimplencia: { label: "Inadimplência", color: "#ef4444" } }} 
              className="h-[240px] w-full"
            >
              <LineChart data={filteredTimeData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis domain={[0, 6]} tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line type="monotone" dataKey="inadimplencia" stroke="var(--color-inadimplencia)" strokeWidth={2} dot={{ fill: "var(--color-inadimplencia)", r: 3 }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Ticket Médio</CardTitle>
            <CardDescription className="text-slate-400">Valor médio das operações (R$)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer 
              config={{ ticket_medio: { label: "Ticket Médio", color: "#22c55e" } }} 
              className="h-[240px] w-full"
            >
              <BarChart data={filteredTimeData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="ticket_medio" fill="var(--color-ticket_medio)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Distribuição por Score</CardTitle>
            <CardDescription className="text-slate-400">Classificação das regiões analisadas</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer 
              config={{
                excelente: { label: "Excelente", color: "#10b981" },
                bom: { label: "Bom", color: "#3b82f6" },
                medio: { label: "Médio", color: "#f59e0b" },
                baixo: { label: "Baixo", color: "#ef4444" },
              }} 
              className="h-[240px] w-full"
            >
              <PieChart>
                <Pie 
                  data={scoreDistribution} 
                  cx="50%" cy="50%" 
                  labelLine={false}
                  label={({ name, count }) => `${name}: ${count}`} 
                  outerRadius={85} 
                  dataKey="count"
                >
                  {scoreDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card className="bg-[#111827] border-white/5">
        <CardHeader>
          <CardTitle className="text-white">Detalhamento Regional</CardTitle>
          <CardDescription className="text-slate-400">Indicadores completos por região</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {["Região", "UF", "Score", "População", "Bancarização", "Inadimplência", "Renda Média", "Potencial"].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-medium text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allRegionsSorted.map(r => (
                  <tr key={r.id}
                    onClick={() => handleStateClick(r.state)}
                    className={`border-b border-white/5 last:border-0 cursor-pointer transition-colors ${selectedState === r.state ? "bg-blue-500/10" : "hover:bg-white/[.03]"}`}>
                    <td className="py-3 px-4 text-sm text-white font-medium">{r.name}</td>
                    <td className="py-3 px-4">
                      <Badge className="text-xs bg-blue-900/50 text-blue-300 border border-blue-500/30 hover:bg-blue-900/50">{r.state}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm font-bold text-blue-400">{r.score.toFixed(1)}</td>
                    <td className="py-3 px-4 text-sm text-slate-300">{fmtNumber(r.population)}</td>
                    <td className="py-3 px-4 text-sm text-slate-300">{r.bancarizacao}%</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={r.inadimplencia < 4 ? "text-green-400" : "text-red-400"}>{r.inadimplencia}%</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-300">{fmtCurrency(r.rendaMedia)}</td>
                    <td className="py-3 px-4 text-sm font-bold text-white">{fmtCurrency(r.potencialCredito)}</td>
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
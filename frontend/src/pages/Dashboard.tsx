import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { BrazilMap } from "../components/BrazilMap";

import { regionsData, timeSeriesData, kpiData } from "../data/mockData";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell,
} from "recharts";
import { TrendingUp, Users, DollarSign, Target, X, MapPin } from "lucide-react";
import { Badge } from "../components/ui/badge";

// Mapeamento de Macroregiões
const MACRO_REGIONS: Record<string, { label: string; states: string[]; color: string }> = {
  norte: { label: "Norte", states: ["AC","AP","AM","PA","RO","RR","TO"], color: "#22c55e" },
  nordeste: { label: "Nordeste", states: ["AL","BA","CE","MA","PB","PE","PI","RN","SE"], color: "#f59e0b" },
  centro_oeste: { label: "Centro-Oeste", states: ["DF","GO","MS","MT"], color: "#a855f7" },
  sudeste: { label: "Sudeste", states: ["ES","MG","RJ","SP"], color: "#3b82f6" },
  sul: { label: "Sul", states: ["PR","RS","SC"], color: "#ef4444" },
};

// Retorna a macrorregião de um UF
function getMacroRegion(uf: string): string | undefined {
  return Object.entries(MACRO_REGIONS).find(([, v]) => v.states.includes(uf))?.[0];
}

export function Dashboard() {
  const [selectedState, setSelectedState] = useState<string | undefined>();
  const [selectedMacroRegion, setSelectedMacroRegion] = useState<string | undefined>();
  const [timeFilter, setTimeFilter] = useState("12m");

  // Filtros de tempo 
  const filteredTimeData = useMemo(() => {
    const m: Record<string, number> = { "3m": 3, "6m": 6, "12m": 12 };
    return timeSeriesData.slice(-(m[timeFilter]));
  }, [timeFilter]);

  // Estados Disponiveis 
  const availableStates = useMemo(() => {
    const allStates = [...new Set(regionsData.map(r => r.state))].sort();
    if (!selectedMacroRegion) return allStates;
    return allStates.filter(s => MACRO_REGIONS[selectedMacroRegion].states.includes(s));
  }, [selectedMacroRegion]);

  // Regiões filtradas
  const filteredRegions = useMemo(() => {
    return regionsData.filter(r => {
      const matchesMacro = !selectedMacroRegion ||
        MACRO_REGIONS[selectedMacroRegion].states.includes(r.state);
      const matchesState = !selectedState || r.state === selectedState;
      return matchesMacro && matchesState;
    });
  }, [selectedMacroRegion, selectedState]);

  const allRegionsSorted = useMemo(
    () => [...filteredRegions].sort((a, b) => b.score - a.score),
    [filteredRegions]
  );

  const scoreDistribution = useMemo(() => {
    const ranges = [
      { name: "Excelente (85+)", min: 85, count: 0, color: "#10b981" },
      { name: "Bom (75-84)", min: 75, count: 0, color: "#3b82f6" },
      { name: "Médio (65-74)", min: 65, count: 0, color: "#f59e0b" },
      { name: "Baixo (<65)", min: 0,  count: 0, color: "#ef4444" },
    ];
    filteredRegions.forEach(r => {
      if (r.score >= 85) ranges[0].count++;
      else if (r.score >= 75) ranges[1].count++;
      else if (r.score >= 65) ranges[2].count++;
      else ranges[3].count++;
    });
    return ranges.filter(r => r.count > 0);
  }, [filteredRegions]);

  const fmtCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1 }).format(v);
  const fmtNumber = (v: number) =>
    new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(v);

  const grid = { stroke: "rgba(255,255,255,0.05)" };
  const tick  = { fill: "#94a3b8", fontSize: 11 };
  const ttip  = {
    contentStyle: { backgroundColor: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#f1f5f9" },
    labelStyle: { color: "#94a3b8" },
  };

  const selectedRegion = selectedState ? regionsData.find(r => r.state === selectedState) : null;

  const handleStateClick = (uf: string) => {
    if (uf === "" || uf === selectedState) {
      setSelectedState(undefined);
      return;
    }
    const macro = getMacroRegion(uf);
    setSelectedState(uf);
    if (macro && !selectedMacroRegion) {
    }
  };

  const handleMacroChange = (value: string) => {
    const next = value === "all" ? undefined : value;
    setSelectedMacroRegion(next);
    if (next && selectedState && !MACRO_REGIONS[next].states.includes(selectedState)) {
      setSelectedState(undefined);
    }
  };

  const clearAllFilters = () => {
    setSelectedMacroRegion(undefined);
    setSelectedState(undefined);
    setTimeFilter("12m");
  };

  const hasActiveFilters = !!selectedMacroRegion || !!selectedState || timeFilter !== "12m";
  const activeFilterCount = [selectedMacroRegion, selectedState, timeFilter !== "12m" ? "time" : undefined]
    .filter(Boolean).length;

  const detailItems = selectedRegion ? [
    { label: "Score", value: selectedRegion.score.toFixed(1), cls: "text-blue-400 font-bold" },
    { label: "Potencial",    value: fmtCurrency(selectedRegion.potencialCredito), cls: "text-white font-bold" },
    { label: "Macrorregião", value: MACRO_REGIONS[getMacroRegion(selectedRegion.state) ?? ""]?.label ?? "—", cls: "text-slate-200" },
    { label: "População",    value: fmtNumber(selectedRegion.population), cls: "text-slate-200" },
    { label: "Bancarização", value: `${selectedRegion.bancarizacao}%`, cls: "text-slate-200" },
    { label: "Inadimplência",value: `${selectedRegion.inadimplencia}%`,
      cls: selectedRegion.inadimplencia > 5 ? "text-red-400 font-medium" : "text-green-400 font-medium" },
    { label: "Renda Média",  value: fmtCurrency(selectedRegion.rendaMedia), cls: "text-slate-200" },
  ] : [];

  return (
    <div className="space-y-6">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Dashboard de Oportunidades</h2>
          <p className="text-slate-400 mt-1">Análise territorial de potencial de crédito inclusivo</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Período */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-400">Período:</label>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-32 bg-[#111827] border-white/10 text-white"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#111827] border-white/10 text-white">
                <SelectItem value="3m">3 meses</SelectItem>
                <SelectItem value="6m">6 meses</SelectItem>
                <SelectItem value="12m">12 meses</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Macrorregião */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-400">Região:</label>
            <Select value={selectedMacroRegion ?? "all"} onValueChange={handleMacroChange}>
              <SelectTrigger className="w-40 bg-[#111827] border-white/10 text-white"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#111827] border-white/10 text-white">
                <SelectItem value="all">Todas</SelectItem>
                {Object.entries(MACRO_REGIONS).map(([key, { label, color }]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: color }} />
                      {label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estado (cascata) */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-400">Estado:</label>
            <Select value={selectedState ?? "all"} onValueChange={v => setSelectedState(v === "all" ? undefined : v)}>
              <SelectTrigger className="w-36 bg-[#111827] border-white/10 text-white"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#111827] border-white/10 text-white">
                <SelectItem value="all">Todos</SelectItem>
                {availableStates.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Botão limpar filtros */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
            >
              <X className="w-3 h-3" />
              Limpar ({activeFilterCount})
            </button>
          )}
        </div>
      </div>

      {/* ── Filtros Ativos (badges visuais) ─────────────────────────────── */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Filtros ativos:
          </span>
          {selectedMacroRegion && (
            <Badge
              className="flex items-center gap-1 cursor-pointer text-xs px-2 py-1 border"
              style={{
                backgroundColor: `${MACRO_REGIONS[selectedMacroRegion].color}20`,
                color: MACRO_REGIONS[selectedMacroRegion].color,
                borderColor: `${MACRO_REGIONS[selectedMacroRegion].color}40`,
              }}
              onClick={() => handleMacroChange("all")}
            >
              {MACRO_REGIONS[selectedMacroRegion].label} <X className="w-2.5 h-2.5" />
            </Badge>
          )}
          {selectedState && (
            <Badge
              className="flex items-center gap-1 cursor-pointer text-xs px-2 py-1 bg-blue-900/50 text-blue-300 border border-blue-500/30 hover:bg-blue-900/70"
              onClick={() => setSelectedState(undefined)}
            >
              {selectedState} <X className="w-2.5 h-2.5" />
            </Badge>
          )}
          {timeFilter !== "12m" && (
            <Badge
              className="flex items-center gap-1 cursor-pointer text-xs px-2 py-1 bg-purple-900/50 text-purple-300 border border-purple-500/30 hover:bg-purple-900/70"
              onClick={() => setTimeFilter("12m")}
            >
              {timeFilter === "3m" ? "3 meses" : "6 meses"} <X className="w-2.5 h-2.5" />
            </Badge>
          )}
          <span className="text-xs text-slate-500">
            — {filteredRegions.length} {filteredRegions.length === 1 ? "região" : "regiões"} encontrada{filteredRegions.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* ── Seletor visual de Macrorregiões ─────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(MACRO_REGIONS).map(([key, { label, color, states }]) => {
          const isActive = selectedMacroRegion === key;
          const regionCount = regionsData.filter(r => states.includes(r.state)).length;
          return (
            <button
              key={key}
              onClick={() => handleMacroChange(isActive ? "all" : key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-200 ${
                isActive
                  ? "text-white shadow-lg scale-105"
                  : "bg-[#111827] text-slate-400 border-white/10 hover:border-white/20 hover:text-slate-200"
              }`}
              style={isActive ? { backgroundColor: `${color}25`, borderColor: `${color}60`, color } : {}}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              {label}
              <span
                className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                style={isActive
                  ? { backgroundColor: `${color}30`, color }
                  : { backgroundColor: "rgba(255,255,255,0.05)", color: "#64748b" }
                }
              >
                {regionCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── KPIs ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Potencial Total",
            value: fmtCurrency(filteredRegions.reduce((s, r) => s + r.potencialCredito, 0)),
            sub: `↗ +${kpiData.crescimentoMensal}% vs mês anterior`,
            icon: <DollarSign className="w-5 h-5 text-white/80" />,
            grad: "from-green-700 to-green-500",
          },
          {
            label: "Regiões Mapeadas",
            value: String(filteredRegions.length),
            sub: selectedMacroRegion
              ? `na região ${MACRO_REGIONS[selectedMacroRegion].label}`
              : "Territórios analisados",
            icon: <Target className="w-5 h-5 text-white/80" />,
            grad: "from-blue-700 to-blue-400",
          },
          {
            label: "Ticket Médio",
            value: fmtCurrency(kpiData.ticketMedioNacional),
            sub: "↗ +4.2% vs trimestre anterior",
            icon: <TrendingUp className="w-5 h-5 text-white/80" />,
            grad: "from-purple-700 to-purple-400",
          },
          {
            label: "População Alvo",
            value: fmtNumber(filteredRegions.reduce((s, r) => s + r.population, 0)),
            sub: "Habitantes nas regiões",
            icon: <Users className="w-5 h-5 text-white/80" />,
            grad: "from-orange-600 to-orange-400",
          },
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

      {/* ── Mapa + Ranking ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#111827] border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Mapa do Brasil</CardTitle>
            <CardDescription className="text-slate-400">
              {selectedMacroRegion
                ? `Filtrando: ${MACRO_REGIONS[selectedMacroRegion].label} — clique em um estado`
                : "Clique em um estado para ver os indicadores"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BrazilMap
              data={filteredRegions.map(r => ({ estado: r.state, valor: r.score }))}
              selectedState={selectedState}
              onStateClick={handleStateClick}
            />
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Ranking Regional</CardTitle>
            <CardDescription className="text-slate-400">
              {selectedMacroRegion
                ? `Top regiões — ${MACRO_REGIONS[selectedMacroRegion].label}`
                : "Top regiões por potencial de crédito"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-0" style={{ minHeight: 340 }}>
              {/* Ranking — metade esquerda */}
              <div className="w-1/2 space-y-1 overflow-y-auto pr-2" style={{ maxHeight: 340 }}>
                {allRegionsSorted.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center gap-2 text-center pt-10">
                    <span className="text-2xl">🔍</span>
                    <p className="text-[11px] text-slate-500">Nenhuma região encontrada para os filtros selecionados.</p>
                  </div>
                ) : (
                  allRegionsSorted.map((region, index) => {
                    const macro = getMacroRegion(region.state);
                    const macroColor = macro ? MACRO_REGIONS[macro].color : "#64748b";
                    return (
                      <div key={region.id}
                        onClick={() => handleStateClick(region.state)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition-colors border-b border-white/5 last:border-0 ${selectedState === region.state ? "bg-blue-500/15" : "hover:bg-white/5"}`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] text-white flex-shrink-0 ${
                          index === 0 ? "bg-orange-500" : index === 1 ? "bg-slate-500" : index === 2 ? "bg-amber-800" : "bg-blue-900"
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <p className="font-semibold text-white text-[11px] truncate">{region.name}</p>
                            <Badge className="text-[9px] px-1 py-0 bg-blue-900/50 text-blue-300 border border-blue-500/30 hover:bg-blue-900/50 flex-shrink-0">
                              {region.state}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: macroColor }} />
                            <div className="text-[10px] text-slate-400">Inadimp: {region.inadimplencia}%</div>
                          </div>
                        </div>
                        <div className="font-bold text-xs text-blue-400 flex-shrink-0">{region.score.toFixed(1)}</div>
                      </div>
                    );
                  })
                )}
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

      {/* ── Gráficos ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#111827] border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Evolução de Concessões</CardTitle>
            <CardDescription className="text-slate-400">Volume de operações ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={filteredTimeData}>
                <defs>
                  <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" {...grid} />
                <XAxis dataKey="month" tick={tick} />
                <YAxis tick={tick} />
                <Tooltip {...ttip} />
                <Area type="monotone" dataKey="concessoes" stroke="#3b82f6" strokeWidth={2} fill="url(#cg)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Taxa de Inadimplência</CardTitle>
            <CardDescription className="text-slate-400">Evolução do índice (%)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={filteredTimeData}>
                <CartesianGrid strokeDasharray="3 3" {...grid} />
                <XAxis dataKey="month" tick={tick} />
                <YAxis tick={tick} domain={[0, 6]} />
                <Tooltip {...ttip} />
                <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
                <Line type="monotone" dataKey="inadimplencia" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444", r: 3 }} name="Inadimplência %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Ticket Médio</CardTitle>
            <CardDescription className="text-slate-400">Valor médio das operações (R$)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={filteredTimeData}>
                <CartesianGrid strokeDasharray="3 3" {...grid} />
                <XAxis dataKey="month" tick={tick} />
                <YAxis tick={tick} />
                <Tooltip {...ttip} />
                <Bar dataKey="ticket_medio" fill="#22c55e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Distribuição por Score</CardTitle>
            <CardDescription className="text-slate-400">
              {selectedMacroRegion
                ? `Classificação — ${MACRO_REGIONS[selectedMacroRegion].label}`
                : "Classificação das regiões analisadas"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={scoreDistribution}
                  cx="50%" cy="50%"
                  labelLine={false}
                  label={({ name, count }: any) => `${name}: ${count}`}
                  outerRadius={90}
                  dataKey="count"
                >
                  {scoreDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip {...ttip} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Tabela ───────────────────────────────────────────────────────── */}
      <Card className="bg-[#111827] border-white/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Detalhamento Regional</CardTitle>
              <CardDescription className="text-slate-400">
                Indicadores completos — {filteredRegions.length} {filteredRegions.length === 1 ? "região" : "regiões"}
                {selectedMacroRegion && ` · ${MACRO_REGIONS[selectedMacroRegion].label}`}
                {selectedState && ` · ${selectedState}`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {["Região", "UF", "Macrorregião", "Score", "População", "Bancarização", "Inadimplência", "Renda Média", "Potencial"].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-medium text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allRegionsSorted.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500 text-sm">
                      Nenhuma região encontrada para os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  allRegionsSorted.map(r => {
                    const macro = getMacroRegion(r.state);
                    const macroInfo = macro ? MACRO_REGIONS[macro] : null;
                    return (
                      <tr key={r.id}
                        onClick={() => handleStateClick(r.state)}
                        className={`border-b border-white/5 last:border-0 cursor-pointer transition-colors ${selectedState === r.state ? "bg-blue-500/10" : "hover:bg-white/[.03]"}`}
                      >
                        <td className="py-3 px-4 text-sm text-white font-medium">{r.name}</td>
                        <td className="py-3 px-4">
                          <Badge className="text-xs bg-blue-900/50 text-blue-300 border border-blue-500/30 hover:bg-blue-900/50">{r.state}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          {macroInfo && (
                            <span className="flex items-center gap-1.5 text-xs text-slate-300">
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: macroInfo.color }} />
                              {macroInfo.label}
                            </span>
                          )}
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

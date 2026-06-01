import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { BrazilMap } from "../components/BrazilMap";
import { X, RefreshCw, AlertTriangle, Download, Table, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Button } from "../components/ui/button";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { api } from "../services/api";
import { useGrafico } from "../hooks/useGrafico";
import { ChartCreditoSfn } from "../components/charts/ChartCreditoSfn";
import { ChartMacroContexto } from "../components/charts/ChartMacroContexto";
import { ChartInadimplenciaRegional } from "../components/charts/ChartInadimplenciaRegional";
import { ChartHeatmapEstados } from "../components/charts/ChartHeatmapEstados";
import { ChartScatterPfPj } from "../components/charts/ChartScatterPfPj";
// import { ChartEstudoEstado } from "../components/charts/ChartEstudoEstado";
import { ChartScoreOportunidade } from "../components/charts/ChartScoreOportunidade";
import { ChartMonteCarlo } from "../components/charts/ChartMonteCarlo";

// ─── Constantes ──────────────────────────────────────────────────────────────
const MACRO_REGIONS: Record<string, { label: string; states: string[]; color: string }> = {
  norte: { label: "Norte", states: ["AC", "AP", "AM", "PA", "RO", "RR", "TO"], color: "#22c55e" },
  nordeste: { label: "Nordeste", states: ["AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"], color: "#3b82f6" },
  centro_oeste: { label: "Centro-Oeste", states: ["DF", "GO", "MS", "MT"], color: "#a855f7" },
  sudeste: { label: "Sudeste", states: ["ES", "MG", "RJ", "SP"], color: "#f97316" },
  sul: { label: "Sul", states: ["PR", "RS", "SC"], color: "#ef4444" },
};

function getMacroRegion(uf: string) {
  return Object.entries(MACRO_REGIONS).find(([, v]) => v.states.includes(uf))?.[0];
}

// ─── Componente auxiliar: Card de gráfico com loading/erro ───────────────────
function ChartCard({
  title, description, loading, error, refetch, children, colSpan = 1,
}: {
  title: string;
  description?: string;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  children: React.ReactNode;
  colSpan?: 1 | 2;
}) {
  return (
    <Card className={colSpan === 2 ? "lg:col-span-2" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {description && <CardDescription className="text-m mt-0.5">{description}</CardDescription>}
          </div>
          <button onClick={refetch} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0" title="Recarregar">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-52 gap-2 text-muted-foreground text-sm">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Carregando dados do servidor...
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-52 gap-2 text-center px-4">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <button onClick={refetch} className="text-xs text-blue-500 hover:underline">Tentar novamente</button>
          </div>
        ) : children}
      </CardContent>
    </Card>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export function Dashboard() {
  const [selectedState, setSelectedState] = useState<string | undefined>();
  const [selectedMacroRegion, setSelectedMacroRegion] = useState<string | undefined>();

  // ── Dados da API ────────────────────────────────────────────────────────────
  const grf01 = useGrafico(() => api.graficos.creditoSfn(10), []);
  const grf02 = useGrafico(() => api.graficos.macroContexto(5), []);
  const grf03 = useGrafico(() => api.graficos.inadimplenciaRegional(), []);
  const grf05 = useGrafico(() => api.graficos.heatmapEstados(), []);
  const grf06 = useGrafico(() => api.graficos.scatterPfPj(), []);
  // const grf07 = useGrafico(
  //   () => api.graficos.estudioEstado(selectedState ?? "MG", 5),
  //   [selectedState]
  // );
  const grf08 = useGrafico(() => api.graficos.scoreOportunidade(), []);
  const grf09 = useGrafico(() => api.graficos.monteCarlo(), []);
  const ufsData = useGrafico(() => api.ufs.listar(), []);

  // ── Filtros ─────────────────────────────────────────────────────────────────
  const mapData = useMemo(() => {
    if (!grf08.data) return [];
    return grf08.data.ranking.map(r => ({ estado: r.sigla_uf, valor: r.score_oportunidade }));
  }, [grf08.data]);

  const availableStates = useMemo(() => {
    const all = (ufsData.data ?? []).map(u => u.sigla_uf).sort();
    if (!selectedMacroRegion) return all;
    return all.filter(s => MACRO_REGIONS[selectedMacroRegion].states.includes(s));
  }, [ufsData.data, selectedMacroRegion]);

  const handleStateClick = (uf: string) => {
    setSelectedState(uf === "" || uf === selectedState ? undefined : uf);
  };

  const handleMacroChange = (value: string) => {
    const next = value === "all" ? undefined : value;
    setSelectedMacroRegion(next);
    if (next && selectedState && !MACRO_REGIONS[next].states.includes(selectedState)) {
      setSelectedState(undefined);
    }
  };

  const clearFilters = () => { setSelectedMacroRegion(undefined); setSelectedState(undefined); };
  const hasFilters = !!selectedMacroRegion || !!selectedState;

  // ── Ranking lateral (do grf08, filtrado pela região selecionada) ──────────
  const rankingFiltrado = useMemo(() => {
    const full = grf08.data?.ranking ?? [];
    if (!selectedMacroRegion) return full;
    return full.filter(r => MACRO_REGIONS[selectedMacroRegion].states.includes(r.sigla_uf));
  }, [grf08.data, selectedMacroRegion]);

  const selectedRankingItem = selectedState
    ? grf08.data?.ranking.find(r => r.sigla_uf === selectedState)
    : null;

  const [isExporting, setIsExporting] = useState(false);

  const exportDashboard = async (format: "pdf" | "csv") => {
    if (format === "pdf") {
      setIsExporting(true);
      setTimeout(async () => {
        try {
          const doc = new jsPDF("p", "mm", "a4");

          doc.setFontSize(22);
          doc.setTextColor(40, 40, 40);
          doc.text("Mapa de Oportunidades de Crédito - DM", 14, 22);

          doc.setFontSize(11);
          doc.setTextColor(100, 100, 100);
          doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`, 14, 30);

          const filtrosTexto = [];
          if (selectedMacroRegion) filtrosTexto.push(`Macrorregião: ${MACRO_REGIONS[selectedMacroRegion].label}`);
          if (selectedState) filtrosTexto.push(`Estado: ${selectedState}`);

          if (filtrosTexto.length > 0) {
            doc.text(`Filtros Ativos: ${filtrosTexto.join(" | ")}`, 14, 38);
          } else {
            doc.text("Filtros Ativos: Nenhum (Visão Geral Brasil)", 14, 38);
          }

          const ranking = grf08.data?.ranking ?? [];
          const dadosFiltrados = selectedMacroRegion
            ? ranking.filter(r => MACRO_REGIONS[selectedMacroRegion].states.includes(r.sigla_uf))
            : ranking;

          const tableColumn = ["Posição", "UF", "Nome do Estado", "Score IOI", "Risco", "Tendência"];
          const tableRows = dadosFiltrados.map((r, index) => [
            index + 1,
            r.sigla_uf,
            r.nome,
            r.score_oportunidade.toFixed(2),
            r.componente_risco != null ? r.componente_risco.toFixed(2) : "-",
            (r as any).componente_tendencia != null ? (r as any).componente_tendencia.toFixed(2) : "-"
          ]);

          autoTable(doc, {
            startY: 46,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: [15, 30, 84] },
            styles: { fontSize: 9 },
            alternateRowStyles: { fillColor: [245, 247, 250] }
          });

          const chartsContainer = document.getElementById("dashboard-charts");
          if (chartsContainer) {
            const imgData = await toPng(chartsContainer, { backgroundColor: "#ffffff" });

            // To properly calculate aspect ratio, we can create an Image object
            const img = new Image();
            img.src = imgData;
            await new Promise((resolve) => { img.onload = resolve; });

            const pdfWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const marginX = 14;
            const imgWidth = pdfWidth - (marginX * 2);
            const imgHeight = (img.height * imgWidth) / img.width;

            doc.addPage();

            let position = 14;
            doc.addImage(imgData, 'PNG', marginX, position, imgWidth, imgHeight);
            let heightLeft = imgHeight - (pageHeight - position);

            while (heightLeft > 0) {
              position -= pageHeight;
              doc.addPage();
              doc.addImage(imgData, 'PNG', marginX, position, imgWidth, imgHeight);
              heightLeft -= pageHeight;
            }
          }

          doc.save(`mapa_oportunidades_dm_${new Date().toISOString().slice(0, 10)}.pdf`);
        } catch (err: any) {
          console.error("Erro ao gerar PDF:", err);
          alert("Erro ao gerar relatório: " + (err.message || String(err)));
        } finally {
          setIsExporting(false);
        }
      }, 100);
      return;
    }

    if (format === "csv") {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "UF,Nome,Score IOI,Risco,Tendencia\n";
      const ranking = grf08.data?.ranking ?? [];
      ranking.forEach(r => {
        csvContent += `${r.sigla_uf},${r.nome},${r.score_oportunidade},${r.componente_risco ?? ''},${(r as any).componente_tendencia ?? ''}\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `ranking_ioi_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div id="dashboard-content" className="space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <img src="/favicon.ico" alt="Logo DM" className="w-10 h-10 object-contain rounded-md" />
          <div>
            <h2 className="text-3xl font-bold text-vocedm-navy">Mapa de Oportunidades de Crédito - DM</h2>
            <p className="text-muted-foreground mt-1">Análise territorial de potencial de crédito inclusivo</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Exportar */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-white" disabled={isExporting}>
                {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {isExporting ? "Exportando..." : "Exportar"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              <DropdownMenuItem onClick={() => exportDashboard("pdf")} className="gap-2 cursor-pointer">
                <FileText className="w-4 h-4 text-red-500" />
                Gerar Relatório (PDF)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportDashboard("csv")} className="gap-2 cursor-pointer">
                <Table className="w-4 h-4 text-green-500" />
                Exportar Dados IOI (CSV)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Macrorregião */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Região:</label>
            <Select value={selectedMacroRegion ?? "all"} onValueChange={handleMacroChange}>
              <SelectTrigger className="w-40 bg-white border-input text-foreground"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-white border-input text-foreground">
                <SelectItem value="all">Todas</SelectItem>
                {Object.entries(MACRO_REGIONS).map(([key, { label, color }]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: color }} />
                      {label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estado */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Estado:</label>
            <Select value={selectedState ?? "all"} onValueChange={v => setSelectedState(v === "all" ? undefined : v)}>
              <SelectTrigger className="w-36 bg-white border-input text-foreground"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-white border-input text-foreground">
                <SelectItem value="all">Todos</SelectItem>
                {availableStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ── Botões de macrorregião + filtros ativos ─────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        {Object.entries(MACRO_REGIONS).map(([key, { label, color, states }]) => {
          const isActive = selectedMacroRegion === key;
          return (
            <button key={key} onClick={() => handleMacroChange(isActive ? "all" : key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-200 ${isActive ? "text-foreground shadow-lg scale-105" : "bg-white text-muted-foreground border-border hover:border-white/20"
                }`}
              style={isActive ? { backgroundColor: `${color}25`, borderColor: `${color}60`, color } : {}}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              {label}
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                style={isActive ? { backgroundColor: `${color}30`, color } : { backgroundColor: "rgba(0,0,0,0.06)", color: "#64748b" }}>
                {states.length}
              </span>
            </button>
          );
        })}

        {hasFilters && (
          <>
            <div className="w-px h-5 bg-border mx-1" />
            {selectedMacroRegion && (
              <Badge className="flex items-center gap-1 cursor-pointer text-xs px-2 py-1 border rounded-full"
                style={{ backgroundColor: `${MACRO_REGIONS[selectedMacroRegion].color}20`, color: MACRO_REGIONS[selectedMacroRegion].color, borderColor: `${MACRO_REGIONS[selectedMacroRegion].color}40` }}
                onClick={() => handleMacroChange("all")}>
                {MACRO_REGIONS[selectedMacroRegion].label} <X className="w-2.5 h-2.5" />
              </Badge>
            )}
            {selectedState && (
              <Badge className="flex items-center gap-1 cursor-pointer text-xs px-2 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-full"
                onClick={() => setSelectedState(undefined)}>
                {selectedState} <X className="w-2.5 h-2.5" />
              </Badge>
            )}
            <button onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors">
              <X className="w-3 h-3" /> Limpar filtros
            </button>
          </>
        )}
      </div>

      {/* ── Mapa + Ranking IOI ───────────────────────────────────────────────── */}
      <div id="dashboard-charts" className="space-y-6 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Mapa do Brasil</CardTitle>
              <CardDescription>
                {selectedMacroRegion
                  ? `Filtrando: ${MACRO_REGIONS[selectedMacroRegion].label} — clique em um estado`
                  : "Colorido pelo Score IOI — clique em um estado"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BrazilMap
                data={mapData}
                selectedState={selectedState}
                onStateClick={handleStateClick}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ranking IOI</CardTitle>
              <CardDescription>Score de oportunidade por estado (0–10)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 md:gap-0" style={{ minHeight: 340 }}>
                {/* Lista */}
                <div className="w-full md:w-1/2 space-y-1 overflow-y-auto md:pr-2" style={{ maxHeight: 340 }}>
                  {grf08.loading ? (
                    <div className="flex items-center justify-center h-40 text-sm text-muted-foreground gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" /> Carregando...
                    </div>
                  ) : rankingFiltrado.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center gap-2 text-center pt-10">
                      <span className="text-2xl">🔍</span>
                      <p className="text-[11px] text-muted-foreground">Sem dados de ranking para os filtros selecionados.</p>
                    </div>
                  ) : (
                    rankingFiltrado.map((r, idx) => {
                      const macro = getMacroRegion(r.sigla_uf);
                      const macroColor = macro ? MACRO_REGIONS[macro].color : "#64748b";
                      return (
                        <div key={r.sigla_uf}
                          onClick={() => handleStateClick(r.sigla_uf)}
                          className={`flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition-colors border-b border-border last:border-0 ${selectedState === r.sigla_uf ? "bg-vocedm-blue/10" : "hover:bg-slate-50"}`}>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] text-white flex-shrink-0 ${idx === 0 ? "bg-[#f97316]" : idx === 1 ? "bg-slate-500" : idx === 2 ? "bg-amber-700" : "bg-vocedm-blue"}`}>
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <p className="font-semibold text-foreground text-[11px] truncate">{r.nome}</p>
                              <Badge className="text-[9px] px-1 py-0 bg-[#F1EFFF] text-vocedm-blue border border-vocedm-blue/20 flex-shrink-0">{r.sigla_uf}</Badge>
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: macroColor }} />
                              <span className="text-[10px] text-muted-foreground">Score: {r.score_oportunidade.toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="font-bold text-xs text-vocedm-blue">{r.score_oportunidade.toFixed(1)}</div>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="hidden md:block w-px bg-border mx-3" />
                {/* Detalhe */}
                <div className="w-full md:w-1/2 md:pl-1">
                  {selectedRankingItem ? (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <Badge className="bg-[#F1EFFF] text-vocedm-blue border border-vocedm-blue/20 text-xs">{selectedRankingItem.sigla_uf}</Badge>
                          <span className="text-foreground text-sm font-semibold truncate">{selectedRankingItem.nome}</span>
                        </div>
                        <button onClick={() => setSelectedState(undefined)} className="text-muted-foreground hover:text-foreground text-xs ml-1">✕</button>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {[
                          { label: "Score IOI", value: `${selectedRankingItem.score_oportunidade.toFixed(2)} / 10`, cls: "text-vocedm-blue font-bold" },
                          { label: "Risco", value: selectedRankingItem.componente_risco != null ? `${selectedRankingItem.componente_risco.toFixed(2)}` : "—", cls: "text-muted-foreground" },
                          { label: "Tendência", value: (selectedRankingItem as any).componente_tendencia != null ? `${(selectedRankingItem as any).componente_tendencia.toFixed(2)}` : "—", cls: "text-muted-foreground" },
                          { label: "Macrorregião", value: MACRO_REGIONS[getMacroRegion(selectedRankingItem.sigla_uf) ?? ""]?.label ?? "—", cls: "text-muted-foreground" },
                        ].map(item => (
                          <div key={item.label} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                            <span className="text-muted-foreground text-xs">{item.label}</span>
                            <span className={`text-sm ${item.cls}`}>{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-2 text-center">
                      <span className="text-3xl">👆</span>
                      <p className="text-[10px] text-muted-foreground leading-relaxed px-2">Clique em uma região para ver os detalhes</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <hr />

        {/* ── Gráficos: linha 1 ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Saldo de Crédito SFN" description="PF, PJ e Total — Séries BCB 20540/41/42 (R$ mi)"
            loading={grf01.loading} error={grf01.error} refetch={grf01.refetch}>
            {grf01.data && <ChartCreditoSfn data={grf01.data} />}
          </ChartCard>

          <ChartCard title="Contexto Macroeconômico" description="Selic, IPCA e Inadimplência PF — eixo duplo"
            loading={grf02.loading} error={grf02.error} refetch={grf02.refetch}>
            {grf02.data && <ChartMacroContexto data={grf02.data} />}
          </ChartCard>
        </div>

        {/* ── Gráficos: linha 2 ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Inadimplência Regional" description="Boxplot histórico + barras do valor atual por macrorregião"
            loading={grf03.loading} error={grf03.error} refetch={grf03.refetch}>
            {grf03.data && <ChartInadimplenciaRegional data={grf03.data} />}
          </ChartCard>

          <ChartCard title="Dispersão PF vs PJ" description="Inadimplência atual por estado — cor indica macrorregião"
            loading={grf06.loading} error={grf06.error} refetch={grf06.refetch}>
            {grf06.data && <ChartScatterPfPj data={grf06.data} />}
          </ChartCard>
        </div>



        {/* ── Gráficos: linha 3 ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── GRF-05 Heatmap  ──────────────────────────────────── */}
          <ChartCard title="Heatmap de Inadimplência Estadual" description="Matriz UF × Mês — últimos 24 meses (verde=baixa, vermelho=alta)"
            loading={grf05.loading} error={grf05.error} refetch={grf05.refetch} >
            {grf05.data && <ChartHeatmapEstados data={grf05.data} />}
          </ChartCard>

          <ChartCard title="Score IOI — Ranking de Oportunidade" description="Índice de Oportunidade Inclusiva por estado (0–10)"
            loading={grf08.loading} error={grf08.error} refetch={grf08.refetch}>
            {grf08.data && <ChartScoreOportunidade data={grf08.data} />}
          </ChartCard>
        </div>

        {/* ── GRF-09 Monte Carlo (largura total) ──────────────────────────────── */}
        <ChartCard title="Simulação Monte Carlo" description="Distribuição de perdas projetadas — VaR 95% e 99%"
          loading={grf09.loading} error={grf09.error} refetch={grf09.refetch} colSpan={2}>
          {grf09.data && <ChartMonteCarlo data={grf09.data} />}
        </ChartCard>

      </div>
    </div>
  );
}

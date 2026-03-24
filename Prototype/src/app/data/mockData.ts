// Dados mockados para o sistema de crédito inclusivo

export interface RegionData {
  id: string;
  name: string;
  state: string;
  score: number;
  population: number;
  bancarizacao: number;
  inadimplencia: number;
  rendaMedia: number;
  potencialCredito: number;
  coordinates: [number, number];
}

export interface TimeSeriesData {
  month: string;
  concessoes: number;
  inadimplencia: number;
  ticket_medio: number;
  state: string; // Adicionado identificador de estado
}

export const regionsData: RegionData[] = [
  {
    id: "SP-1",
    name: "São Paulo - Zona Leste",
    state: "SP",
    score: 92.5,
    population: 4200000,
    bancarizacao: 68.5,
    inadimplencia: 3.2,
    rendaMedia: 2850,
    potencialCredito: 1250000000,
    coordinates: [-23.55, -46.63],
  },
  {
    id: "RJ-1",
    name: "Rio de Janeiro - Zona Norte",
    state: "RJ",
    score: 88.3,
    population: 2800000,
    bancarizacao: 65.2,
    inadimplencia: 4.1,
    rendaMedia: 2650,
    potencialCredito: 980000000,
    coordinates: [-22.91, -43.17],
  },
  {
    id: "MG-1",
    name: "Belo Horizonte - Região Metropolitana",
    state: "MG",
    score: 85.7,
    population: 2500000,
    bancarizacao: 62.8,
    inadimplencia: 3.8,
    rendaMedia: 2420,
    potencialCredito: 780000000,
    coordinates: [-19.92, -43.93],
  },
  {
    id: "BA-1",
    name: "Salvador - Subúrbio Ferroviário",
    state: "BA",
    score: 82.1,
    population: 1900000,
    bancarizacao: 58.3,
    inadimplencia: 4.5,
    rendaMedia: 2180,
    potencialCredito: 620000000,
    coordinates: [-12.97, -38.51],
  },
  {
    id: "PE-1",
    name: "Recife - Região Metropolitana",
    state: "PE",
    score: 79.8,
    population: 1750000,
    bancarizacao: 56.7,
    inadimplencia: 4.8,
    rendaMedia: 2050,
    potencialCredito: 540000000,
    coordinates: [-8.05, -34.88],
  },
  {
    id: "CE-1",
    name: "Fortaleza - Periferia",
    state: "CE",
    score: 77.4,
    population: 1680000,
    bancarizacao: 54.2,
    inadimplencia: 5.1,
    rendaMedia: 1920,
    potencialCredito: 485000000,
    coordinates: [-3.73, -38.52],
  },
  {
    id: "PR-1",
    name: "Curitiba - Região Sul",
    state: "PR",
    score: 86.9,
    population: 1950000,
    bancarizacao: 70.5,
    inadimplencia: 3.5,
    rendaMedia: 3100,
    potencialCredito: 720000000,
    coordinates: [-25.42, -49.27],
  },
  {
    id: "RS-1",
    name: "Porto Alegre - Zona Norte",
    state: "RS",
    score: 84.2,
    population: 1480000,
    bancarizacao: 68.9,
    inadimplencia: 3.9,
    rendaMedia: 2890,
    potencialCredito: 650000000,
    coordinates: [-30.03, -51.23],
  },
  {
    id: "PA-1",
    name: "Belém - Região Metropolitana",
    state: "PA",
    score: 73.6,
    population: 1420000,
    bancarizacao: 48.5,
    inadimplencia: 6.2,
    rendaMedia: 1750,
    potencialCredito: 380000000,
    coordinates: [-1.45, -48.48],
  },
  {
    id: "GO-1",
    name: "Goiânia - Região Sudoeste",
    state: "GO",
    score: 80.5,
    population: 1350000,
    bancarizacao: 59.8,
    inadimplencia: 4.3,
    rendaMedia: 2350,
    potencialCredito: 495000000,
    coordinates: [-16.68, -49.25],
  },
];

const baseMonths = ["Jan/25", "Fev/25", "Mar/25", "Abr/25", "Mai/25", "Jun/25", "Jul/25", "Ago/25", "Set/25", "Out/25", "Nov/25", "Dez/25", "Jan/26", "Fev/26", "Mar/26"];

export const timeSeriesData: TimeSeriesData[] = [
  ...baseMonths.map((m, i) => ({
    month: m,
    state: "all",
    concessoes: 18500 + (i * 800),
    inadimplencia: 3.8 - (i * 0.05),
    ticket_medio: 2850 + (i * 50)
  })),
  ...regionsData.flatMap(region => 
    baseMonths.map((m, i) => ({
      month: m,
      state: region.state,
      concessoes: Math.round((18500 + (i * 800)) * (region.population / 20000000)),
      inadimplencia: Number((region.inadimplencia - (i * 0.02)).toFixed(1)),
      ticket_medio: Math.round(region.rendaMedia * (1 + (i * 0.01)))
    }))
  )
];

export const stateCoordinates: Record<string, { x: number; y: number; name: string }> = {
  AC: { x: 100, y: 380, name: "Acre" },
  AL: { x: 620, y: 380, name: "Alagoas" },
  AM: { x: 180, y: 320, name: "Amazonas" },
  AP: { x: 340, y: 240, name: "Amapá" },
  BA: { x: 560, y: 450, name: "Bahia" },
  CE: { x: 600, y: 320, name: "Ceará" },
  DF: { x: 480, y: 520, name: "Distrito Federal" },
  ES: { x: 580, y: 580, name: "Espírito Santo" },
  GO: { x: 460, y: 520, name: "Goiás" },
  MA: { x: 500, y: 320, name: "Maranhão" },
  MG: { x: 520, y: 580, name: "Minas Gerais" },
  MS: { x: 380, y: 580, name: "Mato Grosso do Sul" },
  MT: { x: 360, y: 480, name: "Mato Grosso" },
  PA: { x: 360, y: 320, name: "Pará" },
  PB: { x: 620, y: 340, name: "Paraíba" },
  PE: { x: 620, y: 360, name: "Pernambuco" },
  PI: { x: 540, y: 360, name: "Piauí" },
  PR: { x: 420, y: 680, name: "Paraná" },
  RJ: { x: 560, y: 620, name: "Rio de Janeiro" },
  RN: { x: 620, y: 320, name: "Rio Grande do Norte" },
  RO: { x: 200, y: 420, name: "Rondônia" },
  RR: { x: 240, y: 240, name: "Roraima" },
  RS: { x: 400, y: 740, name: "Rio Grande do Sul" },
  SC: { x: 440, y: 700, name: "Santa Catarina" },
  SE: { x: 620, y: 400, name: "Sergipe" },
  SP: { x: 480, y: 640, name: "São Paulo" },
  TO: { x: 480, y: 400, name: "Tocantins" },
};

export const kpiData = {
  totalPotencial: 7900000000,
  regioesMapeadas: 127,
  crescimentoMensal: 8.5,
  ticketMedioNacional: 3250,
};

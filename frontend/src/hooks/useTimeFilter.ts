import { useState, useMemo } from "react";

export type TimePeriod = "1m" | "3m" | "6m" | "1y" | "3y" | "5y" | "all";

export function useTimeFilter(initialPeriod: TimePeriod = "1y") {
  const [period, setPeriod] = useState<TimePeriod>(initialPeriod);

  // calcula dinamicamente as datas de início e fim sempre que o período muda
  const dateRange = useMemo(() => {
    const end = new Date();
    const start = new Date();

    switch (period) {
      case "1m":
        start.setMonth(start.getMonth() - 1);
        break;
      case "3m":
        start.setMonth(start.getMonth() - 3);
        break;
      case "6m":
        start.setMonth(start.getMonth() - 6);
        break;
      case "1y":
        start.setFullYear(start.getFullYear() - 1);
        break;
      case "3y":
        start.setFullYear(start.getFullYear() - 3);
        break;
      case "5y":
        start.setFullYear(start.getFullYear() - 5);
        break;
      case "all":
        start.setFullYear(2000); // define a data base do projeto BCB
        break;
    }

    // formatação YYYY-MM-DD para o backend consumir diretamente
    return {
      start_date: start.toISOString().split("T")[0],
      end_date: end.toISOString().split("T")[0],
    };
  }, [period]);

  return {
    period,
    setPeriod,
    start_date: dateRange.start_date,
    end_date: dateRange.end_date,
  };
}
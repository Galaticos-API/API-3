import { useState, useEffect, useCallback, useRef } from "react";

interface UseGraficoState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook genérico para buscar dados de qualquer endpoint da API.
 * Gerencia estados de loading, erro e dados. Re-executa quando `deps` muda.
 */
export function useGrafico<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
): UseGraficoState<T> {
  const [data, setData]       = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const counter               = useRef(0);

  const fetch = useCallback(async () => {
    const id = ++counter.current;
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (id === counter.current) {
        setData(result);
      }
    } catch (err) {
      if (id === counter.current) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      }
    } finally {
      if (id === counter.current) {
        setLoading(false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

import { useState, useEffect } from "react";
import { Database, Play, Trash2, RefreshCw, AlertCircle, CheckCircle2, ShieldAlert, Loader2 } from "lucide-react";
import { api, BASE } from "../services/api";

export function Admin() {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  const [etlStatus, setEtlStatus] = useState<any>(null);
  const [etlProgress, setEtlProgress] = useState<{ atual: number, total: number, mensagem: string } | null>(null);

  const fetchEtlStatus = async () => {
    try {
      const res = await api.etl.status();
      setEtlStatus(res);
    } catch (error: any) {
      console.error(error);
      setEtlStatus({ status: 'error', message: error.message });
    }
  };

  useEffect(() => {
    fetchEtlStatus();
  }, []);

  const handleCreateDB = async () => {
    if (!confirm("Tem certeza que deseja recriar o banco de dados? Isso pode sobrescrever dados existentes.")) return;
    setLoading("create");
    setMessage({ type: 'info', text: 'Criando banco de dados...' });
    try {
      const res = await api.database.create();
      setMessage({ type: 'success', text: res.message || 'Banco criado com sucesso!' });
      fetchEtlStatus();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao criar banco de dados.' });
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteDB = async () => {
    if (!confirm("ATENÇÃO: Você está prestes a DELETAR o banco de dados inteiro. Esta ação não pode ser desfeita. Continuar?")) return;
    setLoading("delete");
    setMessage({ type: 'info', text: 'Deletando banco de dados...' });
    try {
      const res = await api.database.delete();
      setMessage({ type: 'success', text: res.message || 'Banco deletado com sucesso!' });
      fetchEtlStatus();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao deletar banco de dados.' });
    } finally {
      setLoading(null);
    }
  };

  const handleRunETL = async () => {
    setLoading("etl");
    setEtlProgress({ atual: 0, total: 1, mensagem: 'Iniciando conexão...' });
    setMessage({ type: 'info', text: 'Executando pipeline ETL... Isso pode demorar alguns minutos.' });
    
    try {
      const response = await fetch(`${BASE}/etl/stream`);
      
      if (!response.body) throw new Error('Não foi possível ler o stream do servidor.');
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            
            if (data.tipo === 'progresso') {
              setEtlProgress({ atual: data.atual, total: data.total, mensagem: data.mensagem });
            } else if (data.tipo === 'info' || data.tipo === 'log') {
              setEtlProgress(prev => prev ? { ...prev, mensagem: data.mensagem } : { atual: 0, total: 1, mensagem: data.mensagem });
            } else if (data.tipo === 'concluido') {
              setEtlProgress(prev => prev ? { ...prev, mensagem: data.mensagem, atual: prev.total } : null);
            }
          } catch (e) {
            console.error("Erro ao parsear JSON do stream:", e);
          }
        }
      }

      setMessage({ type: 'success', text: 'ETL executado com sucesso!' });
      fetchEtlStatus();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao executar ETL.' });
    } finally {
      setLoading(null);
      // Mantém o progresso finalizado visível por alguns segundos
      setTimeout(() => setEtlProgress(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-vocedm-navy">Administração do Sistema</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie o banco de dados e a ingestão de dados do Mapa de Crédito Inclusivo.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-start gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
          message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
          'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> :
           message.type === 'error' ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> :
           <RefreshCw className="w-5 h-5 flex-shrink-0 animate-spin" />}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Banco de Dados Card */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-vocedm-navy">Banco de Dados</h2>
              <p className="text-xs text-muted-foreground">Gerenciar estrutura local SQLite</p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleCreateDB}
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-2 bg-vocedm-navy hover:bg-vocedm-navy/90 text-white py-3 rounded-xl transition-all font-medium text-sm disabled:opacity-50"
            >
              <Database className="w-4 h-4" />
              {loading === "create" ? "Criando..." : "Inicializar / Criar Banco de Dados"}
            </button>
            <button
              onClick={handleDeleteDB}
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-2 bg-white border border-red-200 hover:bg-red-50 text-red-600 py-3 rounded-xl transition-all font-medium text-sm disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {loading === "delete" ? "Deletando..." : "Deletar Banco de Dados"}
            </button>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-2">
            <ShieldAlert className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-700 leading-relaxed">
              <strong>Aviso:</strong> Deletar o banco apaga todas as tabelas e dados cacheados. É necessário recriar e rodar o ETL para restaurar.
            </p>
          </div>
        </div>

        {/* Pipeline ETL Card */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-vocedm-navy">Pipeline ETL</h2>
                <p className="text-xs text-muted-foreground">Atualizar dados do BCB/IBGE</p>
              </div>
            </div>
            <button 
              onClick={fetchEtlStatus}
              className="p-2 text-muted-foreground hover:bg-gray-100 rounded-lg transition-colors"
              title="Atualizar status"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleRunETL}
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-2 bg-vocedm-teal hover:bg-[#6edcd9] text-vocedm-blue py-3 rounded-xl transition-all font-bold text-sm disabled:opacity-50"
            >
              {loading === "etl" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {loading === "etl" ? "Executando ETL..." : "Executar Ingestão de Dados"}
            </button>

            {etlProgress && (
              <div className="mt-4 p-4 border border-vocedm-teal bg-vocedm-teal/10 rounded-xl space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-vocedm-navy">Progresso do ETL</span>
                  <span className="text-vocedm-blue font-bold">
                    {etlProgress.atual} / {etlProgress.total}
                  </span>
                </div>
                <div className="w-full bg-white rounded-full h-2.5 shadow-inner">
                  <div 
                    className="bg-vocedm-teal h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.max(5, (etlProgress.atual / etlProgress.total) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground animate-pulse">
                  {etlProgress.mensagem}
                </p>
              </div>
            )}

            <div className="mt-6 border border-border rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold text-vocedm-navy">Status do Banco e ETL</h3>
              </div>
              <div className="p-4">
                {etlStatus ? (
                  etlStatus.status === "error" ? (
                    <p className="text-sm text-red-600">{etlStatus.message || "Erro ao conectar."}</p>
                  ) : etlStatus.status === "ok" ? (
                    <div className="space-y-3">
                      {etlStatus.categorias.map((cat: any, i: number) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                          <span className="font-medium text-gray-700 capitalize">{cat.categoria}</span>
                          <div className="text-right">
                            <span className="block text-xs text-muted-foreground">
                              {new Date(cat.ultima_ingestao).toLocaleString()}
                            </span>
                            <span className="block text-[10px] text-gray-400">
                              {cat.total_registros} registros
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Banco criado, mas não há dados (ETL não executado).</p>
                  )
                ) : (
                  <p className="text-sm text-muted-foreground">Carregando status...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

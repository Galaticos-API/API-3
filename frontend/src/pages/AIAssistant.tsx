import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Brain, Send, Database, LineChart, MapPin, Activity } from "lucide-react";
import { api } from "../services/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface SuggestedQuestion {
  id: string;
  question: string;
  icon: React.ElementType;
}

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Olá! Sou o assistente de IA especializado em dados de crédito inclusivo. Tenho acesso ao banco de dados e posso ajudá-lo a consultar estados, listar o catálogo de indicadores e analisar o histórico de séries temporais. Como posso ajudar hoje?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [dbStatus, setDbStatus] = useState({ ufs: 0, loading: true });
  const [llmStatus, setLlmStatus] = useState({ model: "Carregando...", provider: "...", loading: true });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions: SuggestedQuestion[] = [
    {
      id: "1",
      question: "Quais são os indicadores disponíveis sobre inadimplência?",
      icon: Database,
    },
    {
      id: "2",
      question: "Consulte o histórico de inadimplência PJ de São Paulo.",
      icon: LineChart,
    },
    {
      id: "3",
      question: "Quais estados do Brasil estão disponíveis na base?",
      icon: MapPin,
    },
    {
      id: "4",
      question: "Mostre os dados da série temporal de saldo de crédito PF.",
      icon: Activity,
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const ufs = await api.ufs.listar();
        setDbStatus({ ufs: ufs.length, loading: false });
      } catch (err) {
        setDbStatus({ ufs: 0, loading: false });
      }
      
      try {
        const llmInfo = await api.llm.status();
        setLlmStatus({ model: llmInfo.model, provider: llmInfo.provider, loading: false });
      } catch (err) {
        setLlmStatus({ model: "Desconhecido", provider: "Desconhecido", loading: false });
      }
    }
    fetchStatus();
  }, []);

  const handleSendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // Formata o histórico pro formato que a API espera (excluindo a mensagem atual)
      const historyToSend = messages
        .filter(m => m.id !== "1") // Ignora a mensagem inicial de boas vindas
        .map(m => ({ role: m.role, content: m.content }));

      const data = await api.llm.chat(messageText, historyToSend);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "Desculpe, não consegui gerar uma resposta.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Erro ao chamar LLM:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Desculpe, ocorreu um erro de conexão com o assistente inteligente. Tente novamente mais tarde.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Assistente de IA</h2>
          <p className="text-gray-500 mt-1">
            {llmStatus.loading ? "Carregando informações do modelo..." : `Integração ${llmStatus.model} com o banco de dados via chamadas de ferramentas`}
          </p>
        </div>
        {llmStatus.loading ? (
          <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-200 shadow-sm">
            <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-yellow-700">Conectando...</span>
          </div>
        ) : llmStatus.model !== "Desconhecido" ? (
          <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg border border-green-200 shadow-sm">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <span className="text-sm font-semibold text-green-700">Modelo Online</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-lg border border-red-200 shadow-sm">
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
            <span className="text-sm font-semibold text-red-700">Offline</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Interface */}
        <Card className="lg:col-span-3 flex flex-col min-h-[500px] lg:h-[calc(100vh-280px)]">
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>Agente de Dados</CardTitle>
                <CardDescription>
                  {llmStatus.loading ? "..." : `${llmStatus.model} (${llmStatus.provider}) com RAG / Tools`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900 border border-gray-200"
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                  <div
                    className={`text-xs mt-2 ${message.role === "user" ? "text-blue-100" : "text-gray-500"}`}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 border border-gray-200 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                    <span className="text-sm text-gray-600">Analisando dados...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </CardContent>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Digite sua pergunta sobre crédito inclusivo, regiões ou indicadores..."
                className="min-h-[60px] resize-none"
                disabled={isTyping}
              />
              <Button onClick={() => handleSendMessage()} disabled={!input.trim() || isTyping} size="lg" className="px-6">
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Pressione Enter para enviar, Shift+Enter para nova linha</p>
          </div>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Perguntas Sugeridas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Perguntas Sugeridas</CardTitle>
              <CardDescription>Clique para fazer uma pergunta rápida</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {suggestedQuestions.map((sq) => {
                const Icon = sq.icon;
                return (
                  <button
                    key={sq.id}
                    onClick={() => handleSuggestedQuestion(sq.question)}
                    disabled={isTyping}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-start gap-2">
                      <Icon className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{sq.question}</span>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Capacidades */}
          <Card className="border-t-4 border-t-purple-500 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Capacidades Reais da IA</CardTitle>
              <CardDescription>As ferramentas que o modelo utiliza</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 p-2 rounded-md mt-0.5">
                  <MapPin className="w-4 h-4 text-purple-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Consultar UFs</p>
                  <p className="text-xs text-gray-500">Mapeia os estados do Brasil e regiões</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-md mt-0.5">
                  <Database className="w-4 h-4 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Catálogo de Séries</p>
                  <p className="text-xs text-gray-500">Lista indicadores e seus identificadores únicos</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-md mt-0.5">
                  <LineChart className="w-4 h-4 text-green-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Histórico Temporal</p>
                  <p className="text-xs text-gray-500">Analisa a evolução dos dados filtrados por data</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card className="border-t-4 border-t-indigo-500 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Integração de Dados</CardTitle>
              <CardDescription>Status das conexões</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 font-medium">Estados Mapeados</span>
                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">
                  {dbStatus.loading ? "..." : dbStatus.ufs} UFs
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 font-medium">Banco de Dados</span>
                <Badge variant="secondary" className="bg-green-50 text-green-700">SQLite</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 font-medium">Provedor LLM</span>
                <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                  {llmStatus.loading ? "..." : llmStatus.provider}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

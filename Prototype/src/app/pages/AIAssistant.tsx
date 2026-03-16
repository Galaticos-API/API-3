import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Brain, Send, Sparkles, TrendingUp, MapPin, AlertCircle, CheckCircle } from "lucide-react";
import { regionsData, kpiData } from "../data/mockData";

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
        "Olá! Sou o assistente de IA do Mapa de Oportunidades. Posso ajudá-lo a analisar dados de crédito inclusivo, identificar regiões promissoras, interpretar indicadores e gerar insights estratégicos. Como posso ajudar hoje?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions: SuggestedQuestion[] = [
    {
      id: "1",
      question: "Quais são as 3 regiões com maior potencial de crédito?",
      icon: TrendingUp,
    },
    {
      id: "2",
      question: "Qual região tem a menor taxa de inadimplência?",
      icon: CheckCircle,
    },
    {
      id: "3",
      question: "Como está a evolução do ticket médio?",
      icon: Sparkles,
    },
    {
      id: "4",
      question: "Quais fatores influenciam o score de oportunidade?",
      icon: AlertCircle,
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = (userQuestion: string): string => {
    const lowerQuestion = userQuestion.toLowerCase();

    // Análise de regiões com maior potencial
    if (lowerQuestion.includes("maior potencial") || lowerQuestion.includes("melhores regiões") || lowerQuestion.includes("top")) {
      const top3 = regionsData.sort((a, b) => b.score - a.score).slice(0, 3);
      return `Com base na análise dos dados atuais, as 3 regiões com maior potencial de crédito são:

1. **${top3[0].name}** (Score: ${top3[0].score.toFixed(1)})
   - Potencial de crédito: R$ ${(top3[0].potencialCredito / 1000000).toFixed(0)}M
   - Taxa de bancarização: ${top3[0].bancarizacao}%
   - Inadimplência: ${top3[0].inadimplencia}%

2. **${top3[1].name}** (Score: ${top3[1].score.toFixed(1)})
   - Potencial de crédito: R$ ${(top3[1].potencialCredito / 1000000).toFixed(0)}M
   - Taxa de bancarização: ${top3[1].bancarizacao}%
   - Inadimplência: ${top3[1].inadimplencia}%

3. **${top3[2].name}** (Score: ${top3[2].score.toFixed(1)})
   - Potencial de crédito: R$ ${(top3[2].potencialCredito / 1000000).toFixed(0)}M
   - Taxa de bancarização: ${top3[2].bancarizacao}%
   - Inadimplência: ${top3[2].inadimplencia}%

Essas regiões apresentam excelente combinação de alto potencial de mercado, boa bancarização e taxas de inadimplência controladas, tornando-as ideais para expansão sustentável.`;
    }

    // Análise de inadimplência
    if (lowerQuestion.includes("inadimpl") || lowerQuestion.includes("menor risco")) {
      const lowest = regionsData.reduce((prev, curr) => (curr.inadimplencia < prev.inadimplencia ? curr : prev));
      return `A região com a **menor taxa de inadimplência** é:

**${lowest.name}** - ${lowest.inadimplencia}%

Esta região se destaca por:
- Score de oportunidade de ${lowest.score.toFixed(1)} pontos
- Taxa de bancarização de ${lowest.bancarizacao}%
- População de ${(lowest.population / 1000000).toFixed(1)}M habitantes
- Renda média de R$ ${lowest.rendaMedia.toFixed(0)}

A baixa inadimplência indica um mercado maduro e com bom perfil de crédito, sendo uma excelente opção para operações de menor risco.`;
    }

    // Evolução do ticket médio
    if (lowerQuestion.includes("ticket") || lowerQuestion.includes("evolução") || lowerQuestion.includes("crescimento")) {
      return `A **evolução do ticket médio** apresenta tendência positiva consistente:

📊 **Dados Atuais:**
- Ticket médio nacional: R$ ${kpiData.ticketMedioNacional.toFixed(0)}
- Crescimento mensal: +${kpiData.crescimentoMensal}%
- Crescimento trimestral: +4.2%

📈 **Análise de Tendência:**
Nos últimos 12 meses, observamos crescimento gradual do ticket médio, partindo de R$ 2.850 em Jan/25 para R$ 3.580 em Fev/26. Isso indica:

1. Maior capacidade de crédito da população
2. Melhora nas condições econômicas regionais
3. Amadurecimento do mercado de crédito inclusivo
4. Confiança crescente nas operações

💡 **Recomendação:** Este crescimento sustentado sugere oportunidade para produtos de crédito de maior valor agregado, especialmente nas regiões com score acima de 85 pontos.`;
    }

    // Fatores de influência
    if (lowerQuestion.includes("fator") || lowerQuestion.includes("influenc") || lowerQuestion.includes("score") || lowerQuestion.includes("como")) {
      return `O **score de oportunidade** é calculado com base em diversos fatores ponderados:

🎯 **Principais Fatores:**

1. **Taxa de Bancarização (peso: 30%)**
   - Indica a penetração de serviços financeiros
   - Maior bancarização = maior familiaridade com crédito

2. **Taxa de Inadimplência (peso: 25%)**
   - Avalia o risco de crédito da região
   - Menor inadimplência = melhor score

3. **Renda Média (peso: 20%)**
   - Capacidade de pagamento da população
   - Fundamental para sustentabilidade das operações

4. **Densidade Populacional (peso: 15%)**
   - Escala de mercado potencial
   - Maior população = maior volume de operações

5. **Potencial de Crédito (peso: 10%)**
   - Volume financeiro disponível
   - Baseado em demanda reprimida e capacidade econômica

📊 **Exemplo Prático:**
Uma região com 70% de bancarização, 3% de inadimplência, renda média de R$ 3.000 e 2M de habitantes tende a ter score acima de 85 pontos, indicando excelente oportunidade de expansão.`;
    }

    // Resposta padrão
    return `Entendo sua pergunta sobre "${userQuestion}". 

Com base nos dados do sistema, posso fornecer as seguintes informações:

📊 **Visão Geral do Sistema:**
- Total de regiões mapeadas: ${kpiData.regioesMapeadas}
- Potencial total de crédito: R$ ${(kpiData.totalPotencial / 1000000000).toFixed(1)}B
- Taxa de crescimento mensal: ${kpiData.crescimentoMensal}%

Para análises mais específicas, você pode perguntar sobre:
- Rankings regionais e scores de oportunidade
- Indicadores de risco e inadimplência
- Evolução temporal de métricas
- Comparações entre regiões

Como posso ajudar com mais detalhes?`;
  };

  const handleSendMessage = (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    // Adiciona mensagem do usuário
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simula tempo de processamento da IA
    setTimeout(() => {
      const response = generateResponse(messageText);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
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
          <p className="text-gray-500 mt-1">Análise inteligente de dados e geração de insights</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-700">IA Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Interface */}
        <Card className="lg:col-span-3 flex flex-col h-[calc(100vh-280px)]">
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>Assistente Inteligente</CardTitle>
                <CardDescription>Baseado em GPT-4 com dados do sistema</CardDescription>
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
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Capacidades da IA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Análise Preditiva</p>
                  <p className="text-xs text-gray-600">Identifica tendências e padrões</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Insights Regionais</p>
                  <p className="text-xs text-gray-600">Compara e ranqueia territórios</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Recomendações</p>
                  <p className="text-xs text-gray-600">Sugere estratégias de expansão</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Brain className="w-4 h-4 text-indigo-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Linguagem Natural</p>
                  <p className="text-xs text-gray-600">Explica conceitos complexos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dados Conectados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Regiões</span>
                <Badge variant="secondary">{kpiData.regioesMapeadas}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Séries Temporais</span>
                <Badge variant="secondary">15 meses</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Indicadores</span>
                <Badge variant="secondary">8 métricas</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

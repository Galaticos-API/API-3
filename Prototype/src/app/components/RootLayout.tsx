import { Outlet, Link, useLocation } from "react-router";
import { BarChart3, Activity, Brain, MapPin } from "lucide-react";
import { cn } from "./ui/utils";

export function RootLayout() {
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: BarChart3 },
    { name: "Simulação Monte Carlo", href: "/simulacao", icon: Activity },
    { name: "Assistente IA", href: "/assistente", icon: Brain },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#0b1120" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5"
        style={{ background: "linear-gradient(90deg, #1a237e, #3949ab 50%, #5c6bc0)" }}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #f97316, #fb923c)" }}>
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-white text-base leading-tight">Mapa de Oportunidades</h1>
                <p className="text-xs text-white/70">Crédito Inclusivo Sustentável</p>
              </div>
            </div>
            <div className="text-right border border-white/20 rounded-lg px-3 py-1.5">
              <p className="text-xs text-white/70">Última atualização</p>
              <p className="text-sm font-semibold text-white">16 Mar 2026</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 flex-shrink-0 min-h-[calc(100vh-65px)] sticky top-[65px] border-r border-white/5 flex flex-col py-3"
          style={{ background: "#0d1526" }}>
          <nav className="px-2 space-y-0.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-sm font-medium",
                    isActive
                      ? "bg-blue-500 text-white"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar card */}
          <div className="mx-3 mt-auto mb-2 rounded-xl p-4 border border-blue-500/20"
            style={{ background: "linear-gradient(135deg, #1e3a5f, rgba(37,99,235,0.2))" }}>
            <h3 className="font-bold text-white text-xs mb-1">Sistema de Inteligência</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Análise preditiva para expansão sustentável de crédito inclusivo
            </p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6" style={{ background: "#0b1120" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
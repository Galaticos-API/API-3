import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router";
import { BarChart3, Activity, Brain, MapPin, Menu, X } from "lucide-react";
import { cn } from "./ui/utils";

export function RootLayout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/", icon: BarChart3 },
    { name: "Simulação Monte Carlo", href: "/simulacao", icon: Activity },
    { name: "Assistente IA", href: "/assistente", icon: Brain },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-vocedm-blue">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className="md:hidden p-1.5 -ml-1.5 text-white hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-vocedm-teal">
                <MapPin className="w-5 h-5 text-vocedm-blue" />
              </div>
              <div>
                <h1 className="font-bold text-white text-base leading-tight">Mapa de Oportunidades</h1>
                <p className="text-xs text-white/70">Crédito Inclusivo Sustentável</p>
              </div>
            </div>
            <div className="text-right border border-white/20 rounded-lg px-3 py-1.5 hidden md:block">
              <p className="text-xs text-white/70">Última atualização</p>
              <p className="text-sm font-semibold text-white">16 Mar 2026</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Mobile Menu Backdrop */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-vocedm-navy/40 z-40 md:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "w-56 flex-shrink-0 border-r border-border flex flex-col py-3 bg-[#F1EFFF]",
            "fixed top-[73px] bottom-0 left-0 z-40 transition-transform duration-300",
            isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
          )}
        >
          <nav className="px-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-3 rounded-xl transition-all text-sm font-bold",
                    isActive
                      ? "bg-vocedm-teal text-vocedm-blue"
                      : "text-vocedm-navy hover:bg-white"
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar card */}
          <div className="mx-4 mt-auto mb-2 rounded-xl p-4 border border-vocedm-salmon bg-white">
            <h3 className="font-bold text-vocedm-navy text-xs mb-1">Sistema de Inteligência</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Análise preditiva para expansão sustentável de crédito inclusivo
            </p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 bg-white overflow-hidden md:ml-56 min-h-[calc(100vh-73px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
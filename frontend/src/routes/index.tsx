import { createBrowserRouter } from "react-router";
import { Login } from "../pages/Login";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { RootLayout } from "../components/RootLayout";
import { Dashboard } from "../pages/Dashboard";
import { MonteCarloSimulation } from "../pages/MonteCarloSimulation";
import { AIAssistant } from "../pages/AIAssistant";

export const router = createBrowserRouter([
  // ── Rota pública ───────────────────────────────────
  {
    path: "/login",
    Component: Login,
  },

  // ── Rotas protegidas — exigem token no sessionStorage ──
  {
    Component: ProtectedRoute,
    children: [
      {
        Component: RootLayout,
        children: [
          { index: true,              Component: Dashboard           },
          { path: "simulacao",        Component: MonteCarloSimulation },
          { path: "assistente",       Component: AIAssistant          },
        ],
      },
    ],
  },
]);
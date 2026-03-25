import { createBrowserRouter } from "react-router";
import { Login } from "./pages/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RootLayout } from "./components/RootLayout";
import { Dashboard } from "./pages/Dashboard";
import { MonteCarloSimulation } from "./pages/MonteCarloSimulation";
import { AIAssistant } from "./pages/AIAssistant";

const TOKEN_KEY = "dm_token";
const USER_KEY = "dm_user";
const token = "dm_fake_jwt_token_sprint1"
const user = { id: "usr_001", name: "Usuário DM", email: "dm", role: "analyst" }
sessionStorage.setItem(TOKEN_KEY, token);
sessionStorage.setItem(USER_KEY, JSON.stringify(user));

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
          { index: true, Component: Dashboard },
          { path: "simulacao", Component: MonteCarloSimulation },
          { path: "assistente", Component: AIAssistant },
        ],
      },
    ],
  },
]);
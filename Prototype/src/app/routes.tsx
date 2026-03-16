import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { Dashboard } from "./pages/Dashboard";
import { MonteCarloSimulation } from "./pages/MonteCarloSimulation";
import { AIAssistant } from "./pages/AIAssistant";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "simulacao", Component: MonteCarloSimulation },
      { path: "assistente", Component: AIAssistant },
    ],
  },
]);

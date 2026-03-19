import { Navigate, Outlet } from "react-router";

const TOKEN_KEY = "dm_token";

/**
 * Protege rotas filhas verificando a existência do token de sessão.
 *
 * Uso em routes.tsx:
 * {
 *   Component: ProtectedRoute,
 *   children: [
 *     { index: true, Component: RootLayout, children: [...] }
 *   ]
 * }
 *
 * Na Sprint 2, substituir a checagem do sessionStorage por validação
 * real do JWT via chamada ao backend Node.js.
 */
export function ProtectedRoute() {
  const token = sessionStorage.getItem(TOKEN_KEY);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Eye, EyeOff, Loader2,
  MapPin, TrendingUp, Shield, Brain,
  AlertCircle,
} from "lucide-react";
import { cn } from "../components/ui/utils";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG — troque pelo endpoint real na Sprint 2
// ─────────────────────────────────────────────────────────────────────────────
const AUTH_ENDPOINT = import.meta.env.VITE_AUTH_ENDPOINT ?? "/api/auth/login";
const TOKEN_KEY = "dm_token";
const USER_KEY = "dm_user";
const DEMO_EMAIL = "dm";
const DEMO_PASSWORD = "dm";

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL AUTH STORE  (Observer leve — sem biblioteca externa)
// ─────────────────────────────────────────────────────────────────────────────
interface AuthUser { id: string; name: string; email: string; role: string }
interface AuthState { isAuthenticated: boolean; token: string | null; user: AuthUser | null }

const AuthStore = (() => {
  let _state: AuthState = { isAuthenticated: false, token: null, user: null };
  const _subs = new Set<(s: AuthState) => void>();

  // Restaura sessão existente
  const saved = sessionStorage.getItem(TOKEN_KEY);
  if (saved) {
    try {
      _state = {
        isAuthenticated: true,
        token: saved,
        user: JSON.parse(sessionStorage.getItem(USER_KEY) ?? "null"),
      };
    } catch { /* ignora */ }
  }

  return {
    getState: () => ({ ..._state }),
    subscribe(fn: (s: AuthState) => void) {
      _subs.add(fn);
      return () => _subs.delete(fn);
    },
    login(token: string, user: AuthUser) {
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
      _state = { isAuthenticated: true, token, user };
      _subs.forEach(fn => fn(_state));
    },
    logout() {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
      _state = { isAuthenticated: false, token: null, user: null };
      _subs.forEach(fn => fn(_state));
    },
  };
})();

export { AuthStore };

// ─────────────────────────────────────────────────────────────────────────────
// API REQUEST  — mock Sprint 1 / fetch real Sprint 2
// ─────────────────────────────────────────────────────────────────────────────
async function authRequest(
  email: string,
  password: string,
): Promise<{ token: string; user: AuthUser }> {
  // ── MODO DEMO (Sprint 1) ──────────────────────────────────────────────────
  await new Promise(r => setTimeout(r, 1400));
  if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
    return {
      token: "dm_fake_jwt_token_sprint1",
      user: { id: "usr_001", name: "Usuário DM", email, role: "analyst" },
    };
  }
  throw new Error("E-mail ou senha inválidos.");

  // ── PRODUÇÃO (Sprint 2) — descomente ───────────────────────────────────────
  // const res = await fetch(AUTH_ENDPOINT, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   credentials: "include",
  //   body: JSON.stringify({ email, password }),
  // });
  // if (!res.ok) {
  //   const err = await res.json().catch(() => ({}));
  //   throw new Error(err.message ?? `Erro ${res.status}`);
  // }
  // return res.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE CARDS — painel esquerdo
// ─────────────────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: MapPin,
    label: "Mapa de Oportunidades",
    desc: "Identifique territórios com potencial de expansão de crédito.",
    accent: "#22c55e",          // green  (igual card dashboard)
  },
  {
    icon: TrendingUp,
    label: "Análise Monte Carlo",
    desc: "Simule cenários de risco e projete inadimplência futura.",
    accent: "#3b82f6",          // blue
  },
  {
    icon: Brain,
    label: "Assistente de IA",
    desc: "Insights em linguagem natural sobre qualquer região.",
    accent: "#a855f7",          // purple
  },
  {
    icon: Shield,
    label: "Dados do Banco Central",
    desc: "Indicadores reais de concessão, endividamento e risco regional.",
    accent: "#f97316",          // orange
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errEmail, setErrEmail] = useState("");
  const [errPwd, setErrPwd] = useState("");
  const [errGen, setErrGen] = useState("");

  function clearErrors() { setErrEmail(""); setErrPwd(""); setErrGen(""); }

  function validate() {
    let ok = true;
    if (!email.trim()) {
      setErrEmail("E-mail é obrigatório."); ok = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email !== DEMO_EMAIL) {
      // aceita "dm" em demo; em produção remova a exceção
      setErrEmail("Informe um e-mail válido."); ok = false;
    }
    if (!password) {
      setErrPwd("Senha é obrigatória."); ok = false;
    }
    return ok;
  }

  async function handleSubmit() {
    clearErrors();
    if (!validate()) return;
    setLoading(true);
    try {
      const { token, user } = await authRequest(email, password);
      AuthStore.login(token, user);
      navigate("/", { replace: true });
    } catch (err) {
      setErrGen((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !loading) handleSubmit();
  }

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex"
      style={{ background: "#0f1117", fontFamily: "'Inter', sans-serif" }}
    >
      {/* ════════════════════════════════════════════════════════════════════
          PAINEL ESQUERDO — identidade DM (igual header do dashboard)
          ════════════════════════════════════════════════════════════════════ */}
      <div
        className="hidden lg:flex flex-col justify-between w-[58%] px-14 py-12 relative overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #1e2a78 0%, #2d3a9e 40%, #3b4fc8 100%)",
        }}
      >
        {/* grade sutil de fundo */}
        <div
          aria-hidden
          style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* brilho inferior */}
        <div
          aria-hidden
          style={{
            position: "absolute", bottom: -120, left: -80,
            width: 440, height: 440, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,130,255,.25) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Logo — idêntico ao header do dashboard */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <div
              className="flex items-center justify-center rounded-xl"
              style={{ width: 40, height: 40, background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.2)" }}
            >
              <MapPin className="text-white" size={22} />
            </div>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-.5px" }}>
              DM
            </span>
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.55)", marginLeft: 52 }}>
            Mapa de Oportunidades · Crédito Inclusivo
          </p>
        </div>

        {/* Headline + feature grid */}
        <div className="relative z-10 space-y-6">
          <div>
            <h1 style={{ fontSize: 38, fontWeight: 800, color: "#fff", lineHeight: 1.15, letterSpacing: "-.8px", marginBottom: 12 }}>
              Inteligência territorial<br />
              para crédito inclusivo.
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,.65)", maxWidth: 380, lineHeight: 1.7 }}>
              Identifique oportunidades de expansão sustentável com dados
              reais do Banco Central e análise preditiva de risco regional.
            </p>
          </div>

          {/* 2×2 grid de features — colorido como os cards do dashboard */}
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map(f => {
              const Icon = f.icon;
              return (
                <div
                  key={f.label}
                  style={{
                    background: "rgba(255,255,255,.08)",
                    border: "1px solid rgba(255,255,255,.12)",
                    borderRadius: 14,
                    padding: "14px 16px",
                    transition: "background .2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.14)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,.08)")}
                >
                  <div className="flex items-start gap-3">
                    <div
                      style={{
                        width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                        background: f.accent + "33",
                        border: `1px solid ${f.accent}55`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        marginTop: 2,
                      }}
                    >
                      <Icon size={15} style={{ color: f.accent }} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: "#fff", fontSize: 13 }}>{f.label}</p>
                      <p style={{ fontSize: 11.5, color: "rgba(255,255,255,.55)", marginTop: 2, lineHeight: 1.5 }}>{f.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rodapé */}
        <p className="relative z-10" style={{ fontSize: 12, color: "rgba(255,255,255,.4)", fontStyle: "italic" }}>
          "Toda história merece crédito." — DM
        </p>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          PAINEL DIREITO — formulário
          ════════════════════════════════════════════════════════════════════ */}
      <div
        className="flex-1 flex items-center justify-center px-6 py-12"
        style={{ background: "#0f1117" }}
      >
        <div style={{ width: "100%", maxWidth: 420 }}>

          {/* Logo mobile */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div
              style={{ width: 34, height: 34, borderRadius: 10, background: "#3b4fc8", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <MapPin size={18} className="text-white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 20, color: "#fff" }}>DM</span>
          </div>

          {/* Card do formulário — mesma superfície do dashboard */}
          <div
            style={{
              background: "#161b2e",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: 18,
              padding: "36px 36px 32px",
              boxShadow: "0 24px 64px rgba(0,0,0,.5)",
            }}
            onKeyDown={onKey}
          >
            {/* Cabeçalho */}
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontWeight: 800, fontSize: 22, color: "#fff", letterSpacing: "-.4px", marginBottom: 4 }}>
                Entrar na plataforma
              </h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,.45)" }}>
                Use suas credenciais corporativas para acessar.
              </p>
            </div>

            {/* Erro geral */}
            {errGen && (
              <div
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.25)",
                  borderRadius: 10, padding: "10px 14px", marginBottom: 20,
                  fontSize: 13, color: "#fca5a5",
                  animation: "fadeIn .25s ease",
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                {errGen}
              </div>
            )}

            {/* Campo E-mail */}
            <FieldWrapper label="E-mail corporativo" error={errEmail}>
              <input
                type="email"
                placeholder="seu@dm.com.br"
                value={email}
                disabled={loading}
                onChange={e => { setEmail(e.target.value); setErrEmail(""); setErrGen(""); }}
                style={inputStyle(!!errEmail)}
                onFocus={e => applyFocusStyle(e.currentTarget, !!errEmail)}
                onBlur={e => removeFocusStyle(e.currentTarget, !!errEmail)}
              />
            </FieldWrapper>

            {/* Campo Senha */}
            <FieldWrapper label="Senha" error={errPwd} style={{ marginBottom: 20 }}>
              <div style={{ position: "relative" }}>
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  disabled={loading}
                  onChange={e => { setPassword(e.target.value); setErrPwd(""); setErrGen(""); }}
                  style={{ ...inputStyle(!!errPwd), paddingRight: 42 }}
                  onFocus={e => applyFocusStyle(e.currentTarget, !!errPwd)}
                  onBlur={e => removeFocusStyle(e.currentTarget, !!errPwd)}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  disabled={loading}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "rgba(255,255,255,.35)", padding: 0, lineHeight: 0,
                    transition: "color .15s",
                  }}
                  onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,.8)")}
                  onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,.35)")}
                  aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </FieldWrapper>

            {/* Botão submit — azul igual ao botão active do sidebar */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: "100%", height: 44,
                background: loading ? "#2d3a9e" : "#3b4fc8",
                border: "none", borderRadius: 10,
                color: "#fff", fontWeight: 700, fontSize: 14, letterSpacing: ".2px",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "background .2s, transform .1s",
                boxShadow: "0 4px 20px rgba(59,79,200,.4)",
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#4a5fe0"; }}
              onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#3b4fc8"; }}
              onMouseDown={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = "scale(.98)"; }}
              onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = "none"; }}
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Entrando…</>
              ) : "Entrar"}
            </button>

            {/* Hint credenciais demo */}
            <div
              style={{
                marginTop: 20,
                background: "rgba(255,255,255,.04)",
                border: "1px solid rgba(255,255,255,.07)",
                borderRadius: 10, padding: "10px 14px",
                fontSize: 12, color: "rgba(255,255,255,.45)",
              }}
            >
              <p style={{ fontWeight: 600, color: "rgba(255,255,255,.6)", marginBottom: 4 }}>
                Credenciais de demonstração:
              </p>
              <p><span style={{ fontWeight: 500 }}>Usuário:</span> {DEMO_EMAIL}</p>
              <p><span style={{ fontWeight: 500 }}>Senha:</span> {DEMO_PASSWORD}</p>
            </div>
          </div>

          {/* Rodapé */}
          <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,.25)", marginTop: 24, lineHeight: 1.7 }}>
            DM · Plataforma de Inteligência de Crédito Inclusivo<br />
            Uso exclusivamente interno · Dados confidenciais
          </p>
        </div>
      </div>

      {/* keyframe inline */}
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(-4px) } }`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function FieldWrapper({
  label, error, children, style,
}: { label: string; error?: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ marginBottom: 16, ...style }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, letterSpacing: ".3px", textTransform: "uppercase", color: "rgba(255,255,255,.4)", marginBottom: 7 }}>
        {label}
      </label>
      {children}
      {error && (
        <p style={{ fontSize: 11.5, color: "#fca5a5", marginTop: 5 }}>{error}</p>
      )}
    </div>
  );
}

function inputStyle(hasError: boolean): React.CSSProperties {
  return {
    width: "100%",
    background: "#0f1117",
    border: `1.5px solid ${hasError ? "rgba(239,68,68,.5)" : "rgba(255,255,255,.1)"}`,
    borderRadius: 10,
    color: "#e8eaf0",
    fontSize: 14,
    padding: "11px 14px",
    outline: "none",
    transition: "border-color .2s, box-shadow .2s",
    fontFamily: "inherit",
  };
}

function applyFocusStyle(el: HTMLInputElement, hasError: boolean) {
  el.style.borderColor = hasError ? "rgba(239,68,68,.7)" : "#3b4fc8";
  el.style.boxShadow = hasError ? "0 0 0 3px rgba(239,68,68,.12)" : "0 0 0 3px rgba(59,79,200,.2)";
}
function removeFocusStyle(el: HTMLInputElement, hasError: boolean) {
  el.style.borderColor = hasError ? "rgba(239,68,68,.5)" : "rgba(255,255,255,.1)";
  el.style.boxShadow = "none";
}
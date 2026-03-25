import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, Loader2, MapPin, TrendingUp, Shield, Brain } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { cn } from "../components/ui/utils";

// ── Credenciais de demonstração (substituir por chamada real na Sprint 2) ──
const DEMO_EMAIL    = "dm@gmail.com";
const DEMO_PASSWORD = "dm1234";
const TOKEN_KEY     = "dm_token";

interface FormState {
  email:    string;
  password: string;
}

interface FormErrors {
  email?:    string;
  password?: string;
  general?:  string;
}

function validateForm(values: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!values.email.trim()) {
    errors.email = "E-mail é obrigatório.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Informe um e-mail válido.";
  }

  if (!values.password) {
    errors.password = "Senha é obrigatória.";
  } else if (values.password.length < 6) {
    errors.password = "A senha deve ter no mínimo 6 caracteres.";
  }

  return errors;
}

// ── Simulação de chamada ao backend (substituir por fetch real) ──────────────
function fakeAuthRequest(email: string, password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        resolve("dm_fake_jwt_token_sprint1");
      } else {
        reject(new Error("E-mail ou senha inválidos."));
      }
    }, 1500);
  });
}

// ── Feature cards do painel esquerdo ─────────────────────────────────────────
const features = [
  { icon: MapPin,    title: "Mapa de Oportunidades", desc: "Identifique territórios com potencial de expansão de crédito." },
  { icon: TrendingUp,title: "Análise Monte Carlo",   desc: "Simule cenários de risco e projete inadimplência futura." },
  { icon: Brain,     title: "Assistente de IA",      desc: "Obtenha insights em linguagem natural sobre qualquer região." },
  { icon: Shield,    title: "Dados do Banco Central", desc: "Indicadores reais de concessão, endividamento e risco regional." },
];

// ════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ════════════════════════════════════════════════════════════════════════════
export function Login() {
  const navigate = useNavigate();

  const [form, setForm]       = useState<FormState>({ email: "", password: "" });
  const [errors, setErrors]   = useState<FormErrors>({});
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    // limpa o erro do campo ao digitar
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (errors.general) setErrors((prev) => ({ ...prev, general: undefined }));
  }

  async function handleSubmit() {
    const validation = validateForm(form);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const token = await fakeAuthRequest(form.email, form.password);
      sessionStorage.setItem(TOKEN_KEY, token);
      navigate("/", { replace: true });
    } catch (err) {
      setErrors({ general: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !loading) handleSubmit();
  }

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex">

      {/* ── Painel Esquerdo — Identidade DM ─────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[58%] bg-primary px-14 py-12">

        {/* Logo */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center ring-1 ring-white/20">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">DM</span>
          </div>
          <p className="text-sm text-white/60 ml-[52px]">Mapa de Oportunidades · Crédito Inclusivo</p>
        </div>

        {/* Headline */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Inteligência territorial<br />
            para crédito inclusivo.
          </h1>
          <p className="text-lg text-white/70 max-w-md">
            Identifique oportunidades de expansão sustentável com dados reais
            do Banco Central e análise preditiva de risco regional.
          </p>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-white/10 rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{f.title}</p>
                      <p className="text-xs text-white/60 mt-0.5 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Slogan */}
        <p className="text-sm text-white/50 italic">
          "Toda história merece crédito." — DM
        </p>
      </div>

      {/* ── Painel Direito — Formulário ──────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-md">

          {/* Logo mobile (visível apenas em telas menores) */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">DM</span>
          </div>

          <Card className="border-border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-foreground">Entrar na plataforma</CardTitle>
              <CardDescription>
                Use suas credenciais corporativas para acessar.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5" onKeyDown={handleKeyDown}>

              {/* Erro geral */}
              {errors.general && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive font-medium">
                  {errors.general}
                </div>
              )}

              {/* Campo E-mail */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  E-mail corporativo
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@dm.com.br"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  disabled={loading}
                  aria-invalid={!!errors.email}
                  className={cn(errors.email && "border-destructive focus-visible:ring-destructive/30")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">{errors.email}</p>
                )}
              </div>

              {/* Campo Senha */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPwd ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={form.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    disabled={loading}
                    aria-invalid={!!errors.password}
                    className={cn(
                      "pr-10",
                      errors.password && "border-destructive focus-visible:ring-destructive/30"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive mt-1">{errors.password}</p>
                )}
              </div>

              {/* Botão de submit */}
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full h-10 font-semibold"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>

              {/* Hint de credenciais demo */}
              <div className="rounded-lg bg-muted px-4 py-3 text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground/80">Credenciais de demonstração:</p>
                <p><span className="font-medium">E-mail:</span> {DEMO_EMAIL}</p>
                <p><span className="font-medium">Senha:</span> {DEMO_PASSWORD}</p>
              </div>

            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6">
            DM · Plataforma de Inteligência de Crédito Inclusivo
            <br />
            Uso exclusivamente interno · Dados confidenciais
          </p>
        </div>
      </div>

    </div>
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("eduksim_token", data.access);
        router.push("/dashboard");
      } else {
        setError(data.detail || "Erro ao fazer login. Verifique suas credenciais.");
      }
    } catch (err) {
      setError("Erro de conexão com o servidor.");
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await fetch("http://localhost:8000/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_token: credentialResponse.credential,
          role: "PROFESSOR"
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("eduksim_token", data.access);
        router.push("/dashboard");
      } else {
        setError(data.detail || "Erro ao fazer login pelo Google.");
      }
    } catch (err) {
      setError("Erro de conexão com o servidor.");
    }
  };

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <main className="w-full h-screen flex overflow-hidden bg-background">
        <section className="hidden lg:flex lg:w-1/2 relative bg-primary items-center justify-center p-xl">
          <div className="absolute inset-0 z-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD56sBfbryjmDIqlgmQR3MiVsyx5nocgx9k2mDRD8WdInzgMHPFfisbz6ErvE6phrdaTMnHc9wcUWlAXmpoPlBf1SO-A1dGJgjXd23qpb2Wk-dvzE_QylMXs-wqJytFddRAvVp80TQQ_iZt-eHw40XXrH2LM2BwHcr54vsS2TSiSeB2mfhYJvEqDHu3n5SyzEhZSk9hj_yCjcH9H_CGi96n885iiu_KkDmO3A1ZwdOsl6tOVuLusANZs39gs0FuXMRUJXwNSSuA_Xvn')" }}></div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-container to-secondary opacity-90 z-10"></div>
          <div className="relative z-20 max-w-[512px] text-on-primary">
            <div className="mb-lg">
              <span className="material-symbols-outlined text-[64px] mb-base">school</span>
              <h1 className="font-h1 text-h1 tracking-tight mb-sm">Sistema de Simulados Escolares</h1>
              <p className="font-body-lg text-body-lg opacity-90">A plataforma definitiva para gestão de avaliações, análise de desempenho e excelência acadêmica.</p>
            </div>
            <div className="grid grid-cols-2 gap-md">
              <div className="bg-white/10 backdrop-blur-md p-md rounded-xl border border-white/20">
                <span className="material-symbols-outlined text-tertiary mb-xs">analytics</span>
                <h3 className="font-h3 text-h3 text-sm">Relatórios Precisos</h3>
                <p className="font-body-sm text-body-sm opacity-80 mt-xs">Insights baseados em dados reais.</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-md rounded-xl border border-white/20">
                <span className="material-symbols-outlined text-tertiary mb-xs">timer</span>
                <h3 className="font-h3 text-h3 text-sm">Controle de Tempo</h3>
                <p className="font-body-sm text-body-sm opacity-80 mt-xs">Simulações em tempo real.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full lg:w-1/2 h-full bg-surface flex flex-col justify-center items-center px-gutter overflow-y-auto">
          <div className="max-w-[440px] w-full">
            <header className="mb-lg text-center lg:text-left">
              <div className="lg:hidden flex justify-center mb-md">
                <Link href="/" className="text-primary font-lexend text-2xl font-bold tracking-tight">EdukSim</Link>
              </div>
              <h2 className="font-h2 text-h2 text-on-surface mb-xs">Bem-vindo de volta</h2>
              <p className="font-body-md text-text-secondary">Entre com suas credenciais para acessar o painel.</p>
            </header>

            <form onSubmit={handleLogin} className="space-y-md">
              {error && (
                <div className="p-3 text-sm text-destructive-foreground bg-destructive/90 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-xs">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider" htmlFor="email">Email institucional</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">mail</span>
                  <input
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-md"
                    id="email"
                    name="email"
                    placeholder="nome@escola.com.br"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-xs">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider" htmlFor="password">Senha</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">lock</span>
                  <input
                    className="w-full pl-12 pr-12 py-3 rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-md"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors" type="button">
                    <span className="material-symbols-outlined">visibility</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-xs cursor-pointer group">
                  <input className="w-4 h-4 rounded border-border text-primary focus:ring-primary" type="checkbox" />
                  <span className="font-body-sm text-text-secondary group-hover:text-on-surface transition-colors">Lembrar-me</span>
                </label>
                <Link className="font-body-sm text-primary font-medium hover:underline" href="#">Esqueceu a senha?</Link>
              </div>

              <button className="w-full bg-primary text-on-primary font-button text-button py-4 rounded-lg hover:bg-primary-container active:scale-[0.98] transition-all shadow-md" type="submit">
                Entrar no Painel
              </button>
            </form>

            <div className="relative my-lg">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-label-caps">
                <span className="bg-surface px-4 text-outline font-semibold">OU</span>
              </div>
            </div>

            <div className="space-y-sm flex justify-center">
              {googleClientId ? (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError("Erro ao autenticar com Google")}
                  theme="outline"
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                />
              ) : (
                <button disabled className="w-full flex items-center justify-center gap-base border border-border bg-surface py-3 rounded-lg font-button text-button text-on-surface opacity-50 shadow-sm" type="button">
                  Google Client ID não configurado
                </button>
              )}
            </div>

            <footer className="mt-xl text-center">
              <p className="font-body-sm text-text-secondary">
                Ainda não tem uma conta?
                <Link className="text-primary font-semibold hover:underline ml-1" href="/register">Solicite acesso agora</Link>
              </p>
              <div className="mt-lg flex justify-center gap-md">
                <Link className="text-outline text-xs hover:text-primary transition-colors uppercase tracking-widest font-semibold" href="#">Privacidade</Link>
                <Link className="text-outline text-xs hover:text-primary transition-colors uppercase tracking-widest font-semibold" href="#">Termos</Link>
                <Link className="text-outline text-xs hover:text-primary transition-colors uppercase tracking-widest font-semibold" href="#">Suporte</Link>
              </div>
            </footer>
          </div>
        </section>
      </main>
    </GoogleOAuthProvider>
  );
}

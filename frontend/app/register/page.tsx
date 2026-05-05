"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { API_BASE_URL } from "@/lib/api";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("PROFESSOR");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/login");
      } else {
        setError(data.email?.[0] || "Erro ao fazer cadastro. Verifique os dados.");
      }
    } catch (err) {
      setError("Erro de conexão com o servidor.");
    }
  };

  const handleGoogleRegister = async (credentialResponse: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/google-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_token: credentialResponse.credential,
          role: role
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("eduksim_token", data.access);
        router.push("/dashboard");
      } else {
        setError(data.detail || "Erro ao fazer cadastro pelo Google.");
      }
    } catch (err) {
      setError("Erro de conexão com o servidor.");
    }
  };

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <main className="w-full max-w-container-max mx-auto grid lg:grid-cols-2 gap-gutter p-md items-center min-h-screen">
        {/* Left Side: Visual/Marketing Branding (Bento Style) */}
        <section className="hidden lg:flex flex-col gap-md h-full justify-center">
          <div className="space-y-sm">
            <div className="inline-flex items-center gap-xs px-3 py-1 rounded-full bg-primary-container/10 border border-primary-container/20">
              <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
              <span className="font-label-caps text-label-caps text-primary">PLATAFORMA LÍDER EM SIMULADOS</span>
            </div>
            <h1 className="font-h1 text-h1 text-primary leading-tight">Prepare-se para o sucesso com EdukSim.</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[448px]">
              Uma plataforma completa para gestão pedagógica e excelência acadêmica. Crie, aplique e analise simulados com facilidade.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-sm mt-md">
            <div className="bg-surface p-md rounded-xl border border-border shadow-sm flex flex-col gap-sm">
              <span className="material-symbols-outlined text-primary text-3xl">analytics</span>
              <h3 className="font-h3 text-h3">Análise de Dados</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Relatórios detalhados de desempenho para cada aluno e turma.</p>
            </div>
            <div className="bg-primary text-on-primary p-md rounded-xl shadow-lg flex flex-col gap-sm">
              <span className="material-symbols-outlined text-3xl">database</span>
              <h3 className="font-h3 text-h3">Banco de Questões</h3>
              <p className="font-body-sm text-body-sm text-on-primary/80">Milhares de questões categorizadas por disciplina e nível.</p>
            </div>
          </div>
          <div className="w-full h-48 rounded-xl overflow-hidden relative group">
            <img alt="Students studying" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDaGFQzHCRZANfsn4jHrBjl2854vBRdsV4BVr0trWSRBztf-xtKoeJksxBtQqSONx3BqNAAwP-5dT9abX-Gsh2e82KLsiy5c7dxLfvkIVh2SYz_6P4OUsKoH3ql5ajQHRkVLvZm2NCCBItcsFJaOVnb65jGJ9yQPHCKJYRkQ_fzzSol7dFN2tkIj7q8NtpFbfihMbOaDmpk88GRbn-qX3dJ8Tn1gY1-tLCFP26_EvcwlDtpoWjfmXsuHxhXuL1tzxLSBAF1bcrJfR2" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent flex items-end p-md">
              <span className="text-on-primary font-button text-button">Junte-se a mais de 5.000 instituições.</span>
            </div>
          </div>
        </section>

        {/* Right Side: Sign-up Form */}
        <section className="flex justify-center w-full">
          <div className="w-full max-w-[448px] bg-surface p-lg rounded-xl border border-border shadow-sm">
            <div className="mb-lg text-center lg:text-left">
              <h2 className="font-h2 text-h2 text-primary mb-xs">Criar Conta</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Preencha os dados abaixo para começar.</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-md">
              {error && (
                <div className="p-3 text-sm text-destructive-foreground bg-destructive/90 rounded-md">
                  {error}
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-xs">
                <label className="font-label-caps text-label-caps text-on-surface-variant" htmlFor="name">NOME COMPLETO</label>
                <div className="relative flex items-center border border-border rounded-lg bg-background/50 form-input-focus transition-all duration-200">
                  <span className="material-symbols-outlined absolute left-3 text-outline">person</span>
                  <input
                    className="w-full bg-transparent border-none focus:ring-0 py-3 pl-10 pr-4 font-body-md text-on-surface placeholder-outline/50 outline-none"
                    id="name"
                    placeholder="Ex: Ricardo Silva"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              {/* Profile Selection */}
              <div className="space-y-sm">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">EU SOU...</span>
                <div className="grid grid-cols-2 gap-sm">
                  <label className="relative cursor-pointer group">
                    <input
                      className="peer sr-only"
                      name="profile"
                      type="radio"
                      value="PROFESSOR"
                      checked={role === "PROFESSOR"}
                      onChange={() => setRole("PROFESSOR")}
                    />
                    <div className="p-md rounded-lg border-2 border-border bg-background/30 peer-checked:border-primary peer-checked:bg-primary-container/5 transition-all flex flex-col items-center gap-xs group-hover:border-primary-container/50">
                      <span className="material-symbols-outlined text-outline peer-checked:text-primary" style={{ fontVariationSettings: "'FILL' 0" }}>school</span>
                      <span className="font-button text-button text-on-surface-variant peer-checked:text-primary">Professor</span>
                    </div>
                  </label>
                  <label className="relative cursor-pointer group">
                    <input
                      className="peer sr-only"
                      name="profile"
                      type="radio"
                      value="ALUNO"
                      checked={role === "ALUNO"}
                      onChange={() => setRole("ALUNO")}
                    />
                    <div className="p-md rounded-lg border-2 border-border bg-background/30 peer-checked:border-primary peer-checked:bg-primary-container/5 transition-all flex flex-col items-center gap-xs group-hover:border-primary-container/50">
                      <span className="material-symbols-outlined text-outline peer-checked:text-primary" style={{ fontVariationSettings: "'FILL' 0" }}>person_search</span>
                      <span className="font-button text-button text-on-surface-variant peer-checked:text-primary">Aluno</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-xs">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="email">E-MAIL INSTITUCIONAL</label>
                <div className="relative flex items-center border border-border rounded-lg bg-background/50 form-input-focus transition-all duration-200">
                  <span className="material-symbols-outlined absolute left-3 text-outline">mail</span>
                  <input
                    className="w-full bg-transparent border-none focus:ring-0 py-3 pl-10 pr-4 font-body-md text-on-surface placeholder-outline/50 outline-none"
                    id="email"
                    placeholder="seu@email.com"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-xs">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="password">SENHA</label>
                <div className="relative flex items-center border border-border rounded-lg bg-background/50 form-input-focus transition-all duration-200">
                  <span className="material-symbols-outlined absolute left-3 text-outline">lock</span>
                  <input
                    className="w-full bg-transparent border-none focus:ring-0 py-3 pl-10 pr-10 font-body-md text-on-surface placeholder-outline/50 outline-none"
                    id="password"
                    placeholder="••••••••"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span className="material-symbols-outlined absolute right-3 text-outline cursor-pointer hover:text-primary transition-colors">visibility</span>
                </div>
              </div>

              {/* Submit Button */}
              <button className="w-full bg-primary text-on-primary font-button text-button py-4 rounded-xl shadow-md hover:bg-primary/90 transition-all active:scale-[0.98] mt-sm flex items-center justify-center gap-sm" type="submit">
                CADASTRAR
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </button>

              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 border-t border-border"></div>
                <span className="text-body-sm text-text-secondary font-medium uppercase text-xs">OU</span>
                <div className="flex-1 border-t border-border"></div>
              </div>

              <div className="flex justify-center">
                {googleClientId && (
                  <GoogleLogin
                    onSuccess={handleGoogleRegister}
                    onError={() => setError("Erro ao conectar com Google")}
                    theme="outline"
                    size="large"
                    text="signup_with"
                    shape="rectangular"
                    width="100%"
                  />
                )}
              </div>

              {/* Footer Link */}
              <div className="pt-md text-center">
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Já possui uma conta?
                  <Link className="text-primary font-semibold hover:underline decoration-2 underline-offset-4 ml-1" href="/login">Entrar agora</Link>
                </p>
              </div>
            </form>

            {/* Terms */}
            <div className="mt-lg pt-md border-t border-border">
              <p className="text-[10px] text-outline text-center leading-relaxed">
                Ao se cadastrar, você concorda com nossos <Link className="underline" href="#">Termos de Serviço</Link> e <Link className="underline" href="#">Política de Privacidade</Link>.
              </p>
            </div>
          </div>
        </section>
      </main>
    </GoogleOAuthProvider>
  );
}

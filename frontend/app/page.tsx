import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* TopNavBar */}
      <header className="bg-white/95 backdrop-blur-sm fixed top-0 w-full z-50 border-b border-slate-200 shadow-sm">
        <nav className="flex justify-between items-center h-20 px-6 md:px-12 max-w-container-max mx-auto">
          <div className="text-2xl font-extrabold text-[#2b73fa] tracking-tight font-h1">EdukSim</div>
          <div className="hidden md:flex gap-8 items-center">
            <Link className="text-[#2b73fa] font-bold border-b-2 border-[#2b73fa] pb-1 font-lexend text-sm" href="#">Funcionalidades</Link>
            <Link className="text-slate-600 hover:text-blue-700 transition-colors duration-200 font-lexend text-sm font-medium" href="#">Benefícios</Link>
            <Link className="text-slate-600 hover:text-blue-700 transition-colors duration-200 font-lexend text-sm font-medium" href="#">Preços</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-slate-600 hover:text-blue-700 font-lexend text-sm font-medium transition-transform duration-150 active:scale-95">Entrar</Link>
            <Link href="/register" className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-lexend text-sm font-medium hover:brightness-110 transition-transform duration-150 active:scale-95">Cadastrar</Link>
          </div>
        </nav>
      </header>

      <main className="flex-grow pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-xl lg:py-40">
          <div className="max-w-container-max mx-auto px-6 md:px-gutter flex flex-col lg:flex-row items-center gap-lg">
            <div className="max-w-[896px] mx-auto flex flex-col items-center text-center gap-md">
              <h1 className="font-h1 text-h1 lg:text-[48px] lg:leading-tight text-text-primary">
                Transforme a avaliação escolar com Inteligência Artificial
              </h1>
              <p className="font-body-lg text-body-lg text-text-secondary max-w-[576px]">
                Economize horas de correção e elimine fraudes com nossa plataforma completa de simulados automatizados. Focada no desempenho real dos seus alunos.
              </p>
              <div className="flex flex-wrap gap-md mt-4 justify-center">
                <Link href="/register" className="bg-primary text-on-primary px-lg py-4 rounded-xl font-button text-button shadow-lg hover:brightness-110 transition-all active:scale-95">
                  Começar Agora
                </Link>
                <Link href="/login" className="flex items-center gap-2 text-primary font-button text-button px-lg py-4 border border-primary rounded-xl hover:bg-primary/5 transition-all">
                  <span className="material-symbols-outlined">play_circle</span>
                  Ver demonstração
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid Solutions */}
        <section className="py-xl bg-surface-container-low">
          <div className="max-w-container-max mx-auto px-6 md:px-gutter">
            <div className="text-center mb-16">
              <span className="text-primary font-label-caps tracking-widest uppercase mb-4 block">Nossa Tecnologia</span>
              <h2 className="font-h2 text-h2 text-text-primary mb-6">Soluções inteligentes para desafios modernos</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
              {/* Card 1 */}
              <div className="md:col-span-8 bg-surface p-lg rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-md items-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-4xl">auto_fix_high</span>
                </div>
                <div>
                  <h3 className="font-h3 text-h3 mb-2 text-text-primary">Correção Automática por IA</h3>
                  <p className="font-body-md text-body-md text-text-secondary">
                    Ganhe seu tempo livre de volta. Nossa inteligência processa questões objetivas e discursivas com precisão cirúrgica, fornecendo feedback instantâneo.
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="md:col-span-4 bg-primary text-on-primary p-lg rounded-xl shadow-lg flex flex-col justify-between">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-on-primary text-3xl">shield</span>
                </div>
                <div>
                  <h3 className="font-h3 text-h3 mb-2">Antifraude Avançado</h3>
                  <p className="font-body-sm text-body-sm opacity-90">
                    Embaralhamento dinâmico e controle de tempo por questão que garantem a integridade de cada avaliação.
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="md:col-span-4 bg-surface p-lg rounded-xl border border-border shadow-sm flex flex-col">
                <div className="w-16 h-16 bg-success/10 rounded-xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-success text-3xl">analytics</span>
                </div>
                <h3 className="font-h3 text-h3 mb-2 text-text-primary">Insights Instantâneos</h3>
                <p className="font-body-md text-body-md text-text-secondary">
                  Relatórios detalhados gerados automaticamente após o término de cada aplicação.
                </p>
              </div>

              {/* Card 4 */}
              <div className="md:col-span-8 bg-white p-lg rounded-xl border border-border shadow-sm flex items-center justify-between overflow-hidden">
                <div className="max-w-[448px]">
                  <h3 className="font-h3 text-h3 mb-2 text-text-primary">Relatórios em Tempo Real</h3>
                  <p className="font-body-md text-body-md text-text-secondary">
                    Monitore o progresso de cada turma com métricas visuais intuitivas. Identifique lacunas de aprendizado em segundos.
                  </p>
                </div>
                <div className="hidden lg:block w-40 h-40 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full -mr-20 flex-shrink-0 opacity-20"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Why EdukSim */}
        <section className="py-xl">
          <div className="max-w-container-max mx-auto px-6 md:px-gutter">
            <div className="flex flex-col lg:flex-row items-center gap-xl">
              <div className="max-w-[768px] mx-auto w-full">
                <h2 className="font-h2 text-h2 text-text-primary mb-8 text-center">Por que EdukSim?</h2>
                <div className="space-y-md">
                  <div className="flex gap-md">
                    <div className="flex-shrink-0 mt-1">
                      <span className="material-symbols-outlined text-success">check_circle</span>
                    </div>
                    <div>
                      <h4 className="font-h3 text-h3 text-text-primary mb-1">Facilidade de Uso</h4>
                      <p className="font-body-md text-body-md text-text-secondary">Interface intuitiva projetada para professores, sem curvas de aprendizado complexas.</p>
                    </div>
                  </div>
                  <div className="flex gap-md">
                    <div className="flex-shrink-0 mt-1">
                      <span className="material-symbols-outlined text-success">check_circle</span>
                    </div>
                    <div>
                      <h4 className="font-h3 text-h3 text-text-primary mb-1">Segurança de Dados</h4>
                      <p className="font-body-md text-body-md text-text-secondary">Total conformidade com a LGPD, garantindo o sigilo absoluto das informações dos alunos.</p>
                    </div>
                  </div>
                  <div className="flex gap-md">
                    <div className="flex-shrink-0 mt-1">
                      <span className="material-symbols-outlined text-success">check_circle</span>
                    </div>
                    <div>
                      <h4 className="font-h3 text-h3 text-text-primary mb-1">Escalabilidade</h4>
                      <p className="font-body-md text-body-md text-text-secondary">Desde pequenas turmas até grandes redes de ensino com milhares de simulados simultâneos.</p>
                    </div>
                  </div>
                </div>
                <div className="mt-lg text-center">
                  <button className="bg-surface border-2 border-primary text-primary px-lg py-3 rounded-xl font-button text-button hover:bg-primary hover:text-white transition-all">
                    Saiba mais sobre nossa segurança
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-xl bg-blue-900 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <div className="max-w-[672px] mx-auto px-6 relative z-10">
            <h2 className="font-h1 text-h1 mb-6">Pronto para elevar o nível das suas avaliações?</h2>
            <p className="font-body-lg text-body-lg mb-lg opacity-80">Junte-se a centenas de escolas que já estão transformando a educação com o EdukSim.</p>
            <Link href="/register" className="inline-block bg-white text-blue-900 px-xl py-4 rounded-xl font-button text-button font-bold hover:bg-blue-50 transition-all shadow-xl active:scale-95">
              Criar minha conta
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 mt-auto py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 px-6 md:px-12 max-w-container-max mx-auto">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="text-lg font-bold text-slate-900 font-h2">EdukSim</div>
            <p className="font-lexend text-xs text-slate-500">© 2026 EdukSim. Todos os direitos reservados.</p>
          </div>
          <div className="flex gap-8">
            <a className="font-lexend text-xs text-slate-500 hover:text-blue-600 underline transition-all" href="#">Termos de Uso</a>
            <a className="font-lexend text-xs text-slate-500 hover:text-blue-600 underline transition-all" href="#">Privacidade</a>
            <a className="font-lexend text-xs text-slate-500 hover:text-blue-600 underline transition-all" href="#">Contato</a>
            <a className="font-lexend text-xs text-slate-500 hover:text-blue-600 underline transition-all" href="#">Sobre Nós</a>
          </div>
          <div className="flex gap-4">
            <a className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all" href="#">
              <span className="material-symbols-outlined text-sm">share</span>
            </a>
            <a className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all" href="#">
              <span className="material-symbols-outlined text-sm">public</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

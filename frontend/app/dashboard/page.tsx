"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";

interface Test {
  id: string;
  title: string;
  area: string | null;
}

interface DashboardStats {
  active_students: number;
  recent_tests: Test[];
  top_students: { email: string; score: number }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchTests = async () => {
      const token = localStorage.getItem("eduksim_token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/exams/dashboard-stats`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        } else if (res.status === 401) {
          router.push("/login");
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchTests();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("eduksim_token");
    router.push("/");
  };

  return (
    <div className="flex min-h-screen">
      {/* SideNavBar Component */}
      <aside className="hidden md:flex h-screen w-64 border-r rounded-none bg-white flex-col p-4 gap-2 border-slate-200 sticky top-0">
        <div className="flex items-center gap-3 px-4 py-6 mb-4">
          <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined">school</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900 font-lexend leading-tight">Painel do Professor</h1>
            <p className="text-xs text-slate-500 font-lexend">Ano Letivo 2026</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          {/* Active Navigation */}
          <Link className="bg-blue-50 text-blue-600 font-bold rounded-lg px-4 py-2 flex items-center gap-3 transition-all duration-200 ease-in-out font-lexend text-sm" href="/dashboard">
            <span className="material-symbols-outlined">dashboard</span> Painel
          </Link>
          <Link className="text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg px-4 py-2 flex items-center gap-3 transition-all duration-200 ease-in-out font-lexend text-sm" href="#">
            <span className="material-symbols-outlined">description</span> Simulados
          </Link>
          <Link className="text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg px-4 py-2 flex items-center gap-3 transition-all duration-200 ease-in-out font-lexend text-sm" href="/dashboard/create-question">
            <span className="material-symbols-outlined">database</span> Banco de Questões
          </Link>
          <Link className="text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg px-4 py-2 flex items-center gap-3 transition-all duration-200 ease-in-out font-lexend text-sm" href="#">
            <span className="material-symbols-outlined">school</span> Alunos
          </Link>
          <Link className="text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg px-4 py-2 flex items-center gap-3 transition-all duration-200 ease-in-out font-lexend text-sm" href="#">
            <span className="material-symbols-outlined">analytics</span> Relatórios
          </Link>
        </nav>
        <div className="mt-auto border-t border-slate-100 pt-4 space-y-1">
          <Link className="text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg px-4 py-2 flex items-center gap-3 transition-all duration-200 ease-in-out font-lexend text-sm" href="#">
            <span className="material-symbols-outlined">help</span> Central de Ajuda
          </Link>
          <button onClick={handleLogout} className="w-full text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg px-4 py-2 flex items-center gap-3 transition-all duration-200 ease-in-out font-lexend text-sm">
            <span className="material-symbols-outlined">logout</span> Sair
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* TopNavBar Component */}
        <header className="flex justify-between items-center h-16 px-6 w-full bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-[448px] hidden md:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none outline-none rounded-xl focus:ring-2 focus:ring-primary-container text-sm font-body-md" placeholder="Pesquisar por simulados ou alunos..." type="text" />
            </div>
            <div className="md:hidden flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">school</span>
              <span className="font-bold font-lexend">EdukSim</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden md:block"></div>
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold font-lexend">Prof. Ricardo Silva</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Matemática</p>
              </div>
              <img alt="User profile avatar" className="w-10 h-10 object-cover rounded-full border-2 border-primary-fixed" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_3l2_7FhEfkp3DgKB1D4ywGAiw0S5vZggqnokbtkyejSBZ3X_BJgHLy12ZtP9AMIDP_KyLWaUzS1LZttPBv56Go_-sr7lOIE9EyFOVBzmOmE6PM9ywLXfvBTkAunwVc1Z6amiSzDKmFzgH6tPNX4njTI7HCD1e1Hr5-GVlw80xwTxFwKdIqX02MQ-TBfeTbhQPbo4UPzUVtiZfOgGCxY5mO3e8LL3pFKKY7E15tfkBW7sGUYpvJ-fUoDTfbH9GrUNBvnZzC-K5xIr" />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-gutter overflow-y-auto">
          <div className="max-w-container-max mx-auto space-y-md">
            {/* Page Header with CTA */}
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
              <div>
                <h2 className="font-h1 text-h1 text-on-surface">Visão Geral do Painel</h2>
                <p className="font-body-md text-text-secondary">Bem-vindo de volta. Veja o que está acontecendo com suas turmas hoje.</p>
              </div>
              <Link href="/dashboard/create-test" className="bg-primary text-on-primary font-button px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                <span className="material-symbols-outlined">add</span> Criar Novo Simulado
              </Link>
            </div>

            {/* Bento Grid Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
              {/* Stat 1 */}
              <div className="bg-surface p-6 rounded-xl border border-border shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-blue-50 text-primary rounded-lg">
                    <span className="material-symbols-outlined">group</span>
                  </div>
                  <span className="text-success text-xs font-bold font-lexend flex items-center">
                    <span className="material-symbols-outlined text-xs mr-1">trending_up</span> +12%
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-text-secondary font-label-caps text-label-caps">ALUNOS ATIVOS</p>
                  <h3 className="font-h2 text-h2 mt-1">{stats?.active_students || 0}</h3>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="bg-surface p-6 rounded-xl border border-border shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-orange-50 text-tertiary-container rounded-lg">
                    <span className="material-symbols-outlined">query_stats</span>
                  </div>
                  <span className="text-success text-xs font-bold font-lexend flex items-center">
                    <span className="material-symbols-outlined text-xs mr-1">trending_up</span> +5.2%
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-text-secondary font-label-caps text-label-caps">DESEMPENHO MÉDIO</p>
                  <h3 className="font-h2 text-h2 mt-1">78.4%</h3>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="bg-surface p-6 rounded-xl border border-border shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-green-50 text-success rounded-lg">
                    <span className="material-symbols-outlined">task_alt</span>
                  </div>
                  <span className="text-text-secondary text-xs font-bold font-lexend">Target: 85%</span>
                </div>
                <div className="mt-4">
                  <p className="text-text-secondary font-label-caps text-label-caps">SIMULADOS RECENTES</p>
                  <h3 className="font-h2 text-h2 mt-1">{stats?.recent_tests.length || 0}</h3>
                </div>
              </div>

              {/* Stat 4 */}
              <div className="bg-surface p-6 rounded-xl border border-border shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                    <span className="material-symbols-outlined">hourglass_empty</span>
                  </div>
                  <span className="text-danger text-xs font-bold font-lexend flex items-center">
                    <span className="material-symbols-outlined text-xs mr-1">warning</span> 3 Pendentes
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-text-secondary font-label-caps text-label-caps">TEMPO MÉDIO GASTO</p>
                  <h3 className="font-h2 text-h2 mt-1">48<span className="text-body-md font-normal">min</span></h3>
                </div>
              </div>
            </div>

            {/* Main Grid: Chart & Active Exams */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
              {/* Performance Chart Container */}
              <div className="lg:col-span-2 bg-surface p-6 rounded-xl border border-border shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-h3 text-h3">Análise de Desempenho</h3>
                    <p className="text-body-sm text-text-secondary">Distribuição média de notas ao longo do tempo</p>
                  </div>
                  <div className="flex bg-slate-50 p-1 rounded-lg">
                    <button className="px-3 py-1 text-xs font-bold rounded-md bg-white shadow-sm">Semanal</button>
                    <button className="px-3 py-1 text-xs font-bold text-slate-500">Mensal</button>
                  </div>
                </div>
                <div className="h-[300px] w-full relative flex items-end justify-between gap-2 pt-10">
                  {/* Placeholder for Chart - Using CSS Bars for UI fidelity */}
                  <div className="flex-1 bg-primary/10 rounded-t-lg relative group h-[40%]">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-inverse-surface text-on-primary px-2 py-1 rounded text-[10px] transition-all">65%</div>
                  </div>
                  <div className="flex-1 bg-primary/20 rounded-t-lg relative group h-[60%]"></div>
                  <div className="flex-1 bg-primary/40 rounded-t-lg relative group h-[55%]"></div>
                  <div className="flex-1 bg-primary/60 rounded-t-lg relative group h-[75%]"></div>
                  <div className="flex-1 bg-primary/80 rounded-t-lg relative group h-[90%]">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-inverse-surface text-on-primary px-2 py-1 rounded text-[10px] transition-all">92%</div>
                  </div>
                  <div className="flex-1 bg-primary/40 rounded-t-lg relative group h-[65%]"></div>
                  <div className="flex-1 bg-primary/20 rounded-t-lg relative group h-[45%]"></div>
                </div>
                <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2"><span className="material-symbols-outlined text-xs">schedule</span> Termina em 2h 15m</div>
              </div>

              {/* Active Exams List */}
              <div className="bg-surface rounded-xl border border-border shadow-sm flex flex-col">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-h3 text-h3">Seus Simulados</h3>
                  <Link className="text-primary text-xs font-bold hover:underline" href="#">Ver Todos</Link>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[350px]">
                  {!stats?.recent_tests || stats.recent_tests.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      <span className="material-symbols-outlined opacity-50 mb-2">menu_book</span>
                      <p className="text-sm">Nenhum simulado criado.</p>
                    </div>
                  ) : (
                    stats.recent_tests.map((test) => (
                      <Link href={`/dashboard/tests/${test.id}`} key={test.id} className="block p-4 rounded-xl border border-slate-100 hover:border-primary/30 transition-colors bg-surface-container-low/30 group">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-sm text-on-surface line-clamp-1">{test.title}</h4>
                          <span className="px-2 py-1 bg-success/10 text-success text-[10px] font-bold rounded-full whitespace-nowrap">ATIVO</span>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between text-xs text-text-secondary">
                            <span>Área/Disciplina</span>
                            <span className="font-bold">{test.area || "Geral"}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="bg-primary h-full w-[45%]"></div>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Secondary Row: Recent Students & Quick Tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md pb-xl">
              {/* Recent Performance */}
              <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="font-h3 text-h3">Alunos com Melhor Desempenho</h3>
                </div>
                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <tr>
                        <th className="px-6 py-3 whitespace-nowrap">Aluno</th>
                        <th className="px-6 py-3 whitespace-nowrap">Último Simulado</th>
                        <th className="px-6 py-3 whitespace-nowrap">Nota</th>
                        <th className="px-6 py-3 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {!stats?.top_students || stats.top_students.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-10 text-center text-text-secondary text-sm">
                            <span className="material-symbols-outlined opacity-50 block text-3xl mb-2">analytics</span>
                            Ainda não há alunos que finalizaram simulados.
                          </td>
                        </tr>
                      ) : (
                        stats.top_students.map((student, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold text-xs">
                                  {student.email.substring(0, 2).toUpperCase()}
                                </div>
                                <span className="text-sm font-semibold whitespace-nowrap">{student.email}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs text-text-secondary whitespace-nowrap">Último Simulado</td>
                            <td className="px-6 py-4"><span className="text-sm font-bold text-success">{student.score.toFixed(1)}</span></td>
                            <td className="px-6 py-4 text-right">
                              <button className="text-primary hover:bg-blue-50 p-1 rounded-md">
                                <span className="material-symbols-outlined text-lg">chevron_right</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Question Bank Preview */}
              <div className="bg-primary p-6 rounded-xl text-on-primary shadow-xl relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-container/30 rounded-full -ml-16 -mb-16 blur-3xl"></div>
                <div className="relative z-10">
                  <h3 className="font-h3 text-h3 mb-2">Banco de Questões</h3>
                  <p className="text-white/80 text-body-sm max-w-[320px]">Acesse sua biblioteca de mais de 4.200 questões acadêmicas. Verificadas por padrões pedagógicos.</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-white/20 rounded-lg text-xs font-bold">Matemática (824)</span>
                    <span className="px-3 py-1 bg-white/20 rounded-lg text-xs font-bold">Física (412)</span>
                    <span className="px-3 py-1 bg-white/20 rounded-lg text-xs font-bold">Química (398)</span>
                  </div>
                </div>
                <div className="relative z-10 mt-8 flex flex-col gap-2">
                  <Link href="/dashboard/questions" className="w-full bg-white text-primary font-button py-3 rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">search</span> Explorar Questões
                  </Link>
                  <Link href="/dashboard/create-question" className="w-full border border-white/30 text-white font-button py-3 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">add</span> Adicionar Questão
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Floating Action Button for mobile */}
      <Link href="/dashboard/create-test" className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[60] md:hidden">
        <span className="material-symbols-outlined text-3xl">add</span>
      </Link>
    </div>
  );
}

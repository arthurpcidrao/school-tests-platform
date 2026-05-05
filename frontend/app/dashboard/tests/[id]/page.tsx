"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";

interface Item {
  id: string;
  text: string;
  is_correct: boolean;
}

interface Question {
  id: string;
  subject: string;
  stem: string;
  question_type: string;
  items: Item[];
}

interface Test {
  id: string;
  title: string;
  area: string;
  questions?: Question[];
}

interface StudentStat {
  email: string;
  score_percentage: number;
  status: string;
}

interface TestStats {
  test_id: string;
  total_students: number;
  completed_students: number;
  students: StudentStat[];
}

export default function TestDetailPage() {
  const [test, setTest] = useState<Test | null>(null);
  const [stats, setStats] = useState<TestStats | null>(null);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const fetchTest = async () => {
      const token = localStorage.getItem("eduksim_token");
      if (!token) return router.push("/login");

      try {
        const res = await fetch(`${API_BASE_URL}/api/exams/tests/${params.id}/full`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (res.ok) {
          setTest(await res.json());
          
          const statsRes = await fetch(`${API_BASE_URL}/api/exams/tests/${params.id}/stats`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (statsRes.ok) {
            setStats(await statsRes.json());
          }
        } else {
          router.push("/dashboard");
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchTest();
  }, [params.id, router]);

  if (!test) {
    return <div className="p-10 text-center">Carregando...</div>;
  }

  return (
    <div className="p-gutter max-w-container-max mx-auto space-y-md">
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <Link href="/dashboard" className="text-primary hover:bg-slate-50 p-2 rounded-full transition-colors flex items-center justify-center">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h1 className="font-h1 text-h1 text-on-surface">{test.title}</h1>
          <p className="text-text-secondary mt-1">Visão Geral do Simulado</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm col-span-2">
          <h2 className="font-h3 text-h3 mb-4">Informações</h2>
          <div className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">ID do Simulado:</span>
              <span className="font-mono text-sm">{test.id}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Área:</span>
              <span className="font-bold">{test.area || "Geral"}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Status:</span>
              <span className="px-2 py-1 bg-success/10 text-success text-[10px] font-bold rounded-full">ATIVO</span>
            </div>
          </div>
        </div>

        <div className="bg-primary text-white p-6 rounded-xl shadow-lg flex flex-col justify-center items-center text-center">
          <span className="material-symbols-outlined text-5xl mb-2">analytics</span>
          <h3 className="font-bold text-xl mb-1">Resultados</h3>
          
          {!stats || stats.completed_students === 0 ? (
            <p className="text-white/80 text-sm mb-4">Nenhum aluno finalizou este simulado ainda.</p>
          ) : (
            <div className="w-full text-left bg-white/10 rounded-lg p-3 mb-4 max-h-40 overflow-y-auto">
              <p className="text-sm font-bold border-b border-white/20 pb-2 mb-2">{stats.completed_students} aluno(s) concluíram:</p>
              {stats.students.filter(s => s.status === 'FINISHED').map(s => (
                <div key={s.email} className="flex justify-between items-center text-sm py-1">
                  <span className="truncate pr-2">{s.email.split('@')[0]}</span>
                  <span className="font-bold">{s.score_percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          )}
          
          <button className="bg-white text-primary px-4 py-2 rounded font-bold hover:bg-white/90 transition-colors w-full">
            Ver Relatório Completo
          </button>
        </div>
      </div>

      {test.questions && test.questions.length > 0 && (
        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm mt-8">
          <h2 className="font-h3 text-h3 mb-6">Questões do Simulado</h2>
          <div className="space-y-6">
            {test.questions.map((q, index) => (
              <div key={q.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-slate-800">Questão {index + 1}</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full">{q.subject || test.area || "Geral"}</span>
                </div>
                <p className="font-medium text-sm text-slate-800 mb-4">{q.stem}</p>
                <div className="space-y-2">
                  {q.items.map((item, idx) => (
                    <div key={item.id} className={`flex items-center gap-3 p-3 rounded-lg border ${item.is_correct ? 'bg-success/10 border-success' : 'bg-white border-slate-200'}`}>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${item.is_correct ? 'border-success' : 'border-slate-300'}`}>
                        {item.is_correct && <div className="w-3 h-3 rounded-full bg-success"></div>}
                      </div>
                      <span className={`text-sm ${item.is_correct ? 'font-bold text-success' : 'text-slate-600'}`}>
                        {String.fromCharCode(65 + idx)}) {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";

interface Item {
  id: string;
  text: string;
  is_correct: boolean;
}

interface Question {
  id: string;
  subject: string;
  content: string;
  stem: string;
  question_type: string;
  items: Item[];
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjectFilter, setSubjectFilter] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchQuestions = async () => {
      const token = localStorage.getItem("eduksim_token");
      if (!token) return router.push("/login");

      let url = `${API_BASE_URL}/api/exams/questions`;
      if (subjectFilter) url += `?subject=${encodeURIComponent(subjectFilter)}`;

      const res = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (res.ok) {
        setQuestions(await res.json());
      } else if (res.status === 401) {
        router.push("/login");
      }
    };
    fetchQuestions();
  }, [router, subjectFilter]);

  return (
    <div className="p-gutter max-w-container-max mx-auto space-y-md">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div>
          <Link href="/dashboard" className="text-primary text-sm font-bold flex items-center hover:underline mb-2">
            <span className="material-symbols-outlined text-sm mr-1">arrow_back</span> Voltar ao Painel
          </Link>
          <h1 className="font-h1 text-h1 text-on-surface">Banco de Questões</h1>
          <p className="text-text-secondary mt-1">Gerencie seu repositório de questões</p>
        </div>
        <Link href="/dashboard/create-question" className="bg-primary text-on-primary font-button px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
          <span className="material-symbols-outlined">add</span> Criar Questão
        </Link>
      </div>

      <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-h3 text-h3">Filtros</h2>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Filtrar por matéria (ex: Matemática)" 
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          {questions.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-50">search_off</span>
              <p>Nenhuma questão encontrada.</p>
            </div>
          ) : (
            questions.map(q => (
              <div key={q.id} className="p-4 border border-slate-100 rounded-xl hover:border-primary/30 transition-colors bg-slate-50/50">
                <div className="flex justify-between mb-2">
                  <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full">{q.subject}</span>
                  <span className="text-xs text-slate-400">ID: {q.id.substring(0, 8)}</span>
                </div>
                <p className="font-bold text-sm text-slate-800 mb-2">{q.stem}</p>
                <div className="text-xs text-slate-500 space-y-1">
                  {q.items.map((item, idx) => (
                    <div key={item.id} className={`flex items-center gap-2 ${item.is_correct ? 'text-success font-bold' : ''}`}>
                      <span>{String.fromCharCode(65 + idx)})</span>
                      <span className="line-clamp-1">{item.text}</span>
                      {item.is_correct && <span className="material-symbols-outlined text-[14px]">check_circle</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

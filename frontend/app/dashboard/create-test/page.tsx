"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Item {
  text: string;
  is_correct: boolean;
}

interface Question {
  id?: string;
  subject: string;
  stem: string;
  question_type: "FECHADA" | "ABERTA";
  items: Item[];
  weight: number;
}

export default function CreateTestPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [area, setArea] = useState("Matemática");
  const [description, setDescription] = useState("");
  const [timePerQuestion, setTimePerQuestion] = useState("");
  
  const [questions, setQuestions] = useState<Question[]>([]);
  
  // Editor State
  const [qSubject, setQSubject] = useState("Matemática");
  const [qStem, setQStem] = useState("");
  const [qType, setQType] = useState<"FECHADA" | "ABERTA">("FECHADA");
  const [qItems, setQItems] = useState<Item[]>([{ text: "", is_correct: true }, { text: "", is_correct: false }]);
  const [qWeight, setQWeight] = useState(1.0);

  const handleAddItem = () => {
    setQItems([...qItems, { text: "", is_correct: false }]);
  };

  const handleUpdateItem = (index: number, text: string) => {
    const newItems = [...qItems];
    newItems[index].text = text;
    setQItems(newItems);
  };

  const handleSetCorrect = (index: number) => {
    const newItems = qItems.map((item, i) => ({
      ...item,
      is_correct: i === index,
    }));
    setQItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    if (qItems.length <= 2) return;
    setQItems(qItems.filter((_, i) => i !== index));
  };

  const handleSaveQuestion = () => {
    if (!qStem.trim()) return alert("O enunciado não pode ser vazio.");
    
    setQuestions([...questions, {
      subject: area, // Using the main area for simplicity
      stem: qStem,
      question_type: qType,
      items: qType === "FECHADA" ? qItems : [],
      weight: qWeight
    }]);
    
    // Reset editor
    setQStem("");
    setQItems([{ text: "", is_correct: true }, { text: "", is_correct: false }]);
  };

  const handleSaveTest = async () => {
    const token = localStorage.getItem("eduksim_token");
    if (!token) return router.push("/login");

    try {
      const testQuestions = [];
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const resQ = await fetch("http://localhost:8000/api/exams/questions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            subject: q.subject,
            content: "",
            stem: q.stem,
            question_type: q.question_type,
            items: q.items
          })
        });
        
        if (resQ.ok) {
          const qData = await resQ.json();
          testQuestions.push({
            question_id: qData.id,
            order_index: i,
            weight: q.weight
          });
        }
      }

      const resT = await fetch("http://localhost:8000/api/exams/tests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          area,
          time_per_question: timePerQuestion ? parseInt(timePerQuestion) : null,
          questions: testQuestions
        })
      });

      if (resT.ok) {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar simulado.");
    }
  };

  return (
    <div className="font-body-md text-text-primary h-screen overflow-hidden flex flex-col bg-background">
      {/* TopNavBar */}
      <header className="bg-white border-b border-slate-200 shadow-sm top-0 z-50 flex justify-between items-center h-16 px-6 w-full flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-xl font-bold tracking-tight text-blue-600 font-lexend hover:opacity-80">EduSimulados</Link>
          <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>
          <nav className="hidden md:flex gap-6">
            <Link className="text-slate-500 font-lexend text-sm font-medium hover:bg-slate-50 transition-colors px-3 py-2 rounded-lg" href="/dashboard">Painel</Link>
            <Link className="text-blue-600 border-b-2 border-blue-600 font-lexend text-sm font-medium px-3 py-2" href="#">Simulados</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-200">
            <img alt="User profile avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNcUJzuFQJZRszzAjzIQLbyRIPrK3rx7EjmNyMPIl7kmd3kClbwZFAIqk5ukJdUalnDKEIdBRh6VHkTlorLa4ETfP33TCkqd4M9zC3tCiX6KMnBQtXKM6Xv1JmCOGtIFtQ-XAjWWVGBf2yaY9pqx6LbaZwrdVUFv1M9VnARF_SpYjjnbfiUwuVQYv8xJV8YwpH-mIWMp0ktgk7ox4iPO_KoEgs3Tv0PjpsE_so8nMdk79icIkP3M8cX2KIwQjA-nMHicYpqTtt1lRN" />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left SideNavBar: Question Navigator */}
        <aside className="bg-slate-50 h-full w-20 border-r border-slate-200 flex flex-col items-center py-6 gap-4 overflow-y-auto flex-shrink-0">
          <div className="text-center mb-2">
            <span className="text-[10px] font-lexend font-bold text-slate-400 uppercase">NAV. Q.</span>
          </div>
          
          {questions.map((q, idx) => (
            <div key={idx} className="flex flex-col items-center group relative">
              <button className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-lexend text-xs font-bold shadow-md">
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
              </button>
              <div className="text-[10px] mt-1 text-blue-600 font-bold">Q{idx + 1}</div>
              {/* Opção para remover */}
              <button 
                onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}
                className="absolute left-12 top-0 bg-danger text-white rounded-full w-6 h-6 hidden group-hover:flex items-center justify-center shadow-sm"
              >
                <span className="material-symbols-outlined text-[14px]">delete</span>
              </button>
            </div>
          ))}

          {/* Current Editing Question */}
          <div className="flex flex-col items-center">
            <button className="bg-white text-primary border border-primary rounded-full w-10 h-10 flex items-center justify-center font-lexend text-xs font-bold shadow-sm">
              <span className="material-symbols-outlined text-[20px]">edit</span>
            </button>
            <div className="text-[10px] mt-1 text-primary font-bold">Q{questions.length + 1}</div>
          </div>
        </aside>

        {/* Main Content Area: Question Builder */}
        <main className="flex-1 overflow-y-auto p-gutter">
          <div className="max-w-[896px] mx-auto space-y-md">
            {/* General Info Card */}
            <div className="bg-surface border border-border rounded-xl p-md shadow-sm">
              <div className="flex items-center gap-3 mb-base">
                <span className="material-symbols-outlined text-primary">edit_note</span>
                <h2 className="font-h2 text-h2 text-text-primary">Informações do Simulado</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="font-label-caps text-label-caps text-text-secondary uppercase">Nome do Simulado</label>
                  <input 
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" 
                    placeholder="ex: Matemática Bimestral - 2024" 
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-xs">
                  <label className="font-label-caps text-label-caps text-text-secondary uppercase">Área / Disciplina</label>
                  <select 
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none appearance-none transition-all bg-white"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                  >
                    <option value="Matemática">Matemática</option>
                    <option value="Física">Física</option>
                    <option value="História">História</option>
                    <option value="Biologia">Biologia</option>
                    <option value="Linguagens">Linguagens</option>
                    <option value="Geral">Geral</option>
                  </select>
                </div>
                <div className="col-span-full space-y-xs">
                  <label className="font-label-caps text-label-caps text-text-secondary uppercase">Descrição</label>
                  <textarea 
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" 
                    placeholder="Descreva brevemente os objetivos deste simulado..." 
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Question Builder Card */}
            <div className="bg-surface border border-border rounded-xl p-md shadow-sm relative">
              <div className="flex justify-between items-center mb-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary">
                    <span className="font-h3 text-h3">{questions.length + 1}</span>
                  </div>
                  <div>
                    <h2 className="font-h2 text-h2 text-text-primary">Editor de Questões</h2>
                    <p className="text-body-sm text-text-secondary font-body-sm">Configure o enunciado e as alternativas</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-full text-xs font-bold uppercase tracking-wider">RASCUNHO</span>
                </div>
              </div>

              <div className="space-y-md">
                {/* Enunciado */}
                <div className="space-y-xs">
                  <label className="font-label-caps text-label-caps text-text-secondary uppercase">Enunciado</label>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <div className="bg-slate-50 border-b border-border p-2 flex gap-2">
                      <button className="p-1 hover:bg-white rounded transition-colors"><span className="material-symbols-outlined text-[20px]">format_bold</span></button>
                      <button className="p-1 hover:bg-white rounded transition-colors"><span className="material-symbols-outlined text-[20px]">format_italic</span></button>
                      <button className="p-1 hover:bg-white rounded transition-colors"><span className="material-symbols-outlined text-[20px]">image</span></button>
                      <button className="p-1 hover:bg-white rounded transition-colors"><span className="material-symbols-outlined text-[20px]">functions</span></button>
                    </div>
                    <textarea 
                      className="w-full px-4 py-3 border-none focus:ring-0 outline-none transition-all" 
                      placeholder="Digite o conteúdo da questão aqui..." 
                      rows={4}
                      value={qStem}
                      onChange={(e) => setQStem(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                {/* Type & Weight */}
                <div className="grid grid-cols-2 gap-md">
                  <div className="space-y-xs">
                    <label className="font-label-caps text-label-caps text-text-secondary uppercase">Tipo de Questão</label>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setQType("FECHADA")}
                        className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors ${qType === "FECHADA" ? "border-2 border-primary bg-primary-container/10 text-primary" : "border border-border text-text-secondary hover:border-primary"}`}
                      >
                        <span className="material-symbols-outlined">checklist</span> Múltipla Escolha
                      </button>
                      <button 
                        onClick={() => setQType("ABERTA")}
                        className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors ${qType === "ABERTA" ? "border-2 border-primary bg-primary-container/10 text-primary" : "border border-border text-text-secondary hover:border-primary"}`}
                      >
                        <span className="material-symbols-outlined">edit</span> Discursiva
                      </button>
                    </div>
                  </div>
                  <div className="space-y-xs">
                    <label className="font-label-caps text-label-caps text-text-secondary uppercase">Peso (Pontos)</label>
                    <div className="flex items-center border border-border rounded-lg overflow-hidden">
                      <input 
                        className="w-full px-4 py-3 border-none focus:ring-0 outline-none" 
                        step="0.1" 
                        type="number" 
                        value={qWeight}
                        onChange={(e) => setQWeight(parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                {/* Options Builder (Visible if Multiple Choice) */}
                {qType === "FECHADA" && (
                  <div className="space-y-sm bg-surface-container-low p-sm rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center px-1">
                      <label className="font-label-caps text-label-caps text-text-secondary uppercase">Alternativas de Resposta</label>
                      <span className="text-body-sm text-primary font-medium cursor-pointer" onClick={handleAddItem}>+ Adicionar Alternativa</span>
                    </div>
                    <div className="space-y-2">
                      {qItems.map((item, idx) => (
                        <div key={idx} className={`flex items-center gap-3 bg-surface p-3 rounded-lg border shadow-sm transition-colors ${item.is_correct ? "border-success" : "border-border"}`}>
                          <div 
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer flex-shrink-0 ${item.is_correct ? "border-success" : "border-border"}`}
                            onClick={() => handleSetCorrect(idx)}
                          >
                            {item.is_correct && <div className="w-3 h-3 rounded-full bg-success"></div>}
                          </div>
                          <input 
                            className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-body-md font-body-md outline-none" 
                            type="text" 
                            placeholder={`Alternativa ${idx + 1}`}
                            value={item.text}
                            onChange={(e) => handleUpdateItem(idx, e.target.value)}
                          />
                          <button className="text-slate-400 hover:text-danger flex-shrink-0" onClick={() => handleRemoveItem(idx)}>
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-sm pt-md border-t border-border">
                  <button className="px-6 py-3 font-button text-button text-text-secondary hover:bg-slate-100 rounded-lg transition-colors" onClick={() => {
                    setQStem("");
                    setQItems([{ text: "", is_correct: true }, { text: "", is_correct: false }]);
                  }}>Limpar</button>
                  <button 
                    className="px-8 py-3 font-button text-button bg-primary text-on-primary rounded-lg shadow-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                    onClick={handleSaveQuestion}
                    disabled={!qStem.trim()}
                  >
                    Salvar Questão
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Right Side: Settings & Publish */}
        <aside className="hidden lg:flex w-[320px] bg-white border-l border-slate-200 p-6 flex-col gap-6 overflow-y-auto flex-shrink-0">
          <div className="space-y-4">
            <h3 className="font-h3 text-h3 text-text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">schedule</span> Configuração
            </h3>
            <div className="space-y-3">
              <div className="space-y-xs">
                <label className="font-label-caps text-label-caps text-text-secondary uppercase">Tempo Limite</label>
                <div className="flex items-center gap-3 bg-surface-container-low p-3 rounded-lg border border-border">
                  <span className="material-symbols-outlined text-text-secondary">timer</span>
                  <input 
                    type="number" 
                    className="bg-transparent border-none outline-none w-16 text-body-md font-semibold focus:ring-0 p-0"
                    placeholder="120"
                    value={timePerQuestion}
                    onChange={(e) => setTimePerQuestion(e.target.value)}
                  />
                  <span className="text-body-sm font-semibold text-text-secondary">Seg/Questão</span>
                </div>
              </div>
            </div>
          </div>
          
          <hr className="border-slate-100" />
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-h3 text-h3 text-text-primary">Atribuir a</h3>
              <span className="text-xs text-primary font-bold bg-primary/10 px-2 py-1 rounded-full">Turmas</span>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">search</span>
              <input className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-body-sm focus:ring-1 focus:ring-primary outline-none" placeholder="Buscar turmas ou alunos..." type="text"/>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-slate-50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs">3A</div>
                  <span className="text-body-sm font-medium">Turma 3A - Ciências</span>
                </div>
                <input type="checkbox" defaultChecked className="rounded border-border text-primary focus:ring-primary" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-slate-50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs">3B</div>
                  <span className="text-body-sm font-medium">Turma 3B - Ciências</span>
                </div>
                <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" />
              </div>
            </div>
          </div>
          
          <div className="mt-auto pt-6 border-t border-border">
            <button 
              className="w-full py-4 bg-primary text-on-primary rounded-xl font-h3 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              onClick={handleSaveTest}
              disabled={questions.length === 0 || !title.trim()}
            >
              <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>rocket_launch</span> Publicar Simulado
            </button>
            <p className="text-[11px] text-center text-text-secondary mt-3">Agendado para ser liberado após a criação.</p>
          </div>
        </aside>

        {/* Mobile Submit Button (Fallback) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 z-50">
          <button 
            className="w-full py-3 bg-primary text-on-primary rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            onClick={handleSaveTest}
            disabled={questions.length === 0 || !title.trim()}
          >
            Publicar ({questions.length} questões)
          </button>
        </div>
      </div>
    </div>
  );
}

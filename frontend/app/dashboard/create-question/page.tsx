"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Item {
  text: string;
  is_correct: boolean;
}

export default function CreateQuestionPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("eduksim_token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  // Editor State
  const [qSubject, setQSubject] = useState("Matemática");
  const [qStem, setQStem] = useState("");
  const [qType, setQType] = useState<"FECHADA" | "ABERTA">("FECHADA");
  const [qItems, setQItems] = useState<Item[]>([{ text: "", is_correct: true }, { text: "", is_correct: false }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSaveQuestion = async () => {
    if (!qStem.trim()) return alert("O enunciado não pode ser vazio.");

    // Validar se fechada tem pelo menos 2 alternativas e 1 correta
    if (qType === "FECHADA") {
      if (qItems.length < 2) return alert("Questões fechadas precisam de pelo menos 2 alternativas.");
      const hasCorrect = qItems.some(i => i.is_correct);
      if (!hasCorrect) return alert("Selecione qual a alternativa correta.");
    }

    const token = localStorage.getItem("eduksim_token");
    if (!token) return router.push("/login");

    setIsSubmitting(true);
    try {
      const resQ = await fetch("http://localhost:8000/api/exams/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: qSubject,
          content: "",
          stem: qStem,
          question_type: qType,
          items: qType === "FECHADA" ? qItems : []
        })
      });

      if (resQ.ok) {
        alert("Questão cadastrada com sucesso no Banco!");
        // Reset editor
        setQStem("");
        setQItems([{ text: "", is_correct: true }, { text: "", is_correct: false }]);
      } else {
        alert("Falha ao salvar questão. Verifique os dados.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de comunicação com o servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-body-md text-text-primary h-screen overflow-hidden flex flex-col bg-background">
      {/* TopNavBar */}
      <header className="bg-white border-b border-slate-200 shadow-sm top-0 z-50 flex justify-between items-center h-16 px-6 w-full flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-xl font-bold tracking-tight text-blue-600 font-lexend hover:opacity-80">EdukSim</Link>
          <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>
          <nav className="hidden md:flex gap-6">
            <Link className="text-slate-500 font-lexend text-sm font-medium hover:bg-slate-50 transition-colors px-3 py-2 rounded-lg" href="/dashboard">Painel</Link>
            <Link className="text-blue-600 border-b-2 border-blue-600 font-lexend text-sm font-medium px-3 py-2" href="#">Banco de Questões</Link>
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

      {/* Main Content Area: Question Builder */}
      <main className="flex-1 overflow-y-auto p-gutter flex justify-center">
        <div className="w-full max-w-[896px] space-y-md pb-xl">

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                <span className="material-symbols-outlined">arrow_back</span>
              </Link>
              <div>
                <h1 className="font-h1 text-h1">Nova Questão</h1>
                <p className="text-text-secondary">Adicione uma questão avulsa ao banco global do sistema.</p>
              </div>
            </div>
          </div>

          {/* Question Builder Card */}
          <div className="bg-surface border border-border rounded-xl p-md shadow-sm relative">

            <div className="space-y-md">
              {/* Disciplina */}
              <div className="space-y-xs">
                <label className="font-label-caps text-label-caps text-text-secondary uppercase">Área / Disciplina</label>
                <select
                  className="w-full md:w-1/2 px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none appearance-none transition-all bg-white"
                  value={qSubject}
                  onChange={(e) => setQSubject(e.target.value)}
                >
                  <option value="Matemática">Matemática</option>
                  <option value="Física">Física</option>
                  <option value="História">História</option>
                  <option value="Biologia">Biologia</option>
                  <option value="Linguagens">Linguagens</option>
                  <option value="Geral">Geral</option>
                </select>
              </div>

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
                    rows={6}
                    value={qStem}
                    onChange={(e) => setQStem(e.target.value)}
                  ></textarea>
                </div>
              </div>

              {/* Type */}
              <div className="space-y-xs md:w-1/2">
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

              {/* Options Builder (Visible if Multiple Choice) */}
              {qType === "FECHADA" && (
                <div className="space-y-sm bg-surface-container-low p-sm rounded-xl border border-slate-100 mt-6">
                  <div className="flex justify-between items-center px-1">
                    <label className="font-label-caps text-label-caps text-text-secondary uppercase">Alternativas de Resposta</label>
                    <span className="text-body-sm text-primary font-medium cursor-pointer flex items-center" onClick={handleAddItem}>
                      <span className="material-symbols-outlined text-[16px] mr-1">add</span> Adicionar Alternativa
                    </span>
                  </div>
                  <div className="space-y-2 mt-4">
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
                        <button className="text-slate-400 hover:text-danger flex-shrink-0 p-2 rounded-full hover:bg-slate-50 transition-colors" onClick={() => handleRemoveItem(idx)}>
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-text-secondary px-1 pt-2">Selecione a bolinha da alternativa correta para o gabarito.</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-sm pt-md border-t border-border mt-8">
                <button
                  className="px-6 py-3 font-button text-button bg-primary text-on-primary rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  onClick={handleSaveQuestion}
                  disabled={!qStem.trim() || isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                  ) : (
                    <span className="material-symbols-outlined">save</span>
                  )}
                  Salvar no Banco
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  ArrowLeft,
  Upload,
  Document,
  TrashCan,
  Chat,
  Education,
  Checkmark,
  Close,
  Send,
  Renew,
  ChevronRight,
} from '@carbon/icons-react';
import { usePDFManager, SavedPDF } from '../hooks/usePDFManager';
import { CEFRLevel } from '../types';

interface FluencyPDFPracticeProps {
  userLevel: CEFRLevel;
  onBack: () => void;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

type PracticeMode = 'select' | 'conversation' | 'vocabulary' | 'grammar';

// ─── API helper ───────────────────────────────────────────────────────────────

async function callGemini(prompt: string, pdfContent: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('API key não configurada');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `CONTEXT (lesson PDF content):\n${pdfContent}\n\n---\n\n${prompt}` }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
      }),
    }
  );

  if (!response.ok) throw new Error(`Erro na API: ${response.status}`);
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Resposta inválida da API');
  return text;
}

async function callGeminiJSON<T>(prompt: string, pdfContent: string): Promise<T> {
  const raw = await callGemini(prompt, pdfContent);
  // Extrair o primeiro bloco JSON do texto (array ou objeto)
  const match = raw.match(/(\[\s*\{[\s\S]*\}\s*\]|\{[\s\S]*\})/m);
  if (!match) throw new Error(`Resposta não contém JSON válido. Recebido: ${raw.slice(0, 200)}`);
  return JSON.parse(match[1]) as T;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function UploadZone({ onFile }: { onFile: (f: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file?.type === 'application/pdf') onFile(file);
    },
    [onFile]
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
        dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = '';
        }}
      />
      <Upload size={32} className="mx-auto mb-3 text-blue-500" />
      <p className="text-sm font-semibold text-gray-700">Arraste o PDF aqui ou clique para selecionar</p>
      <p className="text-xs text-gray-500 mt-1">Somente arquivos .pdf</p>
    </div>
  );
}

// ─── Conversation Mode ────────────────────────────────────────────────────────

function ConversationPractice({ pdf, userLevel }: { pdf: SavedPDF; userLevel: CEFRLevel }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: `Hello! 👋 I've read your lesson material on **${pdf.name}**. I'm here to help you prepare for your English class!\n\nWe can:\n• Discuss the main topics\n• Practise key vocabulary: ${pdf.vocabulary.slice(0, 4).join(', ')}\n• Role-play conversation scenarios\n\nWhat would you like to practise first?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = [...messages, userMsg]
        .map((m) => `${m.role === 'user' ? 'Student' : 'Teacher'}: ${m.text}`)
        .join('\n');

      const prompt = `You are an enthusiastic English teacher (level ${userLevel} student). Use the lesson PDF content as the basis for this conversation. Help the student prepare for their English class by practising the topics and vocabulary from the material.

Always:
- Correct grammar mistakes kindly and show the correct form
- Encourage use of vocabulary from the PDF
- Ask follow-up questions to keep the conversation going
- Suggest more natural ways to phrase things when relevant
- Keep responses concise (2-4 sentences max unless explaining something)

Conversation so far:
${history}

Teacher:`;

      const reply = await callGemini(prompt, pdf.extractedContent);
      setMessages((prev) => [...prev, { role: 'assistant', text: reply.trim() }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: "Sorry, I had a connection issue. Please try again!" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Topic chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {pdf.topics.map((t) => (
          <span key={t} className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
            {t}
          </span>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Type your answer in English..."
          className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={send}
          disabled={!input.trim() || isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-3 rounded-xl transition-colors"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

// ─── Quiz Mode (shared for Vocabulary & Grammar) ──────────────────────────────

function QuizMode({
  pdf,
  type,
  userLevel,
}: {
  pdf: SavedPDF;
  type: 'vocabulary' | 'grammar';
  userLevel: CEFRLevel;
}) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQuiz = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setQuestions([]);
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setFinished(false);

    const typeLabel = type === 'vocabulary' ? 'vocabulary and expressions' : 'grammar structures and patterns';
    const prompt = `Based on the lesson content, create 8 multiple-choice questions testing the student's understanding of ${typeLabel} from this material. Student CEFR level: ${userLevel}.

Return ONLY valid JSON (no markdown):
[
  {
    "id": "q1",
    "question": "...",
    "options": ["option A", "option B", "option C", "option D"],
    "correct": 0,
    "explanation": "Brief explanation of why this is correct, referencing the lesson."
  }
]

Make questions directly based on the PDF content. Vary difficulty.`;

    try {
      // Limitar o conteúdo para não ultrapassar o limite de tokens
      const content = pdf.extractedContent.slice(0, 8000);
      const result = await callGeminiJSON<QuizQuestion[]>(prompt, content);
      if (!Array.isArray(result) || result.length === 0) throw new Error('Array de questões vazio');
      setQuestions(result);
    } catch (err) {
      console.error('[QuizMode] Erro ao gerar questões:', err);
      setError(`Não foi possível gerar as questões: ${err instanceof Error ? err.message : 'erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  }, [pdf, type, userLevel]);

  useEffect(() => {
    generateQuiz();
  }, [generateQuiz]);

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === questions[current].correct) setScore((s) => s + 1);
  };

  const next = () => {
    if (current + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Renew size={32} className="text-blue-500 animate-spin" />
        <p className="text-gray-600 text-sm">Gerando questões com base no PDF...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-600 text-sm">{error}</p>
        <button onClick={generateQuiz} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm">
          Tentar novamente
        </button>
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const emoji = pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '💪';
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
        <div className="text-6xl">{emoji}</div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{score}/{questions.length}</h3>
          <p className="text-gray-600 mt-1">{pct}% de acerto</p>
        </div>
        <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
          pct >= 80 ? 'bg-green-100 text-green-700' : pct >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
        }`}>
          {pct >= 80 ? 'Excelente! Você está bem preparado.' : pct >= 60 ? 'Bom! Continue praticando.' : 'Continue estudando o material.'}
        </div>
        <button onClick={generateQuiz} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
          <Renew size={18} />
          Novo Teste
        </button>
      </div>
    );
  }

  if (!questions.length) return null;

  const q = questions[current];
  return (
    <div className="flex flex-col gap-5">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-gray-500 whitespace-nowrap">
          {current + 1}/{questions.length}
        </span>
        <span className="text-xs font-bold text-green-600 whitespace-nowrap">{score} ✓</span>
      </div>

      {/* Question */}
      <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
        <p className="text-gray-900 font-medium text-sm leading-relaxed">{q.question}</p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {q.options.map((opt, idx) => {
          let style = 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50';
          if (selected !== null) {
            if (idx === q.correct) style = 'border-green-500 bg-green-50';
            else if (idx === selected) style = 'border-red-400 bg-red-50';
            else style = 'border-gray-200 bg-gray-50 opacity-60';
          }
          return (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all text-sm font-medium flex items-center gap-3 ${style}`}
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold">
                {['A', 'B', 'C', 'D'][idx]}
              </span>
              <span className="flex-1">{opt}</span>
              {selected !== null && idx === q.correct && <Checkmark size={16} className="text-green-600 flex-shrink-0" />}
              {selected !== null && idx === selected && idx !== q.correct && <Close size={16} className="text-red-500 flex-shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {selected !== null && (
        <div className={`rounded-xl p-4 text-sm ${
          selected === q.correct ? 'bg-green-50 border border-green-200 text-green-900' : 'bg-red-50 border border-red-200 text-red-900'
        }`}>
          <strong>{selected === q.correct ? '✓ Correto!' : '✗ Incorreto.'}</strong>{' '}
          {q.explanation}
        </div>
      )}

      {selected !== null && (
        <button
          onClick={next}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-colors"
        >
          {current + 1 >= questions.length ? 'Ver Resultado' : 'Próxima Questão'}
          <ChevronRight size={18} />
        </button>
      )}
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ManifestEntry {
  name: string;
  file: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function FluencyPDFPractice({ userLevel, onBack }: FluencyPDFPracticeProps) {
  const { pdfs, isProcessing, processingError, uploadPDF, deletePDF } = usePDFManager();
  const [selectedPDF, setSelectedPDF] = useState<SavedPDF | null>(null);
  const [mode, setMode] = useState<PracticeMode>('select');
  const [manifestPdfs, setManifestPdfs] = useState<ManifestEntry[]>([]);
  const [loadingManifestFile, setLoadingManifestFile] = useState<string | null>(null);

  // Buscar manifest ao montar
  useEffect(() => {
    fetch('/FluencyPDF/manifest.json')
      .then((r) => r.json())
      .then((data: ManifestEntry[]) => setManifestPdfs(data))
      .catch(() => setManifestPdfs([]));
  }, []);

  const handleFile = async (file: File) => {
    const result = await uploadPDF(file);
    if (result) {
      setSelectedPDF(result);
      setMode('conversation');
    }
  };

  // Quando usuário clica em um PDF do manifest:
  // Se já foi processado (está no localStorage), usa direto.
  // Se não, busca o arquivo da pasta public e processa.
  const handleManifestPDF = async (entry: ManifestEntry) => {
    const cached = pdfs.find((p) => p.name === entry.name);
    if (cached) {
      setSelectedPDF(cached);
      setMode('conversation');
      return;
    }

    setLoadingManifestFile(entry.file);
    try {
      const res = await fetch(`/FluencyPDF/${entry.file}`);
      const blob = await res.blob();
      const file = new File([blob], entry.file, { type: 'application/pdf' });
      const result = await uploadPDF(file, entry.name);
      if (result) {
        setSelectedPDF(result);
        setMode('conversation');
      }
    } finally {
      setLoadingManifestFile(null);
    }
  };

  const handleSelectPDF = (pdf: SavedPDF) => {
    setSelectedPDF(pdf);
    setMode('conversation');
  };

  const handleBack = () => {
    if (mode !== 'select') {
      setMode('select');
      setSelectedPDF(null);
    } else {
      onBack();
    }
  };

  // ── Header ──────────────────────────────────────────────────────────────────
  const renderHeader = () => (
    <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
      <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
        <ArrowLeft size={22} />
      </button>
      <div className="flex-1 min-w-0">
        <h2 className="font-bold text-gray-900 truncate">
          {mode === 'select' ? 'Preparação para Aula (PDF)' : selectedPDF?.name ?? 'PDF'}
        </h2>
        <p className="text-xs text-gray-500">Nível {userLevel}</p>
      </div>
      {selectedPDF && mode !== 'select' && (
        <button
          onClick={() => { setMode('select'); setSelectedPDF(null); }}
          className="text-xs text-blue-600 font-medium hover:underline"
        >
          Trocar PDF
        </button>
      )}
    </header>
  );

  // ── Select / Upload screen ──────────────────────────────────────────────────
  if (mode === 'select') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {renderHeader()}
        <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 space-y-6">

          {/* Upload */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3">Adicionar novo PDF</h3>
            {isProcessing ? (
              <div className="border-2 border-dashed border-blue-300 rounded-2xl p-8 flex flex-col items-center gap-3 bg-blue-50">
                <Renew size={32} className="text-blue-500 animate-spin" />
                <p className="text-sm text-blue-700 font-medium">Processando PDF com IA...</p>
                <p className="text-xs text-blue-600">Extraindo conteúdo e vocabulário</p>
              </div>
            ) : (
              <UploadZone onFile={handleFile} />
            )}
            {processingError && (
              <p className="text-xs text-red-600 mt-2">{processingError}</p>
            )}
          </div>

          {/* Aulas do Curso (pasta public/FluencyPDF) */}
          {manifestPdfs.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">Aulas do Curso ({manifestPdfs.length})</h3>
              <div className="space-y-3">
                {manifestPdfs.map((entry) => {
                  const cached = pdfs.find((p) => p.name === entry.name);
                  const isLoadingThis = loadingManifestFile === entry.file;
                  const busy = isProcessing || isLoadingThis || loadingManifestFile !== null;
                  return (
                    <div
                      key={entry.file}
                      className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-center gap-4"
                    >
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Document size={20} className="text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{entry.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {cached ? '✓ Já processado' : 'Será processado na primeira vez'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleManifestPDF(entry)}
                        disabled={busy}
                        className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
                      >
                        {isLoadingThis ? (
                          <><Renew size={14} className="animate-spin" /> Processando...</>
                        ) : (
                          'Praticar'
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PDFs enviados manualmente */}
          {pdfs.filter((p) => !manifestPdfs.find((m) => m.name === p.name)).length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">PDFs enviados por você</h3>
              <div className="space-y-3">
                {pdfs
                  .filter((p) => !manifestPdfs.find((m) => m.name === p.name))
                  .map((pdf) => (
                  <div
                    key={pdf.id}
                    className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-center gap-4 group"
                  >
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Document size={20} className="text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{pdf.name}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {pdf.topics.slice(0, 3).map((t) => (
                          <span key={t} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {t}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(pdf.uploadedAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleSelectPDF(pdf)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                      >
                        Praticar
                      </button>
                      <button
                        onClick={() => deletePDF(pdf.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Excluir PDF"
                      >
                        <TrashCan size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pdfs.length === 0 && manifestPdfs.length === 0 && !isProcessing && (
            <div className="text-center py-10 text-gray-400">
              <Document size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">Nenhum PDF disponível ainda.</p>
              <p className="text-xs mt-1">Faça upload do PDF da sua aula para começar.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Practice screen ─────────────────────────────────────────────────────────
  if (!selectedPDF) return null;

  const tabs: { id: PracticeMode; label: string; icon: React.ReactNode }[] = [
    { id: 'conversation', label: 'Conversa', icon: <Chat size={16} /> },
    { id: 'vocabulary', label: 'Vocabulário', icon: <Education size={16} /> },
    { id: 'grammar', label: 'Gramática', icon: <Education size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {renderHeader()}

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="max-w-2xl mx-auto flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                mode === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 h-full flex flex-col">
          {mode === 'conversation' && (
            <ConversationPractice pdf={selectedPDF} userLevel={userLevel} />
          )}
          {mode === 'vocabulary' && (
            <QuizMode key={`vocab-${selectedPDF.id}`} pdf={selectedPDF} type="vocabulary" userLevel={userLevel} />
          )}
          {mode === 'grammar' && (
            <QuizMode key={`gram-${selectedPDF.id}`} pdf={selectedPDF} type="grammar" userLevel={userLevel} />
          )}
        </div>
      </div>
    </div>
  );
}

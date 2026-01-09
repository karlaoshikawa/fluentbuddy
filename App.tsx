
import React, { useState, useEffect } from 'react';
import { useLiveChat } from './hooks/useLiveChat';
import { TEACHER_PERSONAS } from './constants';
import { ConnectionStatus, TeacherPersona } from './types';
import ChatHistory from './components/ChatHistory';
import Visualizer from './components/Visualizer';
import { usePronunciationAnalysis } from './hooks/usePronunciationAnalysis';
import PronunciationPanel from './components/PronunciationPanel';
import EvolutionDashboard from './components/EvolutionDashboard';
import { useProgressTracker } from './hooks/useProgressTracker';

const App: React.FC = () => {
  const [selectedPersona, setSelectedPersona] = useState<TeacherPersona>(TEACHER_PERSONAS[0]);
  const [hasStarted, setHasStarted] = useState(false);
  const [isKeyConfigured, setIsKeyConfigured] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  const { stats, isAssessing, runAssessment } = useProgressTracker();

  const { 
    status, 
    errorMsg,
    transcriptions, 
    isMuted, 
    setIsMuted, 
    startSession, 
    stopSession 
  } = useLiveChat(selectedPersona, stats.level, runAssessment);

  const { analyze, isAnalyzing, result, clear } = usePronunciationAnalysis();

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setIsKeyConfigured(hasKey);
      }
    };
    checkKey();
  }, []);

  const handleOpenKeySelector = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setIsKeyConfigured(true);
    }
  };

  const handleStart = async () => {
    if (!isKeyConfigured) {
      setShowGuide(true);
      return;
    }
    setHasStarted(true);
    await startSession();
  };

  const handleBack = () => {
    stopSession();
    clear();
    setHasStarted(false);
  };

  const handleAnalyzeLast = () => {
    const lastUserEntry = [...transcriptions].reverse().find(t => t.role === 'user');
    if (lastUserEntry) {
      analyze(lastUserEntry.text);
    }
  };

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        {showGuide && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6">
              <h3 className="text-2xl font-bold text-gray-900">Guia de Configuração</h3>
              <div className="space-y-4 text-gray-600 text-sm">
                <p>Para treinar para cargos de <strong>Manager</strong> com estabilidade, você precisa de uma API Key do Google.</p>
                <ol className="list-decimal ml-4 space-y-2">
                  <li>Crie uma chave em <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-blue-600 underline font-bold">AI Studio</a>.</li>
                  <li>Ative o faturamento (Billing) no Google Cloud para evitar que a conexão caia.</li>
                  <li>Clique no botão abaixo para inserir sua chave no sistema.</li>
                </ol>
                <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-xs leading-relaxed">
                  <strong>Dica:</strong> Você pode usar aqui no PC mesmo. O "Deploy" serve para levar o app no celular para qualquer lugar.
                </div>
              </div>
              <div className="flex flex-col space-y-3">
                <button onClick={handleOpenKeySelector} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors">
                  Configurar Minha Chave
                </button>
                <button onClick={() => setShowGuide(false)} className="w-full bg-gray-100 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors">
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-1/2 bg-blue-600 p-8 text-white flex flex-col justify-center">
            <div className="mb-6 flex justify-between items-center">
              <span className="bg-blue-400 bg-opacity-30 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                Professional Tech English
              </span>
              <button onClick={() => setShowGuide(true)} className="text-blue-200 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </button>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">FluentBuddy</h1>
            <p className="text-blue-100 text-lg mb-8 leading-relaxed">
              Prepare-se para cargos internacionais de gestão com mentoria de voz em tempo real.
            </p>
            
            <div className="mt-8 space-y-4">
               <div className="bg-blue-500 bg-opacity-20 border border-blue-400 border-opacity-30 rounded-2xl p-4">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold opacity-80 uppercase tracking-tighter">Sua Evolução CEFR</span>
                    <span className="bg-white text-blue-600 px-2 py-0.5 rounded-lg text-xs font-bold">{stats.level}</span>
                 </div>
                 <div className="h-2 w-full bg-blue-800 bg-opacity-40 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${(stats.grammar + stats.vocabulary + stats.communication) / 3}%` }} />
                 </div>
               </div>

               {!isKeyConfigured && (
                 <div className="bg-amber-400 bg-opacity-10 border border-amber-400 border-opacity-30 rounded-2xl p-4 text-xs">
                   <p className="font-bold mb-1">💡 Upgrade para Management</p>
                   <p className="opacity-80 mb-3 text-[11px]">O plano gratuito pode cair. Configure uma chave paga para sessões ilimitadas.</p>
                   <button onClick={handleOpenKeySelector} className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg transition-all w-full">
                     Configurar Conta Paga
                   </button>
                 </div>
               )}
            </div>
          </div>

          <div className="md:w-1/2 p-8 flex flex-col">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Selecione seu Coach</h2>
            <div className="space-y-4 flex-1">
              {TEACHER_PERSONAS.map((persona) => (
                <button
                  key={persona.id}
                  onClick={() => setSelectedPersona(persona)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 flex items-center space-x-4 ${
                    selectedPersona.id === persona.id 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                    persona.id === 'alex' ? 'bg-orange-400' : persona.id === 'sarah' ? 'bg-purple-400' : 'bg-indigo-600'
                  }`}>
                    {persona.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-gray-900">{persona.name}</h4>
                      <span className="text-xs font-medium text-gray-500 px-2 py-0.5 bg-gray-100 rounded-full">{persona.accent}</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{persona.description}</p>
                  </div>
                </button>
              ))}
            </div>
            
            <button 
              onClick={handleStart}
              className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg transform active:scale-95 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>{isKeyConfigured ? 'Começar Sessão' : 'Configurar para Começar'}</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h2 className="font-bold text-gray-900 flex items-center">
              Coaching: {selectedPersona.name}
              <span className={`ml-3 w-2 h-2 rounded-full ${status === ConnectionStatus.CONNECTED ? 'bg-green-500 animate-pulse' : status === ConnectionStatus.ERROR ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'}`} />
            </h2>
            <p className="text-xs text-gray-500">
              Modo Profissional Ativo &bull; {stats.level}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
           <button onClick={handleOpenKeySelector} className="hidden md:flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-[10px] font-bold transition-colors">
            CONFIGURAR CHAVE
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-4 md:p-6 space-y-4">
        <EvolutionDashboard stats={stats} isAssessing={isAssessing} />

        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden flex flex-col p-6 items-center justify-center text-center space-y-4">
          {status === ConnectionStatus.ERROR && (
            <div className="w-full bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm">
               {errorMsg?.includes("not found") ? "Sua chave API expirou ou é inválida. Clique abaixo para re-configurar." : errorMsg || 'Erro de conexão.'}
               <button onClick={handleOpenKeySelector} className="block w-full mt-2 font-bold underline">Re-configurar Chave</button>
            </div>
          )}

          <div className="relative">
             <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-xl transition-transform duration-500 ${
               status === ConnectionStatus.CONNECTED ? 'scale-110' : 'scale-100'
             } ${
                selectedPersona.id === 'alex' ? 'bg-orange-400' : selectedPersona.id === 'sarah' ? 'bg-purple-400' : 'bg-indigo-600'
              }`}>
                {selectedPersona.name[0]}
              </div>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-gray-900">{selectedPersona.name}</h3>
            <p className="text-gray-500 text-sm max-w-sm">
              {status === ConnectionStatus.CONNECTED 
                ? "Conexão estável. Pode falar." 
                : "Preparando ambiente de mentoria..."}
            </p>
          </div>

          <Visualizer isActive={status === ConnectionStatus.CONNECTED && !isMuted} status={status} />
        </div>

        {result && (
          <PronunciationPanel result={result} onClose={clear} />
        )}

        <ChatHistory entries={transcriptions} />

        <div className="sticky bottom-6 flex justify-center items-center space-x-4">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            disabled={status !== ConnectionStatus.CONNECTED}
            className={`p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center justify-center disabled:opacity-50 ${
              isMuted ? 'bg-red-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {isMuted ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z M1 1l22 22" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            )}
          </button>

          {status === ConnectionStatus.CONNECTED ? (
             <div className="flex space-x-2">
               <button 
                  onClick={handleAnalyzeLast}
                  disabled={isAnalyzing || transcriptions.filter(t => t.role === 'user').length === 0}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-2xl font-bold shadow-xl flex items-center space-x-2 transition-all transform hover:scale-105 disabled:opacity-50"
               >
                 <span className="text-sm">Avaliar Fala</span>
               </button>

               <button 
                  onClick={stopSession}
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-2xl font-bold shadow-xl flex items-center space-x-2 transition-all"
               >
                 <span className="text-sm">Encerrar</span>
               </button>
             </div>
          ) : (
            <button 
                onClick={startSession}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl transition-all"
             >
               Reconectar Mentor
             </button>
          )}
        </div>
      </main>

      <footer className="py-4 text-center text-gray-400 text-[10px] uppercase tracking-widest flex items-center justify-center space-x-2">
        <span>FluentBuddy &bull; Management Career Accelerator</span>
        <span className="bg-gray-200 px-2 py-0.5 rounded text-gray-500">
          {isLocal ? 'Ambiente Local' : 'Deploy Ativo'}
        </span>
      </footer>
    </div>
  );
};

export default App;

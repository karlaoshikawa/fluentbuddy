
import React, { useState, useEffect } from 'react';
import { useLiveChat } from './hooks/useLiveChat';
import { TEACHER_PERSONAS } from './constants';
import { ConnectionStatus, TeacherPersona, CEFRLevel } from './types';
import ChatHistory from './components/ChatHistory';
import Visualizer from './components/Visualizer';
import { usePronunciationAnalysis } from './hooks/usePronunciationAnalysis';
import PronunciationPanel from './components/PronunciationPanel';
import EvolutionDashboard from './components/EvolutionDashboard';
import { useProgressTracker } from './hooks/useProgressTracker';
import { useLearningProgress } from './hooks/useLearningProgress';
import { LearningProgressSummary } from './components/LearningProgressSummary';
import { LearningPath } from './components/LearningPath';
import { ReviewReminder } from './components/ReviewReminder';
import { Login } from './components/Login';
import { LevelTest } from './components/LevelTest';
import { ArrowLeft, Send, Microphone, MicrophoneOff, Stop, Book, Logout, Play, Edit } from '@carbon/icons-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<TeacherPersona>(TEACHER_PERSONAS[0]);
  const [hasStarted, setHasStarted] = useState(false);
  const [showLearningPath, setShowLearningPath] = useState(false);
  const [studyMode, setStudyMode] = useState<'voice' | 'text'>('voice');
  const [textInput, setTextInput] = useState('');
  const [showLevelTest, setShowLevelTest] = useState(false);
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  // Verificar autenticação e teste de nível ao carregar
  useEffect(() => {
    const auth = localStorage.getItem('fluentbuddy_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
    
    // Verificar se já fez o teste de nível
    const hasCompletedTest = localStorage.getItem('fluentbuddy_level_test_completed');
    if (!hasCompletedTest && auth === 'true') {
      setShowLevelTest(true);
    }
  }, []);
  
  const { stats, isAssessing, runAssessment, setInitialLevel } = useProgressTracker();
  
  // Sistema de acompanhamento de requisitos de aprendizado
  const { 
    getAIContext, 
    getItemsDueForReview, 
    getUpcomingReviews 
  } = useLearningProgress(stats.level);
  const learningContext = getAIContext();
  
  const dueForReview = getItemsDueForReview();
  const upcomingReviews = getUpcomingReviews(7);

  const { 
    status, 
    errorMsg,
    transcriptions, 
    isMuted, 
    setIsMuted, 
    startSession, 
    stopSession,
    sendTextMessage
  } = useLiveChat(selectedPersona, stats.level, runAssessment, learningContext, studyMode === 'voice');

  const { analyze, isAnalyzing, result, clear } = usePronunciationAnalysis();

  const handleStart = async () => {
    setHasStarted(true);
    await startSession();
  };

  const handleBack = () => {
    if (showLearningPath) {
      setShowLearningPath(false);
    } else {
      stopSession();
      clear();
      setHasStarted(false);
    }
  };

  const handleLevelTestComplete = (level: CEFRLevel) => {
    setInitialLevel(level);
    localStorage.setItem('fluentbuddy_level_test_completed', 'true');
    setShowLevelTest(false);
  };

  const handleAnalyzeLast = () => {
    const lastUserEntry = [...transcriptions].reverse().find(t => t.role === 'user');
    if (lastUserEntry) {
      analyze(lastUserEntry.text);
    }
  };

  // Verificar autenticação primeiro
  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  // Mostrar teste de nível se for a primeira vez
  if (showLevelTest) {
    return <LevelTest onComplete={handleLevelTestComplete} />;
  }

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-1/2 bg-slate-700 p-8 text-white flex flex-col justify-center">
            <div className="mb-6">
              <span className="bg-slate-600 bg-opacity-40 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                Professional Tech English
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">FluentBuddy</h1>
            <p className="text-slate-200 text-lg mb-8 leading-relaxed">
              Prepare-se para cargos internacionais de gestão com mentoria de voz em tempo real.
            </p>
            
            <div className="mt-8">
               <div className="bg-slate-600 bg-opacity-20 border border-slate-500 border-opacity-30 rounded-2xl p-4">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold opacity-80 uppercase tracking-tighter">Sua Evolução CEFR</span>
                    <span className="bg-white text-slate-700 px-2 py-0.5 rounded-lg text-xs font-bold">{stats.level}</span>
                 </div>
                 <div className="h-2 w-full bg-slate-800 bg-opacity-40 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${(stats.grammar + stats.vocabulary + stats.communication) / 3}%` }} />
                 </div>
               </div>
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
                      ? 'border-slate-600 bg-slate-50 shadow-md' 
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                    persona.id === 'alex' ? 'bg-slate-600' : persona.id === 'sarah' ? 'bg-slate-700' : 'bg-slate-800'
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

            <div className="mt-6 mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-3">Modo de Estudo:</label>
              <div className="flex items-center bg-gray-100 rounded-2xl p-1.5">
                <button
                  onClick={() => setStudyMode('voice')}
                  className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all duration-200 flex items-center justify-center space-x-2 ${
                    studyMode === 'voice' 
                      ? 'bg-white text-slate-700 shadow-md' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Microphone size={20} />
                  <span>Voz</span>
                </button>
                <button
                  onClick={() => setStudyMode('text')}
                  className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all duration-200 flex items-center justify-center space-x-2 ${
                    studyMode === 'text' 
                      ? 'bg-white text-slate-700 shadow-md' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Edit size={20} />
                  <span>Texto</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {studyMode === 'voice' 
                  ? 'Modo completo com áudio' 
                  : 'Modo silencioso, apenas texto'}
              </p>
            </div>
            
            <button 
              onClick={handleStart}
              className="w-full bg-slate-700 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-lg transform active:scale-95 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>Começar Sessão</span>
              <ArrowLeft size={20} className="rotate-180" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar LearningPath se estiver ativo
  if (hasStarted && showLearningPath) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h2 className="font-bold text-gray-900">Requisitos de Aprendizado</h2>
              <p className="text-xs text-gray-500">Nível {stats.level}</p>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('fluentbuddy_auth');
              setIsAuthenticated(false);
            }}
            className="text-sm text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1.5"
          >
            <Logout size={18} />
            <span>Sair</span>
          </button>
        </header>
        <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6">
          <LearningPath currentLevel={stats.level} />
        </main>
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
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="font-bold text-gray-900 flex items-center">
              Coaching: {selectedPersona.name}
              <span className={`ml-3 w-2 h-2 rounded-full ${status === ConnectionStatus.CONNECTED ? 'bg-green-500 animate-pulse' : status === ConnectionStatus.ERROR ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'}`} />
            </h2>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              {studyMode === 'voice' ? <><Microphone size={12} /> Modo Voz</> : <><Edit size={12} /> Modo Texto</>} &bull; {stats.level}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
           <button 
             onClick={() => setShowLearningPath(true)}
             className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-[10px] font-bold transition-colors"
           >
            <Book size={14} />
            REQUISITOS
          </button>

          <button
            onClick={() => {
              localStorage.removeItem('fluentbuddy_auth');
              setIsAuthenticated(false);
            }}
            className="text-sm text-gray-500 hover:text-red-600 transition-colors px-3 py-1.5"
            title="Sair"
          >
            <Logout size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-4 md:p-6 space-y-4">
        <EvolutionDashboard stats={stats} isAssessing={isAssessing} />
        
        <ReviewReminder 
          dueItems={dueForReview}
          upcomingItems={upcomingReviews}
          onReviewClick={() => setShowLearningPath(true)}
        />
        
        <LearningProgressSummary 
          currentLevel={stats.level}
          onViewDetails={() => setShowLearningPath(true)}
        />

        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden flex flex-col p-6 items-center justify-center text-center space-y-4">
          {status === ConnectionStatus.ERROR && (
            <div className="w-full bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm">
               {errorMsg || 'Erro de conexão.'}
            </div>
          )}

          <div className="relative">
             <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-xl transition-transform duration-500 ${
               status === ConnectionStatus.CONNECTED ? 'scale-110' : 'scale-100'
             } ${
                selectedPersona.id === 'alex' ? 'bg-slate-600' : selectedPersona.id === 'sarah' ? 'bg-slate-700' : 'bg-slate-800'
              }`}>
                {selectedPersona.name[0]}
              </div>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-gray-900">{selectedPersona.name}</h3>
            <p className="text-gray-500 text-sm max-w-sm">
              {status === ConnectionStatus.CONNECTED 
                ? (studyMode === 'text' ? "Modo Silencioso - Digite suas mensagens" : "Conexão estável. Pode falar.")
                : "Preparando ambiente de mentoria..."}
            </p>
          </div>

          {studyMode === 'voice' && (
            <Visualizer isActive={status === ConnectionStatus.CONNECTED && !isMuted} status={status} />
          )}
        </div>

        {result && (
          <PronunciationPanel result={result} onClose={clear} />
        )}

        <ChatHistory entries={transcriptions} />

        {studyMode === 'text' ? (
          <div className="sticky bottom-6 bg-white rounded-2xl shadow-xl p-4 border border-gray-200">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (textInput.trim()) {

                  sendTextMessage(textInput);
                  setTextInput('');
                }
              }}
              className="flex items-center space-x-3"
            >
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (textInput.trim()) {

                      sendTextMessage(textInput);
                      setTextInput('');
                    }
                  }
                }}
                placeholder="Digite sua mensagem em inglês..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
                disabled={status === ConnectionStatus.ERROR}
              />
              <button
                type="submit"
                disabled={!textInput.trim() || status === ConnectionStatus.ERROR}
                className="bg-slate-700 hover:bg-slate-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center space-x-2"
              >
                <Send size={20} />
                <span>Enviar</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="sticky bottom-6 flex justify-center items-center space-x-4">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              disabled={status !== ConnectionStatus.CONNECTED}
              className={`p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center justify-center disabled:opacity-50 ${
                isMuted ? 'bg-red-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {isMuted ? <MicrophoneOff size={24} /> : <Microphone size={24} />}
            </button>

            {status === ConnectionStatus.CONNECTED ? (
              <div className="flex space-x-2">
                <button 
                  onClick={handleAnalyzeLast}
                  disabled={isAnalyzing || transcriptions.filter(t => t.role === 'user').length === 0}
                  className="bg-slate-700 hover:bg-slate-800 text-white px-5 py-3 rounded-2xl font-bold shadow-xl flex items-center space-x-2 transition-all transform hover:scale-105 disabled:opacity-50"
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
                className="bg-slate-700 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl transition-all"
              >
                Reconectar Mentor
              </button>
            )}
          </div>
        )}
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

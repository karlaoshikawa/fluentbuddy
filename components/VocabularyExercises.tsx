import React, { useState, useEffect } from 'react';
import { ArrowLeft, Checkmark, Close, Restart, Save, Time, Trophy, Book, Edit, DocumentView, Idea } from '@carbon/icons-react';
import { Exercise, ExerciseProgress, UserExerciseData, CEFRLevel, ExerciseAttempt } from '../types';
import { EXERCISE_BANK } from '../data';

interface VocabularyExercisesProps {
  currentLevel: CEFRLevel;
  onClose: () => void;
}

export function VocabularyExercises({ currentLevel, onClose }: VocabularyExercisesProps) {
  const [exerciseData, setExerciseData] = useState<UserExerciseData>(() => {
    const saved = localStorage.getItem('exercise_progress');
    return saved ? JSON.parse(saved) : {
      currentLevel,
      progressByExercise: {},
      totalCompleted: 0,
      totalCorrect: 0,
      streak: 0,
      lastPracticeDate: new Date()
    };
  });

  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [usedWordIndices, setUsedWordIndices] = useState<number[]>([]); // Rastrear índices usados
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [isSaving, setIsSaving] = useState(false);
  const [currentBlock, setCurrentBlock] = useState(0);
  const [blockProgress, setBlockProgress] = useState(0); // 0-9 (10 exercícios por bloco)
  const [showCelebration, setShowCelebration] = useState(false);

  // Salvar progresso localmente
  useEffect(() => {
    localStorage.setItem('exercise_progress', JSON.stringify(exerciseData));
  }, [exerciseData]);

  // Algoritmo de repetição espaçada + Filtro por requisitos
  const getNextExercise = (): Exercise | null => {
    const now = new Date();
    
    // 1. Filtrar exercícios APENAS do nível atual
    let availableExercises = EXERCISE_BANK.filter(ex => ex.level === currentLevel);

    // 2. NOVO: Filtrar por requisitos não completos (foco automático)
    try {
      const savedProgress = localStorage.getItem('learning_progress');
      if (savedProgress) {
        const learningProgress = JSON.parse(savedProgress);
        const completedRequirements = learningProgress.completedRequirements || [];
        
        // Priorizar exercícios relacionados a requisitos não completos
        const exercisesForIncompleteReqs = availableExercises.filter(ex => {
          // Se o exercício tem tags, verificar se alguma tag corresponde a requisitos não completos
          if (ex.tags && ex.tags.length > 0) {
            // Exercício é relevante se pelo menos uma tag não está nos requisitos completos
            return !ex.tags.every(tag => 
              completedRequirements.some((reqId: string) => reqId.includes(tag))
            );
          }
          return true; // Sem tags, incluir
        });

        // Se temos exercícios focados, usar eles
        if (exercisesForIncompleteReqs.length > 0) {
          availableExercises = exercisesForIncompleteReqs;
        }
      }
    } catch (error) {
      console.log('Using all exercises (no filtering)');
    }

    // 3. Priorizar exercícios que precisam de revisão
    const needReview = availableExercises.filter(ex => {
      const progress = exerciseData.progressByExercise[ex.id];
      if (!progress) return true; // Novo exercício
      return new Date(progress.nextReview) <= now;
    });

    if (needReview.length === 0) {
      // Todos revisados, pegar aleatório
      return availableExercises[Math.floor(Math.random() * availableExercises.length)];
    }

    // 4. Priorizar exercícios com menor masteryLevel
    needReview.sort((a, b) => {
      const aProgress = exerciseData.progressByExercise[a.id];
      const bProgress = exerciseData.progressByExercise[b.id];
      const aMastery = aProgress?.masteryLevel || 0;
      const bMastery = bProgress?.masteryLevel || 0;
      return aMastery - bMastery;
    });

    return needReview[0];
  };

  // Calcular próxima revisão (repetição espaçada)
  const calculateNextReview = (
    correct: boolean,
    currentProgress?: ExerciseProgress
  ): { nextReview: Date; interval: number; easeFactor: number; repetitions: number; masteryLevel: number } => {
    const now = new Date();
    
    if (!currentProgress) {
      // Primeira tentativa
      const interval = correct ? 4 : 0.5; // 4h se correto, 30min se errado
      return {
        nextReview: new Date(now.getTime() + interval * 60 * 60 * 1000),
        interval,
        easeFactor: correct ? 2.0 : 1.3,
        repetitions: correct ? 1 : 0,
        masteryLevel: correct ? 20 : 0
      };
    }

    const { easeFactor, repetitions, masteryLevel } = currentProgress;
    
    if (!correct) {
      // Errou: resetar progresso parcialmente
      return {
        nextReview: new Date(now.getTime() + 30 * 60 * 1000), // 30min
        interval: 0.5,
        easeFactor: Math.max(1.3, easeFactor - 0.2),
        repetitions: 0,
        masteryLevel: Math.max(0, masteryLevel - 15)
      };
    }

    // Acertou: aumentar intervalo
    const newRepetitions = repetitions + 1;
    let newInterval: number;

    if (newRepetitions === 1) {
      newInterval = 4; // 4 horas
    } else if (newRepetitions === 2) {
      newInterval = 24; // 1 dia
    } else {
      newInterval = currentProgress.interval * easeFactor; // Exponencial
    }

    return {
      nextReview: new Date(now.getTime() + newInterval * 60 * 60 * 1000),
      interval: newInterval,
      easeFactor: Math.min(2.5, easeFactor + 0.1),
      repetitions: newRepetitions,
      masteryLevel: Math.min(100, masteryLevel + 20)
    };
  };

  // Iniciar novo exercício
  const loadNextExercise = () => {
    const next = getNextExercise();
    if (next) {
      setCurrentExercise(next);
      setUserAnswer('');
      setSelectedWords([]);
      setUsedWordIndices([]);
      setShowResult(false);
      setIsCorrect(false);
      setStartTime(new Date());
    }
  };

  // Carregar primeiro exercício
  useEffect(() => {
    if (!currentExercise) {
      loadNextExercise();
    }
  }, []);

  // Submeter resposta
  const handleSubmit = () => {
    if (!currentExercise) return;

    const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    let finalAnswer = userAnswer;

    // Para exercícios de reordenar, juntar palavras
    if (currentExercise.type === 'reorder' || currentExercise.type === 'build') {
      finalAnswer = selectedWords.join(' ');
    }

    // Para exercícios de escrita, sempre considerar como correto (avaliação manual/critérios)
    const correct = currentExercise.type === 'writing' 
      ? true // Exercícios de escrita são sempre marcados como completos
      : finalAnswer.toLowerCase().trim() === 
        currentExercise.correctAnswer.toString().toLowerCase().trim();

    setIsCorrect(correct);
    setShowResult(true);

    // Registrar tentativa
    const attempt: ExerciseAttempt = {
      exerciseId: currentExercise.id,
      timestamp: new Date(),
      correct,
      userAnswer: finalAnswer,
      timeSpent
    };

    // Atualizar progresso
    const currentProgress = exerciseData.progressByExercise[currentExercise.id];
    const newSchedule = calculateNextReview(correct, currentProgress);

    const updatedProgress: ExerciseProgress = {
      exerciseId: currentExercise.id,
      lastAttempt: new Date(),
      ...newSchedule,
      attempts: [...(currentProgress?.attempts || []), attempt]
    };

    setExerciseData(prev => ({
      ...prev,
      progressByExercise: {
        ...prev.progressByExercise,
        [currentExercise.id]: updatedProgress
      },
      totalCompleted: prev.totalCompleted + 1,
      totalCorrect: correct ? prev.totalCorrect + 1 : prev.totalCorrect,
      lastPracticeDate: new Date()
    }));

    // NOVO: Auto-marcar requisitos relacionados se o domínio for alto
    if (updatedProgress.masteryLevel >= 80 && currentExercise.tags) {
      try {
        const savedProgress = localStorage.getItem('learning_progress');
        if (savedProgress) {
          const learningProgress = JSON.parse(savedProgress);
          const completedRequirements = learningProgress.completedRequirements || [];
          
          // Verificar quais tags correspondem a requisitos não completos
          const requirementsToComplete = currentExercise.tags
            .map(tag => `${currentLevel.toLowerCase()}-${currentExercise.category}-${tag}`)
            .filter((reqId: string) => !completedRequirements.includes(reqId));
          
          if (requirementsToComplete.length > 0) {
            const updatedLearningProgress = {
              ...learningProgress,
              completedRequirements: [
                ...completedRequirements,
                ...requirementsToComplete
              ],
              lastUpdated: new Date()
            };
            localStorage.setItem('learning_progress', JSON.stringify(updatedLearningProgress));
            
            // Notificar mudanças
            window.dispatchEvent(new CustomEvent('progressUpdated', { detail: updatedLearningProgress }));
          }
        }
      } catch (error) {
        console.error('Failed to auto-mark requirements:', error);
      }
    }

    // Atualizar progresso do bloco
    const newBlockProgress = blockProgress + 1;
    if (newBlockProgress >= 10) {
      setShowCelebration(true);
      setCurrentBlock(prev => prev + 1);
      setBlockProgress(0);
      setTimeout(() => setShowCelebration(false), 3000);
    } else {
      setBlockProgress(newBlockProgress);
    }
  };

  // Adicionar palavra (para reorder/build)
  const addWord = (word: string, wordIndex: number) => {
    setSelectedWords([...selectedWords, word]);
    setUsedWordIndices([...usedWordIndices, wordIndex]);
  };

  const removeWord = (selectedIndex: number) => {
    setSelectedWords(selectedWords.filter((_, i) => i !== selectedIndex));
    setUsedWordIndices(usedWordIndices.filter((_, i) => i !== selectedIndex));
  };

  // Salvar no Firebase
  const handleSaveProgress = async () => {
    setIsSaving(true);
    try {
      // TODO: Implementar sync com Firebase
      // await saveToFirebase(exerciseData);
      
      setExerciseData(prev => ({ ...prev, lastSyncDate: new Date() }));
      
      setTimeout(() => {
        setIsSaving(false);
        alert('Progresso salvo com sucesso!');
      }, 1000);
    } catch (error) {
      setIsSaving(false);
      console.error('Erro ao salvar:', error);
    }
  };

  if (!currentExercise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-slate-600">Carregando exercícios...</p>
        </div>
      </div>
    );
  }

  const accuracy = exerciseData.totalCompleted > 0
    ? Math.round((exerciseData.totalCorrect / exerciseData.totalCompleted) * 100)
    : 0;

  // Filtrar palavras disponíveis baseado em índices (para suportar palavras repetidas)
  const availableWords = currentExercise.words?.map((word, idx) => ({ word, idx })).filter(({ idx }) => !usedWordIndices.includes(idx)) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Celebração de bloco completo */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-12 text-center shadow-2xl animate-bounce">
            <div className="flex justify-center mb-4">
              <Trophy size={64} className="text-yellow-500" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              Bloco {currentBlock} Completo!
            </h2>
            <p className="text-slate-600">Você completou 10 exercícios!</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Voltar</span>
            </button>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800">{accuracy}%</div>
                <div className="text-xs text-slate-500">Precisão</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800">{exerciseData.totalCompleted}</div>
                <div className="text-xs text-slate-500">Completos</div>
              </div>
              <button
                onClick={handleSaveProgress}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                {isSaving ? 'Salvando...' : 'Salvar Progresso'}
              </button>
            </div>
          </div>

          {/* Barra de progresso do bloco */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">
                Bloco {currentBlock + 1} - {blockProgress}/10 exercícios
              </span>
              <span className="text-slate-500">
                {blockProgress * 10}% deste bloco
              </span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-slate-600 to-slate-700 transition-all duration-500 ease-out"
                style={{ width: `${blockProgress * 10}%` }}
              />
            </div>
            <div className="flex gap-1">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded-full transition-colors ${
                    i < blockProgress ? 'bg-slate-600' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Exercício */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* Badge de nível */}
          <div className="flex items-center justify-between mb-6">
            <span className="px-3 py-1 bg-slate-600 text-white text-xs font-bold rounded-full">
              {currentExercise.level}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-slate-500">
              {currentExercise.category === 'vocabulary' ? (
                <><Book size={16} /> Vocabulário</>
              ) : currentExercise.category === 'grammar' ? (
                <><Edit size={16} /> Gramática</>
              ) : (
                <><DocumentView size={16} /> Compreensão</>
              )}
            </span>
          </div>

          {/* Card do exercício */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6">
              {currentExercise.question}
            </h2>

            {currentExercise.content && (
              <div className="bg-slate-50 rounded-lg p-4 mb-6 text-slate-700 text-lg">
                {currentExercise.content}
              </div>
            )}

            {/* Reorder/Build - palavras para organizar */}
            {(currentExercise.type === 'reorder' || currentExercise.type === 'build') && (
              <div className="space-y-6">
                {/* Área de resposta */}
                <div className="min-h-[80px] bg-slate-50 rounded-lg p-4 border-2 border-dashed border-slate-300">
                  {selectedWords.length === 0 ? (
                    <p className="text-slate-400 text-center">Clique nas palavras abaixo para formar a frase</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedWords.map((word, index) => (
                        <button
                          key={index}
                          onClick={() => removeWord(index)}
                          className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                        >
                          {word}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Palavras disponíveis */}
                <div className="flex flex-wrap gap-2">
                  {availableWords.map((item) => (
                    <button
                      key={item.idx}
                      onClick={() => addWord(item.word, item.idx)}
                      disabled={showResult}
                      className="px-4 py-2 bg-white border-2 border-slate-300 text-slate-700 rounded-lg hover:border-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                      {item.word}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Multiple choice */}
            {(currentExercise.type === 'complete' || 
              currentExercise.type === 'translate' || 
              currentExercise.type === 'context') && (
              <div className="space-y-3">
                {currentExercise.options?.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setUserAnswer(option)}
                    disabled={showResult}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                      userAnswer === option
                        ? 'border-slate-600 bg-slate-50'
                        : 'border-slate-200 hover:border-slate-400 bg-white'
                    } ${showResult ? 'opacity-50' : ''}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {/* Writing - Campo de texto livre */}
            {currentExercise.type === 'writing' && (
              <div className="space-y-4">
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  disabled={showResult}
                  placeholder="Escreva sua resposta aqui..."
                  className="w-full min-h-[200px] p-4 rounded-lg border-2 border-slate-300 focus:border-slate-600 focus:outline-none resize-y text-slate-800 disabled:opacity-50 disabled:bg-slate-50"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                />
                
                {/* Contador de palavras */}
                <div className="flex justify-between text-sm text-slate-600">
                  <span>
                    Palavras: <strong className={`
                      ${userAnswer.trim().split(/\s+/).filter(w => w).length < (currentExercise.minWords || 0) ? 'text-red-600' : ''}
                      ${userAnswer.trim().split(/\s+/).filter(w => w).length > (currentExercise.maxWords || 999) ? 'text-red-600' : ''}
                      ${userAnswer.trim().split(/\s+/).filter(w => w).length >= (currentExercise.minWords || 0) && 
                        userAnswer.trim().split(/\s+/).filter(w => w).length <= (currentExercise.maxWords || 999) ? 'text-green-600' : ''}
                    `}>{userAnswer.trim().split(/\s+/).filter(w => w).length}</strong>
                    {currentExercise.minWords && ` (mínimo: ${currentExercise.minWords})`}
                    {currentExercise.maxWords && ` (máximo: ${currentExercise.maxWords})`}
                  </span>
                </div>

                {/* Vocabulário sugerido */}
                {currentExercise.suggestedWords && currentExercise.suggestedWords.length > 0 && !showResult && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-800 mb-2">💡 Vocabulário sugerido:</p>
                    <div className="flex flex-wrap gap-2">
                      {currentExercise.suggestedWords.map((word, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-mono">
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Critérios de avaliação */}
                {currentExercise.criterias && currentExercise.criterias.length > 0 && !showResult && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-amber-800 mb-2">✓ Critérios de avaliação:</p>
                    <ul className="space-y-1">
                      {currentExercise.criterias.map((criteria, idx) => (
                        <li key={idx} className="text-sm text-amber-700 flex items-start gap-2">
                          <span className="text-amber-500">•</span>
                          {criteria}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Hint */}
            {currentExercise.hint && !showResult && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 flex items-start gap-2">
                <Idea size={20} className="flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Dica:</strong> {currentExercise.hint}
                </div>
              </div>
            )}

            {/* Resultado */}
            {showResult && (
              <div className={`mt-6 p-6 rounded-lg ${
                currentExercise.type === 'writing'
                  ? 'bg-blue-50 border-2 border-blue-200'
                  : isCorrect 
                    ? 'bg-green-50 border-2 border-green-200' 
                    : 'bg-red-50 border-2 border-red-200'
              }`}>
                {currentExercise.type === 'writing' ? (
                  // Feedback para exercícios de escrita
                  <>
                    <div className="flex items-center gap-3 mb-3">
                      <Checkmark size={24} className="text-blue-600" />
                      <span className="text-lg font-bold text-blue-700">Texto Submetido!</span>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-blue-700 font-medium mb-2">Seu texto:</p>
                      <div className="bg-white p-4 rounded-lg border border-blue-200 text-slate-700 whitespace-pre-wrap">
                        {userAnswer}
                      </div>
                    </div>

                    {currentExercise.sampleAnswer && (
                      <div className="mb-4">
                        <p className="text-sm text-blue-700 font-medium mb-2">Exemplo de resposta:</p>
                        <div className="bg-white p-4 rounded-lg border border-blue-200 text-slate-600 text-sm whitespace-pre-wrap">
                          {currentExercise.sampleAnswer}
                        </div>
                      </div>
                    )}

                    {currentExercise.criterias && (
                      <div className="mb-3 p-3 bg-blue-100 rounded-lg">
                        <p className="text-sm font-medium text-blue-800 mb-2">Verifique se você incluiu:</p>
                        <ul className="space-y-1">
                          {currentExercise.criterias.map((criteria, idx) => (
                            <li key={idx} className="text-sm text-blue-700 flex items-start gap-2">
                              <span>✓</span>
                              {criteria}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {currentExercise.explanation && (
                      <div className="pt-3 border-t border-blue-200">
                        <p className="text-sm text-blue-600">
                          <strong>Dica:</strong> {currentExercise.explanation}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  // Feedback para outros tipos de exercício
                  <>
                    <div className="flex items-center gap-3 mb-3">
                      {isCorrect ? (
                        <>
                          <Checkmark size={24} className="text-green-600" />
                          <span className="text-lg font-bold text-green-700">Correto!</span>
                        </>
                      ) : (
                        <>
                          <Close size={24} className="text-red-600" />
                          <span className="text-lg font-bold text-red-700">Incorreto</span>
                        </>
                      )}
                    </div>

                    {!isCorrect && (
                      <div className="mb-3">
                        <p className="text-sm text-red-600 mb-1">Resposta correta:</p>
                        <p className="font-medium text-red-700">{currentExercise.correctAnswer}</p>
                      </div>
                    )}

                    {currentExercise.explanation && (
                      <div className="pt-3 border-t border-slate-200">
                        <p className="text-sm text-slate-600">
                          <strong>Explicação:</strong> {currentExercise.explanation}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Botões de ação */}
            <div className="mt-6 flex gap-3">
              {!showResult ? (
                <button
                  onClick={handleSubmit}
                  disabled={
                    currentExercise.type === 'writing'
                      ? userAnswer.trim().split(/\s+/).filter(w => w).length < (currentExercise.minWords || 0) ||
                        userAnswer.trim().split(/\s+/).filter(w => w).length > (currentExercise.maxWords || 999)
                      : (currentExercise.type === 'reorder' || currentExercise.type === 'build') 
                        ? selectedWords.length === 0
                        : !userAnswer
                  }
                  className="flex-1 py-3 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentExercise.type === 'writing' ? 'Enviar Texto' : 'Verificar Resposta'}
                </button>
              ) : (
                <button
                  onClick={loadNextExercise}
                  className="flex-1 py-3 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Restart size={20} />
                  Próximo Exercício
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

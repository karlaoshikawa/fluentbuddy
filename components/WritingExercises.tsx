import React, { useState, useEffect } from 'react';
import { WritingText, WritingSummaryEvaluation, CEFRLevel } from '../types';
import { WRITING_TEXTS } from '../constants';
import { CheckmarkFilled, CloseFilled, Edit, DocumentBlank, Renew } from '@carbon/icons-react';

interface WritingExercisesProps {
  userLevel: CEFRLevel;
}

export const WritingExercises: React.FC<WritingExercisesProps> = ({ userLevel }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [linesForNotebook, setLinesForNotebook] = useState(5);
  const [showText, setShowText] = useState(false);
  const [summary, setSummary] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<WritingSummaryEvaluation | null>(null);
  const [progressData, setProgressData] = useState<{ completed: number; total: number }>({ 
    completed: 0, 
    total: WRITING_TEXTS.length 
  });
  const [generatedText, setGeneratedText] = useState<WritingText | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(!!import.meta.env.VITE_OPENAI_API_KEY);

  // Filtrar textos por nível
  const availableTexts = WRITING_TEXTS.filter(text => {
    const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const userLevelIndex = levels.indexOf(userLevel);
    const textLevelIndex = levels.indexOf(text.level);
    // Mostrar textos do nível atual e um nível acima/abaixo
    return Math.abs(userLevelIndex - textLevelIndex) <= 1;
  }).sort((a, b) => a.difficulty - b.difficulty);

  const currentText = generatedText || availableTexts[currentTextIndex] || WRITING_TEXTS[0];

  // Gerar novo texto com IA baseado no número de linhas
  const generateNewText = async () => {
    setIsGenerating(true);
    
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      
      // Se não houver API key, usar texto pré-definido
      if (!apiKey) {
        console.warn('API key não configurada, usando textos pré-definidos');
        const randomText = availableTexts[Math.floor(Math.random() * availableTexts.length)];
        setGeneratedText(randomText);
        setShowText(true);
        setEvaluation(null);
        setSummary('');
        setIsGenerating(false);
        return;
      }
      
      // Estimar palavras baseado em linhas (aproximadamente 12-15 palavras por linha)
      const estimatedWords = linesForNotebook * 13;
      
      const prompt = `You are an English teacher creating a reading exercise for a student.

Student Level: ${userLevel} (CEFR)
Text Length: approximately ${estimatedWords} words (to fit in ${linesForNotebook} lines when displayed)
Difficulty: Progressive (this is exercise #${progressData.completed + 1})

Create a NEW, interesting short story or text that:
1. Is appropriate for ${userLevel} level
2. Has approximately ${estimatedWords} words
3. Teaches 3-5 new vocabulary words for this level
4. Includes 1-2 grammar points relevant to ${userLevel}
5. Is engaging and interesting (mini-story, real-life situation, or interesting fact)
6. Gets slightly harder than previous exercises (current progress: ${progressData.completed} completed)

Make it a COMPLETE story with beginning, middle, and end.

Return ONLY a JSON object:
{
  "id": "generated-${Date.now()}",
  "level": "${userLevel}",
  "difficulty": ${Math.min(10, 3 + progressData.completed)},
  "title": "Catchy short title",
  "text": "The complete story text here (${estimatedWords} words)",
  "wordCount": actual_word_count,
  "topics": ["topic1", "topic2"],
  "keyVocabulary": ["word1", "word2", "word3", "word4", "word5"],
  "comprehensionQuestions": ["question1", "question2", "question3"],
  "grammarFocus": "Main grammar point taught (e.g., 'past perfect', 'conditionals')"
}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert English teacher who creates engaging, level-appropriate texts. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8, // Mais criativo
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const newText: WritingText = JSON.parse(data.choices[0].message.content);
      
      setGeneratedText(newText);
      setShowText(true);
      setEvaluation(null);
      setSummary('');

    } catch (error) {
      console.error('Erro ao gerar texto:', error);
      // Fallback: usar texto pré-definido
      const randomText = availableTexts[Math.floor(Math.random() * availableTexts.length)];
      setGeneratedText(randomText);
      setShowText(true);
      setEvaluation(null);
      setSummary('');
    } finally {
      setIsGenerating(false);
    }
  };

  // Carregar progresso do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('writing_exercise_progress');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setProgressData(data);
      } catch (e) {
        console.error('Erro ao carregar progresso:', e);
      }
    }
  }, []);

  const handleStartReading = () => {
    generateNewText();
  };

  const handleNextText = () => {
    // Gerar novo texto em vez de navegar pelos existentes
    setShowText(false);
    setSummary('');
    setEvaluation(null);
    setGeneratedText(null);
  };

  const handlePreviousText = () => {
    // Usar textos pré-definidos como fallback
    if (currentTextIndex > 0) {
      setCurrentTextIndex(prev => prev - 1);
      setShowText(false);
      setSummary('');
      setEvaluation(null);
      setGeneratedText(null);
    }
  };

  const evaluateSummary = async () => {
    if (!summary.trim() || summary.trim().split(/\s+/).length < 10) {
      alert('Por favor, escreva um resumo com pelo menos 10 palavras.');
      return;
    }

    setIsEvaluating(true);

    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      
      // Se não houver API key, fornecer feedback básico
      if (!apiKey) {
        console.warn('API key não configurada, fornecendo avaliação básica');
        const wordCount = summary.trim().split(/\s+/).length;
        const basicScore = Math.min(100, Math.max(50, wordCount * 5));
        
        setEvaluation({
          score: basicScore,
          feedback: 'Bom trabalho! Continue praticando sua escrita em inglês.',
          strengths: ['Você escreveu um resumo', 'Praticou vocabulário em inglês'],
          improvements: ['Configure a API key da OpenAI para feedback detalhado'],
          keyPointsCovered: [],
          missedPoints: []
        });
        setIsEvaluating(false);
        return;
      }
      
      const prompt = `You are an English teacher evaluating a student's summary of a text.

Original Text:
"${currentText.text}"

Student's Summary:
"${summary}"

Student Level: ${currentText.level}

Evaluate the summary based on:
1. Comprehension: Did they understand the main ideas?
2. Accuracy: Is the summary factually correct?
3. Writing Quality: Grammar, vocabulary, and coherence
4. Completeness: Did they cover the key points?

Provide a score from 0-100 and detailed feedback.

Return ONLY a JSON object with this structure:
{
  "score": number (0-100),
  "feedback": "Overall feedback in Portuguese",
  "strengths": ["strength 1 in Portuguese", "strength 2 in Portuguese"],
  "improvements": ["improvement 1 in Portuguese", "improvement 2 in Portuguese"],
  "correctedVersion": "A grammatically perfect version of their summary in English (only if there are errors)",
  "keyPointsCovered": ["point 1", "point 2"],
  "missedPoints": ["missed point 1", "missed point 2"]
}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert English teacher. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const evalResult: WritingSummaryEvaluation = JSON.parse(data.choices[0].message.content);
      
      setEvaluation(evalResult);

      // Atualizar progresso se score >= 70
      if (evalResult.score >= 70) {
        const newProgress = {
          completed: progressData.completed + 1,
          total: WRITING_TEXTS.length
        };
        setProgressData(newProgress);
        localStorage.setItem('writing_exercise_progress', JSON.stringify(newProgress));
      }

    } catch (error) {
      console.error('Erro ao avaliar:', error);
      // Fallback: fornecer feedback básico
      const wordCount = summary.trim().split(/\s+/).length;
      const basicScore = Math.min(100, Math.max(50, wordCount * 5));
      
      setEvaluation({
        score: basicScore,
        feedback: 'Bom trabalho! Continue praticando. (Configure a API key da OpenAI para feedback mais detalhado)',
        strengths: ['Você completou o exercício', 'Praticou escrita em inglês'],
        improvements: ['Configure VITE_OPENAI_API_KEY no arquivo .env para avaliação completa'],
        keyPointsCovered: [],
        missedPoints: []
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const resetExercise = () => {
    setSummary('');
    setEvaluation(null);
    setShowText(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Edit size={28} className="text-blue-600" />
              Exercícios de Escrita
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Pratique leitura, cópia e resumo de textos em inglês
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">
              {progressData.completed}/{progressData.total}
            </div>
            <div className="text-xs text-gray-500">Exercícios completos</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(progressData.completed / progressData.total) * 100}%` }}
          />
        </div>
      </div>

      {/* Text Info */}
      <div className="bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <div className="text-sm font-semibold opacity-80 mb-1">
              {generatedText ? '🤖 Texto Gerado com IA' : `Texto ${currentTextIndex + 1} de ${availableTexts.length}`}
            </div>
            <h3 className="text-2xl font-bold">{currentText.title}</h3>
            <div className="flex items-center gap-3 mt-2 text-sm flex-wrap">
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                Nível: {currentText.level}
              </span>
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                Dificuldade: {currentText.difficulty}/10
              </span>
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                {currentText.wordCount} palavras
              </span>
              {currentText.grammarFocus && (
                <span className="bg-green-500 bg-opacity-30 px-3 py-1 rounded-full border border-green-300">
                  📚 {currentText.grammarFocus}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Topics */}
        <div className="flex flex-wrap gap-2">
          {currentText.topics.map(topic => (
            <span key={topic} className="text-xs bg-white bg-opacity-10 px-2 py-1 rounded">
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Step 1: Configurar linhas do caderno */}
      {!showText && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <DocumentBlank size={24} className="text-blue-600" />
            Passo 1: Escolha o tamanho do seu texto
          </h3>
          <p className="text-gray-600 mb-4">
            Quantas linhas de texto você quer na tela? A IA vai gerar uma história nova para você!
          </p>
          <div className="flex items-center gap-4 mb-6">
            <input
              type="number"
              min="3"
              max="15"
              value={linesForNotebook}
              onChange={(e) => setLinesForNotebook(Math.max(3, Math.min(15, parseInt(e.target.value) || 5)))}
              className="w-24 px-4 py-2 border-2 border-gray-300 rounded-lg text-center text-lg font-semibold"
            />
            <span className="text-gray-600">linhas de texto</span>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl">{hasApiKey ? '🤖' : '📚'}</div>
              <div>
                <p className="text-sm text-blue-900 font-semibold mb-2">
                  {hasApiKey ? 'A IA vai criar um texto personalizado:' : 'Modo texto pré-definido:'}
                </p>
                <ul className="text-xs text-blue-800 space-y-1">
                  {hasApiKey ? (
                    <>
                      <li>✓ Adaptado ao seu nível ({userLevel})</li>
                      <li>✓ Com ~{linesForNotebook * 13} palavras</li>
                      <li>✓ Ensina vocabulário novo</li>
                      <li>✓ Foca em gramática específica</li>
                      <li>✓ História interessante e completa</li>
                      <li>✓ Dificuldade progressiva</li>
                    </>
                  ) : (
                    <>
                      <li>✓ Textos pré-selecionados para seu nível</li>
                      <li>✓ Vocabulário e gramática incluídos</li>
                      <li>⚠️ Configure VITE_OPENAI_API_KEY para textos gerados por IA</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={handleStartReading}
            disabled={isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <span className="animate-spin">⚡</span>
                <span>Gerando história...</span>
              </>
            ) : (
              <>
                <span>{hasApiKey ? '🎯' : '📖'}</span>
                <span>{hasApiKey ? 'Gerar Texto com IA' : 'Ver Texto'}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Step 2: Mostrar texto */}
      {showText && !evaluation && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Passo 2: Copie este texto à mão no seu caderno
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              📝 Copiar à mão ajuda na memorização! Este texto tem aproximadamente <strong>{linesForNotebook} linhas</strong>.
            </p>
            
            {currentText.grammarFocus && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-green-700 font-bold">📚 Gramática:</span>
                  <span className="text-green-900 font-semibold">{currentText.grammarFocus}</span>
                </div>
                <p className="text-xs text-green-700">
                  Preste atenção em como este ponto gramatical é usado no texto!
                </p>
              </div>
            )}

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-4">
              <p className="text-gray-800 leading-relaxed text-base" style={{ lineHeight: '2.5' }}>
                {currentText.text}
              </p>
            </div>
            
            {currentText.keyVocabulary && (
              <div className="mb-4">
                <div className="text-sm font-semibold text-gray-700 mb-2">
                  📚 Vocabulário-chave para aprender:
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentText.keyVocabulary.map(word => (
                    <span key={word} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Escrever resumo */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Passo 3: Escreva um resumo em inglês
            </h3>
            <p className="text-gray-600 mb-4">
              Escreva com suas próprias palavras o que você entendeu do texto (mínimo 5 palavras).
            </p>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Write your summary here in English..."
              className="w-full h-40 px-4 py-3 border-2 border-gray-300 rounded-lg resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Palavras: {summary.trim().split(/\s+/).filter(w => w.length > 0).length}
                {summary.trim().split(/\s+/).filter(w => w.length > 0).length < 5 && (
                  <span className="text-red-500 ml-2">(mínimo 5)</span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={resetExercise}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                  <Renew size={20} />
                  Recomeçar
                </button>
                <button
                  onClick={evaluateSummary}
                  disabled={isEvaluating || summary.trim().split(/\s+/).length < 10}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                >
                  {isEvaluating ? 'Avaliando...' : 'Avaliar resumo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {evaluation && (
        <div className="space-y-6">
          {/* Score */}
          <div className={`rounded-2xl shadow-lg p-8 text-white ${
            evaluation.score >= 80 ? 'bg-gradient-to-br from-green-500 to-green-600' :
            evaluation.score >= 60 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
            'bg-gradient-to-br from-red-500 to-red-600'
          }`}>
            <div className="text-center">
              <div className="text-6xl font-bold mb-2">{evaluation.score}%</div>
              <div className="text-xl opacity-90">
                {evaluation.score >= 80 ? '🎉 Excelente!' :
                 evaluation.score >= 60 ? '👍 Bom trabalho!' :
                 '💪 Continue praticando!'}
              </div>
            </div>
          </div>

          {/* Feedback Details */}
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
            <div>
              <h4 className="font-bold text-gray-900 mb-2">📝 Feedback Geral:</h4>
              <p className="text-gray-700">{evaluation.feedback}</p>
            </div>

            {evaluation.strengths.length > 0 && (
              <div>
                <h4 className="font-bold text-green-700 mb-2 flex items-center gap-2">
                  <CheckmarkFilled size={20} />
                  Pontos Fortes:
                </h4>
                <ul className="space-y-1">
                  {evaluation.strengths.map((strength, idx) => (
                    <li key={idx} className="text-gray-700 flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {evaluation.improvements.length > 0 && (
              <div>
                <h4 className="font-bold text-orange-700 mb-2 flex items-center gap-2">
                  <CloseFilled size={20} />
                  Pontos a Melhorar:
                </h4>
                <ul className="space-y-1">
                  {evaluation.improvements.map((improvement, idx) => (
                    <li key={idx} className="text-gray-700 flex items-start gap-2">
                      <span className="text-orange-600 mt-1">•</span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {evaluation.keyPointsCovered.length > 0 && (
              <div>
                <h4 className="font-bold text-blue-700 mb-2">✅ Pontos-chave cobertos:</h4>
                <ul className="space-y-1">
                  {evaluation.keyPointsCovered.map((point, idx) => (
                    <li key={idx} className="text-gray-700 flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {evaluation.missedPoints.length > 0 && (
              <div>
                <h4 className="font-bold text-red-700 mb-2">❌ Pontos perdidos:</h4>
                <ul className="space-y-1">
                  {evaluation.missedPoints.map((point, idx) => (
                    <li key={idx} className="text-gray-700 flex items-start gap-2">
                      <span className="text-red-600 mt-1">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {evaluation.correctedVersion && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <h4 className="font-bold text-blue-900 mb-2">✏️ Versão Corrigida:</h4>
                <p className="text-gray-800 italic">{evaluation.correctedVersion}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={resetExercise}
              className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
            >
              Tentar novamente
            </button>
            <button
              onClick={() => {
                setShowText(false);
                setSummary('');
                setEvaluation(null);
                setGeneratedText(null);
              }}
              disabled={isGenerating}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <span className="animate-spin">⚡</span>
                  <span>Gerando...</span>
                </>
              ) : (
                <>
                  <span>{hasApiKey ? '🎯' : '📖'}</span>
                  <span>{hasApiKey ? 'Novo Texto (IA)' : 'Novo Texto'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

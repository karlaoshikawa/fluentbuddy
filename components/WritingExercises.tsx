import React, { useState, useEffect } from 'react';
import { WritingText, WritingSummaryEvaluation, CEFRLevel } from '../types';
import { WRITING_TEXTS } from '../constants';
import { CheckmarkFilled, CloseFilled, Edit, DocumentBlank, Renew } from '@carbon/icons-react';

interface WritingExercisesProps {
  userLevel: CEFRLevel;
}

export const WritingExercises: React.FC<WritingExercisesProps> = ({ userLevel }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [textLength, setTextLength] = useState<'very-short' | 'short' | 'medium' | 'long' | 'very-long'>('short');
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
  const [hasApiKey, setHasApiKey] = useState(!!import.meta.env.VITE_GEMINI_API_KEY);

  // Resetar texto gerado quando o tamanho muda (para forçar nova geração)
  useEffect(() => {
    if (generatedText && showText) {
      setGeneratedText(null);
      setShowText(false);
      setSummary('');
      setEvaluation(null);
    }
  }, [textLength]);

  // Mapear tamanho para número de palavras
  const getWordCount = () => {
    const wordMap = {
      'very-short': 50,
      'short': 100,
      'medium': 150,
      'long': 200,
      'very-long': 250
    };
    return wordMap[textLength];
  };

  // Filtrar textos por nível
  const availableTexts = WRITING_TEXTS.filter(text => {
    const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const userLevelIndex = levels.indexOf(userLevel);
    const textLevelIndex = levels.indexOf(text.level);
    // Mostrar textos do nível atual e um nível acima/abaixo
    return Math.abs(userLevelIndex - textLevelIndex) <= 1;
  }).sort((a, b) => a.difficulty - b.difficulty);

  const currentText = generatedText || availableTexts[currentTextIndex] || WRITING_TEXTS[0];

  // Gerar novo texto com IA baseado no número de palavras
  const generateNewText = async () => {
    setIsGenerating(true);
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      // Se não houver API key, usar texto pré-definido
      if (!apiKey) {
        const randomText = availableTexts[Math.floor(Math.random() * availableTexts.length)];
        setGeneratedText(randomText);
        setShowText(true);
        setEvaluation(null);
        setSummary('');
        setIsGenerating(false);
        return;
      }
      
      // Capturar o tamanho atual no momento da geração
      const targetWords = getWordCount();
      
      const prompt = `CRITICAL MISSION: Write a story with EXACTLY ${targetWords} words. Not ${targetWords - 10}, not ${targetWords + 10}, but EXACTLY ${targetWords} words (±5 max).

COUNT EXAMPLE (for reference):
"I went to school today" = 5 words
"The cat sat on the mat" = 6 words  
"She quickly ran down the street" = 6 words

YOUR TASK:
Write a ${userLevel}-level English story with EXACTLY ${targetWords} WORDS.

STRICT REQUIREMENTS:
✓ Exactly ${targetWords} words (minimum: ${targetWords - 5}, maximum: ${targetWords + 5})
✓ Complete story: beginning, middle, ending
✓ Appropriate for ${userLevel} CEFR level
✓ Include 3-5 vocabulary words for ${userLevel}
✓ Focus on 1 grammar point

METHODOLOGY TO ENSURE ${targetWords} WORDS:
Step 1: Write first paragraph, count words (aim for ${Math.floor(targetWords * 0.3)} words)
Step 2: Write middle section, count again (aim for ${Math.floor(targetWords * 0.5)} words total)
Step 3: Write ending, count final total (must be ${targetWords} words ±5)
Step 4: If count is wrong, ADD or REMOVE words until ${targetWords} is reached

EXAMPLE LENGTHS:
- 50 words = about 3-4 sentences
- 100 words = about 6-7 sentences  
- 150 words = about 9-11 sentences
- 200 words = about 12-14 sentences
- 250 words = about 15-17 sentences

For ${targetWords} words, write approximately ${Math.ceil(targetWords / 15)} sentences.

Return ONLY this JSON (no extra text):
{
  "id": "gen-${Date.now()}",
  "level": "${userLevel}",
  "difficulty": ${Math.min(10, 3 + progressData.completed)},
  "title": "Engaging Title",
  "text": "[YOUR STORY HERE - MUST BE ${targetWords} WORDS]",
  "wordCount": ${targetWords},
  "topics": ["topic1", "topic2"],
  "keyVocabulary": ["word1", "word2", "word3", "word4", "word5"],
  "comprehensionQuestions": ["Q1?", "Q2?", "Q3?"],
  "grammarFocus": "Grammar point"
}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 4096
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Verificar se há erro na resposta
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Resposta inválida da API');
      }
      
      const rawContent = data.candidates[0].content.parts[0].text;
      // Limpar markdown code fences se existirem
      const textContent = rawContent.replace(/^```json\n?/i, '').replace(/```\s*$/i, '').trim();
      
      const newText: WritingText = JSON.parse(textContent);
      
      // Validar palavra contagem real
      const actualWordCount = newText.text.trim().split(/\s+/).length;
      const absDifference = Math.abs(actualWordCount - targetWords);
      
      // Se a diferença for muito grande (>30 palavras), tentar ajustar
      if (absDifference > 30) {
        
        const adjustPrompt = `You generated a ${actualWordCount}-word story, but I need EXACTLY ${targetWords} words.

CURRENT TEXT (${actualWordCount} words):
"${newText.text}"

TASK: ${difference > 0 ? `REMOVE ${absDifference} words` : `ADD ${absDifference} words`} to make it EXACTLY ${targetWords} words.

${difference > 0 ? 
  'Remove unnecessary adjectives, details, or sentences. Keep the story coherent.' : 
  'Add more details, descriptions, or extend sentences. Maintain the story flow.'}

Return the ADJUSTED story as JSON:
{
  "id": "gen-${Date.now()}",
  "level": "${userLevel}",
  "difficulty": ${Math.min(10, 3 + progressData.completed)},
  "title": "${newText.title}",
  "text": "[ADJUSTED TEXT WITH ${targetWords} WORDS]",
  "wordCount": ${targetWords},
  "topics": ${JSON.stringify(newText.topics)},
  "keyVocabulary": ${JSON.stringify(newText.keyVocabulary)},
  "comprehensionQuestions": ${JSON.stringify(newText.comprehensionQuestions)},
  "grammarFocus": "${newText.grammarFocus}"
}`;

        const retryResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: adjustPrompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 4096
            }
          })
        });

        if (retryResponse.ok) {
          const retryData = await retryResponse.json();
          if (retryData.candidates && retryData.candidates[0]) {
            const rawAdjusted = retryData.candidates[0].content.parts[0].text;
            const adjustedTextContent = rawAdjusted.replace(/^```json\n?/i, '').replace(/```\s*$/i, '').trim();
            const adjustedText: WritingText = JSON.parse(adjustedTextContent);
            const adjustedWordCount = adjustedText.text.trim().split(/\s+/).length;
            
            // Usar o texto ajustado
            adjustedText.wordCount = adjustedWordCount;
            setGeneratedText(adjustedText);
            setShowText(true);
            setEvaluation(null);
            setSummary('');
            setIsGenerating(false);
            return;
          }
        }
      }
      
      // Atualizar wordCount com valor real
      newText.wordCount = actualWordCount;
      
      // Atualizar wordCount com valor real
      newText.wordCount = actualWordCount;
      
      setGeneratedText(newText);
      setShowText(true);
      setEvaluation(null);
      setSummary('');

    } catch (error) {
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
        // Progresso corrompido, ignorar
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
    if (!summary.trim() || summary.trim().split(/\s+/).length < 3) {
      alert('Escreva pelo menos 3 palavras mostrando que entendeu o texto.');
      return;
    }

    setIsEvaluating(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      // Se não houver API key, fornecer feedback básico
      if (!apiKey) {
        const wordCount = summary.trim().split(/\s+/).length;
        const basicScore = Math.min(100, Math.max(50, wordCount * 5));
        
        setEvaluation({
          score: basicScore,
          feedback: 'Bom trabalho! Continue praticando sua escrita em inglês.',
          strengths: ['Você escreveu um resumo', 'Praticou vocabulário em inglês'],
          improvements: ['Configure a API key do Gemini para feedback detalhado'],
          keyPointsCovered: [],
          missedPoints: []
        });
        setIsEvaluating(false);
        return;
      }
      
      const prompt = `You are a friendly English teacher checking if a beginner student understood a text.

Original Text:
"${currentText.text}"

Student wrote:
"${summary}"

Student Level: ${currentText.level}

IMPORTANT RULES:
- The student ONLY needs to show they got the GENERAL IDEA of the text.
- A few words like "It's about a girl who found a dog" is PERFECT. Score: 90+
- Do NOT ask for details, names, specific events, or completeness.
- Do NOT suggest adding more details in your feedback.
- If the student captured the MAIN THEME/TOPIC, that's a high score.
- Be encouraging and positive. This is a beginner exercise.
- Only give low scores if the answer is completely wrong or unrelated.

Scoring:
- 90-100: Got the general idea (e.g. "a girl found a dog" for a story about finding a dog)
- 70-89: Somewhat related but vague
- 0-69: Wrong or unrelated

Return ONLY valid JSON (no markdown):
{
  "score": number (0-100),
  "feedback": "1 short encouraging sentence in Portuguese",
  "strengths": ["1 short positive point in Portuguese"],
  "improvements": ["1 grammar tip ONLY if there are English errors, otherwise say 'Ótimo trabalho!'"],
  "correctedVersion": "Fix grammar only if needed, otherwise empty string",
  "keyPointsCovered": ["the main idea they got"],
  "missedPoints": []
}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const rawEval = data.candidates[0].content.parts[0].text;
      const cleanEval = rawEval.replace(/^```json\n?/i, '').replace(/```\s*$/i, '').trim();
      const evalResult: WritingSummaryEvaluation = JSON.parse(cleanEval);
      
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
      // Fallback: fornecer feedback básico
      const wordCount = summary.trim().split(/\s+/).length;
      const basicScore = Math.min(100, Math.max(50, wordCount * 5));
      
      setEvaluation({
        score: basicScore,
        feedback: 'Bom trabalho! Continue praticando. (Configure a API key do Gemini para feedback mais detalhado)',
        strengths: ['Você completou o exercício', 'Praticou escrita em inglês'],
        improvements: ['Configure VITE_GEMINI_API_KEY no arquivo .env.local para avaliação completa'],
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
            Passo 1: Escolha o tamanho do texto
          </h3>
          <p className="text-gray-600 mb-4">
            Selecione o tamanho do texto que você quer ler e copiar:
          </p>
          
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tamanho do texto:
            </label>
            <select
              value={textLength}
              onChange={(e) => setTextLength(e.target.value as any)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            >
              <option value="very-short">Muito Curto (~50 palavras - 3-4 linhas)</option>
              <option value="short">Curto (~100 palavras - 5-6 linhas)</option>
              <option value="medium">Médio (~150 palavras - 7-8 linhas)</option>
              <option value="long">Longo (~200 palavras - 10-12 linhas)</option>
              <option value="very-long">Muito Longo (~250 palavras - 14-16 linhas)</option>
            </select>
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
                      <li>✓ Exatamente {getWordCount()} palavras</li>
                      <li>✓ Ensina vocabulário novo</li>
                      <li>✓ Foca em gramática específica</li>
                      <li>✓ História interessante e completa</li>
                      <li>✓ Dificuldade progressiva</li>
                    </>
                  ) : (
                    <>
                      <li>✓ Textos pré-selecionados para seu nível</li>
                      <li>✓ Vocabulário e gramática incluídos</li>
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
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-900">
                Passo 2: Copie este texto à mão no seu caderno
              </h3>
              {currentText.wordCount && (
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                    {currentText.wordCount} palavras
                  </span>
                  {(() => {
                    const expected = getWordCount();
                    const diff = Math.abs(currentText.wordCount - expected);
                    if (diff > 20) {
                      return (
                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold">
                          ⚠️ Esperava {expected}
                        </span>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-4">
              📝 Copiar à mão ajuda na memorização!
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
              Passo 3: Mostre que entendeu o texto
            </h3>
            <p className="text-gray-600 mb-4">
              Escreva em poucas palavras (em inglês) o que você entendeu do texto. Não precisa copiar, só mostrar que entendeu a ideia.
            </p>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="What is this text about? Write in English..."
              className="w-full h-40 px-4 py-3 border-2 border-gray-300 rounded-lg resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Palavras: {summary.trim().split(/\s+/).filter(w => w.length > 0).length}
                {summary.trim().split(/\s+/).filter(w => w.length > 0).length < 3 && (
                  <span className="text-red-500 ml-2">(mínimo 3)</span>
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

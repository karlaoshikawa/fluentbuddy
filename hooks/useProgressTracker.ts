
import { useState, useEffect, useCallback } from 'react';
import { UserStats, TranscriptionEntry, CEFRLevel } from '../types';
import { GoogleGenAI } from '@google/genai';
import { ASSESSMENT_PROMPT } from '../constants';
import { CEFR_LEVEL_REQUIREMENTS } from '../data';
import { useLearningProgress } from './useLearningProgress';

const INITIAL_STATS: UserStats = {
  grammar: 30,
  vocabulary: 35,
  communication: 40,
  level: 'B1',
  totalTurns: 0
};

export function useProgressTracker() {
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('fluentbuddy_stats');
    return saved ? JSON.parse(saved) : INITIAL_STATS;
  });

  const [isAssessing, setIsAssessing] = useState(false);
  const [requirementProgress, setRequirementProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    localStorage.setItem('fluentbuddy_stats', JSON.stringify(stats));
  }, [stats]);

  // Analisar e marcar requisitos automaticamente
  const analyzeRequirements = useCallback(async (entries: TranscriptionEntry[], currentLevel: CEFRLevel) => {
    try {
      const userMessages = entries.filter(e => e.role === 'user').map(e => e.text).join(' ');
      const levelData = CEFR_LEVEL_REQUIREMENTS[currentLevel];
      
      // Buscar progresso atual
      const savedProgress = localStorage.getItem('learning_progress');
      const progress = savedProgress ? JSON.parse(savedProgress) : { completedRequirements: [] };
      
      // Filtrar apenas requisitos não completos
      const incompleteRequirements = levelData.requirements.filter(
        req => !progress.completedRequirements.includes(req.id)
      );

      if (incompleteRequirements.length === 0) return;

      // Prompt para analisar domínio de requisitos
      const analysisPrompt = `Analyze if the student demonstrated mastery of these English learning requirements based on their conversation:

STUDENT MESSAGES:
${userMessages}

REQUIREMENTS TO ANALYZE:
${incompleteRequirements.slice(0, 10).map((req, i) => `${i + 1}. ${req.id}: ${req.name} - ${req.description}`)}.join('\n')

For each requirement, rate mastery from 0-100 based on:
- Correct usage in context
- Natural application
- Consistency across messages
- Appropriate level of complexity

Return JSON: { "masteredRequirements": ["req-id-1", "req-id-2", ...] }
Only include requirements with 80%+ mastery demonstrated.`;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: analysisPrompt,
        config: { responseMimeType: 'application/json' }
      });

      const result = JSON.parse(response.text || '{}');
      
      if (result.masteredRequirements && result.masteredRequirements.length > 0) {
        // Auto-marcar requisitos como completos
        const updatedProgress = {
          ...progress,
          completedRequirements: [
            ...progress.completedRequirements,
            ...result.masteredRequirements
          ],
          lastUpdated: new Date()
        };
        localStorage.setItem('learning_progress', JSON.stringify(updatedProgress));
        
        // Notificar mudanças
        window.dispatchEvent(new CustomEvent('progressUpdated', { detail: updatedProgress }));
      }
    } catch (error) {
      console.error('Requirement analysis failed:', error);
    }
  }, []);

  const runAssessment = useCallback(async (entries: TranscriptionEntry[]) => {
    // Only assess if we have at least 3 new user turns
    const userEntries = entries.filter(e => e.role === 'user');
    if (userEntries.length % 3 !== 0 || userEntries.length === 0) return;

    setIsAssessing(true);
    try {
      const historyStr = entries
        .slice(-6)
        .map(e => `${e.role.toUpperCase()}: ${e.text}`)
        .join('\n');

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: ASSESSMENT_PROMPT(historyStr),
        config: { responseMimeType: 'application/json' }
      });

      const result = JSON.parse(response.text || '{}');
      
      const newStats = {
        ...stats,
        grammar: Math.round((stats.grammar + result.grammar) / 2),
        vocabulary: Math.round((stats.vocabulary + result.vocabulary) / 2),
        communication: Math.round((stats.communication + result.communication) / 2),
        level: result.level as CEFRLevel,
        totalTurns: userEntries.length
      };
      
      setStats(newStats);
      
      // NOVO: Analisar requisitos automaticamente a cada 6 turnos
      if (userEntries.length % 6 === 0 && userEntries.length > 0) {
        await analyzeRequirements(entries, newStats.level);
      }
    } catch (error) {
      console.error('Assessment failed:', error);
    } finally {
      setIsAssessing(false);
    }
  }, [stats, analyzeRequirements]);

  const setInitialLevel = useCallback((level: CEFRLevel) => {
    const levelScores: Record<CEFRLevel, { grammar: number; vocabulary: number; communication: number }> = {
      'A1': { grammar: 15, vocabulary: 20, communication: 25 },
      'A2': { grammar: 30, vocabulary: 35, communication: 40 },
      'B1': { grammar: 45, vocabulary: 50, communication: 55 },
      'B2': { grammar: 60, vocabulary: 65, communication: 70 },
      'C1': { grammar: 75, vocabulary: 80, communication: 85 },
      'C2': { grammar: 90, vocabulary: 90, communication: 95 }
    };

    const scores = levelScores[level];
    setStats({
      ...scores,
      level,
      totalTurns: 0
    });
  }, []);

  return { stats, isAssessing, runAssessment, setInitialLevel };
}

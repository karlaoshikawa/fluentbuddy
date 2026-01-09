
import { useState, useEffect, useCallback } from 'react';
import { UserStats, TranscriptionEntry, CEFRLevel } from '../types';
import { GoogleGenAI } from '@google/genai';
import { ASSESSMENT_PROMPT } from '../constants';

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

  useEffect(() => {
    localStorage.setItem('fluentbuddy_stats', JSON.stringify(stats));
  }, [stats]);

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
        model: 'gemini-3-flash-preview',
        contents: ASSESSMENT_PROMPT(historyStr),
        config: { responseMimeType: 'application/json' }
      });

      const result = JSON.parse(response.text || '{}');
      
      setStats(prev => ({
        ...prev,
        grammar: Math.round((prev.grammar + result.grammar) / 2),
        vocabulary: Math.round((prev.vocabulary + result.vocabulary) / 2),
        communication: Math.round((prev.communication + result.communication) / 2),
        level: result.level as CEFRLevel,
        totalTurns: userEntries.length
      }));
    } catch (error) {
      console.error('Assessment failed:', error);
    } finally {
      setIsAssessing(false);
    }
  }, []);

  return { stats, isAssessing, runAssessment };
}

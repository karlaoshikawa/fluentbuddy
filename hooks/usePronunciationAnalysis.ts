
import { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { AnalysisResult } from '../types';
import { ANALYSIS_PROMPT } from '../constants';

export function usePronunciationAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const analyze = async (sentence: string) => {
    if (!sentence || sentence.trim().length < 2) return;
    
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: ANALYSIS_PROMPT(sentence),
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sentence: { type: Type.STRING },
              tips: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    word: { type: Type.STRING },
                    ipa: { type: Type.STRING },
                    tip: { type: Type.STRING },
                    difficulty: { type: Type.STRING }
                  },
                  required: ['word', 'ipa', 'tip', 'difficulty']
                }
              },
              overallAdvice: { type: Type.STRING }
            },
            required: ['sentence', 'tips', 'overallAdvice']
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      setResult(data);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clear = () => setResult(null);

  return { analyze, isAnalyzing, result, clear };
}

import { useState, useEffect, useCallback } from 'react';
import { ReviewItem } from '../types';

/**
 * Hook para gerenciar repetição espaçada baseado no algoritmo SM-2
 * O algoritmo ajusta o intervalo de revisão baseado na dificuldade de lembrança
 */
export function useSpacedRepetition() {
  const [reviewSchedule, setReviewSchedule] = useState<Record<string, ReviewItem>>({});

  // Carregar schedule do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('reviewSchedule');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Converter strings de data em objetos Date
      Object.keys(parsed).forEach(key => {
        parsed[key].lastReviewed = new Date(parsed[key].lastReviewed);
        parsed[key].nextReview = new Date(parsed[key].nextReview);
      });
      setReviewSchedule(parsed);
    }
  }, []);

  // Salvar schedule no localStorage
  const saveSchedule = useCallback((schedule: Record<string, ReviewItem>) => {
    setReviewSchedule(schedule);
    localStorage.setItem('reviewSchedule', JSON.stringify(schedule));
  }, []);

  /**
   * Algoritmo SM-2 (SuperMemo 2)
   * quality: 0-5 (0=completo esquecimento, 5=perfeito)
   * - 0-2: esqueceu, reinicia
   * - 3: difícil mas lembrou
   * - 4: lembrou com pouco esforço
   * - 5: lembrou facilmente
   */
  const calculateNextReview = useCallback((item: ReviewItem, quality: number): ReviewItem => {
    let { interval, easeFactor, repetitions } = item;

    // Ajusta ease factor baseado na qualidade
    easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

    if (quality < 3) {
      // Esqueceu - reinicia
      repetitions = 0;
      interval = 1;
    } else {
      // Lembrou - aumenta intervalo
      repetitions += 1;
      if (repetitions === 1) {
        interval = 1;
      } else if (repetitions === 2) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
    }

    const now = new Date();
    const nextReview = new Date(now);
    nextReview.setDate(nextReview.getDate() + interval);

    return {
      ...item,
      lastReviewed: now,
      nextReview,
      interval,
      easeFactor,
      repetitions
    };
  }, []);

  /**
   * Adiciona novo item para revisão
   */
  const addToReview = useCallback((requirementId: string) => {
    const now = new Date();
    const nextReview = new Date(now);
    nextReview.setDate(nextReview.getDate() + 1); // Primeira revisão em 1 dia

    const newItem: ReviewItem = {
      requirementId,
      lastReviewed: now,
      nextReview,
      interval: 1,
      easeFactor: 2.5, // valor inicial padrão
      repetitions: 0
    };

    const updated = { ...reviewSchedule, [requirementId]: newItem };
    saveSchedule(updated);
  }, [reviewSchedule, saveSchedule]);

  /**
   * Registra uma revisão com qualidade de lembrança
   */
  const recordReview = useCallback((requirementId: string, quality: number) => {
    const item = reviewSchedule[requirementId];
    if (!item) {
      // Se não existe, adiciona como novo
      addToReview(requirementId);
      return;
    }

    const updated = calculateNextReview(item, quality);
    const newSchedule = { ...reviewSchedule, [requirementId]: updated };
    saveSchedule(newSchedule);
  }, [reviewSchedule, calculateNextReview, saveSchedule, addToReview]);

  /**
   * Retorna itens que precisam ser revisados hoje
   */
  const getItemsDueForReview = useCallback((): ReviewItem[] => {
    const now = new Date();
    return (Object.values(reviewSchedule) as ReviewItem[]).filter(item => 
      item.nextReview <= now
    ).sort((a, b) => a.nextReview.getTime() - b.nextReview.getTime());
  }, [reviewSchedule]);

  /**
   * Retorna próximos itens a serem revisados (nos próximos N dias)
   */
  const getUpcomingReviews = useCallback((days: number = 7): ReviewItem[] => {
    const now = new Date();
    const future = new Date(now);
    future.setDate(future.getDate() + days);
    
    return (Object.values(reviewSchedule) as ReviewItem[]).filter(item => 
      item.nextReview > now && item.nextReview <= future
    ).sort((a, b) => a.nextReview.getTime() - b.nextReview.getTime());
  }, [reviewSchedule]);

  return {
    reviewSchedule,
    addToReview,
    recordReview,
    getItemsDueForReview,
    getUpcomingReviews
  };
}

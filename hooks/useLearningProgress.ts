import { useState, useEffect, useCallback, useRef } from 'react';
import { UserProgress, CEFRLevel, ReviewItem } from '../types';
import { 
  CEFR_LEVEL_REQUIREMENTS, 
  LearningRequirement,
  getNextIncompleteRequirement,
  getTotalRequirements,
  getCompletedRequirements 
} from '../data';
import { useFirebaseSync } from './useFirebaseSync';
import { useSpacedRepetition } from './useSpacedRepetition';

interface LearningContext {
  currentRequirements: string[];
  focusAreas: string[];
  weakestCategory: LearningRequirement['category'] | null;
}

export function useLearningProgress(currentLevel: CEFRLevel) {
  const { 
    isInitialized, 
    isSyncing, 
    saveProgress: saveToFirebase, 
    loadProgress: loadFromFirebase,
    subscribeToProgress 
  } = useFirebaseSync();

  const {
    reviewSchedule,
    addToReview,
    recordReview,
    getItemsDueForReview,
    getUpcomingReviews
  } = useSpacedRepetition();

  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('learning_progress');
    return saved ? JSON.parse(saved) : {
      currentLevel,
      completedRequirements: [],
      lastUpdated: new Date(),
      notes: {},
      reviewSchedule: {}
    };
  });

  const [isLoading, setIsLoading] = useState(true);
  const isSyncingFromCloud = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Carregar progresso do Firebase ao inicializar
  useEffect(() => {
    const loadInitialProgress = async () => {
      if (!isInitialized) return;

      const cloudProgress = await loadFromFirebase();
      
      if (cloudProgress) {
        // Comparar datas e usar o mais recente
        const localProgress = localStorage.getItem('learning_progress');
        
        if (localProgress) {
          const local = JSON.parse(localProgress);
          const localDate = new Date(local.lastUpdated);
          const cloudDate = new Date(cloudProgress.lastUpdated);
          
          if (cloudDate > localDate) {
            setProgress(cloudProgress);
            localStorage.setItem('learning_progress', JSON.stringify(cloudProgress));
          } else {
            // Sincronizar progresso local para a nuvem
            await saveToFirebase(local);
          }
        } else {
          setProgress(cloudProgress);
          localStorage.setItem('learning_progress', JSON.stringify(cloudProgress));
        }
      }
      
      setIsLoading(false);
    };

    loadInitialProgress();
  }, [isInitialized, loadFromFirebase, saveToFirebase]);

  // Sincronizar em tempo real
  useEffect(() => {
    if (!isInitialized) return;

    const unsubscribe = subscribeToProgress((cloudProgress) => {
      // Só atualizar se o progresso da nuvem for mais recente
      const currentDate = new Date(progress.lastUpdated);
      const cloudDate = new Date(cloudProgress.lastUpdated);
      
      if (cloudDate > currentDate) {
        isSyncingFromCloud.current = true;
        setProgress(cloudProgress);
        localStorage.setItem('learning_progress', JSON.stringify(cloudProgress));
        // Aguardar um pouco antes de permitir novos salvamentos
        setTimeout(() => { 
          isSyncingFromCloud.current = false; 
        }, 500);
      }
    });

    return unsubscribe;
  }, [isInitialized, subscribeToProgress, progress.lastUpdated]);

  // Salvar no localStorage e Firebase com debounce
  const lastSavedProgress = useRef<string>('');
  
  useEffect(() => {
    if (isLoading) return;
    if (isSyncingFromCloud.current) {
      return;
    }
    
    // Evitar salvar se não houve mudança
    const progressString = JSON.stringify(progress);
    if (progressString === lastSavedProgress.current) return;
    
    // Limpar timeout anterior se existir
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Debounce: aguardar 300ms antes de salvar
    saveTimeoutRef.current = setTimeout(() => {
      lastSavedProgress.current = progressString;
      
      // SEMPRE salva localmente (funciona sem Firebase)
      localStorage.setItem('learning_progress', progressString);
      
      // Se Firebase estiver configurado, também sincroniza na nuvem
      if (isInitialized && !isSyncingFromCloud.current) {
        saveToFirebase(progress);
      }
    }, 300);
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [progress, isInitialized, saveToFirebase, isLoading]);

  const markCompleted = useCallback((requirementId: string) => {
    setProgress(prev => ({
      ...prev,
      completedRequirements: [...prev.completedRequirements, requirementId],
      lastUpdated: new Date()
    }));
    
    // Adiciona ao sistema de repetição espaçada
    addToReview(requirementId);
  }, [addToReview]);

  const markIncomplete = useCallback((requirementId: string) => {
    setProgress(prev => ({
      ...prev,
      completedRequirements: prev.completedRequirements.filter(id => id !== requirementId),
      lastUpdated: new Date()
    }));
  }, []);

  const addNote = useCallback((requirementId: string, note: string) => {
    setProgress(prev => ({
      ...prev,
      notes: { ...prev.notes, [requirementId]: note },
      lastUpdated: new Date()
    }));
  }, []);

  const updateLevel = useCallback((newLevel: CEFRLevel) => {
    setProgress(prev => ({
      ...prev,
      currentLevel: newLevel,
      lastUpdated: new Date()
    }));
  }, []);

  // Get learning context for AI to use
  const getLearningContext = useCallback((): LearningContext => {
    const levelData = CEFR_LEVEL_REQUIREMENTS[currentLevel];
    const incomplete = levelData.requirements.filter(
      req => !progress.completedRequirements.includes(req.id)
    );

    // Calculate weakest category (least completion percentage)
    const categories: LearningRequirement['category'][] = 
      ['vocabulary', 'grammar', 'verbs', 'speaking', 'writing', 'pronunciation'];
    
    let weakestCategory: LearningRequirement['category'] | null = null;
    let lowestPercentage = 100;

    categories.forEach(category => {
      const categoryReqs = levelData.requirements.filter(req => req.category === category);
      const categoryCompleted = categoryReqs.filter(req => 
        progress.completedRequirements.includes(req.id)
      ).length;
      const percentage = (categoryCompleted / categoryReqs.length) * 100;

      if (percentage < lowestPercentage) {
        lowestPercentage = percentage;
        weakestCategory = category;
      }
    });

    // Get next 5 incomplete requirements
    const currentRequirements = incomplete.slice(0, 5).map(req => req.name);

    // Get focus areas (categories with < 50% completion)
    const focusAreas = categories.filter(category => {
      const categoryReqs = levelData.requirements.filter(req => req.category === category);
      const categoryCompleted = categoryReqs.filter(req => 
        progress.completedRequirements.includes(req.id)
      ).length;
      return (categoryCompleted / categoryReqs.length) < 0.5;
    });

    return {
      currentRequirements,
      focusAreas,
      weakestCategory
    };
  }, [currentLevel, progress]);

  // Generate AI prompt context
  const getAIContext = useCallback((): string => {
    const context = getLearningContext();
    const levelData = CEFR_LEVEL_REQUIREMENTS[currentLevel];
    const totalReqs = getTotalRequirements(currentLevel);
    const completedReqs = progress.completedRequirements.filter(id => 
      levelData.requirements.some(req => req.id === id)
    ).length;
    const progressPercentage = Math.round((completedReqs / totalReqs) * 100);
    
    // Itens que precisam ser revisados hoje (Repetição Espaçada)
    const dueForReview = getItemsDueForReview();
    const reviewItems = dueForReview.map(item => {
      const req = levelData.requirements.find(r => r.id === item.requirementId);
      return req ? req.name : item.requirementId;
    });

    let aiContext = `STUDENT LEARNING PROGRESS:\n`;
    aiContext += `Current Level: ${currentLevel} (${levelData.displayName})\n`;
    aiContext += `Overall Progress: ${completedReqs}/${totalReqs} requirements completed (${progressPercentage}%)\n\n`;

    // REPETIÇÃO ESPAÇADA - Prioridade máxima
    if (reviewItems.length > 0) {
      aiContext += `⚠️ REVIEW DUE TODAY (Spaced Repetition):\n`;
      aiContext += `These topics need review to reinforce memory:\n`;
      reviewItems.forEach(item => aiContext += `  - ${item}\n`);
      aiContext += `\nPRIORITY: Ask questions about these topics to test retention!\n\n`;
    }

    if (context.weakestCategory) {
      aiContext += `Weakest Category: ${context.weakestCategory}\n`;
    }

    if (context.focusAreas.length > 0) {
      aiContext += `Focus Areas (< 50% complete): ${context.focusAreas.join(', ')}\n`;
    }

    if (context.currentRequirements.length > 0) {
      aiContext += `\nNext Requirements to Learn:\n`;
      context.currentRequirements.forEach((req, idx) => {
        aiContext += `${idx + 1}. ${req}\n`;
      });
    }

    aiContext += `\nINSTRUCTIONS FOR AI:\n`;
    aiContext += `- 🔄 PRIORITY: Test retention of "REVIEW DUE TODAY" topics through questions and exercises\n`;
    aiContext += `- Focus your teaching on the student's weakest areas\n`;
    aiContext += `- Incorporate the next requirements naturally into conversation\n`;
    aiContext += `- Provide examples and practice opportunities for incomplete requirements\n`;
    aiContext += `- Acknowledge and reinforce completed requirements when appropriate\n`;
    aiContext += `- Adjust complexity to match the current CEFR level\n`;
    aiContext += `- Use spaced repetition: periodically revisit previously learned concepts\n`;

    return aiContext;
  }, [currentLevel, progress, getLearningContext, getItemsDueForReview]);

  const getNextRequirement = useCallback(() => {
    return getNextIncompleteRequirement(currentLevel);
  }, [currentLevel]);

  const getCategoryProgress = useCallback((category: LearningRequirement['category']) => {
    const levelData = CEFR_LEVEL_REQUIREMENTS[currentLevel];
    const categoryReqs = levelData.requirements.filter(req => req.category === category);
    const completed = categoryReqs.filter(req => 
      progress.completedRequirements.includes(req.id)
    ).length;
    return {
      completed,
      total: categoryReqs.length,
      percentage: Math.round((completed / categoryReqs.length) * 100)
    };
  }, [currentLevel, progress]);

  return {
    progress,
    markCompleted,
    markIncomplete,
    addNote,
    updateLevel,
    getLearningContext,
    getAIContext,
    getNextRequirement,
    getCategoryProgress,
    isLoading,
    isSyncing,
    isCloudEnabled: isInitialized,
    // Spaced Repetition
    reviewSchedule,
    recordReview,
    getItemsDueForReview,
    getUpcomingReviews
  };
}

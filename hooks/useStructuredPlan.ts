import { useState, useEffect } from 'react';
import { CEFRLevel, StructuredPlanProgress } from '../types';
import { CEFR_LEVEL_REQUIREMENTS } from '../data';

interface TopicDetails {
  title: string;
  estimatedMinutes: number; // Tempo estimado total
  recommendedSessions: number; // Número de sessões recomendadas
  description: string;
}

// Plano estruturado progressivo para chegar ao C2
const STRUCTURED_CONVERSATION_PLAN: Record<CEFRLevel, TopicDetails[]> = {
  'A1': [
    { title: 'Personal Introduction', estimatedMinutes: 30, recommendedSessions: 2, description: 'Name, age, nationality, occupation - basic self-introduction' },
    { title: 'Daily Routines', estimatedMinutes: 45, recommendedSessions: 3, description: 'Wake up, breakfast, work/study, hobbies - describing your day' },
    { title: 'Family Description', estimatedMinutes: 45, recommendedSessions: 2, description: 'Members, relationships, activities together' },
    { title: 'Shopping Basics', estimatedMinutes: 40, recommendedSessions: 2, description: 'Asking for prices, quantities, colors' },
    { title: 'Describing Your Home', estimatedMinutes: 40, recommendedSessions: 2, description: 'Rooms, furniture, location' },
    { title: 'Food Preferences', estimatedMinutes: 35, recommendedSessions: 2, description: 'Likes, dislikes, favorite meals' },
  ],
  'A2': [
    { title: 'Past Experiences', estimatedMinutes: 50, recommendedSessions: 3, description: 'Last weekend, holidays, childhood memories' },
    { title: 'Making Plans', estimatedMinutes: 45, recommendedSessions: 2, description: 'Future intentions, invitations, scheduling' },
    { title: 'Health & Body', estimatedMinutes: 50, recommendedSessions: 3, description: 'Symptoms, doctor visits, healthy habits' },
    { title: 'Travel Stories', estimatedMinutes: 60, recommendedSessions: 3, description: 'Places visited, transportation, accommodation' },
    { title: 'Work & Studies', estimatedMinutes: 55, recommendedSessions: 3, description: 'Describe your job/course, colleagues, challenges' },
    { title: 'Comparing Things', estimatedMinutes: 45, recommendedSessions: 2, description: 'Cities, products, people, preferences' },
  ],
  'B1': [
    { title: 'Expressing Opinions', estimatedMinutes: 60, recommendedSessions: 3, description: 'Agree, disagree, justify your viewpoint' },
    { title: 'Problem-Solving', estimatedMinutes: 70, recommendedSessions: 4, description: 'Describe a problem and propose solutions' },
    { title: 'Telling Stories', estimatedMinutes: 65, recommendedSessions: 3, description: 'Narratives with sequence and details' },
    { title: 'Making Suggestions', estimatedMinutes: 55, recommendedSessions: 3, description: 'Planning events, giving advice' },
    { title: 'Describing Changes', estimatedMinutes: 60, recommendedSessions: 3, description: 'How things have evolved over time' },
    { title: 'Hypothetical Situations', estimatedMinutes: 70, recommendedSessions: 4, description: 'What would you do if...?' },
  ],
  'B2': [
    { title: 'Debating Topics', estimatedMinutes: 80, recommendedSessions: 4, description: 'Environment, technology, education, society' },
    { title: 'Professional Communication', estimatedMinutes: 90, recommendedSessions: 5, description: 'Meetings, presentations, negotiations' },
    { title: 'Abstract Concepts', estimatedMinutes: 85, recommendedSessions: 4, description: 'Success, happiness, culture, values' },
    { title: 'Analyzing Situations', estimatedMinutes: 75, recommendedSessions: 4, description: 'Causes, effects, consequences' },
    { title: 'Persuasive Arguments', estimatedMinutes: 90, recommendedSessions: 5, description: 'Convince someone of your position' },
    { title: 'Complex Narratives', estimatedMinutes: 80, recommendedSessions: 4, description: 'Stories with subplots and character development' },
  ],
  'C1': [
    { title: 'Sophisticated Discussions', estimatedMinutes: 100, recommendedSessions: 5, description: 'Politics, economics, philosophy' },
    { title: 'Nuanced Opinions', estimatedMinutes: 95, recommendedSessions: 5, description: 'Seeing multiple perspectives, gray areas' },
    { title: 'Idiomatic Language', estimatedMinutes: 120, recommendedSessions: 6, description: 'Natural expressions, phrasal verbs, colloquialisms' },
    { title: 'Strategic Communication', estimatedMinutes: 110, recommendedSessions: 6, description: 'Diplomacy, tact, indirect language' },
    { title: 'Critical Analysis', estimatedMinutes: 100, recommendedSessions: 5, description: 'Evaluating arguments, identifying biases' },
    { title: 'Professional Expertise', estimatedMinutes: 120, recommendedSessions: 6, description: 'Deep discussions about your field' },
  ],
  'C2': [
    { title: 'Native-like Fluency', estimatedMinutes: 120, recommendedSessions: 6, description: 'Spontaneous, effortless communication' },
    { title: 'Cultural References', estimatedMinutes: 130, recommendedSessions: 7, description: 'Understanding and using cultural nuances' },
    { title: 'Advanced Rhetoric', estimatedMinutes: 140, recommendedSessions: 7, description: 'Humor, irony, sarcasm, wordplay' },
    { title: 'Professional Excellence', estimatedMinutes: 150, recommendedSessions: 8, description: 'High-level business and academic discourse' },
    { title: 'Mastery of Style', estimatedMinutes: 140, recommendedSessions: 7, description: 'Formal, informal, technical, literary' },
    { title: 'Complete Autonomy', estimatedMinutes: 150, recommendedSessions: 8, description: 'Handle any topic with precision and sophistication' },
  ]
};

export function useStructuredPlan(currentLevel: CEFRLevel) {
  const [planProgress, setPlanProgress] = useState<StructuredPlanProgress>(() => {
    const saved = localStorage.getItem('fluentbuddy_structured_plan');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        lastSessionDate: new Date(parsed.lastSessionDate),
        timeTracking: parsed.timeTracking || {}
      };
    }
    return {
      currentTopicIndex: 0,
      topicsCompleted: [],
      lastSessionDate: new Date(),
      totalSessions: 0,
      timeTracking: {}
    };
  });

  // Salvar progresso no localStorage
  useEffect(() => {
    localStorage.setItem('fluentbuddy_structured_plan', JSON.stringify(planProgress));
  }, [planProgress]);

  // Obter todos os tópicos desde A1 até o nível atual
  const getAllTopicsUpToLevel = (level: CEFRLevel): TopicDetails[] => {
    const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const currentIndex = levels.indexOf(level);
    
    let allTopics: TopicDetails[] = [];
    for (let i = 0; i <= currentIndex; i++) {
      allTopics = [...allTopics, ...STRUCTURED_CONVERSATION_PLAN[levels[i]]];
    }
    return allTopics;
  };

  const allTopics = getAllTopicsUpToLevel(currentLevel);
  const currentTopic = allTopics[planProgress.currentTopicIndex] || allTopics[0];
  const progress = Math.round((planProgress.topicsCompleted.length / allTopics.length) * 100);

  // Obter tracking do tópico atual
  const currentTopicTracking = planProgress.timeTracking[planProgress.currentTopicIndex] || {
    topicIndex: planProgress.currentTopicIndex,
    timeSpentMinutes: 0,
    sessionsCompleted: 0,
    lastSessionDate: new Date()
  };

  // Iniciar sessão (marcar tempo de início)
  const startSession = () => {
    setPlanProgress(prev => ({
      ...prev,
      currentSessionStartTime: Date.now()
    }));
  };

  // Finalizar sessão (calcular tempo gasto)
  const endSession = () => {
    if (!planProgress.currentSessionStartTime) return;
    
    const sessionDuration = Math.round((Date.now() - planProgress.currentSessionStartTime) / 1000 / 60); // minutos
    
    setPlanProgress(prev => {
      const tracking = prev.timeTracking[prev.currentTopicIndex] || {
        topicIndex: prev.currentTopicIndex,
        timeSpentMinutes: 0,
        sessionsCompleted: 0,
        lastSessionDate: new Date()
      };

      return {
        ...prev,
        timeTracking: {
          ...prev.timeTracking,
          [prev.currentTopicIndex]: {
            ...tracking,
            timeSpentMinutes: tracking.timeSpentMinutes + sessionDuration,
            sessionsCompleted: tracking.sessionsCompleted + 1,
            lastSessionDate: new Date()
          }
        },
        totalSessions: prev.totalSessions + 1,
        lastSessionDate: new Date(),
        currentSessionStartTime: undefined
      };
    });
  };

  // Avançar para próximo tópico
  const completeCurrentTopic = () => {
    endSession(); // Finalizar sessão atual
    
    const topicId = `topic-${planProgress.currentTopicIndex}`;
    if (!planProgress.topicsCompleted.includes(topicId)) {
      setPlanProgress(prev => ({
        ...prev,
        currentTopicIndex: Math.min(prev.currentTopicIndex + 1, allTopics.length - 1),
        topicsCompleted: [...prev.topicsCompleted, topicId]
      }));
    }
  };

  // Voltar tópico anterior (para revisão)
  const goToPreviousTopic = () => {
    endSession(); // Finalizar sessão atual
    
    setPlanProgress(prev => ({
      ...prev,
      currentTopicIndex: Math.max(prev.currentTopicIndex - 1, 0)
    }));
  };

  // Pular para próximo tópico sem marcar como completo
  const skipToNextTopic = () => {
    endSession(); // Finalizar sessão atual
    
    setPlanProgress(prev => ({
      ...prev,
      currentTopicIndex: Math.min(prev.currentTopicIndex + 1, allTopics.length - 1)
    }));
  };

  // Reiniciar plano
  const resetPlan = () => {
    setPlanProgress({
      currentTopicIndex: 0,
      topicsCompleted: [],
      lastSessionDate: new Date(),
      totalSessions: 0,
      timeTracking: {}
    });
  };

  // Calcular estatísticas
  const getTopicStats = () => {
    const recommended = currentTopic.recommendedSessions;
    const completed = currentTopicTracking.sessionsCompleted;
    const timeSpent = currentTopicTracking.timeSpentMinutes;
    const timeEstimated = currentTopic.estimatedMinutes;
    
    const sessionsProgress = Math.min(100, Math.round((completed / recommended) * 100));
    const timeProgress = Math.min(100, Math.round((timeSpent / timeEstimated) * 100));
    const isReady = completed >= recommended || timeSpent >= timeEstimated;
    
    return {
      sessionsCompleted: completed,
      sessionsRecommended: recommended,
      sessionsProgress,
      timeSpent,
      timeEstimated,
      timeProgress,
      isReady,
      remainingSessions: Math.max(0, recommended - completed),
      remainingMinutes: Math.max(0, timeEstimated - timeSpent)
    };
  };

  // Gerar contexto para a IA
  const getStructuredContext = (): string => {
    const levelRequirements = CEFR_LEVEL_REQUIREMENTS[currentLevel];
    const incompleteRequirements = levelRequirements.requirements
      .filter(req => !req.completed)
      .slice(0, 3);

    const stats = getTopicStats();

    return `
**STRUCTURED CONVERSATION MODE - Path to C2**

Current Student Level: ${currentLevel}
Current Topic: "${currentTopic.title}"
Progress: ${planProgress.topicsCompleted.length}/${allTopics.length} topics completed (${progress}%)

**TOPIC DETAILS**:
- Description: ${currentTopic.description}
- Recommended Time: ${currentTopic.estimatedMinutes} minutes (${stats.timeSpent} spent so far)
- Recommended Sessions: ${currentTopic.recommendedSessions} (${stats.sessionsCompleted} completed)
- Student Progress: ${stats.timeProgress}% of time, ${stats.sessionsProgress}% of sessions
${stats.isReady ? '✅ Student is READY for evaluation!' : '⏳ More practice needed - keep them engaged!'}

**YOUR MISSION FOR THIS SESSION**:
Focus the ENTIRE conversation on: "${currentTopic.title}"

**HOW TO CONDUCT THIS SESSION**:
1. Start by explaining what you'll practice: "${currentTopic.title}"
2. Ask open-ended questions specifically about this topic
3. Encourage the student to elaborate and use relevant vocabulary
4. Provide examples and scenarios related to this topic
5. Keep bringing the conversation back to this focus area if they diverge
6. Challenge them to use more sophisticated language for this topic
7. ALWAYS correct grammar and suggest more natural alternatives

**🎯 AUTOMATIC ADVANCEMENT SYSTEM - YOU DECIDE WHEN TO ADVANCE**:

${stats.isReady ? `
**READY FOR EVALUATION!**

The student has completed the recommended practice (${stats.sessionsCompleted}/${stats.sessionsRecommended} sessions, ${stats.timeSpent}/${stats.timeEstimated} min).

**YOUR JOB NOW**: Apply a MINI-TEST to evaluate if they're truly ready!

**MINI-TEST FORMAT** (do this naturally in conversation):
1. Ask 2-3 challenging questions about "${currentTopic.title}"
2. Observe their:
   - Grammar accuracy
   - Vocabulary range
   - Fluency and confidence
   - Ability to elaborate

**EVALUATION CRITERIA**:
✅ PASS (advance to next topic):
   - Answers confidently with minimal errors
   - Uses relevant vocabulary naturally
   - Elaborates without prompting
   - Shows clear understanding of the topic

❌ NEEDS MORE PRACTICE:
   - Struggles with basic questions
   - Limited vocabulary
   - Short, incomplete answers
   - Frequent grammar mistakes

**AFTER MINI-TEST**:
- If PASS: Say "Excellent work! You've mastered ${currentTopic.title}. Let's move to the next topic: [next topic name]!"
- If FAIL: Say "Good effort! Let's practice ${currentTopic.title} a bit more to build confidence."

**CRITICAL**: YOU make the decision. Don't ask the student if they want to advance - YOU evaluate and advance automatically!
` : `
**STILL PRACTICING**

Student needs ${stats.remainingSessions} more session(s) (~${stats.remainingMinutes} minutes).

Keep them engaged and focused on "${currentTopic.title}". No testing yet.
`}

**RELATED LEARNING REQUIREMENTS TO INCORPORATE**:
${incompleteRequirements.map(req => `- ${req.name}: ${req.description}`).join('\n')}

**IMPORTANT**: 
- YOU control topic advancement, not the student
- Apply the mini-test when they're ready (stats above)
- Make clear decisions based on their performance
- This is a guided learning path - be directive!

Remember: Your job is to evaluate, decide, and advance them systematically to C2!
`;
  };

  return {
    currentTopic,
    allTopics,
    progress,
    planProgress,
    completeCurrentTopic,
    goToPreviousTopic,
    skipToNextTopic,
    resetPlan,
    getStructuredContext,
    startSession,
    endSession,
    getTopicStats,
    currentTopicTracking
  };
}

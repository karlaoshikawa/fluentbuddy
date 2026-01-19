
export interface TranscriptionEntry {
  role: 'user' | 'teacher';
  text: string;
  timestamp: Date;
}

export enum ConnectionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR'
}

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface UserStats {
  grammar: number; // 0-100
  vocabulary: number; // 0-100
  communication: number; // 0-100
  level: CEFRLevel;
  totalTurns: number;
}

export interface TeacherPersona {
  id: string;
  name: string;
  voice: string;
  description: string;
  accent: string;
}

export interface PronunciationTip {
  word: string;
  ipa: string;
  tip: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface AnalysisResult {
  sentence: string;
  tips: PronunciationTip[];
  overallAdvice: string;
}

export interface UserProgress {
  currentLevel: CEFRLevel;
  completedRequirements: string[]; // IDs of completed requirements
  lastUpdated: Date;
  notes: Record<string, string>; // requirement ID -> user notes
  reviewSchedule: Record<string, ReviewItem>; // requirement ID -> review data
}

export interface ReviewItem {
  requirementId: string;
  lastReviewed: Date;
  nextReview: Date;
  interval: number; // days until next review
  easeFactor: number; // 1.3 to 2.5+ (how easy to remember)
  repetitions: number; // number of successful reviews
}

// ===== Sistema de Exercícios =====

export type ExerciseType = 
  | 'reorder' // Reordenar palavras para formar frase
  | 'complete' // Completar frase com palavra/expressão
  | 'translate' // Traduzir frase
  | 'context' // Escolher resposta apropriada para contexto
  | 'build' // Construir frase com palavras dadas
  | 'writing'; // Escrever texto livre (parágrafos, e-mails, descrições)

export interface Exercise {
  id: string;
  type: ExerciseType;
  level: CEFRLevel;
  category: 'vocabulary' | 'grammar' | 'comprehension' | 'writing';
  
  // Dados do exercício
  question: string; // Pergunta/instrução
  content?: string; // Frase/texto base (se necessário)
  
  // Opcões baseadas no tipo
  words?: string[]; // Para reorder/build
  options?: string[]; // Para múltipla escolha
  correctAnswer: string | string[]; // Resposta correta
  
  // Para exercícios de escrita
  minWords?: number; // Mínimo de palavras (writing)
  maxWords?: number; // Máximo de palavras (writing)
  suggestedWords?: string[]; // Vocabulário sugerido (writing)
  criterias?: string[]; // Critérios de avaliação (writing)
  sampleAnswer?: string; // Exemplo de resposta (writing)
  
  // Metadados
  hint?: string; // Dica opcional
  explanation?: string; // Explicação após resposta
  tags?: string[]; // ex: ['present-simple', 'daily-routine']
}

export interface ExerciseAttempt {
  exerciseId: string;
  timestamp: Date;
  correct: boolean;
  userAnswer: string;
  timeSpent: number; // segundos
}

export interface ExerciseProgress {
  exerciseId: string;
  lastAttempt: Date;
  nextReview: Date;
  interval: number; // horas até próxima revisão
  easeFactor: number; // 1.3 a 2.5+
  repetitions: number; // tentativas corretas consecutivas
  attempts: ExerciseAttempt[]; // histórico
  masteryLevel: number; // 0-100
}

export interface UserExerciseData {
  userId?: string;
  currentLevel: CEFRLevel;
  progressByExercise: Record<string, ExerciseProgress>;
  totalCompleted: number;
  totalCorrect: number;
  streak: number; // dias consecutivos praticando
  lastPracticeDate: Date;
  lastSyncDate?: Date;
}

// ===== Sistema de Conversação =====

export type ConversationMode = 'free' | 'structured';

export interface TopicTimeTracking {
  topicIndex: number;
  timeSpentMinutes: number; // Tempo real gasto
  sessionsCompleted: number; // Sessões realmente feitas
  lastSessionDate: Date;
}

export interface StructuredPlanProgress {
  currentTopicIndex: number; // índice do tópico atual no plano
  topicsCompleted: string[]; // IDs dos tópicos já completados
  currentSessionGoal?: string; // Objetivo da sessão atual
  lastSessionDate: Date;
  totalSessions: number;
  timeTracking: Record<number, TopicTimeTracking>; // tracking por tópico
  currentSessionStartTime?: number; // timestamp do início da sessão atual
}

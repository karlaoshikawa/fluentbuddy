
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

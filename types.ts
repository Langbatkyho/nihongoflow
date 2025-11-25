
export enum AppRoute {
  HOME = 'HOME',
  ROLEPLAY = 'ROLEPLAY',
  PRONUNCIATION = 'PRONUNCIATION',
  VISUAL_DICT = 'VISUAL_DICT',
  KANJI_STORY = 'KANJI_STORY',
  HISTORY = 'HISTORY',
  SETTINGS = 'SETTINGS'
}

export type ModuleType = 'ROLEPLAY' | 'PRONUNCIATION' | 'VISUAL_DICT' | 'KANJI_STORY';

export interface User {
  id: string;
  username: string;
}

export interface StudyLog {
  id: string;
  user_id: string;
  completed_at: string; // ISO String
  duration_sec: number;
  module_type: ModuleType;
  accuracy_score: number; // 0-100
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  translation?: string; // Optional English translation for learning
  isAudio?: boolean;
}

export interface PronunciationFeedback {
  score: number;
  transcription: string;
  feedback: string;
  nativeExample: string;
  advice: string;
}

export interface KanjiExplanation {
  kanji: string;
  reading: string;
  meaning: string;
  mnemonic: string;
  examples: {
    sentence: string;
    reading: string;
    translation: string;
  }[];
}

export interface ImageAnalysisResult {
  japaneseTerm: string;
  reading: string;
  englishMeaning: string;
  exampleSentence: string;
}

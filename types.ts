
export enum AppRoute {
  HOME = 'HOME',
  ROLEPLAY = 'ROLEPLAY',
  PRONUNCIATION = 'PRONUNCIATION',
  VISUAL_DICT = 'VISUAL_DICT',
  KANJI_STORY = 'KANJI_STORY',
  WRITING = 'WRITING',
  HISTORY = 'HISTORY',
  SETTINGS = 'SETTINGS',
  // New Routes
  LISTENING = 'LISTENING',
  GRAMMAR = 'GRAMMAR',
  PHRASEBOOK = 'PHRASEBOOK',
  TEST = 'TEST'
}

export type ModuleType = 'ROLEPLAY' | 'PRONUNCIATION' | 'VISUAL_DICT' | 'KANJI_STORY' | 'WRITING' | 'LISTENING' | 'GRAMMAR' | 'TEST';

export interface User {
  id: string;
  username: string;
}

export interface StudyLog {
  id: string;
  user_id: string;
  completed_at: string;
  duration_sec: number;
  module_type: ModuleType;
  accuracy_score: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  romaji?: string; // New
  translation?: string;
  isAudio?: boolean;
}

export interface PronunciationFeedback {
  score: number;
  transcription: string;
  romaji: string; // New
  feedback: string;
  nativeExample: string;
  exampleRomaji: string; // New
  advice: string;
}

export interface KanjiExplanation {
  kanji: string;
  reading: string; // Kana
  romaji: string; // New
  meaning: string;
  mnemonic: string;
  examples: {
    sentence: string;
    reading: string;
    romaji: string; // New
    translation: string;
  }[];
}

export interface ImageAnalysisResult {
  japaneseTerm: string;
  reading: string;
  romaji: string; // New
  englishMeaning: string;
  exampleSentence: string;
  exampleRomaji: string; // New
}

export interface WritingFeedback {
  recognizedChar: string;
  score: number;
  feedback: string;
  exampleWord: string;
  exampleMeaning: string;
}

// New Types for Quiz (Listening, Grammar, Test)
export interface QuizQuestion {
  id: number;
  type: 'text' | 'audio';
  question: string; // Text question or Audio script
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Phrase {
  japanese: string;
  romaji: string;
  vietnamese: string;
  category: string;
}

export type GameMode = 'race' | 'endless' | 'study';

export type GrammarCategory =
  | 'subject-verb'
  | 'verb-tenses'
  | 'homophones'
  | 'pronouns'
  | 'comparatives'
  | 'plurals'
  | 'prepositions'
  | 'apostrophes';

export interface GrammarQuestion {
  id: string;
  category: GrammarCategory;
  categoryLabel: string;
  difficulty: 'easy' | 'medium' | 'hard';
  prompt: string; // The sentence or question with an issue or blank
  options?: string[]; // Multiple choice options if applicable
  answer: string; // Canonical correct answer (lowercase trimmed for comparison)
  acceptedAnswers?: string[]; // Acceptable variants
  ruleExplanation: string; // Clear grammatical rule for education
  hint: string;
}

export interface PlayerStats {
  height: number; // in meters (blocks stacked)
  targetHeight: number; // e.g. 100 for race mode
  score: number;
  streak: number;
  maxStreak: number;
  correctAnswers: number;
  totalAnswers: number;
  categoryStats: Record<GrammarCategory, { correct: number; total: number }>;
}

export interface CompetitorBot {
  id: string;
  name: string;
  avatarColor: string;
  shirtColor: string;
  hatType: 'noob' | 'bacon' | 'fedora' | 'crown' | 'valk';
  height: number;
  speedMultiplier: number;
  accuracy: number;
  isAlive: boolean;
  lastAnswerTime: number;
}

import { GrammarQuestion, GrammarCategory } from '../types/game';

/**
 * Normalizes player input for comparison:
 * - Trims whitespace
 * - Converts to lowercase
 * - Strips leading/trailing punctuation if not part of contraction
 */
export function normalizeAnswer(input: string): string {
  if (!input) return '';
  return input
    .trim()
    .toLowerCase()
    // Remove enclosing quotes or punctuation like trailing periods/commas
    .replace(/^["'‘“]+|["'’”.!,?]+$/g, '')
    .trim();
}

/**
 * Checks whether user input matches the canonical answer or any accepted variants.
 */
export function checkAnswer(question: GrammarQuestion, rawInput: string): boolean {
  const normalizedUser = normalizeAnswer(rawInput);
  const normalizedCorrect = normalizeAnswer(question.answer);

  if (normalizedUser === normalizedCorrect) {
    return true;
  }

  if (question.acceptedAnswers && question.acceptedAnswers.length > 0) {
    return question.acceptedAnswers.some(
      (accepted) => normalizeAnswer(accepted) === normalizedUser
    );
  }

  return false;
}

/**
 * Calculates score points earned for a correct answer.
 */
export function calculateScore(
  baseScore: number,
  streak: number,
  difficulty: 'easy' | 'medium' | 'hard',
  answerTimeSeconds: number
): number {
  const diffMultiplier = difficulty === 'hard' ? 1.5 : difficulty === 'medium' ? 1.2 : 1.0;
  // Speed bonus if answered in under 4 seconds
  const speedBonus = Math.max(0, Math.floor((6 - answerTimeSeconds) * 20));
  const streakBonus = Math.min(streak * 25, 200);

  return Math.round((baseScore + speedBonus + streakBonus) * diffMultiplier);
}

/**
 * Determines how many blocks / meters of height the tower gains.
 * Base is 2 blocks. Fast answers and streaks give extra blocks (Roblox race boost!).
 */
export function calculateBlockGain(streak: number, answerTimeSeconds: number): number {
  let blocks = 2; // Base +2m
  if (streak >= 5 || answerTimeSeconds < 2.5) {
    blocks += 2; // +4m Mega Stack!
  } else if (streak >= 3 || answerTimeSeconds < 4.0) {
    blocks += 1; // +3m Super Stack!
  }
  return blocks;
}

/**
 * Calculates the current rising speed of the lava (in meters per second).
 * Starts slow so the player can settle in, then accelerates as player ascends or time passes.
 */
export function calculateLavaSpeed(elapsedSeconds: number, currentHeight: number, mode: 'race' | 'endless' | 'study'): number {
  if (mode === 'study') {
    return 0; // Lava is dormant in study mode!
  }

  // Base speed: 0.28 m/s (~7.2 seconds per 2m block at the start)
  const baseSpeed = 0.28;
  // Accelerates smoothly with time: +0.08 m/s every 10 seconds
  const timeAcceleration = Math.min(elapsedSeconds * 0.008, 0.9);
  // Accelerates with height: +0.06 m/s per 10m climbed
  const heightAcceleration = Math.min(currentHeight * 0.006, 1.1);

  return baseSpeed + timeAcceleration + heightAcceleration;
}

/**
 * Checks win condition for Race mode.
 */
export function checkWinCondition(height: number, targetHeight: number, mode: 'race' | 'endless' | 'study'): boolean {
  if (mode === 'study' || mode === 'endless') return false;
  return height >= targetHeight;
}

/**
 * Checks game over (defeat) condition: lava has submerged the player's feet.
 */
export function checkLossCondition(playerHeight: number, lavaHeight: number, mode: 'race' | 'endless' | 'study'): boolean {
  if (mode === 'study') return false;
  // Player is defeated if lava reaches or surpasses their feet
  return lavaHeight >= playerHeight;
}

/**
 * Computes grammar mastery summary percentages.
 */
export function computeCategoryMastery(
  categoryStats: Record<GrammarCategory, { correct: number; total: number }>
): Record<GrammarCategory, number> {
  const result: Partial<Record<GrammarCategory, number>> = {};
  for (const cat of Object.keys(categoryStats) as GrammarCategory[]) {
    const stats = categoryStats[cat];
    result[cat] = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  }
  return result as Record<GrammarCategory, number>;
}

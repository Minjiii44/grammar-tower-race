import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeAnswer,
  checkAnswer,
  calculateScore,
  calculateBlockGain,
  calculateLavaSpeed,
  checkWinCondition,
  checkLossCondition,
  computeCategoryMastery
} from './rules';
import { GrammarQuestion } from '../types/game';

const mockQuestion: GrammarQuestion = {
  id: 'test-1',
  category: 'subject-verb',
  categoryLabel: 'Subject-Verb Agreement',
  difficulty: 'medium',
  prompt: 'The flock of birds (is / are) flying south.',
  options: ['is', 'are'],
  answer: 'is',
  acceptedAnswers: ['is flying'],
  ruleExplanation: 'Collective nouns take singular verbs.',
  hint: 'Flock is singular.'
};

test('normalizeAnswer trims, lowers, and strips surrounding punctuation', () => {
  assert.equal(normalizeAnswer('  Is. '), 'is');
  assert.equal(normalizeAnswer('"swam"'), 'swam');
  assert.equal(normalizeAnswer("children!"), 'children');
  assert.equal(normalizeAnswer("didn't"), "didn't"); // preserves contraction apostrophe
});

test('checkAnswer validates canonical and accepted answers correctly', () => {
  assert.equal(checkAnswer(mockQuestion, 'is'), true);
  assert.equal(checkAnswer(mockQuestion, ' IS '), true);
  assert.equal(checkAnswer(mockQuestion, 'is flying'), true);
  assert.equal(checkAnswer(mockQuestion, 'are'), false);
  assert.equal(checkAnswer(mockQuestion, 'was'), false);
});

test('calculateScore scales with streak, speed and difficulty', () => {
  const normalScore = calculateScore(100, 0, 'easy', 5.0);
  const fastScore = calculateScore(100, 0, 'easy', 2.0);
  assert.ok(fastScore > normalScore, 'Faster answer should yield higher score');

  const streakScore = calculateScore(100, 4, 'easy', 5.0);
  assert.ok(streakScore > normalScore, 'Streak should award extra bonus');

  const hardScore = calculateScore(100, 0, 'hard', 5.0);
  assert.ok(hardScore > normalScore, 'Hard difficulty should multiply score');
});

test('calculateBlockGain gives extra blocks on high streaks and fast speeds', () => {
  assert.equal(calculateBlockGain(0, 5.0), 2); // Base
  assert.equal(calculateBlockGain(3, 5.0), 3); // Streak 3 bonus
  assert.equal(calculateBlockGain(0, 2.0), 4); // Fast speed bonus
  assert.equal(calculateBlockGain(5, 1.5), 4); // Max boost
});

test('calculateLavaSpeed starts slow and ramps up with time and height', () => {
  assert.equal(calculateLavaSpeed(0, 0, 'study'), 0, 'Lava is 0 in study mode');

  const initialSpeed = calculateLavaSpeed(0, 0, 'race');
  const midGameSpeed = calculateLavaSpeed(30, 20, 'race');
  const lateGameSpeed = calculateLavaSpeed(80, 60, 'race');

  assert.ok(midGameSpeed > initialSpeed, 'Lava should speed up as time/height rises');
  assert.ok(lateGameSpeed > midGameSpeed, 'Lava should accelerate further later in the run');
});

test('checkWinCondition and checkLossCondition trigger as expected', () => {
  assert.equal(checkWinCondition(99, 100, 'race'), false);
  assert.equal(checkWinCondition(100, 100, 'race'), true);
  assert.equal(checkWinCondition(105, 100, 'race'), true);
  assert.equal(checkWinCondition(100, 100, 'endless'), false); // Endless has no height win

  assert.equal(checkLossCondition(10, 8, 'race'), false);
  assert.equal(checkLossCondition(10, 10, 'race'), true);
  assert.equal(checkLossCondition(10, 12, 'race'), true);
  assert.equal(checkLossCondition(10, 15, 'study'), false); // Study mode cannot lose
});

test('computeCategoryMastery calculates percentages accurately', () => {
  const mastery = computeCategoryMastery({
    'subject-verb': { correct: 4, total: 5 },
    'verb-tenses': { correct: 3, total: 3 },
    'homophones': { correct: 0, total: 2 },
    'pronouns': { correct: 0, total: 0 },
    'comparatives': { correct: 1, total: 2 },
    'plurals': { correct: 2, total: 4 },
    'prepositions': { correct: 3, total: 4 },
    'apostrophes': { correct: 1, total: 1 }
  });

  assert.equal(mastery['subject-verb'], 80);
  assert.equal(mastery['verb-tenses'], 100);
  assert.equal(mastery['homophones'], 0);
  assert.equal(mastery['pronouns'], 0);
  assert.equal(mastery['comparatives'], 50);
});

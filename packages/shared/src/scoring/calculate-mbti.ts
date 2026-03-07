import { toScoreWeight } from '../constants/score-map';
import type { Dimension, TieBreakRule, Trait } from '../types';

const defaultTieBreakRule: TieBreakRule = {
  EI: 'I',
  SN: 'N',
  TF: 'T',
  JP: 'J',
};

export type AnswerInput = {
  questionId: string;
  answer: number;
  dimension: Dimension;
  positiveTrait: Trait;
};

export type MbtiCalculationResult = {
  mbtiCode: string;
  dimensionScores: Record<Dimension, number>;
};

export function calculateDimensionScores(answers: AnswerInput[]): Record<Dimension, number> {
  const scores: Record<Dimension, number> = {
    EI: 0,
    SN: 0,
    TF: 0,
    JP: 0,
  };

  for (const item of answers) {
    const weight = toScoreWeight(item.answer);
    const [leftTrait, rightTrait] = item.dimension.split('') as [Trait, Trait];

    if (item.positiveTrait === leftTrait) {
      scores[item.dimension] += weight;
      continue;
    }

    if (item.positiveTrait === rightTrait) {
      scores[item.dimension] -= weight;
      continue;
    }

    throw new Error(`Trait ${item.positiveTrait} does not match dimension ${item.dimension}`);
  }

  return scores;
}

export function pickTrait(dimension: Dimension, score: number, tieRule: TieBreakRule): Trait {
  const [leftTrait, rightTrait] = dimension.split('') as [Trait, Trait];

  if (score > 0) {
    return leftTrait;
  }

  if (score < 0) {
    return rightTrait;
  }

  return tieRule[dimension];
}

export function calculateMbtiResult(
  answers: AnswerInput[],
  tieRule: TieBreakRule = defaultTieBreakRule,
): MbtiCalculationResult {
  const dimensionScores = calculateDimensionScores(answers);

  const mbtiCode = (['EI', 'SN', 'TF', 'JP'] as const)
    .map((dimension) => pickTrait(dimension, dimensionScores[dimension], tieRule))
    .join('');

  return {
    mbtiCode,
    dimensionScores,
  };
}

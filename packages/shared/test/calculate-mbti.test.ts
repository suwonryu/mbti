import { describe, expect, it } from 'vitest';
import { toScoreWeight } from '../src/constants/score-map';
import { calculateDimensionScores, calculateMbtiResult } from '../src/scoring/calculate-mbti';

describe('score conversion', () => {
  it('maps answers to fixed weights', () => {
    expect(toScoreWeight(1)).toBe(2);
    expect(toScoreWeight(2)).toBe(1);
    expect(toScoreWeight(3)).toBe(0);
    expect(toScoreWeight(4)).toBe(-1);
    expect(toScoreWeight(5)).toBe(-2);
  });
});

describe('dimension calculations', () => {
  it('calculates axis scores using question metadata', () => {
    const scores = calculateDimensionScores([
      { questionId: 'q1', answer: 1, dimension: 'EI', positiveTrait: 'E' },
      { questionId: 'q2', answer: 5, dimension: 'SN', positiveTrait: 'N' },
      { questionId: 'q3', answer: 2, dimension: 'TF', positiveTrait: 'T' },
      { questionId: 'q4', answer: 4, dimension: 'JP', positiveTrait: 'J' },
    ]);

    expect(scores).toEqual({
      EI: 2,
      SN: 2,
      TF: 1,
      JP: -1,
    });
  });

  it('applies tie-break rule for zero scores', () => {
    const result = calculateMbtiResult(
      [
        { questionId: 'q1', answer: 3, dimension: 'EI', positiveTrait: 'E' },
        { questionId: 'q2', answer: 3, dimension: 'SN', positiveTrait: 'S' },
        { questionId: 'q3', answer: 3, dimension: 'TF', positiveTrait: 'T' },
        { questionId: 'q4', answer: 3, dimension: 'JP', positiveTrait: 'J' },
      ],
      {
        EI: 'I',
        SN: 'N',
        TF: 'F',
        JP: 'P',
      },
    );

    expect(result.mbtiCode).toBe('INFP');
  });
});

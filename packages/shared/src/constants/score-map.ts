export const answerToWeightMap = {
  1: 2,
  2: 1,
  3: 0,
  4: -1,
  5: -2,
} as const;

export function toScoreWeight(answer: number): number {
  const weight = answerToWeightMap[answer as keyof typeof answerToWeightMap];

  if (weight === undefined) {
    throw new Error(`Invalid answer value: ${answer}`);
  }

  return weight;
}

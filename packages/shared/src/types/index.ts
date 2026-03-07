export const dimensions = ['EI', 'SN', 'TF', 'JP'] as const;
export type Dimension = (typeof dimensions)[number];

export const traits = ['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P'] as const;
export type Trait = (typeof traits)[number];

export type TieBreakRule = {
  EI: 'E' | 'I';
  SN: 'S' | 'N';
  TF: 'T' | 'F';
  JP: 'J' | 'P';
};

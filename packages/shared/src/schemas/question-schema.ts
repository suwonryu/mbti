import { z } from 'zod';

export const dimensionSchema = z.enum(['EI', 'SN', 'TF', 'JP']);

export const positiveTraitSchema = z.enum(['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P']);

export const questionSchema = z
  .object({
    questionText: z.string().min(5).max(200),
    dimension: dimensionSchema,
    positiveTrait: positiveTraitSchema,
  })
  .superRefine((value, ctx) => {
    const matches = {
      EI: ['E', 'I'],
      SN: ['S', 'N'],
      TF: ['T', 'F'],
      JP: ['J', 'P'],
    } as const;

    if (!matches[value.dimension].includes(value.positiveTrait as never)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'positiveTrait must match selected dimension',
        path: ['positiveTrait'],
      });
    }
  });

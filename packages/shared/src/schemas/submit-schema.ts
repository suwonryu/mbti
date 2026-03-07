import { z } from 'zod';

export const submitAnswerItemSchema = z.object({
  questionId: z.number().int().positive(),
  answer: z.number().int().min(1).max(5),
});

export const submitSchema = z.object({
  answers: z.array(submitAnswerItemSchema).min(1),
});

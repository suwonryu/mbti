import { apiRequest } from './client';

export type PublicTest = {
  slug: string;
  title: string;
  description: string;
  introText: string;
  thumbnailUrl: string | null;
  status: 'published';
  shareEnabled: boolean;
  answerScale: Array<{
    value: number;
    label: string;
    sortOrder: number;
  }>;
};

export type PublicQuestion = {
  id: number;
  questionText: string;
  sortOrder: number;
};

export type SubmitRequest = {
  answers: Array<{
    questionId: number;
    answer: number;
  }>;
};

export type SubmitResponse = {
  shareToken: string;
  resultMbti: string;
  submittedAt: string;
};

export type SharedResultResponse = {
  shareToken: string;
  createdAt: string;
  snapshot: {
    mbtiCode: string;
    title: string;
    summary: string;
    description: string;
    strengths: unknown;
    cautions: unknown;
    shareTitle: string;
    shareDescription: string;
    imageUrl: string | null;
    test: {
      id: number;
      slug: string;
      title: string;
    };
  };
};

export async function getPublicTest(slug: string) {
  return apiRequest<PublicTest>(`/public/tests/${slug}`);
}

export async function getPublicQuestions(slug: string) {
  return apiRequest<{ slug: string; questions: PublicQuestion[] }>(`/public/tests/${slug}/questions`);
}

export async function submitPublicTest(slug: string, body: SubmitRequest) {
  return apiRequest<SubmitResponse>(`/public/tests/${slug}/submit`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function getSharedResult(shareToken: string) {
  return apiRequest<SharedResultResponse>(`/public/results/${shareToken}`);
}

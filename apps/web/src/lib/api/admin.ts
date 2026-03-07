import { apiRequest } from './client';

export type AdminUser = {
  id: number;
  email: string;
  name: string;
  role: string;
};

export type AdminLoginResponse = {
  accessToken: string;
  admin: AdminUser;
};

export type AdminTestSummary = {
  id: number;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  updatedAt: string;
};

export type AdminTestDetail = {
  id: number;
  title: string;
  slug: string;
  description: string;
  introText: string;
  thumbnailUrl: string | null;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  settings: {
    tieEI: 'E' | 'I';
    tieSN: 'S' | 'N';
    tieTF: 'T' | 'F';
    tieJP: 'J' | 'P';
    shareEnabled: boolean;
  } | null;
};

export type AdminTestInfoInput = {
  title?: string;
  slug?: string;
  description?: string;
  introText?: string;
  thumbnailUrl?: string | null;
};

export type AdminTestSettingsInput = {
  tieEI: 'E' | 'I';
  tieSN: 'S' | 'N';
  tieTF: 'T' | 'F';
  tieJP: 'J' | 'P';
  shareEnabled: boolean;
};

export type AdminAnswerScaleItem = {
  value: number;
  label: string;
  scoreWeight: number;
  sortOrder: number;
};

export type AdminQuestion = {
  id: number;
  questionText: string;
  dimension: 'EI' | 'SN' | 'TF' | 'JP';
  positiveTrait: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminQuestionInput = {
  questionText: string;
  dimension: 'EI' | 'SN' | 'TF' | 'JP';
  positiveTrait: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';
  isActive?: boolean;
};

export type AdminResult = {
  id: number;
  testId: number;
  mbtiCode: string;
  title: string;
  summary: string;
  description: string;
  strengthsJson: unknown;
  cautionsJson: unknown;
  shareTitle: string;
  shareDescription: string;
  imageUrl: string | null;
  updatedAt: string;
};

export type AdminCreateResultInput = {
  mbtiCode: string;
  title: string;
  summary: string;
  description: string;
  strengths: string[];
  cautions: string[];
  shareTitle: string;
  shareDescription: string;
  imageUrl?: string | null;
};

export type AdminUpdateResultInput = {
  title?: string;
  summary?: string;
  description?: string;
  strengths?: string[];
  cautions?: string[];
  shareTitle?: string;
  shareDescription?: string;
  imageUrl?: string | null;
};

export type AdminPreview = {
  testId: number;
  canPublish: boolean;
  reasons: string[];
  checklist: {
    activeQuestionCount: number;
    activeQuestionCountByDimension: {
      EI: number;
      SN: number;
      TF: number;
      JP: number;
    };
    mbtiResultCount: number;
    answerScaleCount: number;
  };
};

export async function loginAdmin(input: { email: string; password: string }) {
  return apiRequest<AdminLoginResponse>('/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getAdminMe(token: string) {
  return apiRequest<AdminUser>('/admin/auth/me', { token });
}

export async function getAdminTests(token: string) {
  return apiRequest<{ items: AdminTestSummary[] }>('/admin/tests', { token });
}

export async function getAdminTest(id: number, token: string) {
  return apiRequest<AdminTestDetail>(`/admin/tests/${id}`, { token });
}

export async function patchAdminTestInfo(id: number, body: AdminTestInfoInput, token: string) {
  return apiRequest<AdminTestDetail>(`/admin/tests/${id}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(body),
  });
}

export async function patchAdminTestStatus(id: number, status: 'draft' | 'published', token: string) {
  return apiRequest<{ id: number; status: 'draft' | 'published'; updatedAt: string }>(`/admin/tests/${id}/status`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ status }),
  });
}

export async function putAdminTestSettings(id: number, body: AdminTestSettingsInput, token: string) {
  return apiRequest<{
    testId: number;
    tieEI: 'E' | 'I';
    tieSN: 'S' | 'N';
    tieTF: 'T' | 'F';
    tieJP: 'J' | 'P';
    shareEnabled: boolean;
    updatedAt: string;
  }>(`/admin/tests/${id}/settings`, {
    method: 'PUT',
    token,
    body: JSON.stringify(body),
  });
}

export async function getAdminAnswerScale(testId: number, token: string) {
  return apiRequest<{ id: number; scales: AdminAnswerScaleItem[] }>(`/admin/tests/${testId}/answer-scale`, { token });
}

export async function putAdminAnswerScale(
  testId: number,
  scales: Array<{ value: number; label: string }>,
  token: string,
) {
  return apiRequest<{ id: number; scales: AdminAnswerScaleItem[] }>(`/admin/tests/${testId}/answer-scale`, {
    method: 'PUT',
    token,
    body: JSON.stringify({ scales }),
  });
}

export async function getAdminQuestions(testId: number, token: string) {
  return apiRequest<{ id: number; questions: AdminQuestion[] }>(`/admin/tests/${testId}/questions`, { token });
}

export async function createAdminQuestion(testId: number, body: AdminQuestionInput, token: string) {
  return apiRequest<AdminQuestion>(`/admin/tests/${testId}/questions`, {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  });
}

export async function updateAdminQuestion(questionId: number, body: Partial<AdminQuestionInput>, token: string) {
  return apiRequest<AdminQuestion>(`/admin/questions/${questionId}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(body),
  });
}

export async function deleteAdminQuestion(questionId: number, token: string) {
  return apiRequest<{ questionId: number; deleted: boolean }>(`/admin/questions/${questionId}`, {
    method: 'DELETE',
    token,
  });
}

export async function reorderAdminQuestions(testId: number, questionIds: number[], token: string) {
  return apiRequest<{ id: number; questions: AdminQuestion[] }>(`/admin/tests/${testId}/questions/order`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ questionIds }),
  });
}

export async function getAdminResults(testId: number, token: string) {
  return apiRequest<{ id: number; results: AdminResult[] }>(`/admin/tests/${testId}/results`, { token });
}

export async function createAdminResult(testId: number, body: AdminCreateResultInput, token: string) {
  return apiRequest<AdminResult>(`/admin/tests/${testId}/results`, {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  });
}

export async function updateAdminResult(resultId: number, body: AdminUpdateResultInput, token: string) {
  return apiRequest<AdminResult>(`/admin/results/${resultId}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(body),
  });
}

export async function deleteAdminResult(resultId: number, token: string) {
  return apiRequest<{ resultId: number; testId: number; deleted: boolean }>(`/admin/results/${resultId}`, {
    method: 'DELETE',
    token,
  });
}

export async function getAdminPreview(testId: number, token: string) {
  return apiRequest<AdminPreview>(`/admin/tests/${testId}/preview`, { token });
}

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { AdminAuthGate } from '@/components/admin/admin-auth-gate';
import {
  createAdminQuestion,
  createAdminResult,
  deleteAdminQuestion,
  deleteAdminResult,
  getAdminAnswerScale,
  getAdminPreview,
  getAdminQuestions,
  getAdminResults,
  getAdminTest,
  patchAdminTestInfo,
  patchAdminTestStatus,
  putAdminAnswerScale,
  putAdminTestSettings,
  reorderAdminQuestions,
  updateAdminQuestion,
  updateAdminResult,
  type AdminQuestion,
  type AdminResult,
  type AdminTestSettingsInput,
} from '@/lib/api/admin';
import { ApiClientError } from '@/lib/api/client';

const MBTI_CODES = [
  'ISTJ',
  'ISFJ',
  'INFJ',
  'INTJ',
  'ISTP',
  'ISFP',
  'INFP',
  'INTP',
  'ESTP',
  'ESFP',
  'ENFP',
  'ENTP',
  'ESTJ',
  'ESFJ',
  'ENFJ',
  'ENTJ',
] as const;

type MbtiCode = (typeof MBTI_CODES)[number];

type QuestionDraft = {
  questionText: string;
  dimension: 'EI' | 'SN' | 'TF' | 'JP';
  positiveTrait: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';
  isActive: boolean;
};

type ResultDraft = {
  mbtiCode: string;
  title: string;
  summary: string;
  description: string;
  strengthsText: string;
  cautionsText: string;
  shareTitle: string;
  shareDescription: string;
  imageUrl: string;
};

function getParamValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return '요청 처리에 실패했습니다.';
}

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as string[];
  }

  return value.filter((item): item is string => typeof item === 'string');
}

function traitOptionsByDimension(dimension: 'EI' | 'SN' | 'TF' | 'JP') {
  if (dimension === 'EI') {
    return ['E', 'I'] as const;
  }

  if (dimension === 'SN') {
    return ['S', 'N'] as const;
  }

  if (dimension === 'TF') {
    return ['T', 'F'] as const;
  }

  return ['J', 'P'] as const;
}

function toMultilineText(items: string[]) {
  return items.join('\n');
}

function parseMultilineText(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function toQuestionDraft(question: AdminQuestion): QuestionDraft {
  return {
    questionText: question.questionText,
    dimension: question.dimension,
    positiveTrait: question.positiveTrait,
    isActive: question.isActive,
  };
}

function toResultDraft(result: AdminResult): ResultDraft {
  return {
    mbtiCode: result.mbtiCode,
    title: result.title,
    summary: result.summary,
    description: result.description,
    strengthsText: toMultilineText(toStringArray(result.strengthsJson)),
    cautionsText: toMultilineText(toStringArray(result.cautionsJson)),
    shareTitle: result.shareTitle,
    shareDescription: result.shareDescription,
    imageUrl: result.imageUrl ?? '',
  };
}

function createDefaultResultDraft(code: MbtiCode): ResultDraft {
  return {
    mbtiCode: code,
    title: `${code} 유형`,
    summary: `${code} 성향 요약`,
    description: `${code} 유형 설명`,
    strengthsText: '강점 1\n강점 2',
    cautionsText: '주의점 1',
    shareTitle: `${code} 테스트 결과`,
    shareDescription: `${code} 유형으로 나왔어요.`,
    imageUrl: '',
  };
}

export default function AdminTestDetailPage() {
  const params = useParams<{ id: string | string[] }>();
  const idText = getParamValue(params.id);
  const testId = Number(idText);

  if (!Number.isInteger(testId) || testId <= 0) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-12">
        <section className="mbti-card w-full p-8 text-center">
          <p className="text-red-600">잘못된 테스트 ID입니다.</p>
        </section>
      </main>
    );
  }

  return (
    <AdminAuthGate>
      {({ token }) => <AdminTestDetailContent testId={testId} token={token} />}
    </AdminAuthGate>
  );
}

function AdminTestDetailContent({ testId, token }: { testId: number; token: string }) {
  const queryClient = useQueryClient();

  const testQueryKey = ['admin-test-detail', testId, token] as const;
  const questionsQueryKey = ['admin-test-questions', testId, token] as const;
  const resultsQueryKey = ['admin-test-results', testId, token] as const;
  const previewQueryKey = ['admin-test-preview', testId, token] as const;
  const answerScaleQueryKey = ['admin-test-answer-scale', testId, token] as const;

  const testQuery = useQuery({
    queryKey: testQueryKey,
    queryFn: () => getAdminTest(testId, token),
  });

  const questionsQuery = useQuery({
    queryKey: questionsQueryKey,
    queryFn: () => getAdminQuestions(testId, token),
  });

  const resultsQuery = useQuery({
    queryKey: resultsQueryKey,
    queryFn: () => getAdminResults(testId, token),
  });

  const previewQuery = useQuery({
    queryKey: previewQueryKey,
    queryFn: () => getAdminPreview(testId, token),
  });

  const answerScaleQuery = useQuery({
    queryKey: answerScaleQueryKey,
    queryFn: () => getAdminAnswerScale(testId, token),
  });

  const [testForm, setTestForm] = useState({
    title: '',
    slug: '',
    description: '',
    introText: '',
    thumbnailUrl: '',
  });
  const [settingsForm, setSettingsForm] = useState<AdminTestSettingsInput>({
    tieEI: 'I',
    tieSN: 'N',
    tieTF: 'T',
    tieJP: 'J',
    shareEnabled: true,
  });
  const [scaleForm, setScaleForm] = useState<Record<number, string>>({
    1: '',
    2: '',
    3: '',
    4: '',
    5: '',
  });
  const [newQuestion, setNewQuestion] = useState<QuestionDraft>({
    questionText: '',
    dimension: 'EI',
    positiveTrait: 'E',
    isActive: true,
  });
  const [questionDrafts, setQuestionDrafts] = useState<Record<number, QuestionDraft>>({});
  const [resultDrafts, setResultDrafts] = useState<Record<number, ResultDraft>>({});
  const [newResult, setNewResult] = useState<ResultDraft>(createDefaultResultDraft('ISTJ'));

  useEffect(() => {
    if (!testQuery.data) {
      return;
    }

    setTestForm({
      title: testQuery.data.title,
      slug: testQuery.data.slug,
      description: testQuery.data.description,
      introText: testQuery.data.introText,
      thumbnailUrl: testQuery.data.thumbnailUrl ?? '',
    });

    setSettingsForm({
      tieEI: testQuery.data.settings?.tieEI ?? 'I',
      tieSN: testQuery.data.settings?.tieSN ?? 'N',
      tieTF: testQuery.data.settings?.tieTF ?? 'T',
      tieJP: testQuery.data.settings?.tieJP ?? 'J',
      shareEnabled: testQuery.data.settings?.shareEnabled ?? true,
    });
  }, [testQuery.data]);

  useEffect(() => {
    if (!answerScaleQuery.data) {
      return;
    }

    const nextScaleForm: Record<number, string> = { 1: '', 2: '', 3: '', 4: '', 5: '' };

    for (const scale of answerScaleQuery.data.scales) {
      nextScaleForm[scale.value] = scale.label;
    }

    setScaleForm(nextScaleForm);
  }, [answerScaleQuery.data]);

  useEffect(() => {
    if (!questionsQuery.data) {
      return;
    }

    const next: Record<number, QuestionDraft> = {};

    for (const question of questionsQuery.data.questions) {
      next[question.id] = toQuestionDraft(question);
    }

    setQuestionDrafts(next);
  }, [questionsQuery.data]);

  useEffect(() => {
    if (!resultsQuery.data) {
      return;
    }

    const next: Record<number, ResultDraft> = {};

    for (const result of resultsQuery.data.results) {
      next[result.id] = toResultDraft(result);
    }

    setResultDrafts(next);
  }, [resultsQuery.data]);

  const missingMbtiCodes = useMemo(() => {
    const existing = new Set((resultsQuery.data?.results ?? []).map((result) => result.mbtiCode));
    return MBTI_CODES.filter((code) => !existing.has(code));
  }, [resultsQuery.data]);

  useEffect(() => {
    if (missingMbtiCodes.length === 0) {
      return;
    }

    if (!missingMbtiCodes.includes(newResult.mbtiCode as MbtiCode)) {
      setNewResult(createDefaultResultDraft(missingMbtiCodes[0]));
    }
  }, [missingMbtiCodes, newResult.mbtiCode]);

  async function refreshQueries(keys: ReadonlyArray<readonly unknown[]>) {
    await Promise.all(keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
  }

  const statusMutation = useMutation({
    mutationFn: (status: 'draft' | 'published') => patchAdminTestStatus(testId, status, token),
    onSuccess: async () => {
      await refreshQueries([testQueryKey, previewQueryKey, ['admin-tests', token]]);
    },
  });

  const patchInfoMutation = useMutation({
    mutationFn: () =>
      patchAdminTestInfo(
        testId,
        {
          title: testForm.title,
          slug: testForm.slug,
          description: testForm.description,
          introText: testForm.introText,
          thumbnailUrl: testForm.thumbnailUrl.trim() || null,
        },
        token,
      ),
    onSuccess: async () => {
      await refreshQueries([testQueryKey, previewQueryKey, ['admin-tests', token]]);
    },
  });

  const settingsMutation = useMutation({
    mutationFn: () => putAdminTestSettings(testId, settingsForm, token),
    onSuccess: async () => {
      await refreshQueries([testQueryKey, previewQueryKey]);
    },
  });

  const answerScaleMutation = useMutation({
    mutationFn: () =>
      putAdminAnswerScale(
        testId,
        [1, 2, 3, 4, 5].map((value) => ({ value, label: scaleForm[value] ?? '' })),
        token,
      ),
    onSuccess: async () => {
      await refreshQueries([answerScaleQueryKey, previewQueryKey, ['public-test', testForm.slug]]);
    },
  });

  const createQuestionMutation = useMutation({
    mutationFn: () => createAdminQuestion(testId, newQuestion, token),
    onSuccess: async () => {
      setNewQuestion({ questionText: '', dimension: 'EI', positiveTrait: 'E', isActive: true });
      await refreshQueries([questionsQueryKey, previewQueryKey]);
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: ({ questionId, draft }: { questionId: number; draft: QuestionDraft }) =>
      updateAdminQuestion(questionId, draft, token),
    onSuccess: async () => {
      await refreshQueries([questionsQueryKey, previewQueryKey]);
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: (questionId: number) => deleteAdminQuestion(questionId, token),
    onSuccess: async () => {
      await refreshQueries([questionsQueryKey, previewQueryKey]);
    },
  });

  const reorderQuestionsMutation = useMutation({
    mutationFn: (questionIds: number[]) => reorderAdminQuestions(testId, questionIds, token),
    onSuccess: async () => {
      await refreshQueries([questionsQueryKey]);
    },
  });

  const createResultMutation = useMutation({
    mutationFn: () =>
      createAdminResult(
        testId,
        {
          mbtiCode: newResult.mbtiCode,
          title: newResult.title,
          summary: newResult.summary,
          description: newResult.description,
          strengths: parseMultilineText(newResult.strengthsText),
          cautions: parseMultilineText(newResult.cautionsText),
          shareTitle: newResult.shareTitle,
          shareDescription: newResult.shareDescription,
          imageUrl: newResult.imageUrl.trim() || null,
        },
        token,
      ),
    onSuccess: async () => {
      if (missingMbtiCodes.length > 0) {
        setNewResult(createDefaultResultDraft(missingMbtiCodes[0]));
      }
      await refreshQueries([resultsQueryKey, previewQueryKey]);
    },
  });

  const updateResultMutation = useMutation({
    mutationFn: ({ resultId, draft }: { resultId: number; draft: ResultDraft }) =>
      updateAdminResult(
        resultId,
        {
          title: draft.title,
          summary: draft.summary,
          description: draft.description,
          strengths: parseMultilineText(draft.strengthsText),
          cautions: parseMultilineText(draft.cautionsText),
          shareTitle: draft.shareTitle,
          shareDescription: draft.shareDescription,
          imageUrl: draft.imageUrl.trim() || null,
        },
        token,
      ),
    onSuccess: async () => {
      await refreshQueries([resultsQueryKey, previewQueryKey]);
    },
  });

  const deleteResultMutation = useMutation({
    mutationFn: (resultId: number) => deleteAdminResult(resultId, token),
    onSuccess: async () => {
      await refreshQueries([resultsQueryKey, previewQueryKey]);
    },
  });

  const isLoading =
    testQuery.isLoading ||
    questionsQuery.isLoading ||
    resultsQuery.isLoading ||
    previewQuery.isLoading ||
    answerScaleQuery.isLoading;
  const isError =
    testQuery.isError ||
    questionsQuery.isError ||
    resultsQuery.isError ||
    previewQuery.isError ||
    answerScaleQuery.isError;

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-12">
        <section className="mbti-card w-full p-8 text-center">
          <p className="text-slate-600">테스트 상세를 불러오는 중...</p>
        </section>
      </main>
    );
  }

  if (
    isError ||
    !testQuery.data ||
    !questionsQuery.data ||
    !resultsQuery.data ||
    !previewQuery.data ||
    !answerScaleQuery.data
  ) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-12">
        <section className="mbti-card w-full p-8 text-center">
          <p className="text-red-600">
            {getErrorMessage(
              testQuery.error ??
                questionsQuery.error ??
                resultsQuery.error ??
                previewQuery.error ??
                answerScaleQuery.error,
            )}
          </p>
        </section>
      </main>
    );
  }

  const test = testQuery.data;
  const preview = previewQuery.data;
  const questions = questionsQuery.data.questions;
  const results = resultsQuery.data.results;

  const moveQuestion = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= questions.length || reorderQuestionsMutation.isPending) {
      return;
    }

    const ids = questions.map((question) => question.id);
    const temp = ids[index];
    ids[index] = ids[nextIndex];
    ids[nextIndex] = temp;

    reorderQuestionsMutation.mutate(ids);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-12">
      <section className="mbti-card w-full space-y-6 p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Test #{test.id}</p>
            <h1 className="text-3xl font-black">{test.title}</h1>
            <p className="text-sm text-slate-500">slug: {test.slug}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link className="rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold" href="/admin/tests">
              목록
            </Link>
            <button
              className="rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold"
              disabled={statusMutation.isPending}
              onClick={() => statusMutation.mutate(test.status === 'published' ? 'draft' : 'published')}
              type="button"
            >
              {statusMutation.isPending
                ? '변경 중...'
                : test.status === 'published'
                  ? 'draft로 변경'
                  : 'published로 변경'}
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-orange-100 bg-white p-4">
            <p className="text-sm text-slate-500">상태</p>
            <p className="mt-1 text-xl font-bold">{test.status}</p>
          </div>
          <div className="rounded-2xl border border-orange-100 bg-white p-4">
            <p className="text-sm text-slate-500">활성 질문</p>
            <p className="mt-1 text-xl font-bold">{preview.checklist.activeQuestionCount}</p>
          </div>
          <div className="rounded-2xl border border-orange-100 bg-white p-4">
            <p className="text-sm text-slate-500">MBTI 결과 수</p>
            <p className="mt-1 text-xl font-bold">{preview.checklist.mbtiResultCount}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-orange-100 bg-white p-4">
          <h2 className="text-lg font-bold">공개 준비 상태</h2>
          <p className={`mt-1 text-sm font-semibold ${preview.canPublish ? 'text-emerald-600' : 'text-rose-600'}`}>
            {preview.canPublish ? 'published 전환 가능' : 'published 전환 불가'}
          </p>
          {preview.reasons.length > 0 ? (
            <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-slate-700">
              {preview.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          ) : null}
          {statusMutation.isError ? <p className="mt-3 text-sm text-red-600">{getErrorMessage(statusMutation.error)}</p> : null}
        </div>

        <div className="rounded-2xl border border-orange-100 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">테스트 기본 정보</h2>
            <button className="mbti-button" disabled={patchInfoMutation.isPending} onClick={() => patchInfoMutation.mutate()} type="button">
              {patchInfoMutation.isPending ? '저장 중...' : '기본정보 저장'}
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="font-semibold text-slate-700">제목</span>
              <input
                className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2"
                onChange={(event) => setTestForm((prev) => ({ ...prev, title: event.target.value }))}
                value={testForm.title}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-semibold text-slate-700">slug</span>
              <input
                className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2"
                onChange={(event) => setTestForm((prev) => ({ ...prev, slug: event.target.value }))}
                value={testForm.slug}
              />
            </label>
            <label className="space-y-1 text-sm md:col-span-2">
              <span className="font-semibold text-slate-700">설명</span>
              <input
                className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2"
                onChange={(event) => setTestForm((prev) => ({ ...prev, description: event.target.value }))}
                value={testForm.description}
              />
            </label>
            <label className="space-y-1 text-sm md:col-span-2">
              <span className="font-semibold text-slate-700">소개 문구</span>
              <textarea
                className="min-h-24 w-full rounded-xl border border-orange-200 bg-white px-3 py-2"
                onChange={(event) => setTestForm((prev) => ({ ...prev, introText: event.target.value }))}
                value={testForm.introText}
              />
            </label>
            <label className="space-y-1 text-sm md:col-span-2">
              <span className="font-semibold text-slate-700">썸네일 URL (옵션)</span>
              <input
                className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2"
                onChange={(event) => setTestForm((prev) => ({ ...prev, thumbnailUrl: event.target.value }))}
                placeholder="https://..."
                value={testForm.thumbnailUrl}
              />
            </label>
          </div>
          {patchInfoMutation.isError ? <p className="mt-2 text-sm text-red-600">{getErrorMessage(patchInfoMutation.error)}</p> : null}
        </div>

        <div className="rounded-2xl border border-orange-100 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">Tie-break / 공유 설정</h2>
            <button className="mbti-button" disabled={settingsMutation.isPending} onClick={() => settingsMutation.mutate()} type="button">
              {settingsMutation.isPending ? '저장 중...' : '설정 저장'}
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <label className="space-y-1 text-sm">
              <span className="font-semibold text-slate-700">EI 동점</span>
              <select
                className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2"
                onChange={(event) =>
                  setSettingsForm((prev) => ({ ...prev, tieEI: event.target.value as 'E' | 'I' }))
                }
                value={settingsForm.tieEI}
              >
                <option value="E">E</option>
                <option value="I">I</option>
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-semibold text-slate-700">SN 동점</span>
              <select
                className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2"
                onChange={(event) =>
                  setSettingsForm((prev) => ({ ...prev, tieSN: event.target.value as 'S' | 'N' }))
                }
                value={settingsForm.tieSN}
              >
                <option value="S">S</option>
                <option value="N">N</option>
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-semibold text-slate-700">TF 동점</span>
              <select
                className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2"
                onChange={(event) =>
                  setSettingsForm((prev) => ({ ...prev, tieTF: event.target.value as 'T' | 'F' }))
                }
                value={settingsForm.tieTF}
              >
                <option value="T">T</option>
                <option value="F">F</option>
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-semibold text-slate-700">JP 동점</span>
              <select
                className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2"
                onChange={(event) =>
                  setSettingsForm((prev) => ({ ...prev, tieJP: event.target.value as 'J' | 'P' }))
                }
                value={settingsForm.tieJP}
              >
                <option value="J">J</option>
                <option value="P">P</option>
              </select>
            </label>
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
            <input
              checked={settingsForm.shareEnabled}
              onChange={(event) => setSettingsForm((prev) => ({ ...prev, shareEnabled: event.target.checked }))}
              type="checkbox"
            />
            결과 공유 허용
          </label>
          {settingsMutation.isError ? <p className="mt-2 text-sm text-red-600">{getErrorMessage(settingsMutation.error)}</p> : null}
        </div>

        <div className="rounded-2xl border border-orange-100 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">선택지 문구(1~5)</h2>
            <button className="mbti-button" disabled={answerScaleMutation.isPending} onClick={() => answerScaleMutation.mutate()} type="button">
              {answerScaleMutation.isPending ? '저장 중...' : '선택지 저장'}
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-5">
            {[1, 2, 3, 4, 5].map((value) => (
              <label key={value} className="space-y-1 text-sm">
                <span className="font-semibold text-slate-700">{value}점</span>
                <input
                  className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2"
                  onChange={(event) =>
                    setScaleForm((prev) => ({
                      ...prev,
                      [value]: event.target.value,
                    }))
                  }
                  value={scaleForm[value] ?? ''}
                />
              </label>
            ))}
          </div>
          {answerScaleMutation.isError ? <p className="mt-2 text-sm text-red-600">{getErrorMessage(answerScaleMutation.error)}</p> : null}
        </div>

        <div className="rounded-2xl border border-orange-100 bg-white p-4">
          <h2 className="text-lg font-bold">질문 관리 ({questions.length})</h2>
          <div className="mt-4 space-y-4">
            {questions.map((question, index) => {
              const draft = questionDrafts[question.id] ?? toQuestionDraft(question);
              const traitOptions = traitOptionsByDimension(draft.dimension);

              return (
                <div key={question.id} className="rounded-xl border border-orange-100 p-3">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-semibold text-slate-700">질문 #{question.sortOrder}</span>
                    <div className="flex items-center gap-2">
                      <button
                        className="rounded-full border border-orange-200 px-3 py-1"
                        onClick={() => moveQuestion(index, -1)}
                        type="button"
                      >
                        위로
                      </button>
                      <button
                        className="rounded-full border border-orange-200 px-3 py-1"
                        onClick={() => moveQuestion(index, 1)}
                        type="button"
                      >
                        아래로
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-2 md:grid-cols-4">
                    <input
                      className="rounded-xl border border-orange-200 bg-white px-3 py-2 md:col-span-2"
                      onChange={(event) =>
                        setQuestionDrafts((prev) => ({
                          ...prev,
                          [question.id]: {
                            ...draft,
                            questionText: event.target.value,
                          },
                        }))
                      }
                      value={draft.questionText}
                    />
                    <select
                      className="rounded-xl border border-orange-200 bg-white px-3 py-2"
                      onChange={(event) => {
                        const dimension = event.target.value as 'EI' | 'SN' | 'TF' | 'JP';
                        const nextTraits = traitOptionsByDimension(dimension);
                        setQuestionDrafts((prev) => ({
                          ...prev,
                          [question.id]: {
                            ...draft,
                            dimension,
                            positiveTrait: nextTraits.includes(draft.positiveTrait as never)
                              ? draft.positiveTrait
                              : nextTraits[0],
                          },
                        }));
                      }}
                      value={draft.dimension}
                    >
                      <option value="EI">EI</option>
                      <option value="SN">SN</option>
                      <option value="TF">TF</option>
                      <option value="JP">JP</option>
                    </select>
                    <select
                      className="rounded-xl border border-orange-200 bg-white px-3 py-2"
                      onChange={(event) =>
                        setQuestionDrafts((prev) => ({
                          ...prev,
                          [question.id]: {
                            ...draft,
                            positiveTrait: event.target.value as QuestionDraft['positiveTrait'],
                          },
                        }))
                      }
                      value={draft.positiveTrait}
                    >
                      {traitOptions.map((trait) => (
                        <option key={trait} value={trait}>
                          {trait}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        checked={draft.isActive}
                        onChange={(event) =>
                          setQuestionDrafts((prev) => ({
                            ...prev,
                            [question.id]: {
                              ...draft,
                              isActive: event.target.checked,
                            },
                          }))
                        }
                        type="checkbox"
                      />
                      활성
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        className="rounded-full border border-orange-200 px-3 py-1 text-sm font-semibold"
                        disabled={updateQuestionMutation.isPending}
                        onClick={() => updateQuestionMutation.mutate({ questionId: question.id, draft })}
                        type="button"
                      >
                        저장
                      </button>
                      <button
                        className="rounded-full border border-rose-200 px-3 py-1 text-sm font-semibold text-rose-700"
                        disabled={deleteQuestionMutation.isPending}
                        onClick={() => deleteQuestionMutation.mutate(question.id)}
                        type="button"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 rounded-xl border border-dashed border-orange-200 p-3">
            <h3 className="text-sm font-bold">새 질문 추가</h3>
            <div className="mt-2 grid gap-2 md:grid-cols-4">
              <input
                className="rounded-xl border border-orange-200 bg-white px-3 py-2 md:col-span-2"
                onChange={(event) => setNewQuestion((prev) => ({ ...prev, questionText: event.target.value }))}
                placeholder="질문 문구"
                value={newQuestion.questionText}
              />
              <select
                className="rounded-xl border border-orange-200 bg-white px-3 py-2"
                onChange={(event) => {
                  const dimension = event.target.value as 'EI' | 'SN' | 'TF' | 'JP';
                  const traits = traitOptionsByDimension(dimension);
                  setNewQuestion((prev) => ({ ...prev, dimension, positiveTrait: traits[0] }));
                }}
                value={newQuestion.dimension}
              >
                <option value="EI">EI</option>
                <option value="SN">SN</option>
                <option value="TF">TF</option>
                <option value="JP">JP</option>
              </select>
              <select
                className="rounded-xl border border-orange-200 bg-white px-3 py-2"
                onChange={(event) =>
                  setNewQuestion((prev) => ({ ...prev, positiveTrait: event.target.value as QuestionDraft['positiveTrait'] }))
                }
                value={newQuestion.positiveTrait}
              >
                {traitOptionsByDimension(newQuestion.dimension).map((trait) => (
                  <option key={trait} value={trait}>
                    {trait}
                  </option>
                ))}
              </select>
            </div>
            <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
              <input
                checked={newQuestion.isActive}
                onChange={(event) => setNewQuestion((prev) => ({ ...prev, isActive: event.target.checked }))}
                type="checkbox"
              />
              생성 시 활성화
            </label>
            <button className="mt-2 mbti-button" disabled={createQuestionMutation.isPending} onClick={() => createQuestionMutation.mutate()} type="button">
              {createQuestionMutation.isPending ? '생성 중...' : '질문 추가'}
            </button>
          </div>

          {createQuestionMutation.isError ? <p className="mt-2 text-sm text-red-600">{getErrorMessage(createQuestionMutation.error)}</p> : null}
          {updateQuestionMutation.isError ? <p className="mt-2 text-sm text-red-600">{getErrorMessage(updateQuestionMutation.error)}</p> : null}
          {deleteQuestionMutation.isError ? <p className="mt-2 text-sm text-red-600">{getErrorMessage(deleteQuestionMutation.error)}</p> : null}
          {reorderQuestionsMutation.isError ? <p className="mt-2 text-sm text-red-600">{getErrorMessage(reorderQuestionsMutation.error)}</p> : null}
        </div>

        <div className="rounded-2xl border border-orange-100 bg-white p-4">
          <h2 className="text-lg font-bold">MBTI 결과 관리 ({results.length})</h2>
          <div className="mt-4 space-y-4">
            {results.map((result) => {
              const draft = resultDrafts[result.id] ?? toResultDraft(result);

              return (
                <div key={result.id} className="rounded-xl border border-orange-100 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-semibold text-slate-800">{result.mbtiCode}</p>
                    <div className="flex items-center gap-2">
                      <button
                        className="rounded-full border border-orange-200 px-3 py-1 text-sm font-semibold"
                        disabled={updateResultMutation.isPending}
                        onClick={() => updateResultMutation.mutate({ resultId: result.id, draft })}
                        type="button"
                      >
                        저장
                      </button>
                      <button
                        className="rounded-full border border-rose-200 px-3 py-1 text-sm font-semibold text-rose-700"
                        disabled={deleteResultMutation.isPending}
                        onClick={() => deleteResultMutation.mutate(result.id)}
                        type="button"
                      >
                        삭제
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-2 md:grid-cols-2">
                    <input
                      className="rounded-xl border border-orange-200 bg-white px-3 py-2"
                      onChange={(event) =>
                        setResultDrafts((prev) => ({
                          ...prev,
                          [result.id]: { ...draft, title: event.target.value },
                        }))
                      }
                      placeholder="결과 제목"
                      value={draft.title}
                    />
                    <input
                      className="rounded-xl border border-orange-200 bg-white px-3 py-2"
                      onChange={(event) =>
                        setResultDrafts((prev) => ({
                          ...prev,
                          [result.id]: { ...draft, summary: event.target.value },
                        }))
                      }
                      placeholder="한 줄 요약"
                      value={draft.summary}
                    />
                    <textarea
                      className="min-h-24 rounded-xl border border-orange-200 bg-white px-3 py-2 md:col-span-2"
                      onChange={(event) =>
                        setResultDrafts((prev) => ({
                          ...prev,
                          [result.id]: { ...draft, description: event.target.value },
                        }))
                      }
                      placeholder="상세 설명"
                      value={draft.description}
                    />
                    <textarea
                      className="min-h-20 rounded-xl border border-orange-200 bg-white px-3 py-2"
                      onChange={(event) =>
                        setResultDrafts((prev) => ({
                          ...prev,
                          [result.id]: { ...draft, strengthsText: event.target.value },
                        }))
                      }
                      placeholder="강점 (줄바꿈으로 구분)"
                      value={draft.strengthsText}
                    />
                    <textarea
                      className="min-h-20 rounded-xl border border-orange-200 bg-white px-3 py-2"
                      onChange={(event) =>
                        setResultDrafts((prev) => ({
                          ...prev,
                          [result.id]: { ...draft, cautionsText: event.target.value },
                        }))
                      }
                      placeholder="주의점 (줄바꿈으로 구분)"
                      value={draft.cautionsText}
                    />
                    <input
                      className="rounded-xl border border-orange-200 bg-white px-3 py-2"
                      onChange={(event) =>
                        setResultDrafts((prev) => ({
                          ...prev,
                          [result.id]: { ...draft, shareTitle: event.target.value },
                        }))
                      }
                      placeholder="공유 제목"
                      value={draft.shareTitle}
                    />
                    <input
                      className="rounded-xl border border-orange-200 bg-white px-3 py-2"
                      onChange={(event) =>
                        setResultDrafts((prev) => ({
                          ...prev,
                          [result.id]: { ...draft, shareDescription: event.target.value },
                        }))
                      }
                      placeholder="공유 설명"
                      value={draft.shareDescription}
                    />
                    <input
                      className="rounded-xl border border-orange-200 bg-white px-3 py-2 md:col-span-2"
                      onChange={(event) =>
                        setResultDrafts((prev) => ({
                          ...prev,
                          [result.id]: { ...draft, imageUrl: event.target.value },
                        }))
                      }
                      placeholder="이미지 URL (옵션)"
                      value={draft.imageUrl}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {missingMbtiCodes.length > 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-orange-200 p-3">
              <h3 className="text-sm font-bold">새 결과 추가</h3>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                <select
                  className="rounded-xl border border-orange-200 bg-white px-3 py-2"
                  onChange={(event) => {
                    const code = event.target.value as MbtiCode;
                    setNewResult(createDefaultResultDraft(code));
                  }}
                  value={newResult.mbtiCode}
                >
                  {missingMbtiCodes.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
                <input
                  className="rounded-xl border border-orange-200 bg-white px-3 py-2"
                  onChange={(event) => setNewResult((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="결과 제목"
                  value={newResult.title}
                />
                <input
                  className="rounded-xl border border-orange-200 bg-white px-3 py-2 md:col-span-2"
                  onChange={(event) => setNewResult((prev) => ({ ...prev, summary: event.target.value }))}
                  placeholder="한 줄 요약"
                  value={newResult.summary}
                />
                <textarea
                  className="min-h-24 rounded-xl border border-orange-200 bg-white px-3 py-2 md:col-span-2"
                  onChange={(event) => setNewResult((prev) => ({ ...prev, description: event.target.value }))}
                  placeholder="상세 설명"
                  value={newResult.description}
                />
                <textarea
                  className="min-h-20 rounded-xl border border-orange-200 bg-white px-3 py-2"
                  onChange={(event) => setNewResult((prev) => ({ ...prev, strengthsText: event.target.value }))}
                  placeholder="강점 (줄바꿈으로 구분)"
                  value={newResult.strengthsText}
                />
                <textarea
                  className="min-h-20 rounded-xl border border-orange-200 bg-white px-3 py-2"
                  onChange={(event) => setNewResult((prev) => ({ ...prev, cautionsText: event.target.value }))}
                  placeholder="주의점 (줄바꿈으로 구분)"
                  value={newResult.cautionsText}
                />
                <input
                  className="rounded-xl border border-orange-200 bg-white px-3 py-2"
                  onChange={(event) => setNewResult((prev) => ({ ...prev, shareTitle: event.target.value }))}
                  placeholder="공유 제목"
                  value={newResult.shareTitle}
                />
                <input
                  className="rounded-xl border border-orange-200 bg-white px-3 py-2"
                  onChange={(event) => setNewResult((prev) => ({ ...prev, shareDescription: event.target.value }))}
                  placeholder="공유 설명"
                  value={newResult.shareDescription}
                />
                <input
                  className="rounded-xl border border-orange-200 bg-white px-3 py-2 md:col-span-2"
                  onChange={(event) => setNewResult((prev) => ({ ...prev, imageUrl: event.target.value }))}
                  placeholder="이미지 URL (옵션)"
                  value={newResult.imageUrl}
                />
              </div>
              <button className="mt-2 mbti-button" disabled={createResultMutation.isPending} onClick={() => createResultMutation.mutate()} type="button">
                {createResultMutation.isPending ? '추가 중...' : '결과 추가'}
              </button>
            </div>
          ) : (
            <p className="mt-4 text-sm text-emerald-700">16개 MBTI 결과가 모두 등록되어 있습니다.</p>
          )}

          {createResultMutation.isError ? <p className="mt-2 text-sm text-red-600">{getErrorMessage(createResultMutation.error)}</p> : null}
          {updateResultMutation.isError ? <p className="mt-2 text-sm text-red-600">{getErrorMessage(updateResultMutation.error)}</p> : null}
          {deleteResultMutation.isError ? <p className="mt-2 text-sm text-red-600">{getErrorMessage(deleteResultMutation.error)}</p> : null}
        </div>
      </section>
    </main>
  );
}

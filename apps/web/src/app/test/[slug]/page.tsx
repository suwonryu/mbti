'use client';

import { useEffect, useMemo } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { ProgressBar } from '@/components/progress-bar';
import { ApiClientError } from '@/lib/api/client';
import {
  getPublicQuestions,
  getPublicTest,
  submitPublicTest,
} from '@/lib/api/public';
import { clearAnswers, loadAnswers, saveAnswers } from '@/lib/test-storage';
import { useTestSessionStore } from '@/lib/use-test-session-store';

function getParamValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return fallback;
}

export default function TestPage() {
  const params = useParams<{ slug: string | string[] }>();
  const slug = getParamValue(params.slug);
  const router = useRouter();
  const { answers, currentIndex, setAnswer, setCurrentIndex, hydrate, clear } = useTestSessionStore();

  const testQuery = useQuery({
    queryKey: ['public-test', slug],
    queryFn: () => getPublicTest(slug),
    enabled: Boolean(slug),
  });

  const questionsQuery = useQuery({
    queryKey: ['public-questions', slug],
    queryFn: () => getPublicQuestions(slug),
    enabled: Boolean(slug),
  });

  const submitMutation = useMutation({
    mutationFn: (payload: { answers: Array<{ questionId: number; answer: number }> }) =>
      submitPublicTest(slug, payload),
    onSuccess: (data) => {
      clearAnswers(slug);
      clear();
      router.push(`/result/${data.shareToken}`);
    },
  });

  const questions = questionsQuery.data?.questions ?? [];
  const answerScale = testQuery.data?.answerScale ?? [];
  const validAnswerValues = useMemo(() => new Set(answerScale.map((item) => item.value)), [answerScale]);
  const questionIdSet = useMemo(() => new Set(questions.map((item) => item.id)), [questions]);
  const total = questions.length;
  const question = questions[currentIndex];
  const selectedAnswer = question ? answers[String(question.id)] : undefined;
  const isSelectedAnswerValid = selectedAnswer !== undefined && validAnswerValues.has(selectedAnswer);

  useEffect(() => {
    if (!slug) {
      return;
    }

    const cached = loadAnswers(slug);
    hydrate(cached);
  }, [slug, hydrate]);

  useEffect(() => {
    if (!slug) {
      return;
    }

    saveAnswers(slug, answers);
  }, [answers, slug]);

  useEffect(() => {
    if (total === 0) {
      return;
    }

    if (currentIndex > total - 1) {
      setCurrentIndex(total - 1);
    }
  }, [currentIndex, total, setCurrentIndex]);

  useEffect(() => {
    if (!slug || questions.length === 0 || answerScale.length === 0) {
      return;
    }

    let hasInvalidAnswer = false;
    const sanitizedAnswers: Record<string, number> = {};

    for (const [questionId, answer] of Object.entries(answers)) {
      const parsedId = Number(questionId);
      const isValidQuestionId = Number.isInteger(parsedId) && questionIdSet.has(parsedId);
      const isValidAnswer = validAnswerValues.has(answer);

      if (!isValidQuestionId || !isValidAnswer) {
        hasInvalidAnswer = true;
        continue;
      }

      sanitizedAnswers[questionId] = answer;
    }

    if (hasInvalidAnswer) {
      hydrate(sanitizedAnswers);
    }
  }, [slug, questions.length, answerScale.length, answers, questionIdSet, validAnswerValues, hydrate]);

  const progressCurrent = useMemo(() => {
    if (total === 0) {
      return 0;
    }

    return Math.min(currentIndex + 1, total);
  }, [currentIndex, total]);

  const onPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const onNext = () => {
    if (!question || !isSelectedAnswerValid) {
      return;
    }

    if (currentIndex < total - 1) {
      setCurrentIndex(currentIndex + 1);
      return;
    }

    const submitAnswers: Array<{ questionId: number; answer: number }> = [];

    for (const [index, item] of questions.entries()) {
      const answer = answers[String(item.id)];
      if (answer === undefined || !validAnswerValues.has(answer)) {
        setCurrentIndex(index);
        return;
      }

      submitAnswers.push({
        questionId: item.id,
        answer,
      });
    }

    submitMutation.mutate({ answers: submitAnswers });
  };

  if (testQuery.isLoading || questionsQuery.isLoading) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-12">
        <section className="mbti-card w-full p-8 text-center">
          <p className="text-slate-600">질문을 불러오는 중입니다...</p>
        </section>
      </main>
    );
  }

  if (testQuery.isError || questionsQuery.isError || !question || total === 0) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-12">
        <section className="mbti-card w-full space-y-4 p-8 text-center">
          <h1 className="text-xl font-bold">질문을 불러오지 못했습니다.</h1>
          <p className="text-slate-600">
            {getErrorMessage(testQuery.error ?? questionsQuery.error, '잠시 후 다시 시도해 주세요.')}
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-12">
      <section className="mbti-card w-full space-y-6 p-6 sm:p-8">
        <ProgressBar current={progressCurrent} total={total} />

        <header className="space-y-2">
          <p className="text-sm font-semibold text-slate-500">
            문항 {progressCurrent} / {total}
          </p>
          <h1 className="text-2xl font-bold leading-snug">{question.questionText}</h1>
        </header>

        <div className="space-y-3">
          {answerScale.map((item) => {
            const active = selectedAnswer === item.value;
            return (
              <button
                key={item.value}
                type="button"
                className={`w-full rounded-2xl border px-4 py-3 text-left font-medium transition ${
                  active
                    ? 'border-accent bg-orange-50 text-slate-900'
                    : 'border-orange-100 bg-white text-slate-700 hover:border-orange-200'
                }`}
                onClick={() => setAnswer(String(question.id), item.value)}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {submitMutation.isError ? (
          <p className="text-sm text-red-600">{getErrorMessage(submitMutation.error, '제출에 실패했습니다.')}</p>
        ) : null}
        {selectedAnswer !== undefined && !isSelectedAnswerValid ? (
          <p className="text-sm text-red-600">선택지를 다시 골라주세요.</p>
        ) : null}

        <div className="flex items-center justify-between gap-3">
          <button
            className="rounded-full border border-orange-200 px-5 py-3 font-semibold"
            disabled={currentIndex === 0 || submitMutation.isPending}
            onClick={onPrevious}
            type="button"
          >
            이전
          </button>
          <button
            className="mbti-button"
            disabled={!isSelectedAnswerValid || submitMutation.isPending}
            onClick={onNext}
            type="button"
          >
            {submitMutation.isPending ? '제출 중...' : currentIndex === total - 1 ? '결과 보기' : '다음'}
          </button>
        </div>
      </section>
    </main>
  );
}

import { HttpStatus, Injectable } from '@nestjs/common';
import { MbtiCode, Prisma, Trait } from '@prisma/client';
import { randomBytes } from 'node:crypto';
import { calculateMbtiResult, type AnswerInput } from '@mbti/shared/scoring/calculate-mbti';
import type { TieBreakRule } from '@mbti/shared/types';
import { ApiHttpException } from '../../common/api-error';
import { PublicRepository } from './public.repository';
import { SubmitAnswersDto } from './submit-answers.dto';

const DEFAULT_TIE_RULE: TieBreakRule = {
  EI: 'I',
  SN: 'N',
  TF: 'T',
  JP: 'J',
};

const VALID_MBTI_CODES = new Set<string>([
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
]);

type SnapshotPayload = {
  mbtiCode: string;
  title: string;
  summary: string;
  description: string;
  strengths: Prisma.JsonValue;
  cautions: Prisma.JsonValue;
  shareTitle: string;
  shareDescription: string;
  imageUrl: string | null;
  test: {
    id: number;
    slug: string;
    title: string;
  };
};

@Injectable()
export class PublicService {
  constructor(private readonly repository: PublicRepository) {}

  async getPublishedTest(slug: string) {
    const test = await this.repository.findPublishedTestBySlug(slug);

    if (!test) {
      throw new ApiHttpException(HttpStatus.NOT_FOUND, 'TEST_NOT_FOUND', '공개된 테스트를 찾을 수 없습니다.');
    }

    return {
      slug: test.slug,
      title: test.title,
      description: test.description,
      introText: test.introText,
      thumbnailUrl: test.thumbnailUrl,
      status: 'published',
      shareEnabled: test.settings?.shareEnabled ?? true,
      answerScale: test.answerScales,
    };
  }

  async getPublishedQuestions(slug: string) {
    const test = await this.repository.findPublishedTestBySlug(slug);

    if (!test) {
      throw new ApiHttpException(HttpStatus.NOT_FOUND, 'TEST_NOT_FOUND', '공개된 테스트를 찾을 수 없습니다.');
    }

    const questions = await this.repository.findActiveQuestionsByTestId(test.id);

    return {
      slug: test.slug,
      questions: questions.map((question) => ({
        id: question.id,
        questionText: question.questionText,
        sortOrder: question.sortOrder,
      })),
    };
  }

  async submit(slug: string, body: SubmitAnswersDto) {
    const test = await this.repository.findPublishedTestBySlug(slug);

    if (!test) {
      throw new ApiHttpException(HttpStatus.NOT_FOUND, 'TEST_NOT_FOUND', '공개된 테스트를 찾을 수 없습니다.');
    }

    if (test.settings && !test.settings.shareEnabled) {
      throw new ApiHttpException(
        HttpStatus.FORBIDDEN,
        'SHARE_DISABLED',
        '현재 테스트는 결과 공유가 비활성화되어 있습니다.',
      );
    }

    const questions = await this.repository.findActiveQuestionsByTestId(test.id);
    this.validateAnswers(questions.map((question) => question.id), body.answers);

    const answerMap = new Map(body.answers.map((item) => [item.questionId, item.answer]));
    const scoringInputs: AnswerInput[] = questions.map((question) => ({
      questionId: String(question.id),
      answer: answerMap.get(question.id) as number,
      dimension: question.dimension,
      positiveTrait: question.positiveTrait,
    }));

    const tieRule = this.resolveTieRule(test.settings);
    const calculated = calculateMbtiResult(scoringInputs, tieRule);

    if (!VALID_MBTI_CODES.has(calculated.mbtiCode)) {
      throw new ApiHttpException(HttpStatus.BAD_REQUEST, 'INVALID_MBTI_CODE', '잘못된 MBTI 계산 결과입니다.');
    }

    const mbtiCode = calculated.mbtiCode as MbtiCode;
    const result = await this.repository.findMbtiResultByCode(test.id, mbtiCode);

    if (!result) {
      throw new ApiHttpException(
        HttpStatus.NOT_FOUND,
        'RESULT_NOT_FOUND',
        `결과 콘텐츠(${mbtiCode})를 찾을 수 없습니다.`,
      );
    }

    const snapshot: SnapshotPayload = {
      mbtiCode,
      title: result.title,
      summary: result.summary,
      description: result.description,
      strengths: result.strengthsJson,
      cautions: result.cautionsJson,
      shareTitle: result.shareTitle,
      shareDescription: result.shareDescription,
      imageUrl: result.imageUrl,
      test: {
        id: test.id,
        slug: test.slug,
        title: test.title,
      },
    };

    const createdAttempt = await this.createAttemptWithUniqueToken({
      testId: test.id,
      answersJson: body.answers.map((item) => ({
        questionId: item.questionId,
        answer: item.answer,
      })),
      scoresJson: calculated.dimensionScores,
      resultMbti: mbtiCode,
      resultSnapshotJson: snapshot as Prisma.InputJsonValue,
      isShared: true,
    });

    return {
      shareToken: createdAttempt.shareToken,
      resultMbti: createdAttempt.resultMbti,
      submittedAt: createdAttempt.createdAt,
    };
  }

  async getSharedResult(shareToken: string) {
    const attempt = await this.repository.findSharedAttempt(shareToken);

    if (!attempt) {
      throw new ApiHttpException(HttpStatus.NOT_FOUND, 'INVALID_TOKEN', '유효하지 않은 결과 링크입니다.');
    }

    const snapshot = await this.hydrateSharedSnapshot({
      testId: attempt.testId,
      resultMbti: attempt.resultMbti,
      snapshot: attempt.resultSnapshotJson,
    });

    return {
      shareToken: attempt.shareToken,
      createdAt: attempt.createdAt,
      snapshot,
    };
  }

  private resolveTieRule(settings: {
    tieEI: Trait;
    tieSN: Trait;
    tieTF: Trait;
    tieJP: Trait;
  } | null): TieBreakRule {
    if (!settings) {
      return DEFAULT_TIE_RULE;
    }

    return {
      EI: this.pickAxisTieTrait(settings.tieEI, 'E', 'I', DEFAULT_TIE_RULE.EI),
      SN: this.pickAxisTieTrait(settings.tieSN, 'S', 'N', DEFAULT_TIE_RULE.SN),
      TF: this.pickAxisTieTrait(settings.tieTF, 'T', 'F', DEFAULT_TIE_RULE.TF),
      JP: this.pickAxisTieTrait(settings.tieJP, 'J', 'P', DEFAULT_TIE_RULE.JP),
    };
  }

  private pickAxisTieTrait<T extends string>(
    stored: Trait,
    left: T,
    right: T,
    fallback: T,
  ): T {
    if (stored === left || stored === right) {
      return stored as T;
    }

    return fallback;
  }

  private async hydrateSharedSnapshot(params: {
    testId: number;
    resultMbti: MbtiCode;
    snapshot: Prisma.JsonValue;
  }) {
    const snapshot = this.toSnapshotRecord(params.snapshot);
    const hasStrengths = this.toStringArray(snapshot.strengths).length > 0;
    const hasCautions = this.toStringArray(snapshot.cautions).length > 0;

    if (hasStrengths && hasCautions) {
      return params.snapshot;
    }

    const currentResult = await this.repository.findMbtiResultByCode(params.testId, params.resultMbti);

    if (!currentResult) {
      return params.snapshot;
    }

    return {
      ...snapshot,
      strengths: hasStrengths ? snapshot.strengths : currentResult.strengthsJson,
      cautions: hasCautions ? snapshot.cautions : currentResult.cautionsJson,
    } satisfies Record<string, Prisma.JsonValue>;
  }

  private toSnapshotRecord(value: Prisma.JsonValue) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {} as Record<string, Prisma.JsonValue>;
    }

    return value as Record<string, Prisma.JsonValue>;
  }

  private toStringArray(value: Prisma.JsonValue | undefined) {
    if (!Array.isArray(value)) {
      return [] as string[];
    }

    return value.filter((item): item is string => typeof item === 'string');
  }

  private validateAnswers(
    questionIds: number[],
    submittedAnswers: Array<{ questionId: number; answer: number }>,
  ) {
    const submittedIdSet = new Set<number>();

    for (const item of submittedAnswers) {
      if (submittedIdSet.has(item.questionId)) {
        throw new ApiHttpException(
          HttpStatus.BAD_REQUEST,
          'DUPLICATE_QUESTION_ID',
          '동일한 questionId를 중복 제출할 수 없습니다.',
        );
      }

      submittedIdSet.add(item.questionId);
    }

    const questionIdSet = new Set(questionIds);

    for (const submittedId of submittedIdSet) {
      if (!questionIdSet.has(submittedId)) {
        throw new ApiHttpException(
          HttpStatus.BAD_REQUEST,
          'UNKNOWN_QUESTION_ID',
          '활성 질문에 없는 questionId가 포함되어 있습니다.',
        );
      }
    }

    for (const questionId of questionIds) {
      if (!submittedIdSet.has(questionId)) {
        throw new ApiHttpException(
          HttpStatus.BAD_REQUEST,
          'MISSING_ANSWER',
          '모든 활성 질문에 답변해야 제출할 수 있습니다.',
        );
      }
    }
  }

  private async createAttemptWithUniqueToken(baseData: {
    testId: number;
    answersJson: Prisma.InputJsonValue;
    scoresJson: Prisma.InputJsonValue;
    resultMbti: MbtiCode;
    resultSnapshotJson: Prisma.InputJsonValue;
    isShared: boolean;
  }) {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const shareToken = randomBytes(24).toString('base64url');

      try {
        return await this.repository.createTestAttempt({
          ...baseData,
          shareToken,
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          continue;
        }

        throw error;
      }
    }

    throw new ApiHttpException(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'TOKEN_GENERATION_FAILED',
      '공유 토큰 생성에 실패했습니다.',
    );
  }
}

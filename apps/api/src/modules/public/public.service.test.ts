import { describe, expect, it, vi } from 'vitest';
import { PublicService } from './public.service';

function createRepositoryMock() {
  return {
    findPublishedTestBySlug: vi.fn(),
    findActiveQuestionsByTestId: vi.fn(),
    findMbtiResultByCode: vi.fn(),
    createTestAttempt: vi.fn(),
    findSharedAttempt: vi.fn(),
  };
}

describe('PublicService submit validation', () => {
  it('rejects duplicate questionId submission', async () => {
    const repo = createRepositoryMock();
    const service = new PublicService(repo as never);

    repo.findPublishedTestBySlug.mockResolvedValue({
      id: 1,
      slug: 'basic-mbti',
      title: 'basic',
      settings: { shareEnabled: true, tieEI: 'I', tieSN: 'N', tieTF: 'T', tieJP: 'J' },
      answerScales: [],
    });

    repo.findActiveQuestionsByTestId.mockResolvedValue([
      { id: 11, questionText: 'q1', sortOrder: 1, dimension: 'EI', positiveTrait: 'E' },
    ]);

    await expect(
      service.submit('basic-mbti', {
        answers: [
          { questionId: 11, answer: 1 },
          { questionId: 11, answer: 2 },
        ],
      }),
    ).rejects.toMatchObject({
      response: {
        code: 'DUPLICATE_QUESTION_ID',
      },
    });
  });

  it('rejects when an active question is not answered', async () => {
    const repo = createRepositoryMock();
    const service = new PublicService(repo as never);

    repo.findPublishedTestBySlug.mockResolvedValue({
      id: 1,
      slug: 'basic-mbti',
      title: 'basic',
      settings: { shareEnabled: true, tieEI: 'I', tieSN: 'N', tieTF: 'T', tieJP: 'J' },
      answerScales: [],
    });

    repo.findActiveQuestionsByTestId.mockResolvedValue([
      { id: 11, questionText: 'q1', sortOrder: 1, dimension: 'EI', positiveTrait: 'E' },
      { id: 12, questionText: 'q2', sortOrder: 2, dimension: 'SN', positiveTrait: 'S' },
    ]);

    await expect(
      service.submit('basic-mbti', {
        answers: [{ questionId: 11, answer: 1 }],
      }),
    ).rejects.toMatchObject({
      response: {
        code: 'MISSING_ANSWER',
      },
    });
  });

  it('creates a shared attempt for valid submission', async () => {
    const repo = createRepositoryMock();
    const service = new PublicService(repo as never);

    repo.findPublishedTestBySlug.mockResolvedValue({
      id: 1,
      slug: 'basic-mbti',
      title: 'basic',
      settings: { shareEnabled: true, tieEI: 'I', tieSN: 'N', tieTF: 'T', tieJP: 'J' },
      answerScales: [],
    });

    repo.findActiveQuestionsByTestId.mockResolvedValue([
      { id: 11, questionText: 'q1', sortOrder: 1, dimension: 'EI', positiveTrait: 'E' },
      { id: 12, questionText: 'q2', sortOrder: 2, dimension: 'SN', positiveTrait: 'S' },
      { id: 13, questionText: 'q3', sortOrder: 3, dimension: 'TF', positiveTrait: 'T' },
      { id: 14, questionText: 'q4', sortOrder: 4, dimension: 'JP', positiveTrait: 'J' },
    ]);

    repo.findMbtiResultByCode.mockResolvedValue({
      title: '전략가',
      summary: 'summary',
      description: 'description',
      strengthsJson: ['집중력'],
      cautionsJson: ['과몰입'],
      shareTitle: 'share title',
      shareDescription: 'share desc',
      imageUrl: null,
    });

    repo.createTestAttempt.mockImplementation(async (data: { shareToken: string; resultMbti: string }) => ({
      shareToken: data.shareToken,
      resultMbti: data.resultMbti,
      createdAt: new Date('2026-03-07T00:00:00.000Z'),
    }));

    const result = await service.submit('basic-mbti', {
      answers: [
        { questionId: 11, answer: 1 },
        { questionId: 12, answer: 1 },
        { questionId: 13, answer: 1 },
        { questionId: 14, answer: 1 },
      ],
    });

    expect(result.resultMbti).toBe('ESTJ');
    expect(result.shareToken.length).toBeGreaterThan(10);
  });

  it('hydrates missing strengths and cautions for legacy shared snapshots', async () => {
    const repo = createRepositoryMock();
    const service = new PublicService(repo as never);

    repo.findSharedAttempt.mockResolvedValue({
      testId: 1,
      shareToken: 'token',
      resultMbti: 'INFJ',
      createdAt: new Date('2026-03-14T00:00:00.000Z'),
      resultSnapshotJson: {
        mbtiCode: 'INFJ',
        title: 'INFJ 유형',
        summary: '요약',
        description: '설명',
        strengths: [],
        cautions: [],
        shareTitle: '공유 제목',
        shareDescription: '공유 설명',
        imageUrl: null,
        test: {
          id: 1,
          slug: 'basic-mbti',
          title: '기본 MBTI 테스트',
        },
      },
    });

    repo.findMbtiResultByCode.mockResolvedValue({
      strengthsJson: ['강점 1', '강점 2'],
      cautionsJson: ['주의점 1', '주의점 2'],
    });

    const result = await service.getSharedResult('token');

    expect(result.snapshot).toMatchObject({
      strengths: ['강점 1', '강점 2'],
      cautions: ['주의점 1', '주의점 2'],
    });
  });
});

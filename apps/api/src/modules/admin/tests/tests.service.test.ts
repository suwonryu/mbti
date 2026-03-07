import { describe, expect, it, vi } from 'vitest';
import { AdminTestsService } from './tests.service';

function createRepositoryMock() {
  return {
    findMany: vi.fn(),
    findById: vi.fn(),
    updateInfo: vi.fn(),
    updateStatus: vi.fn(),
    upsertSettings: vi.fn(),
    findAnswerScale: vi.fn(),
    updateAnswerScaleLabels: vi.fn(),
    getPublishReadinessData: vi.fn(),
  };
}

describe('AdminTestsService publish validation', () => {
  it('returns canPublish=true when all checks pass', async () => {
    const repository = createRepositoryMock();
    const service = new AdminTestsService(repository as never);

    repository.getPublishReadinessData.mockResolvedValue({
      test: {
        id: 1,
        title: '기본 MBTI 테스트',
        slug: 'basic-mbti',
        description: '설명',
        introText: '소개',
        status: 'draft',
      },
      activeQuestions: [
        { dimension: 'EI' },
        { dimension: 'EI' },
        { dimension: 'EI' },
        { dimension: 'SN' },
        { dimension: 'SN' },
        { dimension: 'SN' },
        { dimension: 'TF' },
        { dimension: 'TF' },
        { dimension: 'TF' },
        { dimension: 'JP' },
        { dimension: 'JP' },
        { dimension: 'JP' },
      ],
      mbtiResultCount: 16,
      answerScales: [
        { value: 1, label: '매우 그렇다' },
        { value: 2, label: '그렇다' },
        { value: 3, label: '보통이다' },
        { value: 4, label: '아니다' },
        { value: 5, label: '매우 아니다' },
      ],
    });

    const result = await service.getPublishReadiness(1);

    expect(result.canPublish).toBe(true);
    expect(result.reasons).toEqual([]);
  });

  it('blocks publish when readiness validation fails', async () => {
    const repository = createRepositoryMock();
    const service = new AdminTestsService(repository as never);

    repository.findById.mockResolvedValue({ id: 1 });
    repository.getPublishReadinessData.mockResolvedValue({
      test: {
        id: 1,
        title: '기본 MBTI 테스트',
        slug: 'basic-mbti',
        description: '',
        introText: '',
        status: 'draft',
      },
      activeQuestions: [{ dimension: 'EI' }],
      mbtiResultCount: 5,
      answerScales: [{ value: 1, label: '매우 그렇다' }],
    });

    await expect(service.patchStatus(1, 'published')).rejects.toMatchObject({
      response: {
        code: 'PUBLISH_VALIDATION_FAILED',
      },
    });
  });

  it('updates basic test info with trimmed values', async () => {
    const repository = createRepositoryMock();
    const service = new AdminTestsService(repository as never);

    repository.findById.mockResolvedValue({ id: 1 });
    repository.updateInfo.mockResolvedValue({
      id: 1,
      title: '새 제목',
      slug: 'new-slug',
    });

    const result = await service.patchTestInfo(1, {
      title: '  새 제목  ',
      slug: ' new-slug ',
    });

    expect(result).toEqual({
      id: 1,
      title: '새 제목',
      slug: 'new-slug',
    });
    expect(repository.updateInfo).toHaveBeenCalledWith(1, {
      title: '새 제목',
      slug: 'new-slug',
    });
  });
});

import { describe, expect, it, vi } from 'vitest';
import { AdminResultsService } from './results.service';

function createRepositoryMock() {
  return {
    findTestById: vi.fn(),
    findResultsByTestId: vi.fn(),
    findResultById: vi.fn(),
    findResultByCode: vi.fn(),
    createResult: vi.fn(),
    updateResult: vi.fn(),
    deleteResult: vi.fn(),
  };
}

describe('AdminResultsService', () => {
  it('creates a new mbti result for a test', async () => {
    const repository = createRepositoryMock();
    const service = new AdminResultsService(repository as never);

    repository.findTestById.mockResolvedValue({ id: 1 });
    repository.findResultByCode.mockResolvedValue(null);
    repository.createResult.mockResolvedValue({
      id: 99,
      testId: 1,
      mbtiCode: 'INTJ',
      title: 'INTJ 유형',
    });

    const result = await service.createResult(1, {
      mbtiCode: 'INTJ',
      title: ' INTJ 유형 ',
      summary: ' 요약 ',
      description: ' 설명 ',
      strengths: [' 강점 1 '],
      cautions: [' 주의점 1 '],
      shareTitle: ' 공유 제목 ',
      shareDescription: ' 공유 설명 ',
      imageUrl: null,
    });

    expect(result).toEqual({
      id: 99,
      testId: 1,
      mbtiCode: 'INTJ',
      title: 'INTJ 유형',
    });
    expect(repository.createResult).toHaveBeenCalledWith(
      expect.objectContaining({
        testId: 1,
        mbtiCode: 'INTJ',
        title: 'INTJ 유형',
      }),
    );
  });

  it('deletes an existing result', async () => {
    const repository = createRepositoryMock();
    const service = new AdminResultsService(repository as never);

    repository.findResultById.mockResolvedValue({ id: 12, testId: 1 });
    repository.deleteResult.mockResolvedValue({ id: 12, testId: 1 });

    const result = await service.deleteResult(12);

    expect(result).toEqual({
      resultId: 12,
      testId: 1,
      deleted: true,
    });
  });

  it('rejects invalid image urls on create', async () => {
    const repository = createRepositoryMock();
    const service = new AdminResultsService(repository as never);

    repository.findTestById.mockResolvedValue({ id: 1 });
    repository.findResultByCode.mockResolvedValue(null);

    await expect(
      service.createResult(1, {
        mbtiCode: 'INTJ',
        title: 'INTJ 유형',
        summary: '요약',
        description: '설명',
        strengths: ['강점 1'],
        cautions: ['주의점 1'],
        shareTitle: '공유 제목',
        shareDescription: '공유 설명',
        imageUrl: 'INTJ',
      }),
    ).rejects.toMatchObject({
      response: {
        code: 'INVALID_IMAGE_URL',
      },
    });
  });

  it('accepts root-relative image urls on create', async () => {
    const repository = createRepositoryMock();
    const service = new AdminResultsService(repository as never);

    repository.findTestById.mockResolvedValue({ id: 1 });
    repository.findResultByCode.mockResolvedValue(null);
    repository.createResult.mockResolvedValue({
      id: 99,
      testId: 1,
      mbtiCode: 'INTJ',
      title: 'INTJ 유형',
      imageUrl: '/images/intj.png',
    });

    await service.createResult(1, {
      mbtiCode: 'INTJ',
      title: 'INTJ 유형',
      summary: '요약',
      description: '설명',
      strengths: ['강점 1'],
      cautions: ['주의점 1'],
      shareTitle: '공유 제목',
      shareDescription: '공유 설명',
      imageUrl: '/images/intj.png',
    });

    expect(repository.createResult).toHaveBeenCalledWith(
      expect.objectContaining({
        imageUrl: '/images/intj.png',
      }),
    );
  });
});

import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, TestStatus } from '@prisma/client';
import { ApiHttpException } from '../../../common/api-error';
import { AdminTestsRepository } from './tests.repository';
import { UpdateAnswerScaleDto } from './dto/update-answer-scale.dto';
import { UpdateTestSettingsDto } from './dto/update-test-settings.dto';
import { UpdateTestInfoDto } from './dto/update-test-info.dto';

const REQUIRED_SCALE_VALUES = [1, 2, 3, 4, 5] as const;
const REQUIRED_DIMENSIONS = ['EI', 'SN', 'TF', 'JP'] as const;

@Injectable()
export class AdminTestsService {
  constructor(private readonly repository: AdminTestsRepository) {}

  async getTests() {
    const items = await this.repository.findMany();
    return { items };
  }

  async getTest(id: number) {
    const test = await this.repository.findById(id);

    if (!test) {
      throw new ApiHttpException(HttpStatus.NOT_FOUND, 'TEST_NOT_FOUND', '테스트를 찾을 수 없습니다.');
    }

    return test;
  }

  async patchTestInfo(id: number, body: UpdateTestInfoDto) {
    await this.assertTestExists(id);

    const normalized: Prisma.TestUpdateInput = {};

    if (body.title !== undefined) {
      const title = body.title.trim();
      if (!title) {
        throw new ApiHttpException(HttpStatus.BAD_REQUEST, 'INVALID_TEST_TITLE', 'title은 비어 있을 수 없습니다.');
      }
      normalized.title = title;
    }

    if (body.slug !== undefined) {
      const slug = body.slug.trim();
      if (!slug) {
        throw new ApiHttpException(HttpStatus.BAD_REQUEST, 'INVALID_TEST_SLUG', 'slug는 비어 있을 수 없습니다.');
      }
      normalized.slug = slug;
    }

    if (body.description !== undefined) {
      const description = body.description.trim();
      if (!description) {
        throw new ApiHttpException(
          HttpStatus.BAD_REQUEST,
          'INVALID_TEST_DESCRIPTION',
          'description은 비어 있을 수 없습니다.',
        );
      }
      normalized.description = description;
    }

    if (body.introText !== undefined) {
      const introText = body.introText.trim();
      if (!introText) {
        throw new ApiHttpException(HttpStatus.BAD_REQUEST, 'INVALID_TEST_INTRO', 'introText는 비어 있을 수 없습니다.');
      }
      normalized.introText = introText;
    }

    if (body.thumbnailUrl !== undefined) {
      if (body.thumbnailUrl === null) {
        normalized.thumbnailUrl = null;
      } else {
        const thumbnailUrl = body.thumbnailUrl.trim();
        normalized.thumbnailUrl = thumbnailUrl || null;
      }
    }

    if (Object.keys(normalized).length === 0) {
      throw new ApiHttpException(
        HttpStatus.BAD_REQUEST,
        'EMPTY_TEST_UPDATE',
        '수정할 테스트 기본 정보가 없습니다.',
      );
    }

    try {
      return await this.repository.updateInfo(id, normalized);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ApiHttpException(HttpStatus.CONFLICT, 'DUPLICATE_TEST_SLUG', '이미 사용 중인 slug입니다.');
      }

      throw error;
    }
  }

  async patchStatus(id: number, status: TestStatus) {
    await this.assertTestExists(id);

    if (status === 'published') {
      const readiness = await this.getPublishReadiness(id);

      if (!readiness.canPublish) {
        throw new ApiHttpException(
          HttpStatus.BAD_REQUEST,
          'PUBLISH_VALIDATION_FAILED',
          `공개 전 검증에 실패했습니다: ${readiness.reasons.join(' | ')}`,
        );
      }
    }

    return this.repository.updateStatus(id, status);
  }

  async putSettings(id: number, body: UpdateTestSettingsDto) {
    await this.assertTestExists(id);

    return this.repository.upsertSettings(id, {
      testId: id,
      tieEI: body.tieEI,
      tieSN: body.tieSN,
      tieTF: body.tieTF,
      tieJP: body.tieJP,
      shareEnabled: body.shareEnabled,
    });
  }

  async getAnswerScale(id: number) {
    await this.assertTestExists(id);
    return { id, scales: await this.repository.findAnswerScale(id) };
  }

  async putAnswerScale(id: number, body: UpdateAnswerScaleDto) {
    await this.assertTestExists(id);

    const labelsByValue = new Map<number, string>();

    for (const item of body.scales) {
      if (labelsByValue.has(item.value)) {
        throw new ApiHttpException(HttpStatus.BAD_REQUEST, 'DUPLICATE_SCALE_VALUE', 'value는 중복될 수 없습니다.');
      }

      const normalizedLabel = item.label.trim();

      if (!normalizedLabel) {
        throw new ApiHttpException(HttpStatus.BAD_REQUEST, 'INVALID_SCALE_LABEL', '선택지 문구는 비어 있을 수 없습니다.');
      }

      labelsByValue.set(item.value, normalizedLabel);
    }

    for (const value of REQUIRED_SCALE_VALUES) {
      if (!labelsByValue.has(value)) {
        throw new ApiHttpException(HttpStatus.BAD_REQUEST, 'MISSING_SCALE_VALUE', `value=${value} 항목이 필요합니다.`);
      }
    }

    const scales = await this.repository.updateAnswerScaleLabels(id, labelsByValue);

    return {
      id,
      scales,
    };
  }

  async getPublishReadiness(id: number) {
    const data = await this.repository.getPublishReadinessData(id);

    if (!data.test) {
      throw new ApiHttpException(HttpStatus.NOT_FOUND, 'TEST_NOT_FOUND', '테스트를 찾을 수 없습니다.');
    }

    const reasons: string[] = [];
    const test = data.test;

    if (!test.title.trim() || !test.slug.trim() || !test.description.trim() || !test.introText.trim()) {
      reasons.push('테스트 기본 정보(title/slug/description/introText)가 모두 필요합니다.');
    }

    const activeCountByDimension = new Map<string, number>();
    let totalActiveQuestions = 0;

    for (const question of data.activeQuestions) {
      const current = activeCountByDimension.get(question.dimension) ?? 0;
      activeCountByDimension.set(question.dimension, current + 1);
      totalActiveQuestions += 1;
    }

    if (totalActiveQuestions < 1) {
      reasons.push('활성 질문이 1개 이상 필요합니다.');
    }

    for (const dimension of REQUIRED_DIMENSIONS) {
      const count = activeCountByDimension.get(dimension) ?? 0;

      if (count < 1) {
        reasons.push(`${dimension} 축 활성 질문이 최소 1개 필요합니다.`);
      }
    }

    if (data.mbtiResultCount !== 16) {
      reasons.push('16개 MBTI 결과가 모두 등록되어야 합니다.');
    }

    const labelsByValue = new Map<number, string>();
    for (const scale of data.answerScales) {
      labelsByValue.set(scale.value, scale.label.trim());
    }

    for (const value of REQUIRED_SCALE_VALUES) {
      const label = labelsByValue.get(value);

      if (!label) {
        reasons.push(`선택지 value=${value} 문구가 필요합니다.`);
      }
    }

    return {
      testId: id,
      canPublish: reasons.length === 0,
      reasons,
      checklist: {
        activeQuestionCount: totalActiveQuestions,
        activeQuestionCountByDimension: {
          EI: activeCountByDimension.get('EI') ?? 0,
          SN: activeCountByDimension.get('SN') ?? 0,
          TF: activeCountByDimension.get('TF') ?? 0,
          JP: activeCountByDimension.get('JP') ?? 0,
        },
        mbtiResultCount: data.mbtiResultCount,
        answerScaleCount: data.answerScales.length,
      },
    };
  }

  private async assertTestExists(id: number) {
    const test = await this.repository.findById(id);

    if (!test) {
      throw new ApiHttpException(HttpStatus.NOT_FOUND, 'TEST_NOT_FOUND', '테스트를 찾을 수 없습니다.');
    }

    return test;
  }
}

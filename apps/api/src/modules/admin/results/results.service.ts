import { HttpStatus, Injectable } from '@nestjs/common';
import { MbtiCode, Prisma } from '@prisma/client';
import { ApiHttpException } from '../../../common/api-error';
import { CreateResultDto } from './dto/create-result.dto';
import { UpdateResultDto } from './dto/update-result.dto';
import { AdminResultsRepository } from './results.repository';

@Injectable()
export class AdminResultsService {
  constructor(private readonly repository: AdminResultsRepository) {}

  async getResults(testId: number) {
    const test = await this.repository.findTestById(testId);

    if (!test) {
      throw new ApiHttpException(HttpStatus.NOT_FOUND, 'TEST_NOT_FOUND', '테스트를 찾을 수 없습니다.');
    }

    const results = await this.repository.findResultsByTestId(testId);

    return {
      id: testId,
      results,
    };
  }

  async updateResult(resultId: number, body: UpdateResultDto) {
    const existing = await this.repository.findResultById(resultId);

    if (!existing) {
      throw new ApiHttpException(HttpStatus.NOT_FOUND, 'RESULT_NOT_FOUND', '결과 콘텐츠를 찾을 수 없습니다.');
    }

    const data: Prisma.MbtiResultUpdateInput = {
      title: body.title?.trim(),
      summary: body.summary?.trim(),
      description: body.description?.trim(),
      shareTitle: body.shareTitle?.trim(),
      shareDescription: body.shareDescription?.trim(),
      imageUrl: body.imageUrl === undefined ? undefined : body.imageUrl,
    };

    if (body.strengths) {
      data.strengthsJson = body.strengths.map((value) => value.trim()).filter(Boolean);
    }

    if (body.cautions) {
      data.cautionsJson = body.cautions.map((value) => value.trim()).filter(Boolean);
    }

    return this.repository.updateResult(resultId, data);
  }

  async createResult(testId: number, body: CreateResultDto) {
    const test = await this.repository.findTestById(testId);

    if (!test) {
      throw new ApiHttpException(HttpStatus.NOT_FOUND, 'TEST_NOT_FOUND', '테스트를 찾을 수 없습니다.');
    }

    const mbtiCode = body.mbtiCode as MbtiCode;
    const existing = await this.repository.findResultByCode(testId, mbtiCode);

    if (existing) {
      throw new ApiHttpException(
        HttpStatus.CONFLICT,
        'RESULT_ALREADY_EXISTS',
        `이미 등록된 MBTI 결과(${mbtiCode})입니다.`,
      );
    }

    const title = body.title.trim();
    const summary = body.summary.trim();
    const description = body.description.trim();
    const shareTitle = body.shareTitle.trim();
    const shareDescription = body.shareDescription.trim();
    const strengths = body.strengths.map((value) => value.trim()).filter(Boolean);
    const cautions = body.cautions.map((value) => value.trim()).filter(Boolean);

    if (!title || !summary || !description || !shareTitle || !shareDescription) {
      throw new ApiHttpException(
        HttpStatus.BAD_REQUEST,
        'INVALID_RESULT_PAYLOAD',
        '결과 콘텐츠 필수 항목은 비어 있을 수 없습니다.',
      );
    }

    if (strengths.length < 1 || cautions.length < 1) {
      throw new ApiHttpException(
        HttpStatus.BAD_REQUEST,
        'INVALID_RESULT_LIST',
        'strengths/cautions는 최소 1개 이상 필요합니다.',
      );
    }

    return this.repository.createResult({
      testId,
      mbtiCode,
      title,
      summary,
      description,
      strengthsJson: strengths,
      cautionsJson: cautions,
      shareTitle,
      shareDescription,
      imageUrl: body.imageUrl === undefined || body.imageUrl === null ? null : body.imageUrl.trim() || null,
    });
  }

  async deleteResult(resultId: number) {
    const existing = await this.repository.findResultById(resultId);

    if (!existing) {
      throw new ApiHttpException(HttpStatus.NOT_FOUND, 'RESULT_NOT_FOUND', '결과 콘텐츠를 찾을 수 없습니다.');
    }

    const deleted = await this.repository.deleteResult(resultId);

    return {
      resultId: deleted.id,
      testId: deleted.testId,
      deleted: true,
    };
  }
}

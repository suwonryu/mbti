import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiHttpException } from '../../../common/api-error';
import { CreateQuestionDto } from './dto/create-question.dto';
import { ReorderQuestionsDto } from './dto/reorder-questions.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { AdminQuestionsRepository } from './questions.repository';

const DIMENSION_TRAIT_MAP = {
  EI: ['E', 'I'],
  SN: ['S', 'N'],
  TF: ['T', 'F'],
  JP: ['J', 'P'],
} as const;

@Injectable()
export class AdminQuestionsService {
  constructor(private readonly repository: AdminQuestionsRepository) {}

  async getQuestions(testId: number) {
    await this.assertTestExists(testId);

    const questions = await this.repository.findQuestionsByTestId(testId);

    return {
      id: testId,
      questions,
    };
  }

  async createQuestion(testId: number, body: CreateQuestionDto) {
    await this.assertTestExists(testId);
    this.assertTraitMatchesDimension(body.dimension, body.positiveTrait);

    const nextSortOrder = (await this.repository.findMaxSortOrder(testId)) + 1;

    const created = await this.repository.createQuestion({
      testId,
      questionText: body.questionText.trim(),
      dimension: body.dimension,
      positiveTrait: body.positiveTrait,
      sortOrder: nextSortOrder,
      isActive: body.isActive ?? true,
    });

    return created;
  }

  async updateQuestion(questionId: number, body: UpdateQuestionDto) {
    const existing = await this.repository.findQuestionById(questionId);

    if (!existing) {
      throw new ApiHttpException(HttpStatus.NOT_FOUND, 'QUESTION_NOT_FOUND', '질문을 찾을 수 없습니다.');
    }

    const dimension = body.dimension ?? existing.dimension;
    const positiveTrait = body.positiveTrait ?? existing.positiveTrait;
    this.assertTraitMatchesDimension(dimension, positiveTrait);

    return this.repository.updateQuestion(questionId, {
      questionText: body.questionText?.trim(),
      dimension,
      positiveTrait,
      isActive: body.isActive,
    });
  }

  async removeQuestion(questionId: number) {
    const existing = await this.repository.findQuestionById(questionId);

    if (!existing) {
      throw new ApiHttpException(HttpStatus.NOT_FOUND, 'QUESTION_NOT_FOUND', '질문을 찾을 수 없습니다.');
    }

    const deleted = await this.repository.deleteQuestion(questionId);

    return {
      questionId: deleted.id,
      deleted: true,
    };
  }

  async reorderQuestions(testId: number, body: ReorderQuestionsDto) {
    await this.assertTestExists(testId);

    const questionIds = body.questionIds;
    const uniqueIds = new Set(questionIds);

    if (uniqueIds.size !== questionIds.length) {
      throw new ApiHttpException(HttpStatus.BAD_REQUEST, 'DUPLICATE_QUESTION_ID', 'questionIds는 중복될 수 없습니다.');
    }

    const current = await this.repository.findQuestionsByTestId(testId);
    const currentIds = current.map((question) => question.id);

    if (currentIds.length !== questionIds.length) {
      throw new ApiHttpException(
        HttpStatus.BAD_REQUEST,
        'QUESTION_ORDER_SIZE_MISMATCH',
        'questionIds는 테스트의 전체 질문 ID를 포함해야 합니다.',
      );
    }

    const currentSet = new Set(currentIds);

    for (const id of questionIds) {
      if (!currentSet.has(id)) {
        throw new ApiHttpException(
          HttpStatus.BAD_REQUEST,
          'UNKNOWN_QUESTION_ID',
          `테스트에 존재하지 않는 questionId(${id})가 포함되어 있습니다.`,
        );
      }
    }

    const questions = await this.repository.reorderQuestions(testId, questionIds);

    return {
      id: testId,
      questions,
    };
  }

  private assertTraitMatchesDimension(dimension: keyof typeof DIMENSION_TRAIT_MAP, positiveTrait: string) {
    if (!DIMENSION_TRAIT_MAP[dimension].includes(positiveTrait as never)) {
      throw new ApiHttpException(
        HttpStatus.BAD_REQUEST,
        'INVALID_TRAIT_FOR_DIMENSION',
        'positiveTrait는 dimension 축에 맞는 값이어야 합니다.',
      );
    }
  }

  private async assertTestExists(testId: number) {
    const test = await this.repository.findTestById(testId);

    if (!test) {
      throw new ApiHttpException(HttpStatus.NOT_FOUND, 'TEST_NOT_FOUND', '테스트를 찾을 수 없습니다.');
    }
  }
}

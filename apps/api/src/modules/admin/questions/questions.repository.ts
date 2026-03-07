import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class AdminQuestionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findTestById(testId: number) {
    return this.prisma.test.findUnique({
      where: { id: testId },
      select: { id: true },
    });
  }

  async findQuestionsByTestId(testId: number) {
    return this.prisma.question.findMany({
      where: { testId },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        questionText: true,
        dimension: true,
        positiveTrait: true,
        sortOrder: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findQuestionById(questionId: number) {
    return this.prisma.question.findUnique({
      where: { id: questionId },
      select: {
        id: true,
        testId: true,
        questionText: true,
        dimension: true,
        positiveTrait: true,
        sortOrder: true,
        isActive: true,
      },
    });
  }

  async findMaxSortOrder(testId: number) {
    const question = await this.prisma.question.findFirst({
      where: { testId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    return question?.sortOrder ?? 0;
  }

  async createQuestion(data: Prisma.QuestionUncheckedCreateInput) {
    return this.prisma.question.create({
      data,
      select: {
        id: true,
        testId: true,
        questionText: true,
        dimension: true,
        positiveTrait: true,
        sortOrder: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateQuestion(questionId: number, data: Prisma.QuestionUpdateInput) {
    return this.prisma.question.update({
      where: { id: questionId },
      data,
      select: {
        id: true,
        testId: true,
        questionText: true,
        dimension: true,
        positiveTrait: true,
        sortOrder: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deleteQuestion(questionId: number) {
    return this.prisma.question.delete({
      where: { id: questionId },
      select: {
        id: true,
        testId: true,
      },
    });
  }

  async reorderQuestions(testId: number, questionIds: number[]) {
    await this.prisma.$transaction(
      questionIds.map((questionId, index) =>
        this.prisma.question.update({
          where: { id: questionId },
          data: {
            sortOrder: index + 1,
          },
        }),
      ),
    );

    return this.findQuestionsByTestId(testId);
  }
}

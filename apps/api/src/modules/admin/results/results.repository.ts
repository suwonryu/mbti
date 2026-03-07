import { Injectable } from '@nestjs/common';
import { MbtiCode, Prisma } from '@prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class AdminResultsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findTestById(testId: number) {
    return this.prisma.test.findUnique({
      where: { id: testId },
      select: {
        id: true,
      },
    });
  }

  async findResultsByTestId(testId: number) {
    return this.prisma.mbtiResult.findMany({
      where: { testId },
      orderBy: { mbtiCode: 'asc' },
      select: {
        id: true,
        testId: true,
        mbtiCode: true,
        title: true,
        summary: true,
        description: true,
        strengthsJson: true,
        cautionsJson: true,
        shareTitle: true,
        shareDescription: true,
        imageUrl: true,
        updatedAt: true,
      },
    });
  }

  async findResultById(resultId: number) {
    return this.prisma.mbtiResult.findUnique({
      where: { id: resultId },
      select: {
        id: true,
        testId: true,
        mbtiCode: true,
        title: true,
        summary: true,
        description: true,
        strengthsJson: true,
        cautionsJson: true,
        shareTitle: true,
        shareDescription: true,
        imageUrl: true,
        updatedAt: true,
      },
    });
  }

  async findResultByCode(testId: number, mbtiCode: MbtiCode) {
    return this.prisma.mbtiResult.findUnique({
      where: {
        testId_mbtiCode: {
          testId,
          mbtiCode,
        },
      },
      select: {
        id: true,
      },
    });
  }

  async createResult(data: Prisma.MbtiResultUncheckedCreateInput) {
    return this.prisma.mbtiResult.create({
      data,
      select: {
        id: true,
        testId: true,
        mbtiCode: true,
        title: true,
        summary: true,
        description: true,
        strengthsJson: true,
        cautionsJson: true,
        shareTitle: true,
        shareDescription: true,
        imageUrl: true,
        updatedAt: true,
      },
    });
  }

  async updateResult(resultId: number, data: Prisma.MbtiResultUpdateInput) {
    return this.prisma.mbtiResult.update({
      where: { id: resultId },
      data,
      select: {
        id: true,
        testId: true,
        mbtiCode: true,
        title: true,
        summary: true,
        description: true,
        strengthsJson: true,
        cautionsJson: true,
        shareTitle: true,
        shareDescription: true,
        imageUrl: true,
        updatedAt: true,
      },
    });
  }

  async deleteResult(resultId: number) {
    return this.prisma.mbtiResult.delete({
      where: { id: resultId },
      select: {
        id: true,
        testId: true,
      },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { MbtiCode, Prisma, TestStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class PublicRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPublishedTestBySlug(slug: string) {
    return this.prisma.test.findFirst({
      where: {
        slug,
        status: TestStatus.published,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        introText: true,
        thumbnailUrl: true,
        settings: {
          select: {
            shareEnabled: true,
            tieEI: true,
            tieSN: true,
            tieTF: true,
            tieJP: true,
          },
        },
        answerScales: {
          orderBy: {
            sortOrder: 'asc',
          },
          select: {
            value: true,
            label: true,
            sortOrder: true,
          },
        },
      },
    });
  }

  async findActiveQuestionsByTestId(testId: number) {
    return this.prisma.question.findMany({
      where: {
        testId,
        isActive: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
      select: {
        id: true,
        questionText: true,
        sortOrder: true,
        dimension: true,
        positiveTrait: true,
      },
    });
  }

  async findMbtiResultByCode(testId: number, mbtiCode: MbtiCode) {
    return this.prisma.mbtiResult.findUnique({
      where: {
        testId_mbtiCode: {
          testId,
          mbtiCode,
        },
      },
    });
  }

  async createTestAttempt(data: Prisma.TestAttemptUncheckedCreateInput) {
    return this.prisma.testAttempt.create({
      data,
      select: {
        shareToken: true,
        resultMbti: true,
        createdAt: true,
      },
    });
  }

  async findSharedAttempt(shareToken: string) {
    return this.prisma.testAttempt.findUnique({
      where: {
        shareToken,
      },
      select: {
        testId: true,
        shareToken: true,
        resultMbti: true,
        resultSnapshotJson: true,
        createdAt: true,
      },
    });
  }
}

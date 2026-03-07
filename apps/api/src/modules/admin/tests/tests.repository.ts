import { Injectable } from '@nestjs/common';
import { Prisma, TestStatus } from '@prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class AdminTestsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany() {
    return this.prisma.test.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        updatedAt: true,
      },
    });
  }

  async findById(id: number) {
    return this.prisma.test.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        introText: true,
        thumbnailUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        settings: {
          select: {
            tieEI: true,
            tieSN: true,
            tieTF: true,
            tieJP: true,
            shareEnabled: true,
          },
        },
      },
    });
  }

  async updateInfo(id: number, data: Prisma.TestUpdateInput) {
    return this.prisma.test.update({
      where: { id },
      data,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        introText: true,
        thumbnailUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        settings: {
          select: {
            tieEI: true,
            tieSN: true,
            tieTF: true,
            tieJP: true,
            shareEnabled: true,
          },
        },
      },
    });
  }

  async updateStatus(id: number, status: TestStatus) {
    return this.prisma.test.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        status: true,
        updatedAt: true,
      },
    });
  }

  async upsertSettings(testId: number, data: Prisma.TestSettingUncheckedCreateInput) {
    return this.prisma.testSetting.upsert({
      where: { testId },
      update: {
        tieEI: data.tieEI,
        tieSN: data.tieSN,
        tieTF: data.tieTF,
        tieJP: data.tieJP,
        shareEnabled: data.shareEnabled,
      },
      create: data,
      select: {
        testId: true,
        tieEI: true,
        tieSN: true,
        tieTF: true,
        tieJP: true,
        shareEnabled: true,
        updatedAt: true,
      },
    });
  }

  async findAnswerScale(testId: number) {
    return this.prisma.answerScale.findMany({
      where: { testId },
      orderBy: { sortOrder: 'asc' },
      select: {
        value: true,
        label: true,
        scoreWeight: true,
        sortOrder: true,
      },
    });
  }

  async updateAnswerScaleLabels(testId: number, labelsByValue: Map<number, string>) {
    await this.prisma.$transaction(
      Array.from(labelsByValue.entries()).map(([value, label]) =>
        this.prisma.answerScale.update({
          where: {
            testId_value: {
              testId,
              value,
            },
          },
          data: {
            label,
            sortOrder: value,
          },
        }),
      ),
    );

    return this.findAnswerScale(testId);
  }

  async getPublishReadinessData(testId: number) {
    const [test, activeQuestions, mbtiResultCount, answerScales] = await this.prisma.$transaction([
      this.prisma.test.findUnique({
        where: { id: testId },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          introText: true,
          status: true,
        },
      }),
      this.prisma.question.findMany({
        where: {
          testId,
          isActive: true,
        },
        select: {
          dimension: true,
        },
      }),
      this.prisma.mbtiResult.count({
        where: { testId },
      }),
      this.prisma.answerScale.findMany({
        where: { testId },
        select: {
          value: true,
          label: true,
        },
      }),
    ]);

    return {
      test,
      activeQuestions,
      mbtiResultCount,
      answerScales,
    };
  }
}

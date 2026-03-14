import { PrismaClient, type MbtiCode } from '@prisma/client';
import { mbtiResultContent } from '@mbti/shared/constants/mbti-result-content';

const prisma = new PrismaClient();

const questionSeeds = [
  { questionText: '사람들과 함께 있을 때 에너지가 생긴다.', dimension: 'EI', positiveTrait: 'E' },
  { questionText: '처음 보는 사람에게도 먼저 말을 거는 편이다.', dimension: 'EI', positiveTrait: 'E' },
  { questionText: '혼자 생각을 정리하는 시간이 꼭 필요하다.', dimension: 'EI', positiveTrait: 'I' },
  { questionText: '세부 정보보다 전체 흐름을 먼저 파악한다.', dimension: 'SN', positiveTrait: 'N' },
  { questionText: '경험해 본 방식보다 새로운 가능성에 끌린다.', dimension: 'SN', positiveTrait: 'N' },
  { questionText: '추상적인 아이디어보다 현실적인 사실이 편하다.', dimension: 'SN', positiveTrait: 'S' },
  { questionText: '의사결정 시 객관적인 기준을 먼저 본다.', dimension: 'TF', positiveTrait: 'T' },
  { questionText: '갈등 상황에서 상대 감정을 먼저 고려한다.', dimension: 'TF', positiveTrait: 'F' },
  { questionText: '공정성이 중요하면 다소 차갑게 보일 수 있다.', dimension: 'TF', positiveTrait: 'T' },
  { questionText: '일정을 미리 세우고 계획대로 움직이는 편이다.', dimension: 'JP', positiveTrait: 'J' },
  { questionText: '즉흥적으로 바꾸는 상황이 오히려 재미있다.', dimension: 'JP', positiveTrait: 'P' },
  { questionText: '마감이 다가와야 집중이 잘 된다.', dimension: 'JP', positiveTrait: 'P' },
] as const;

const mbtiCodes: MbtiCode[] = [
  'ISTJ',
  'ISFJ',
  'INFJ',
  'INTJ',
  'ISTP',
  'ISFP',
  'INFP',
  'INTP',
  'ESTP',
  'ESFP',
  'ENFP',
  'ENTP',
  'ESTJ',
  'ESFJ',
  'ENFJ',
  'ENTJ',
];

async function main() {
  const defaultAdminPasswordHash = '$2b$10$nnBnA3NNfJGOZra2iDV/n.JmdiNOoxUovfTgZrJi1vTNt.mDAUFPy';

  const admin = await prisma.admin.upsert({
    where: { email: 'admin@example.com' },
    update: {
      name: 'MVP Admin',
      role: 'SUPER_ADMIN',
      passwordHash: defaultAdminPasswordHash,
    },
    create: {
      email: 'admin@example.com',
      passwordHash: defaultAdminPasswordHash,
      name: 'MVP Admin',
      role: 'SUPER_ADMIN',
    },
  });

  const test = await prisma.test.upsert({
    where: { slug: 'basic-mbti' },
    update: {
      title: '기본 MBTI 테스트',
      description: 'MVP 기본 테스트',
      introText: '간단한 성향 테스트를 진행해 보세요.',
      status: 'published',
    },
    create: {
      title: '기본 MBTI 테스트',
      slug: 'basic-mbti',
      description: 'MVP 기본 테스트',
      introText: '간단한 성향 테스트를 진행해 보세요.',
      status: 'published',
    },
  });

  await prisma.testSetting.upsert({
    where: { testId: test.id },
    update: {
      tieEI: 'I',
      tieSN: 'N',
      tieTF: 'T',
      tieJP: 'J',
      shareEnabled: true,
    },
    create: {
      testId: test.id,
      tieEI: 'I',
      tieSN: 'N',
      tieTF: 'T',
      tieJP: 'J',
      shareEnabled: true,
    },
  });

  const scales = [
    { value: 1, label: '매우 그렇다', scoreWeight: 2, sortOrder: 1 },
    { value: 2, label: '그렇다', scoreWeight: 1, sortOrder: 2 },
    { value: 3, label: '보통이다', scoreWeight: 0, sortOrder: 3 },
    { value: 4, label: '아니다', scoreWeight: -1, sortOrder: 4 },
    { value: 5, label: '매우 아니다', scoreWeight: -2, sortOrder: 5 },
  ];

  for (const scale of scales) {
    await prisma.answerScale.upsert({
      where: {
        testId_value: {
          testId: test.id,
          value: scale.value,
        },
      },
      update: {
        label: scale.label,
        sortOrder: scale.sortOrder,
      },
      create: {
        testId: test.id,
        value: scale.value,
        label: scale.label,
        scoreWeight: scale.scoreWeight,
        sortOrder: scale.sortOrder,
      },
    });
  }

  for (const [index, question] of questionSeeds.entries()) {
    const existing = await prisma.question.findFirst({
      where: {
        testId: test.id,
        questionText: question.questionText,
      },
      select: {
        id: true,
      },
    });

    if (existing) {
      await prisma.question.update({
        where: { id: existing.id },
        data: {
          dimension: question.dimension,
          positiveTrait: question.positiveTrait,
          sortOrder: index + 1,
          isActive: true,
        },
      });
      continue;
    }

    await prisma.question.create({
      data: {
        testId: test.id,
        questionText: question.questionText,
        dimension: question.dimension,
        positiveTrait: question.positiveTrait,
        sortOrder: index + 1,
        isActive: true,
      },
    });
  }

  for (const code of mbtiCodes) {
    const existing = await prisma.mbtiResult.findUnique({
      where: {
        testId_mbtiCode: {
          testId: test.id,
          mbtiCode: code,
        },
      },
      select: {
        id: true,
      },
    });

    if (existing) {
      continue;
    }

    const content = mbtiResultContent[code];

    await prisma.mbtiResult.create({
      data: {
        testId: test.id,
        mbtiCode: code,
        title: content.title,
        summary: content.summary,
        description: content.description,
        strengthsJson: content.strengths,
        cautionsJson: content.cautions,
        shareTitle: content.shareTitle,
        shareDescription: content.shareDescription,
      },
    });
  }

  console.log({ adminId: admin.id, testId: test.id, questionCount: questionSeeds.length, mbtiCount: mbtiCodes.length });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

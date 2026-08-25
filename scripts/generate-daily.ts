import { prisma } from "../lib/prisma";
import { generateQuizWithAI } from "../lib/ai";
import { generateJoinCode } from "../lib/utils";
import { DAILY_QUIZ_TOPICS } from "../lib/daily-topics";
import bcrypt from "bcryptjs";
import crypto from "crypto";

async function main() {
  console.log("Starting daily challenge quiz generator...");

  // 1. Ensure System User exists
  let systemUser = await prisma.user.findFirst({
    where: { email: "system@mentatry.com" },
  });

  if (!systemUser) {
    const hashedPassword = await bcrypt.hash(crypto.randomUUID(), 10);
    systemUser = await prisma.user.create({
      data: {
        firstName: "Mentatry Daily",
        email: "system@mentatry.com",
        password: hashedPassword,
      },
    });
    console.log("Created system user:", systemUser.id);
  }

  // 2. Ensure we have quizzes for today and next 7 days (solid 1-week buffer)
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const targetDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + i));
    console.log(`Checking daily quiz for: ${targetDate.toISOString()}`);

    const existing = await prisma.quiz.findUnique({
      where: { dailyDate: targetDate },
    });

    if (existing) {
      console.log(`Quiz already exists for ${targetDate.toISOString()}: "${existing.title}"`);
      continue;
    }

    const daysSinceEpoch = Math.floor(targetDate.getTime() / (1000 * 60 * 60 * 24));
    const topicIndex = daysSinceEpoch % DAILY_QUIZ_TOPICS.length;
    const topic = DAILY_QUIZ_TOPICS[topicIndex];
    console.log(`Generating AI quiz for topic: "${topic}"...`);

    const aiResult = await generateQuizWithAI({
      sourceType: "TOPIC",
      sourceContent: topic,
      questionCount: 10,
      difficulty: "medium",
    });

    if (!aiResult.success || !aiResult.data) {
      console.error(`Failed to generate quiz for ${targetDate.toISOString()}:`, aiResult.error);
      continue;
    }

    const generatedQuiz = aiResult.data;
    const joinCode = generateJoinCode(6);
    const title = `Daily Quiz: ${generatedQuiz.title}`;

    await prisma.$transaction(async (tx) => {
      const newQuiz = await tx.quiz.create({
        data: {
          ownerId: systemUser!.id,
          title,
          sourceType: "TOPIC",
          sourceContent: topic,
          difficulty: "medium",
          status: "PUBLISHED",
          isDailyQuiz: true,
          dailyDate: targetDate,
          joinCode,
          timeLimitMinutes: null,
        },
      });

      await tx.quizAccess.create({
        data: {
          quizId: newQuiz.id,
          userId: systemUser!.id,
          role: "OWNER",
        },
      });

      await tx.question.createMany({
        data: generatedQuiz.questions.map((q, idx) => ({
          quizId: newQuiz.id,
          text: q.text,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation || null,
          order: idx,
        })),
      });
    });

    console.log(`Successfully generated and saved daily quiz for ${targetDate.toISOString()}!`);
  }

  console.log("Daily quiz generation complete!");
}

main()
  .catch((e) => {
    console.error("Error generating daily quiz:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

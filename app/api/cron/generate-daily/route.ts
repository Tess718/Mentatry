import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQuizWithAI } from "@/lib/ai";
import { generateJoinCode } from "@/lib/utils";
import { DAILY_QUIZ_TOPICS } from "@/lib/daily-topics";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow up to 60s for AI quiz generation on Vercel

export async function GET(req: Request) {
  // Validate cron secret (fail-closed: require CRON_SECRET to be configured and valid)
  const authHeader = req.headers.get("authorization");
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
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
    }

    // 2. Ensure we have quizzes for today and the next 7 days ahead (solid 1-week buffer)
    const now = new Date();
    const generatedDates: string[] = [];
    const skippedDates: string[] = [];

    for (let i = 0; i < 7; i++) {
      const targetDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + i));
      
      const existing = await prisma.quiz.findUnique({
        where: { dailyDate: targetDate },
      });

      if (existing) {
        skippedDates.push(targetDate.toISOString());
        continue;
      }

      // Pick a topic deterministically rotating based on the date
      const daysSinceEpoch = Math.floor(targetDate.getTime() / (1000 * 60 * 60 * 24));
      const topicIndex = daysSinceEpoch % DAILY_QUIZ_TOPICS.length;
      const topic = DAILY_QUIZ_TOPICS[topicIndex];
      
      const aiResult = await generateQuizWithAI({
        sourceType: "TOPIC",
        sourceContent: topic,
        questionCount: 10,
        difficulty: "medium",
      });

      if (!aiResult.success || !aiResult.data) {
        console.error(`Failed to generate daily quiz for ${targetDate.toISOString()} on topic: ${topic}`);
        continue;
      }

      const generatedQuiz = aiResult.data;
      const joinCode = generateJoinCode(6);
      const title = `Daily Quiz: ${generatedQuiz.title}`;

      // Insert quiz
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
            timeLimitMinutes: null, // No hard time limit
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
            order: idx + 1,
          })),
        });
      });

      generatedDates.push(targetDate.toISOString());
    }

    return NextResponse.json({
      success: true,
      generatedDates,
      skippedDates,
    });

  } catch (error) {
    console.error("Daily quiz generation cron failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

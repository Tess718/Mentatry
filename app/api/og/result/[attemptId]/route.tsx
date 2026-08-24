import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          select: {
            title: true,
            status: true,
            isDailyQuiz: true,
            dailyDate: true,
            difficulty: true,
          },
        },
        user: {
          select: {
            firstName: true,
            email: true,
          },
        },
      },
    });

    if (!attempt) {
      return new Response("Attempt not found", { status: 404 });
    }

    const { quiz, user } = attempt;

    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const isFutureDaily = quiz.isDailyQuiz && quiz.dailyDate && quiz.dailyDate.getTime() > todayUTC.getTime();

    // Security: Do not generate OG preview image for draft or unreleased daily quizzes
    if (quiz.status !== "PUBLISHED" || isFutureDaily) {
      return new Response("Attempt not found", { status: 404 });
    }
    const percentage = attempt.totalQuestions > 0 
      ? Math.round((attempt.score / attempt.totalQuestions) * 100) 
      : 0;
    
    const playerName = user?.firstName || user?.email?.split("@")[0] || "Player";
    
    // Format elapsed time if present
    let timeText = "";
    if (attempt.totalTimeMs) {
      const seconds = Math.floor(attempt.totalTimeMs / 1000);
      const mins = Math.floor(seconds / 60);
      const remSecs = seconds % 60;
      timeText = mins > 0 ? `${mins}m ${remSecs}s` : `${remSecs}s`;
    }

    // Calculate daily streak if it's a daily quiz
    let streakCount = 0;
    if (quiz.isDailyQuiz && attempt.userId) {
      const completedAttempts = await prisma.attempt.findMany({
        where: { userId: attempt.userId, completedAt: { not: null } },
        select: { completedAt: true },
        orderBy: { completedAt: "desc" },
      });

      const distinctDays = new Set(
        completedAttempts.map((a) => {
          const d = new Date(a.completedAt!);
          return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
        })
      );

      const now = new Date();
      const todayDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      const yesterdayDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));

      const todayStr = `${todayDate.getUTCFullYear()}-${todayDate.getUTCMonth() + 1}-${todayDate.getUTCDate()}`;
      const yesterdayStr = `${yesterdayDate.getUTCFullYear()}-${yesterdayDate.getUTCMonth() + 1}-${yesterdayDate.getUTCDate()}`;

      let checkDate: Date | null = null;
      if (distinctDays.has(todayStr)) {
        checkDate = new Date(todayDate);
      } else if (distinctDays.has(yesterdayStr)) {
        checkDate = new Date(yesterdayDate);
      }

      if (checkDate) {
        while (true) {
          const checkStr = `${checkDate.getUTCFullYear()}-${checkDate.getUTCMonth() + 1}-${checkDate.getUTCDate()}`;
          if (distinctDays.has(checkStr)) {
            streakCount++;
            checkDate.setUTCDate(checkDate.getUTCDate() - 1);
          } else {
            break;
          }
        }
      }
    }

    let logoBase64 = "";
    try {
      const logoBuffer = await fs.readFile(path.join(process.cwd(), "public", "mentatry_logo.png"));
      logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;
    } catch (e) {
      console.warn("Could not load logo for OG image:", e);
    }

    const isPerfectScore = percentage === 100;
    const isPassing = percentage >= 70;

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#090d16",
            padding: "40px",
            fontFamily: "sans-serif",
          }}
        >
          {/* Main Card */}
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              backgroundColor: isPerfectScore ? "#bef264" : isPassing ? "#fde047" : "#fed7aa",
              border: "6px solid #000000",
              borderRadius: "28px",
              padding: "48px",
              boxShadow: "16px 16px 0px 0px #000000",
            }}
          >
            {/* Top Bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              {/* Brand Pill */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#000000",
                  color: "#ffffff",
                  padding: "10px 24px",
                  borderRadius: "14px",
                  fontSize: "24px",
                  fontWeight: 900,
                  letterSpacing: "-0.5px",
                }}
              >
                {logoBase64 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoBase64}
                    alt="Mentatry Logo"
                    style={{
                      width: "32px",
                      height: "32px",
                      marginRight: "10px",
                      objectFit: "contain",
                    }}
                  />
                ) : null}
                <span>MENTATRY</span>
              </div>

              {/* Badges */}
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                {quiz.isDailyQuiz && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: "#38bdf8",
                      color: "#000000",
                      border: "3px solid #000000",
                      padding: "8px 18px",
                      borderRadius: "12px",
                      fontSize: "18px",
                      fontWeight: 900,
                      boxShadow: "3px 3px 0px 0px #000000",
                    }}
                  >
                    🏆 DAILY CHALLENGE
                  </div>
                )}
                {streakCount > 0 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: "#f97316",
                      color: "#ffffff",
                      border: "3px solid #000000",
                      padding: "8px 18px",
                      borderRadius: "12px",
                      fontSize: "18px",
                      fontWeight: 900,
                      boxShadow: "3px 3px 0px 0px #000000",
                    }}
                  >
                    🔥 {streakCount} DAY STREAK
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "#ffffff",
                    color: "#000000",
                    border: "3px solid #000000",
                    padding: "8px 18px",
                    borderRadius: "12px",
                    fontSize: "18px",
                    fontWeight: 900,
                    boxShadow: "3px 3px 0px 0px #000000",
                  }}
                >
                  👤 {playerName}
                </div>
              </div>
            </div>

            {/* Middle Section: Quiz Title & Big Score Box */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "32px",
                margin: "20px 0",
              }}
            >
              {/* Title & Callout */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: "44px",
                    fontWeight: 900,
                    color: "#000000",
                    lineHeight: 1.1,
                    textTransform: "uppercase",
                    letterSpacing: "-1px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {quiz.title.length > 50 ? `${quiz.title.slice(0, 48)}...` : quiz.title}
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: "24px",
                    fontWeight: 800,
                    color: "#334155",
                  }}
                >
                  {isPerfectScore
                    ? "🌟 Flawless Victory! Can you match my score?"
                    : isPassing
                    ? "🎯 Nailed it! Think you can do better?"
                    : "⚡ Just completed! Test your knowledge."}
                </div>
              </div>

              {/* Big Score Box */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#ffffff",
                  border: "5px solid #000000",
                  borderRadius: "24px",
                  padding: "24px 44px",
                  boxShadow: "8px 8px 0px 0px #000000",
                  minWidth: "280px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: "16px",
                    fontWeight: 900,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  FINAL SCORE
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "center",
                    fontSize: "68px",
                    fontWeight: 900,
                    color: "#000000",
                    lineHeight: 1.1,
                  }}
                >
                  <span>{attempt.score}</span>
                  <span style={{ fontSize: "36px", color: "#64748b", fontWeight: 700, marginLeft: "4px" }}>
                    /{attempt.totalQuestions}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    backgroundColor: isPerfectScore ? "#a3e635" : "#fde047",
                    color: "#000000",
                    border: "2px solid #000000",
                    padding: "4px 16px",
                    borderRadius: "8px",
                    fontSize: "22px",
                    fontWeight: 900,
                    marginTop: "8px",
                  }}
                >
                  {percentage}%
                </div>
              </div>
            </div>

            {/* Bottom Bar: Stats & Link */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderTop: "4px solid #000000",
                paddingTop: "24px",
              }}
            >
              <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                {timeText ? (
                  <div style={{ display: "flex", fontSize: "20px", fontWeight: 800, color: "#000000" }}>
                    ⏱️ {timeText}
                  </div>
                ) : null}
                <div style={{ display: "flex", fontSize: "20px", fontWeight: 800, color: "#000000" }}>
                  📊 {attempt.score} of {attempt.totalQuestions} correct
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#000000",
                  color: "#ffffff",
                  padding: "12px 28px",
                  borderRadius: "14px",
                  fontSize: "22px",
                  fontWeight: 900,
                  letterSpacing: "-0.5px",
                }}
              >
                Play this quiz at mentatry.vercel.app →
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("Error generating OG score card:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}

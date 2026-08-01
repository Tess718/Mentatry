export function calculateAnswerPoints(
  isCorrect: boolean,
  timeTakenMs: number | null,
  questionAllowanceMs: number,
  currentStreak: number
): number {
  if (!isCorrect) {
    return 0;
  }

  // Base Points
  let points = 10;

  // Speed Bonus (Max 10)
  if (timeTakenMs !== null && timeTakenMs !== undefined) {
    const remaining = Math.max(0, questionAllowanceMs - timeTakenMs);
    const speedBonus = Math.min(10, Math.max(0, Math.round((remaining / questionAllowanceMs) * 10)));
    points += speedBonus;
  }

  // Streak Bonus (Max ? - we will cap or scale based on formula)
  if (currentStreak >= 3) {
    // 3rd correct = +5, 4th = +10, 5th = +15, etc.
    const streakBonus = (currentStreak - 2) * 5;
    points += streakBonus;
  }

  return points;
}

export interface GuestAnswerWithQuestion {
  selectedOption: number;
  timeTakenMs: number | null;
  questionId: string;
}

export interface MinimalQuestion {
  id: string;
  correctIndex: number;
}

export function computeGuestScoreFromAnswers(
  questions: MinimalQuestion[],
  answers: GuestAnswerWithQuestion[],
  expectedDurationMs: number
): { points: number; streak: number; correctCount: number; totalTimeMs: number } {
  let points = 0;
  let streak = 0;
  let correctCount = 0;
  let totalTimeMs = 0;

  for (const q of questions) {
    const ans = answers.find(a => a.questionId === q.id);
    if (ans && ans.selectedOption === q.correctIndex) {
      points += calculateAnswerPoints(true, ans.timeTakenMs || 1000, expectedDurationMs, streak);
      streak++;
      correctCount++;
    } else {
      streak = 0;
    }
    
    totalTimeMs += (ans?.timeTakenMs || 0);
  }

  return { points, streak, correctCount, totalTimeMs };
}

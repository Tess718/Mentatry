"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getAndAcknowledgeNewAchievementsAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized." };
  }

  const userId = session.user.id;

  try {
    // Atomic fetch-and-flip using a transaction
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch unacknowledged achievements
      const unacknowledged = await tx.userAchievement.findMany({
        where: { userId, acknowledged: false },
        include: { achievement: true },
      });

      if (unacknowledged.length === 0) {
        return { success: true, newlyEarned: [] };
      }

      // 2. Flip them to acknowledged
      const idsToAcknowledge = unacknowledged.map((ua) => ua.id);
      await tx.userAchievement.updateMany({
        where: { id: { in: idsToAcknowledge } },
        data: { acknowledged: true },
      });

      // 3. Return the achievement metadata for the toast
      const newlyEarned = unacknowledged.map((ua) => ua.achievement);
      return { success: true, newlyEarned };
    });
  } catch (error) {
    console.error("Error fetching/acknowledging achievements:", error);
    return { error: "Failed to fetch achievements." };
  }
}

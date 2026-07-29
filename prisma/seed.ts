import { PrismaClient } from './generated/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding achievements...');

  const achievements = [
    {
      key: 'first_quiz',
      name: 'First Steps',
      description: 'Complete your first quiz.',
      icon: 'Play',
      criteria: { type: 'attempt_count', threshold: 1 },
    },
    {
      key: 'streak_7',
      name: '7-Day Streak',
      description: 'Complete a quiz 7 days in a row.',
      icon: 'Flame',
      criteria: { type: 'streak_days', threshold: 7 },
    },
    {
      key: 'perfect_score',
      name: 'Perfect Score',
      description: 'Get all questions correct in a single quiz.',
      icon: 'Award',
      criteria: { type: 'perfect_score' },
    },
    {
      key: 'speed_demon',
      name: 'Speed Demon',
      description: 'Answer a question correctly within 3 seconds in a live room.',
      icon: 'Zap',
      criteria: { type: 'speed_correct', maxSeconds: 3 },
    },
    {
      key: 'quiz_master',
      name: 'Quiz Master',
      description: 'Create 5 published quizzes.',
      icon: 'GraduationCap',
      criteria: { type: 'quizzes_owned', threshold: 5 },
    },
    {
      key: 'social_butterfly',
      name: 'Social Butterfly',
      description: 'Join 3 classroom quizzes created by others.',
      icon: 'Users',
      criteria: { type: 'quizzes_joined_as_taker', threshold: 3 },
    },
    {
      key: 'century_club',
      name: 'Century Club',
      description: 'Complete 100 quizzes.',
      icon: 'Trophy',
      criteria: { type: 'attempt_count', threshold: 100 },
    },
    {
      key: 'monthly_master',
      name: 'Monthly Master',
      description: 'Complete a quiz 30 days in a row.',
      icon: 'Flame',
      criteria: { type: 'streak_days', threshold: 30 },
    },
    {
      key: 'trivia_titan',
      name: 'Trivia Titan',
      description: 'Answer 1,000 questions total.',
      icon: 'Brain',
      criteria: { type: 'questions_answered', threshold: 1000 },
    },
    {
      key: 'flawless_victory',
      name: 'Flawless Victory',
      description: 'Achieve a perfect score on 50 different quizzes.',
      icon: 'Award',
      criteria: { type: 'perfect_scores_count', threshold: 50 },
    },
    {
      key: 'quiz_legend',
      name: 'Quiz Legend',
      description: 'Create 50 published quizzes.',
      icon: 'Crown',
      criteria: { type: 'quizzes_owned', threshold: 50 },
    },
    {
      key: 'social_elite',
      name: 'Social Elite',
      description: 'Join 50 classroom quizzes created by others.',
      icon: 'Users2',
      criteria: { type: 'quizzes_joined_as_taker', threshold: 50 },
    },
  ];

  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { key: ach.key },
      update: {
        name: ach.name,
        description: ach.description,
        icon: ach.icon,
        criteria: ach.criteria,
      },
      create: ach,
    });
  }

  console.log('Achievements seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

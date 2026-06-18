import { prisma } from "./prisma";

// ─── Badge Definitions ────────────────────────────────────────
export interface BadgeDefinition {
  type: string;
  title: string;
  description: string;
  icon: string; // emoji
  condition: string; // human-readable
}

export const BADGE_CATALOG: BadgeDefinition[] = [
  { type: "BEGINNER",       title: "First Steps",         description: "Complete your first mock test",                   icon: "🎯", condition: "1 mock test completed" },
  { type: "INTERMEDIATE",   title: "Getting Serious",     description: "Complete 5 mock tests",                           icon: "📈", condition: "5 mock tests completed" },
  { type: "ADVANCED",       title: "Test Veteran",        description: "Complete 15 mock tests",                          icon: "🏅", condition: "15 mock tests completed" },
  { type: "EXPERT",         title: "LEET Master",         description: "Complete 30 mock tests",                          icon: "👑", condition: "30 mock tests completed" },
  { type: "TOP_PERFORMER",  title: "Top Performer",       description: "Score above 90% in any mock test",                icon: "⭐", condition: "90%+ in any test" },
  { type: "WEEKLY_TOPPER",  title: "Weekly Champion",     description: "Highest score in your college this week",         icon: "🏆", condition: "Highest weekly score" },
  { type: "CONSISTENCY",    title: "Steady Learner",      description: "Study for 7 consecutive days",                    icon: "📚", condition: "7-day study streak" },
  { type: "STREAK_7",       title: "Week Warrior",        description: "7-day test streak",                               icon: "🔥", condition: "7 days testing streak" },
  { type: "STREAK_30",      title: "Monthly Legend",      description: "30-day study streak",                             icon: "💎", condition: "30-day study streak" },
  { type: "STREAK_100",     title: "Century Champion",    description: "100-day study streak",                            icon: "🎖️", condition: "100-day streak" },
  { type: "IMPROVEMENT",    title: "Rising Star",         description: "Improve score by 20% over 3 consecutive tests",   icon: "📊", condition: "20% improvement over 3 tests" },
  { type: "FAST_LEARNER",   title: "Speed Demon",         description: "Complete a test in under 50% of allotted time",   icon: "⚡", condition: "Under 50% time used" },
];

// ─── Core Badge Check & Award Function ────────────────────────
export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  const awarded: string[] = [];

  // Gather existing badges so we don't re-award
  const existing = await prisma.userBadge.findMany({
    where: { userId },
    select: { badgeType: true },
  });
  const existingSet = new Set(existing.map((b) => b.badgeType));

  // Gather stats
  const [attemptCount, attempts, studyDays] = await Promise.all([
    prisma.testAttempt.count({ where: { userId } }),
    prisma.testAttempt.findMany({
      where: { userId },
      orderBy: { completedAt: "desc" },
      include: { test: { select: { duration: true, title: true } } },
    }),
    prisma.dailyStudy.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      select: { date: true },
    }),
  ]);

  // Helper to award a badge
  const award = async (type: string) => {
    if (existingSet.has(type)) return;
    const def = BADGE_CATALOG.find((b) => b.type === type);
    if (!def) return;
    try {
      await prisma.userBadge.create({
        data: { userId, badgeType: type, title: def.title },
      });
      awarded.push(type);
      existingSet.add(type);
    } catch {
      // Unique constraint – already awarded
    }
  };

  // ─── Test Count Badges ────────────────────────────────────
  if (attemptCount >= 1)  await award("BEGINNER");
  if (attemptCount >= 5)  await award("INTERMEDIATE");
  if (attemptCount >= 15) await award("ADVANCED");
  if (attemptCount >= 30) await award("EXPERT");

  // ─── Top Performer (90%+) ────────────────────────────────
  const hasTopScore = attempts.some(
    (a) => a.totalMarks > 0 && (a.score / a.totalMarks) * 100 >= 90
  );
  if (hasTopScore) await award("TOP_PERFORMER");

  // ─── Fast Learner (under 50% of allotted time) ───────────
  const hasFastFinish = attempts.some(
    (a) => a.timeTaken && a.test.duration > 0 && a.timeTaken < (a.test.duration * 60) / 2
  );
  if (hasFastFinish) await award("FAST_LEARNER");

  // ─── Improvement (20% improvement across 3 consecutive tests) ──
  if (attempts.length >= 3) {
    for (let i = 0; i <= attempts.length - 3; i++) {
      const newest = attempts[i];
      const oldest = attempts[i + 2];
      if (oldest.totalMarks > 0 && newest.totalMarks > 0) {
        const oldPct = (oldest.score / oldest.totalMarks) * 100;
        const newPct = (newest.score / newest.totalMarks) * 100;
        if (newPct - oldPct >= 20) {
          await award("IMPROVEMENT");
          break;
        }
      }
    }
  }

  // ─── Streak Badges ──────────────────────────────────────
  const streak = calculateConsecutiveDays(studyDays.map((d) => d.date));
  if (streak >= 7)   await award("CONSISTENCY");
  if (streak >= 7)   await award("STREAK_7");
  if (streak >= 30)  await award("STREAK_30");
  if (streak >= 100) await award("STREAK_100");

  return awarded;
}

// ─── Streak Calculator ────────────────────────────────────────
function calculateConsecutiveDays(dates: Date[]): number {
  if (dates.length === 0) return 0;
  
  const normalized = [...new Set(
    dates.map((d) => {
      const dt = new Date(d);
      return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    })
  )].sort().reverse();

  if (normalized.length === 0) return 0;

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

  // Streak must include today or yesterday
  if (normalized[0] !== todayStr && normalized[0] !== yesterdayStr) return 0;

  let streak = 1;
  for (let i = 1; i < normalized.length; i++) {
    const prev = new Date(normalized[i - 1]);
    const curr = new Date(normalized[i]);
    const diffMs = prev.getTime() - curr.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

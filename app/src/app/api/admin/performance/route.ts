import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/middleware";
import { apiResponse, apiError } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (isAuthResponse(auth)) return auth;

  try {
    const searchParams = req.nextUrl.searchParams;
    const collegeFilter = searchParams.get("collegeName") || undefined;
    const branchFilter = searchParams.get("branch") || undefined;
    const stateFilter = searchParams.get("state") || undefined;

    // Define where conditions based on filters
    const whereCondition: any = {
      role: "USER" // Filter for students
    };

    if (collegeFilter && collegeFilter !== "ALL") {
      whereCondition.collegeName = collegeFilter;
    }
    if (branchFilter && branchFilter !== "ALL") {
      whereCondition.branch = branchFilter;
    }
    if (stateFilter && stateFilter !== "ALL") {
      whereCondition.state = stateFilter;
    }

    // Fetch students with their test attempts and daily study time
    const students = await prisma.user.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        email: true,
        collegeName: true,
        branch: true,
        state: true,
        testAttempts: {
          select: {
            score: true,
            totalMarks: true,
            answers: true
          }
        },
        dailyStudies: {
          select: {
            studyTime: true,
            questionsSolved: true
          }
        }
      }
    });

    // Format list of student performances
    const studentPerformances = students.map(student => {
      let totalTests = student.testAttempts.length;
      let totalScore = 0;
      let totalMarksPossible = 0;
      let totalCorrect = 0;
      let totalAttempted = 0;

      student.testAttempts.forEach(att => {
        totalScore += att.score;
        totalMarksPossible += att.totalMarks;

        const answers = att.answers as Record<string, string>;
        totalAttempted += Object.keys(answers).length;
      });

      // Simple correct answers estimation for accuracy
      const avgPercentage = totalMarksPossible > 0 ? Math.round((totalScore / totalMarksPossible) * 100) : 0;
      const accuracy = totalAttempted > 0 ? Math.round((totalScore / totalMarksPossible) * 100) : 0; // standard proxy

      const totalStudyTime = student.dailyStudies.reduce((sum, s) => sum + s.studyTime, 0);
      const totalQuestionsSolved = student.dailyStudies.reduce((sum, s) => sum + s.questionsSolved, 0);

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        college: student.collegeName || "Not Set",
        branch: student.branch || "Not Set",
        state: student.state || "Not Set",
        totalTests,
        averagePercentage: avgPercentage,
        accuracy: accuracy || avgPercentage,
        totalStudyTime,
        totalQuestionsSolved
      };
    });

    // Fetch lists for filter dropdowns dynamically
    const allCollegesRaw = await prisma.user.findMany({
      where: { role: "USER", collegeName: { not: null } },
      distinct: ["collegeName"],
      select: { collegeName: true }
    });

    const allBranchesRaw = await prisma.user.findMany({
      where: { role: "USER", branch: { not: null } },
      distinct: ["branch"],
      select: { branch: true }
    });

    const allStatesRaw = await prisma.user.findMany({
      where: { role: "USER", state: { not: null } },
      distinct: ["state"],
      select: { state: true }
    });

    const filterOptions = {
      colleges: allCollegesRaw.map(c => c.collegeName).filter((c): c is string => !!c),
      branches: allBranchesRaw.map(b => b.branch).filter((b): b is string => !!b),
      states: allStatesRaw.map(s => s.state).filter((s): s is string => !!s)
    };

    // Aggregate statistics by branch
    const branchStats: Record<string, { totalScore: number; count: number }> = {};
    studentPerformances.forEach(student => {
      if (student.branch !== "Not Set") {
        if (!branchStats[student.branch]) {
          branchStats[student.branch] = { totalScore: 0, count: 0 };
        }
        branchStats[student.branch].totalScore += student.averagePercentage;
        branchStats[student.branch].count++;
      }
    });

    const branchAggregates = Object.keys(branchStats).map(branch => ({
      branch,
      averagePercentage: Math.round(branchStats[branch].totalScore / branchStats[branch].count),
      studentCount: branchStats[branch].count
    })).sort((a, b) => b.averagePercentage - a.averagePercentage);

    return apiResponse({
      students: studentPerformances,
      branchAggregates,
      filterOptions
    });

  } catch (err: any) {
    console.error("Failed to fetch admin student performance records:", err);
    return apiError(err.message || "Internal server error", 500);
  }
}

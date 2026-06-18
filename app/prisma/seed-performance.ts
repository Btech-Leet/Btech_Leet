import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Aptitude", "Engineering Subjects"];
const TOPICS: Record<string, string[]> = {
  "Mathematics": ["Calculus", "Linear Algebra", "Probability & Statistics", "Differential Equations", "Numerical Methods"],
  "Physics": ["Mechanics", "Thermodynamics", "Wave Optics", "Electromagnetism", "Modern Physics"],
  "Chemistry": ["Atomic Structure", "Chemical Bonding", "Electrochemistry", "Organic Reactions", "Coordination Compounds"],
  "Aptitude": ["Quantitative Aptitude", "Logical Reasoning", "Data Interpretation", "Verbal Ability"],
  "Engineering Subjects": ["Programming in C/C++", "Basic Electronics", "Electrical Circuits", "Engineering Mechanics", "Digital Logic"]
};

const COLLEGES = [
  "Delhi Technological University (DTU)",
  "Netaji Subhas University of Technology (NSUT)",
  "YMCA University of Science and Technology",
  "Punjab Engineering College (PEC)",
  "UIET Panjab University",
  "Guru Gobind Singh Indraprastha University (GGSIPU)",
  "Harcourt Butler Technical University (HBTU)",
  "Madan Mohan Malaviya University of Technology (MMMUT)"
];

const BRANCHES = [
  "Computer Science",
  "Mechanical",
  "Civil",
  "Electrical",
  "Electronics"
];

const STATES = [
  "Delhi",
  "Haryana",
  "Punjab",
  "Uttar Pradesh",
  "Chandigarh",
  "Rajasthan"
];

async function main() {
  console.log("Starting performance data seeding...");

  // 1. Tag existing questions with subjects & topics
  const questions = await prisma.question.findMany();
  console.log(`Found ${questions.length} questions in the database to tag.`);
  
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    // Select a subject and topic deterministically based on index so it is consistent
    const subject = SUBJECTS[i % SUBJECTS.length];
    const topics = TOPICS[subject];
    const topic = topics[i % topics.length];

    await prisma.question.update({
      where: { id: q.id },
      data: { subject, topic }
    });
  }
  console.log("Successfully tagged existing questions with subjects and topics.");

  // 2. Fetch or create a test student (nishant.it089@gmail.com)
  let testUser = await prisma.user.findUnique({
    where: { email: "nishant.it089@gmail.com" }
  });

  if (!testUser) {
    console.log("Test user nishant.it089@gmail.com not found. Creating...");
    testUser = await prisma.user.create({
      data: {
        name: "Nishant",
        email: "nishant.it089@gmail.com",
        password: "hashedpassword123", // Dummy password
        role: "ADMIN",
        collegeName: COLLEGES[0],
        branch: BRANCHES[0],
        state: STATES[0],
        profileComplete: 80,
        examTargets: ["IPU_CET_LEET", "DTU_LEET", "HARYANA_LEET"]
      }
    });
  } else {
    // Ensure the test user has college, branch, and state for demographic checks
    testUser = await prisma.user.update({
      where: { id: testUser.id },
      data: {
        collegeName: testUser.collegeName || COLLEGES[0],
        branch: testUser.branch || BRANCHES[0],
        state: testUser.state || STATES[0],
        profileComplete: Math.max(testUser.profileComplete, 80),
        examTargets: testUser.examTargets.length > 0 ? testUser.examTargets : ["IPU_CET_LEET", "DTU_LEET", "HARYANA_LEET"]
      }
    });
  }

  // 3. Create mock peer students (needed for leaderboard, rank predictions, branch averages)
  console.log("Creating peer students...");
  const peerUsers = [];
  const peerEmails = [
    "rahul.cse@gmail.com", "priya.mech@gmail.com", "aman.civil@gmail.com",
    "sneha.ece@gmail.com", "vikram.ee@gmail.com", "pooja.cse@gmail.com",
    "rohit.cse@gmail.com", "divya.ece@gmail.com", "kabir.mech@gmail.com",
    "isha.civil@gmail.com"
  ];

  for (let i = 0; i < peerEmails.length; i++) {
    const email = peerEmails[i];
    let peer = await prisma.user.findUnique({ where: { email } });
    if (!peer) {
      peer = await prisma.user.create({
        data: {
          name: email.split(".")[0].toUpperCase() + " " + email.split(".")[1].split("@")[0].toUpperCase(),
          email,
          password: "hashedpassword123",
          role: "USER",
          collegeName: COLLEGES[i % COLLEGES.length],
          branch: BRANCHES[i % BRANCHES.length],
          state: STATES[i % STATES.length],
          profileComplete: 90,
          examTargets: ["DTU_LEET", "IPU_CET_LEET"]
        }
      });
    }
    peerUsers.push(peer);
  }
  console.log(`Created/found ${peerUsers.length} peer students.`);

  // 4. Ensure some mock tests exist in the database
  let tests = await prisma.mockTest.findMany({ include: { questions: true } });
  if (tests.length === 0) {
    console.log("No mock tests found. Creating a default LEET exam with questions...");
    const exam = await prisma.exam.findFirst();
    const examId = exam?.id || null;

    const newTest = await prisma.mockTest.create({
      data: {
        title: "Full Length Mock Test 1",
        slug: "full-length-mock-test-1",
        description: "A comprehensive mock test covering all LEET topics.",
        duration: 90,
        totalMarks: 100,
        passMark: 40,
        status: "PUBLISHED",
        examId,
        questions: {
          create: Array.from({ length: 10 }).map((_, idx) => ({
            text: `Question ${idx + 1} for LEET preparation. What is the correct option?`,
            type: "MCQ",
            options: [
              { label: "Option A", value: "A" },
              { label: "Option B", value: "B" },
              { label: "Option C", value: "C" },
              { label: "Option D", value: "D" }
            ],
            answer: ["A", "B", "C", "D"][idx % 4],
            explanation: "This is a detailed explanation of the solution.",
            marks: 10,
            order: idx,
            subject: SUBJECTS[idx % SUBJECTS.length],
            topic: TOPICS[SUBJECTS[idx % SUBJECTS.length]][idx % 4]
          }))
        }
      },
      include: { questions: true }
    });
    tests.push(newTest);
  }

  // 5. Seed test attempts and daily study logs
  console.log("Seeding test attempts and study logs...");
  const allUsers = [testUser, ...peerUsers];
  
  // Clear old test attempts and daily study for these users to prevent duplicate key conflicts
  const userIds = allUsers.map(u => u.id);
  await prisma.testAttempt.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.dailyStudy.deleteMany({ where: { userId: { in: userIds } } });

  const now = new Date();

  for (const user of allUsers) {
    // Generate daily study logs for the last 30 days
    console.log(`Generating study history for ${user.name}...`);
    const streakDays = user.id === testUser.id ? 14 : Math.floor(Math.random() * 8) + 2; // Test user has 14 days consecutive streak
    
    for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
      const date = new Date(now);
      date.setDate(now.getDate() - dayOffset);
      date.setHours(0, 0, 0, 0);

      // Check if user is in study streak range
      const isStudying = dayOffset <= streakDays || Math.random() > 0.4;
      if (isStudying) {
        const studyTime = Math.floor(Math.random() * 120) + 30; // 30 to 150 mins
        const questionsSolved = Math.floor(Math.random() * 30) + 5;
        const notesViewed = Math.floor(Math.random() * 5) + 1;
        const testsAttempted = Math.random() > 0.7 ? 1 : 0;

        await prisma.dailyStudy.create({
          data: {
            userId: user.id,
            date,
            studyTime,
            questionsSolved,
            notesViewed,
            testsAttempted
          }
        });

        // If a test was attempted, create an attempt record
        if (testsAttempted > 0) {
          const test = tests[Math.floor(Math.random() * tests.length)];
          
          // Generate answers JSON
          const answers: Record<string, string> = {};
          let score = 0;
          
          // Score logic (make the testUser scores improve over time)
          const baseAccuracy = user.id === testUser.id 
            ? 0.5 + (30 - dayOffset) * 0.012 // Accuracy increases from 50% to 86% over 30 days
            : Math.random() * 0.4 + 0.4; // Peer users have static random accuracy (40%-80%)
            
          test.questions.forEach((q) => {
            const isCorrect = Math.random() < baseAccuracy;
            if (isCorrect) {
              answers[q.id] = q.answer;
              score += q.marks;
            } else {
              // Select wrong answer
              const wrongOptions = ["A", "B", "C", "D"].filter(o => o !== q.answer);
              answers[q.id] = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
            }
          });

          await prisma.testAttempt.create({
            data: {
              userId: user.id,
              testId: test.id,
              answers,
              score,
              totalMarks: test.totalMarks,
              timeTaken: Math.floor(Math.random() * (test.duration * 30)) + (test.duration * 20), // 20-50 mins in seconds
              completedAt: date
            }
          });
        }
      }
    }
  }

  // 6. Seed Premium Plans
  console.log("Seeding premium plans...");
  await prisma.premiumPlan.deleteMany();
  const plans = [
    {
      name: "1 Month Premium",
      price: 299,
      duration: 30,
      features: ["Full Access to All 25+ State LEET Exams", "Unlimited Mock Tests & Detailed Solutions", "AI-Powered Expected Rank Predictor", "Direct Study Streak Tracking & Rewards", "Ad-Free Platform Experience"]
    },
    {
      name: "3 Months Premium",
      price: 699,
      duration: 90,
      features: ["Everything in 1-Month Plan", "Downloadable Previous Year Papers (PDF)", "Priority Expert Doubts Assistance", "Comprehensive Subject Completion Tracking", "Save ₹200 (22% discount)"]
    },
    {
      name: "6 Months Premium",
      price: 1199,
      duration: 180,
      features: ["Everything in 3-Months Plan", "Exclusive Toppers Preparation Webinars", "Full Engineering Mechanics & Electronics Notes", "1-on-1 Mentorship Session call", "Save ₹600 (33% discount)"]
    },
    {
      name: "12 Months Premium",
      price: 1999,
      duration: 365,
      features: ["Everything in 6-Months Plan", "Complete Admission & Counselling Assistance", "Refund Protection Guarantee", "Lifetime Alumni Badge in Community", "Save ₹1600 (44% discount)"]
    }
  ];

  for (const plan of plans) {
    await prisma.premiumPlan.create({ data: plan });
  }
  console.log("Seeded premium plans successfully!");

  // 7. Seed initial badges for nishant
  console.log("Seeding badges for nishant...");
  await prisma.userBadge.deleteMany({ where: { userId: testUser.id } });
  const badges = [
    { badgeType: "BEGINNER", title: "LEET Explorer" },
    { badgeType: "CONSISTENCY", title: "Daily Grind" },
    { badgeType: "STREAK_7", title: "Week on Fire" }
  ];

  for (const badge of badges) {
    await prisma.userBadge.create({
      data: {
        userId: testUser.id,
        badgeType: badge.badgeType,
        title: badge.title
      }
    });
  }
  console.log("Seeded badges successfully!");

  console.log("Performance and analytics seeding complete!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

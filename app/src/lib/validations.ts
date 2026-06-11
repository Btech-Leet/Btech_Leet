import { z } from "zod";

// Helper for optional datetime string
const optionalDatetime = z.string().optional().nullable();

// ─── Auth ────────────────────────────────────────────────────
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
});

// ─── Exam ────────────────────────────────────────────────────
export const examSchema = z.object({
  name: z.string().min(2).max(200),
  fullName: z.string().min(2).max(500),
  slug: z.string().min(2).max(200).optional(),
  type: z.enum(["STATE", "CENTRAL", "PRIVATE"]),
  stateId: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  officialWebsite: z.string().url().optional().nullable(),
  applicationFee: z.string().optional().nullable(),
  eligibility: z.string().optional().nullable(),
  importantDates: z.record(z.string(), z.string()).optional().nullable(),
  syllabus: z.unknown().optional().nullable(),
  examPattern: z.unknown().optional().nullable(),
  contactInfo: z.unknown().optional().nullable(),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
});

// ─── Paper ───────────────────────────────────────────────────
export const paperSchema = z.object({
  title: z.string().min(2).max(500),
  examId: z.string().min(1),
  year: z.number().int().min(2000).max(2030).optional().nullable(),
  type: z.enum(["PREVIOUS_YEAR", "MOCK", "SAMPLE"]),
  subject: z.string().optional().nullable(),
  branch: z.string().optional().nullable(),
  active: z.boolean().default(true),
});

// ─── Notification ─────────────────────────────────────────────
export const notificationSchema = z.object({
  title: z.string().min(2).max(500),
  content: z.string().min(10),
  examId: z.string().optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  published: z.boolean().default(true),
  pinned: z.boolean().default(false),
  expiresAt: optionalDatetime,
});

// ─── Counselling ─────────────────────────────────────────────
export const counsellingSchema = z.object({
  examId: z.string().min(1),
  title: z.string().min(2).max(500),
  description: z.string().optional().nullable(),
  schedule: z.unknown().optional().nullable(),
  rounds: z.unknown().optional().nullable(),
  documents: z.unknown().optional().nullable(),
  helplineNumbers: z.unknown().optional().nullable(),
  officialPortal: z.string().url().optional().nullable(),
  active: z.boolean().default(true),
});

// ─── College ──────────────────────────────────────────────────
export const collegeSchema = z.object({
  name: z.string().min(2).max(500),
  slug: z.string().optional(),
  stateId: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  affiliation: z.string().optional().nullable(),
  website: z.string().url().optional().nullable(),
  logo: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  accreditation: z.string().optional().nullable(),
  ranking: z.number().int().optional().nullable(),
  established: z.number().int().optional().nullable(),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
});

// ─── Branch ───────────────────────────────────────────────────
export const branchSchema = z.object({
  name: z.string().min(2).max(200),
  code: z.string().min(2).max(20),
  description: z.string().optional().nullable(),
});

// ─── Blog ─────────────────────────────────────────────────────
export const blogPostSchema = z.object({
  title: z.string().min(5).max(500),
  slug: z.string().optional(),
  excerpt: z.string().max(500).optional().nullable(),
  content: z.string().min(50),
  coverImage: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  featured: z.boolean().default(false),
  metaTitle: z.string().max(70).optional().nullable(),
  metaDesc: z.string().max(160).optional().nullable(),
  authorName: z.string().optional().nullable(),
  publishedAt: optionalDatetime,
  readTime: z.number().int().optional().nullable(),
});

export const blogCategorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().optional(),
});

// ─── Mock Test ────────────────────────────────────────────────
export const mockTestSchema = z.object({
  title: z.string().min(2).max(500),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),
  examId: z.string().optional().nullable(),
  duration: z.number().int().min(1).max(300),
  totalMarks: z.number().int().min(1),
  passMark: z.number().int().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
});

export const questionSchema = z.object({
  testId: z.string().min(1),
  text: z.string().min(5),
  type: z.enum(["MCQ", "TRUE_FALSE", "SHORT_ANSWER"]).default("MCQ"),
  options: z.array(z.object({ label: z.string(), value: z.string() })).optional().nullable(),
  answer: z.string().min(1),
  explanation: z.string().optional().nullable(),
  marks: z.number().int().min(1).default(1),
  order: z.number().int().default(0),
});

export const testAttemptSchema = z.object({
  testId: z.string().min(1),
  answers: z.record(z.string(), z.unknown()),
  timeTaken: z.number().int().optional(),
});

// ─── Subscription ─────────────────────────────────────────────
export const subscribeSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

// ─── Resource ─────────────────────────────────────────────────
export const resourceSchema = z.object({
  title: z.string().min(2).max(500),
  description: z.string().optional().nullable(),
  branchId: z.string().optional().nullable(),
  subject: z.string().optional().nullable(),
  semester: z.number().int().min(1).max(8).optional().nullable(),
  type: z.string().min(1),
  active: z.boolean().default(true),
});

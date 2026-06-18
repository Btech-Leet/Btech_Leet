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
  title: z.string().min(5, "Title must be at least 5 characters").max(500),
  slug: z.string().optional(),
  excerpt: z.string().max(500).optional().nullable(),
  content: z.string().min(50, "Content must be at least 50 characters"),
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
  price: z.number().min(0).optional().nullable(),
  active: z.boolean().default(true),
});

// ─── User Profile ─────────────────────────────────────────────
export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  mobile: z.string().max(15).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  collegeName: z.string().max(200).optional().nullable(),
  branch: z.string().max(100).optional().nullable(),
  passingYear: z.number().int().min(2000).max(2035).optional().nullable(),
  examTargets: z.array(z.string()).optional(),
});

// ─── FAQ ──────────────────────────────────────────────────────
export const faqSchema = z.object({
  question: z.string().min(5).max(500),
  answer: z.string().min(10),
  pageUrl: z.string().min(1).max(500),
  order: z.number().int().default(0),
  active: z.boolean().default(true),
});

// ─── Topper ───────────────────────────────────────────────────
export const topperSchema = z.object({
  name: z.string().min(2).max(200),
  image: z.string().optional().nullable(),
  rank: z.number().int().optional().nullable(),
  score: z.string().optional().nullable(),
  collegeName: z.string().optional().nullable(),
  branch: z.string().optional().nullable(),
  year: z.number().int().optional().nullable(),
  successStory: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  active: z.boolean().default(true),
  order: z.number().int().default(0),
});

// ─── Expert ───────────────────────────────────────────────────
export const expertSchema = z.object({
  name: z.string().min(2).max(200),
  photo: z.string().optional().nullable(),
  designation: z.string().optional().nullable(),
  qualification: z.string().optional().nullable(),
  experience: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  linkedinUrl: z.string().url().optional().nullable(),
  socialLinks: z.record(z.string(), z.string()).optional().nullable(),
  active: z.boolean().default(true),
  order: z.number().int().default(0),
});

// ─── Author ───────────────────────────────────────────────────
export const authorSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().optional(),
  photo: z.string().optional().nullable(),
  designation: z.string().optional().nullable(),
  biography: z.string().optional().nullable(),
  experience: z.string().optional().nullable(),
  linkedinUrl: z.string().url().optional().nullable(),
  active: z.boolean().default(true),
});

// ─── Book ─────────────────────────────────────────────────────
export const bookSchema = z.object({
  name: z.string().min(2).max(500),
  slug: z.string().optional(),
  coverImage: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  price: z.number().min(0).optional().nullable(),
  category: z.string().optional().nullable(),
  authorId: z.string().optional().nullable(),
  fileUrl: z.string().optional().nullable(),
  fileKey: z.string().optional().nullable(),
  fileSize: z.number().int().optional().nullable(),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
});

// ─── Best Answer Page ─────────────────────────────────────────
export const bestAnswerPageSchema = z.object({
  title: z.string().min(5).max(500),
  slug: z.string().optional(),
  content: z.string().min(50),
  faqSection: z.array(z.object({ question: z.string(), answer: z.string() })).optional().nullable(),
  internalLinks: z.array(z.object({ text: z.string(), url: z.string() })).optional().nullable(),
  metaTitle: z.string().max(70).optional().nullable(),
  metaDesc: z.string().max(160).optional().nullable(),
  keywords: z.array(z.string()).default([]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
});

// ─── CMS Page ─────────────────────────────────────────────────
export const cmsPageSchema = z.object({
  title: z.string().min(2).max(500),
  slug: z.string().optional(),
  content: z.string().min(10),
  featuredImage: z.string().optional().nullable(),
  metaTitle: z.string().max(70).optional().nullable(),
  metaDesc: z.string().max(160).optional().nullable(),
  keywords: z.array(z.string()).default([]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
});

// ─── Review ───────────────────────────────────────────────────
export const reviewSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().optional().nullable(),
  rating: z.number().int().min(1).max(5),
  text: z.string().min(10).max(2000),
  pageUrl: z.string().optional().nullable(),
});

export const reviewAdminSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  name: z.string().min(2).max(100).optional(),
  text: z.string().min(10).max(2000).optional(),
  rating: z.number().int().min(1).max(5).optional(),
});

// ─── Coupon ───────────────────────────────────────────────────
export const couponSchema = z.object({
  code: z.string().min(3).max(50).transform(v => v.toUpperCase()),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().min(0),
  applicableTo: z.array(z.string()).default(["ALL"]),
  startDate: z.string(),
  endDate: z.string(),
  active: z.boolean().default(true),
  usageLimit: z.number().int().optional().nullable(),
});

// ─── Premium Access ───────────────────────────────────────────
export const premiumAccessSchema = z.object({
  userId: z.string().min(1),
  userName: z.string().min(2),
  email: z.string().email(),
  mobile: z.string().optional().nullable(),
  planName: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  status: z.enum(["ACTIVE", "EXPIRED", "REVOKED"]).default("ACTIVE"),
  notes: z.string().optional().nullable(),
});

// ─── Contact Inquiry ──────────────────────────────────────────
export const contactInquirySchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  mobile: z.string().max(15).optional().nullable(),
  subject: z.string().min(5).max(200),
  message: z.string().min(10).max(5000),
});

// ─── Email Template ───────────────────────────────────────────
export const emailTemplateSchema = z.object({
  name: z.string().min(2).max(200),
  subject: z.string().min(2).max(500),
  content: z.string().min(10),
  active: z.boolean().default(true),
});

// ─── Email Campaign ───────────────────────────────────────────
export const emailCampaignSchema = z.object({
  subject: z.string().min(2).max(500),
  content: z.string().min(10),
  templateId: z.string().optional().nullable(),
  recipientType: z.enum(["ALL", "CSV", "MANUAL", "SELECTED"]),
});

// ─── SEO Meta ─────────────────────────────────────────────────
export const seoMetaSchema = z.object({
  pageUrl: z.string().min(1).max(500),
  seoTitle: z.string().max(70).optional().nullable(),
  metaDescription: z.string().max(160).optional().nullable(),
  keywords: z.array(z.string()).default([]),
  canonicalUrl: z.string().url().optional().nullable(),
  ogTitle: z.string().max(70).optional().nullable(),
  ogDescription: z.string().max(160).optional().nullable(),
  ogImage: z.string().optional().nullable(),
  indexable: z.boolean().default(true),
  robotsTags: z.string().optional().nullable(),
  urlSlug: z.string().optional().nullable(),
});

// ─── Lead ─────────────────────────────────────────────────────
export const leadUpdateSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "INTERESTED", "CONVERTED", "NOT_INTERESTED"]).optional(),
  remarks: z.string().optional().nullable(),
});

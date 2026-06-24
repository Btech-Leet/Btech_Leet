<div align="center">
  <img src="https://raw.githubusercontent.com/Btech-Leet/Btech_Leet/main/app/public/favicon.webp" alt="BTech LEET Logo" width="100" />
  <h1>BTech LEET</h1>
  <p><strong>India's Premier Lateral Entry Exam Preparation Platform for Diploma Students</strong></p>

  [![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
  [![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)](https://prisma.io)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Managed-336791?logo=postgresql)](https://www.postgresql.org)
  [![License](https://img.shields.io/badge/License-Proprietary-red)](#copyright)
</div>

---

## About

**BTech LEET** is a comprehensive, production-grade educational platform built specifically for Diploma students across India preparing for Lateral Entry Engineering Tests (LEET). It centralizes everything a student needs — state-wise exam updates, study resources, mock tests, counselling guidance, and college listings — into a single, modern platform.

## Key Features

| Feature | Description |
|---|---|
| **📚 Study Resources** | High-quality syllabus PDFs, handwritten notes, and previous year question papers with branch-specific filtering. |
| **📖 Digital Library** | Premium e-books and study materials with secure download and watermark protection. |
| **📝 Mock Test Engine** | Timed mock tests with instant evaluation to gauge LEET readiness. |
| **🏛️ College Directory** | Detailed info on engineering colleges offering lateral entry, including cutoffs and available branches. |
| **🎓 Counselling Support** | Built-in guidance for HSTES, UPTU, and IPU counselling rounds. |
| **🔔 Live Notifications** | Real-time updates on exam dates, admit cards, and seat allotments. |
| **💳 Payments & Coupons** | Razorpay-integrated payments with coupon code support for discounts. |
| **🔒 Admin Dashboard** | Role-based admin panel to manage resources, exams, users, coupons, and blog posts. |

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router, Server Actions) |
| **Language** | TypeScript |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com), [next-themes](https://github.com/pacocoursey/next-themes) (Dark Mode) |
| **Database** | PostgreSQL via [Prisma ORM v6](https://prisma.io) |
| **Authentication** | Google OAuth + JWT session management |
| **Payments** | [Razorpay](https://razorpay.com) |
| **Storage** | [Supabase Storage](https://supabase.com) for PDF and asset delivery |
| **Icons** | [Lucide React](https://lucide.dev) |
| **Animations** | [Framer Motion](https://www.framer.com/motion) |

## Project Structure

```
Btech_Leet/
├── app/                    # Next.js application root
│   ├── prisma/             # Prisma schema & seed scripts
│   ├── public/             # Static assets (favicon, SVGs)
│   └── src/
│       ├── app/            # Next.js App Router pages & API routes
│       │   ├── (public)/   # Public-facing pages (books, resources, etc.)
│       │   ├── admin/      # Admin dashboard pages
│       │   ├── api/        # API routes (auth, payment, coupons, etc.)
│       │   ├── auth/       # Authentication pages
│       │   └── dashboard/  # User dashboard pages
│       ├── components/     # Reusable React components
│       │   ├── admin/      # Admin-specific components
│       │   ├── books/      # Book/library components
│       │   ├── home/       # Landing page components
│       │   ├── layout/     # Navbar, Footer, etc.
│       │   ├── resources/  # Resource components
│       │   └── ui/         # Shared UI primitives
│       ├── lib/            # Core utilities (auth, prisma, etc.)
│       └── utils/          # Helper functions
└── README.md
```

## Local Development

### Prerequisites

- **Node.js** ≥ 20
- **npm** or **bun**
- **PostgreSQL** database (local or managed)
- Google OAuth credentials
- Supabase project (for storage)
- Razorpay API keys (for payments)

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Btech-Leet/Btech_Leet.git
   cd Btech_Leet/app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   
   Copy the example env file and fill in your credentials:
   ```bash
   cp .env.example .env
   ```
   
   Required variables: PostgreSQL connection string, Google OAuth keys, Supabase credentials, Razorpay API keys, and JWT secret.

4. **Database setup:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the dev server:**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) to view the application.

## Developers

Built by:

- **[Yash Rathore](https://github.com/Yashrathore05)** — Full-Stack Developer & Architect
- **[Nishant](https://github.com/itsnishant089)** — Full-Stack Developer & Core Contributor

## Copyright

Copyright © 2026 BTech LEET. All rights reserved.

This is proprietary software. Unauthorized copying, modification, distribution, or use of this software, via any medium, is strictly prohibited without explicit written permission from the authors.
<div align="center">
  <img src="https://raw.githubusercontent.com/Btech-Leet/Btech_Leet/main/app/public/favicon.webp" alt="BTech LEET Logo" width="120" />
  <h1>BTech LEET</h1>
  <p><strong>The Ultimate Lateral Entry Exam Portal for Diploma Students</strong></p>
  <br />
</div>

## 🚀 About The Project

**BTech LEET** is a comprehensive, highly-scalable educational platform designed specifically to assist Diploma students across India in transitioning to B.Tech degree programs through the Lateral Entry Engineering Test (LEET). 

Created with ❤️ by developers **Yash Rathore** and **Nishant**, this platform solves the scattered information problem by centralizing everything a diploma student needs: state-wise exam updates, previous year papers, mock tests, counselling guidance, and college listings.

## ✨ Key Features

- **📚 Centralized Resources**: Access high-quality syllabus PDFs, handwritten notes, and previous year question papers.
- **📝 Mock Test Engine**: Practice with real-time timed mock tests and evaluate readiness for LEET.
- **🏛️ College & Branch Directory**: Detailed information about top engineering colleges offering lateral entry, cutoffs, and available branches.
- **🎓 Expert Counselling**: Built-in support to help students optimize their choice-filling for HSTES, UPTU, and IPU counselling rounds.
- **🔔 Live Notifications**: Real-time updates on exam dates, admit cards, and seat allotment results.
- **🔒 Enterprise Admin Dashboard**: A fully secure, role-based admin panel to manage resources, exams, users, and blog posts seamlessly.

## 💻 Tech Stack

We built BTech LEET using modern, enterprise-grade technologies for maximum performance, SEO, and scalability:

- **Frontend**: Next.js 15 (App Router), React, Tailwind CSS v4
- **Backend**: Next.js Server Actions & API Routes
- **Database**: PostgreSQL (managed via Prisma ORM v6)
- **Authentication**: Custom OAuth (Google) & JWT-based session management
- **Storage**: Supabase Storage for fast, reliable PDF and Asset delivery
- **Styling**: Next-Themes (Dark Mode), Lucide Icons, Glassmorphism UI

## 👨‍💻 Meet the Developers

This project was conceptualized, architected, and built by:

* **[Yash Rathore](https://github.com/Yashrathore05)** – Full-Stack Developer & Architect
* **Nishant** – Full-Stack Developer & Core Contributor

*Our mission is to democratize education for diploma students and streamline the highly confusing lateral entry admission process.*

## 🛠️ Local Development Setup

If you wish to run the platform locally or contribute:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Btech-Leet/Btech_Leet.git
   cd Btech_Leet/app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the `app/` directory matching the `.env.example` structure. You will need a PostgreSQL connection string, Google OAuth keys, and Supabase credentials.

4. **Run Database Setup:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to view the application.

## 🛡️ Copyright
Copyright © 2026 BTech LEET. All rights reserved. 
*Built to empower the engineering leaders of tomorrow.*

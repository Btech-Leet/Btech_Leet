import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from "@/components/ui/toaster";
import { BaseSchema } from "@/components/seo/schema-markup";
import { LeetLoadingProvider } from "@/components/ui/leet-loading";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://btechleet.com"),
  title: {
    default: "BTech LEET – Lateral Entry Exam Portal for Diploma Students",
    template: "%s | BTech LEET",
  },
  description:
    "India's most comprehensive portal for BTech Lateral Entry Exam (LEET). Get state-wise exam info, previous year papers, mock tests, counselling details, college listings, and real-time notifications.",
  keywords: [
    "BTech lateral entry",
    "LEET exam",
    "lateral entry exam",
    "diploma to BTech",
    "LEET previous year papers",
    "LEET mock test",
    "lateral entry counselling",
    "engineering lateral entry India",
    "LEET exam eligibility",
    "LEET 2026",
  ],
  authors: [{ name: "BTech LEET" }],
  creator: "BTech LEET",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://btechleet.com",
    siteName: "BTech LEET",
    title: "BTech LEET – Lateral Entry Exam Portal for Diploma Students",
    description:
      "India's most comprehensive portal for BTech Lateral Entry Exam (LEET). Get state-wise exam info, previous year papers, mock tests, counselling details, and more.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "BTech LEET Portal" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BTech LEET – Lateral Entry Exam Portal",
    description: "India's most comprehensive portal for BTech Lateral Entry Exam (LEET).",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large" },
  },
  icons: {
    icon: "/favicon.webp",
  },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f1a" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
      </head>
      <body className={`${inter.variable} ${jakarta.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <LeetLoadingProvider>
            <AuthProvider>
              <Toaster>
                {children}
              </Toaster>
            </AuthProvider>
          </LeetLoadingProvider>
        </ThemeProvider>
        <BaseSchema />
      </body>
    </html>
  );
}

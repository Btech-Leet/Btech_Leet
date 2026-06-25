import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from "@/components/ui/toaster";
import { BaseSchema } from "@/components/seo/schema-markup";
import { LeetLoadingProvider } from "@/components/ui/leet-loading";
import { FontLoader } from "@/components/ui/font-loader";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
    "BTech lateral entry", "LEET exam", "lateral entry exam", "diploma to BTech", "LEET previous year papers", "LEET mock test", "lateral entry counselling", "engineering lateral entry India", "LEET exam eligibility", "LEET 2026",
    // Counselling
    "LEET counselling process 2026", "LEET choice filling guide", "LEET seat allotment", "HSTES counselling schedule", "UPTU LEET counselling", "IPU LEET counselling", "Punjab LEET counselling", "Haryana LEET counselling", "Uttarakhand LEET counselling", "MP LEET counselling", "Rajasthan LEET counselling", "LEET counselling documents required", "LEET counselling fee structure", "LEET online counselling portal", "how to fill LEET choices", "LEET college preference list", "LEET spot round counselling", "LEET mop-up round", "LEET second counselling", "LEET counselling cut-off", "LEET seat matrix", "LEET counselling helpline", "LEET document verification", "LEET reporting to college", "LEET physical counselling", "LEET counselling result", "LEET allotment letter", "LEET fee deposit after counselling", "LEET branch upgrade", "LEET college change process", "LEET counselling FAQ", "LEET counselling step by step", "LEET 2026 counselling date", "LEET rank wise college", "LEET college predictor", "best colleges through LEET", "LEET government college admission", "LEET private college admission", "lateral entry counselling India", "diploma counselling process",
    // Exam & Eligibility
    "LEET exam 2026", "LEET eligibility criteria", "LEET exam pattern", "LEET syllabus 2026", "LEET application form", "LEET exam date 2026", "LEET admit card", "LEET result date", "LEET cut-off marks", "LEET previous year papers", "LEET mock test", "LEET preparation tips", "LEET exam difficulty level", "LEET marking scheme", "lateral entry exam India", "diploma to BTech exam", "LEET online registration", "LEET exam fee", "LEET exam centres", "LEET negative marking", "best books for LEET", "LEET preparation strategy", "LEET rank predictor", "LEET score calculator", "LEET toppers list", "how to prepare for LEET", "LEET exam notification", "LEET important dates", "LEET last date to apply", "LEET exam centres near me", "can ITI students give LEET", "LEET age limit", "LEET attempt limit", "LEET exam language", "LEET online vs offline exam",
    // State-wise
    "Haryana LEET 2026", "Punjab LEET 2026", "UP LEET 2026", "Delhi LEET 2026", "MP LEET 2026", "Rajasthan LEET 2026", "Uttarakhand LEET 2026", "Bihar LEET 2026", "Gujarat LEET 2026", "Maharashtra LEET 2026", "HP LEET 2026", "Chandigarh LEET 2026", "HSTES LEET", "PTU LEET", "IPU CET lateral entry", "AKTU lateral entry", "UPSEE LEET", "Haryana LEET colleges", "Punjab LEET colleges", "Delhi LEET colleges", "UP LEET colleges", "best LEET colleges in India", "top 10 LEET colleges", "LEET colleges in Haryana", "LEET colleges in Punjab", "LEET colleges in Delhi NCR", "LEET colleges in Chandigarh", "government LEET colleges", "private LEET colleges", "LEET colleges with hostel", "LEET colleges with placement", "LEET colleges fees", "affordable LEET colleges", "LEET colleges accepting low rank",
    // College & Admission
    "BTech lateral entry admission 2026", "lateral entry engineering colleges", "diploma to BTech admission", "direct second year BTech", "BTech 2nd year admission", "lateral entry seat availability", "LEET college ranking", "LEET college comparison", "LEET college reviews", "LEET placement statistics", "LEET branch wise seats", "CSE lateral entry", "mechanical lateral entry", "electrical lateral entry", "civil lateral entry", "ECE lateral entry", "LEET intake capacity", "LEET college cutoff", "LEET government vs private college", "LEET scholarship", "LEET fee concession", "LEET hostel facility", "LEET college infrastructure", "LEET campus placement", "LEET college affiliation", "LEET AICTE approved colleges", "LEET NAAC accredited colleges", "LEET college admission process", "LEET lateral entry vs regular", "lateral entry advantages", "lateral entry syllabus difference",
    // General
    "what is LEET exam", "what is lateral entry in BTech", "can diploma students get BTech admission", "diploma to degree engineering", "lateral entry meaning in engineering", "LEET full form", "how to get admission in BTech after diploma", "BTech after diploma process", "difference between LEET and JEE", "is LEET exam tough", "LEET exam success rate", "LEET career prospects", "salary after BTech lateral entry", "lateral entry vs regular BTech difference", "BTech lateral entry scope", "can polytechnic students do BTech", "diploma holder BTech admission", "what after diploma in engineering", "best option after diploma", "engineering admission after diploma 2026", "LEET study material free download", "LEET question bank", "LEET solved papers", "LEET answer key 2026", "LEET rank card download", "how to check LEET result", "LEET counselling registration", "LEET online classes", "LEET coaching", "LEET crash course", "LEET free resources", "BTechLEET.com", "btechleet", "btech leet portal", "lateral entry exam portal India", "LEET news and updates", "LEET notification 2026", "LEET latest updates",
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
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {/* Preconnect hints for critical 3rd-party origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Non-render-blocking Material Symbols load via Client Component */}
        <FontLoader />
        <noscript>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
        </noscript>
        
        {/* Google Analytics 4 */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-32VZ3RYP7L" />
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-32VZ3RYP7L');
        `}} />
        
        {/* Microsoft Clarity */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "xc550g6aok");
        `}} />
        <BaseSchema />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-500/30 selection:text-blue-900 dark:selection:text-blue-100 transition-colors duration-300 overflow-x-hidden`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <LeetLoadingProvider>
            <AuthProvider>
              <Toaster>
                {children}
              </Toaster>
            </AuthProvider>
          </LeetLoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

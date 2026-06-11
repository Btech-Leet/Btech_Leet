import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <header className="py-5 px-6">
        <Link href="/" className="flex items-center gap-2.5 w-fit" aria-label="BTech LEET Home">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <BookOpen className="text-white" size={18} />
          </div>
          <span className="font-bold text-lg text-gray-900 dark:text-white">
            BTech <span className="text-blue-600">LEET</span>
          </span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        {children}
      </main>
      <footer className="py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} BTech LEET. All rights reserved.
      </footer>
    </div>
  );
}

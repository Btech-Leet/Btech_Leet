import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) redirect("/auth/login");

  const { verifyToken } = await import("@/lib/auth");
  const payload = verifyToken(token);
  if (!payload) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      name: true,
      email: true,
      avatar: true,
      premiumStatus: true,
      profileComplete: true,
    },
  });

  if (!user) redirect("/auth/login");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      <div>
        <Navbar />
        <div className="flex flex-col md:flex-row max-w-[1440px] mx-auto w-full">
          <DashboardNav user={user} />
          
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950">
            {children}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}

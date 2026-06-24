import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PromoBanner } from "@/components/ui/promo-banner";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PromoBanner />
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}

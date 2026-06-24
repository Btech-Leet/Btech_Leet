import type { Metadata } from "next";
import CounsellingPage from "./client-page";
import { SchemaMarkup } from "@/components/seo/schema-markup";

export const metadata: Metadata = {
  title: "Haryana & IPU LEET Counselling 2026 | Choice Filling & Admission Guidance",
  description:
    "Get expert counselling assistance for BTech Lateral Entry admissions. Personalized choice filling, document verification, and 24/7 support for HSTES, UPTU, IPU, and more. Rank #1 with BTech LEET.",
  keywords: [
    "Haryana LEET Counselling",
    "IPU LEET Choice filling",
    "BTech lateral entry admission",
    "LEET document verification",
    "Haryana LEET seat allotment",
    "IPU LEET counselling schedule",
    "HSTES lateral entry admission",
    "LEET rank wise college predictor",
    "best LEET counselling service"
  ],
  alternates: {
    canonical: "/counselling",
  },
  openGraph: {
    title: "Expert LEET Counselling 2026 | Admissions Made Easy",
    description: "Maximize your chances of securing a top engineering college through lateral entry with our premium counselling service.",
    url: "/counselling",
    type: "website",
  },
};

export default function CounsellingPageWrapper() {
  const serviceSchemaData = {
    name: "Premium LEET Counselling Service",
    provider: {
      "@type": "Organization",
      name: "BTech LEET",
    },
    areaServed: {
      "@type": "Country",
      name: "India"
    },
    description: "Expert guidance, personalized choice filling, and 24/7 priority support for BTech Lateral Entry admissions (HSTES, IPU, UPTU).",
    offers: {
      "@type": "Offer",
      price: "99",
      priceCurrency: "INR",
      url: "https://btechleet.com/counselling"
    }
  };

  return (
    <>
      <SchemaMarkup schemaType="Service" data={serviceSchemaData} />
      <CounsellingPage />
    </>
  );
}

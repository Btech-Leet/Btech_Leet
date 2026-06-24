import { Metadata } from "next";
import { mergeSeoMetadata } from "@/lib/seo";
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";
import { Search } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const fallback: Metadata = {
    title: "LEET Rank Predictor 2026 – College Predictor",
    description: "Predict your LEET rank and find out which BTech colleges you can get into based on your expected score and past year cutoff trends.",
  };
  return mergeSeoMetadata("/leet-rank-predictor", fallback);
}

export default function LeetRankPredictorPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <BreadcrumbSchema items={[{ name: "Home", item: "/" }, { name: "LEET Rank Predictor", item: "/leet-rank-predictor" }]} />
      
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold sm:text-4xl text-gray-900 dark:text-white">LEET Rank & College Predictor 2026</h1>
        <p className="mt-4 text-lg text-gray-500">Find the best colleges matching your expected LEET rank</p>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 sm:p-12 text-center shadow-sm space-y-6 max-w-xl mx-auto">
        <Search className="mx-auto text-blue-500" size={56} />
        <h3 className="font-extrabold text-gray-900 dark:text-white text-2xl">Coming Soon!</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          We are updating our rank predictor algorithms with the latest 2025 cutoff data to provide you with the most accurate college predictions for 2026. Stay tuned!
        </p>
      </div>

      <div className="prose prose-blue dark:prose-invert max-w-none mt-16">
        <h2>How Does the LEET Rank Predictor Work?</h2>
        <p>Our predictor analyzes historical seat allotment data, opening and closing ranks of various colleges, and category-wise seat reservations to predict your chances of admission into your desired branch and college.</p>
        
        <h2>Factors Affecting LEET Cutoff</h2>
        <ul>
          <li><strong>Difficulty Level:</strong> If the exam is tough, the cutoff marks tend to be lower.</li>
          <li><strong>Number of Applicants:</strong> Higher competition usually drives up the closing ranks.</li>
          <li><strong>Seat Availability:</strong> The total number of lateral entry seats in a specific branch.</li>
          <li><strong>Category Reservations:</strong> General, SC/ST, OBC, and state-specific quotas significantly impact closing ranks.</li>
        </ul>
      </div>
    </div>
  );
}

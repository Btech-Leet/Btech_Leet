import Link from "next/link";

export function CounsellingSection() {
  return (
    <section className="py-xxl bg-slate-50 dark:bg-slate-900 px-margin-mobile md:px-margin-desktop border-b border-slate-200 dark:border-slate-800 transition-colors duration-300" aria-labelledby="counselling-heading">
      <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-2 gap-xl items-center">
        <div className="flex flex-col gap-sm">
          <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-500/30 text-orange-700 dark:text-orange-400 px-3 py-1 rounded-full w-max mb-2 transition-colors duration-300">
            <span className="material-symbols-outlined text-[16px]">support_agent</span>
            <span className="text-caption font-caption uppercase tracking-wider font-semibold">Expert Guidance</span>
          </div>
          <h2 id="counselling-heading" className="text-headline-lg-mobile md:text-headline-lg font-headline-lg-mobile md:font-headline-lg text-slate-900 dark:text-white mb-sm transition-colors duration-300">
            Navigate Admissions with Confidence
          </h2>
          <p className="text-body-lg font-body-lg text-slate-650 dark:text-slate-400 mb-md transition-colors duration-300">
            The seat allocation process can be overwhelming. Our seasoned counsellors provide personalized strategies to maximize your chances of securing admission in top-tier institutions based on your rank.
          </p>
          <ul className="flex flex-col gap-3 mb-lg text-slate-700 dark:text-slate-300 transition-colors duration-300">
            {[
              "Personalized college preference lists",
              "Document verification assistance",
              "Spot round and sliding phase strategies",
            ].map((text, idx) => (
              <li key={idx} className="flex items-center gap-3">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400">
                  check_circle
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/counselling"
            className="bg-orange-700 text-white px-8 py-4 rounded-full text-label-md font-label-md shadow-lg hover:bg-orange-600 transition-colors duration-200 w-max inline-flex items-center gap-2"
          >
            Get Expert Guidance
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-orange-500/10 blur-3xl rounded-full" aria-hidden="true" />
          <img
            alt="Students getting counselling"
            className="relative z-10 w-full h-auto rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl object-cover aspect-video"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1aOJF_D_AUWclk6la2FKyzR8GHk6hB39qwpEpxd--ZkPEmjlKkzAWaNu0fyTxhttcBnZXY57idoRzaODPzwaSBEq7RTPAkm1mHZnlaZ8k3ZIOsyREubcIkVvrF3GbxN7x1ej38-1esTyHP2wogspx55_HB05H3ODInJBMORljzXc_pNtvzzRrbDL5GcUEAblhDNoLGroYMaoQDITKl2nfMc0v23tBF8ykIGtmClQNPMufRAPtrug-kYt3Ua5K35hM5lCpCgA5iHUB"
          />
        </div>
      </div>
    </section>
  );
}

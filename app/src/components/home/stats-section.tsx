export function StatsSection() {
  const stats = [
    { value: "25+", label: "State LEET Exams", desc: "Across India" },
    { value: "5000+", label: "Question Papers", desc: "Previous year & mock" },
    { value: "500+", label: "Colleges Listed", desc: "With cutoffs & intake" },
    { value: "50K+", label: "Students Helped", desc: "And growing daily" },
  ];

  return (
    <section className="py-16 bg-white dark:bg-gray-950" aria-labelledby="stats-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 id="stats-heading" className="sr-only">Platform statistics</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center p-6 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
              <div className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1">{stat.value}</div>
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{stat.label}</div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{stat.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

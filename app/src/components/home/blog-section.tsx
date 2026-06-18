import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

async function getBlogPosts() {
  try {
    return await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      include: { category: { select: { name: true, slug: true } } },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
      take: 3,
    });
  } catch (err) {
    console.error("Failed to load blog posts for homepage:", err);
    return [];
  }
}

export async function BlogSection() {
  const posts = await getBlogPosts();

  if (posts.length === 0) return null;

  const cardGradients = [
    "from-orange-500/30 via-orange-600/20 to-transparent",
    "from-blue-500/30 via-blue-600/20 to-transparent",
    "from-teal-500/30 via-teal-600/20 to-transparent",
  ];

  const hoverColors = [
    "group-hover:text-orange-600 dark:group-hover:text-orange-400",
    "group-hover:text-blue-600 dark:group-hover:text-blue-400",
    "group-hover:text-teal-600 dark:group-hover:text-teal-400",
  ];

  const defaultImages = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCFm9pEUuwi5QIh11Sc6efT21rx_WdBmaZpnOOBf3af0poxAf3iMf5rbAAJ8bjNCb6A71cuj9-MlK_Zp8NP6su8pA8D4W4EgTuOu31fWRP55KYMCvyn5k-kBtlW1Vf-An9cKL7byEqG9c93gj_b0uvxOt85XSWQNgjNXttdGULzstzbc5gn_bfRomcBNjvhnCrFLj1hka440W_yC-nfG8DdBp65wQWMPdRgrER1rJ3G5V2SvjUfeke6xPKLKKw3xMErOAzCcuGvevOt",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCxYPjn7rCZy7NzMYPX1p7dVEd1VYsQcZXrLEdAPT7lj9h-zMvh7NTwdlV47Tcz7wA_9jeLi0r_xDqov0iJ0rZkEsaquUpSQDLH3wu8JAgGomG6GBy4AOHalKOpkAcobHUCqVqIFgt9Z3Xb_EgSX-mDVFfmAEluyO2ycOQI8nF83ixzC6JoZiglwAR6DBz8bjbTN3UBr3c3qfO3UCTvqZcyLxQN_jeSYDgNuTYAV-IgO-0jiOwMMNUEpJvH4VR7Elh6Q7SQvx_drboz",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCi4JsMrwOsP2xIFfoXJ3-wiULADksvaMt5RzZvYxc12FLdh4QtW5rtVqbIKsfLA4-GYunD6MlqZpU65CDxht9o10xWIP1ZLwfwiF4K73d4lBuKNa8l7_4ly-8axwRDkpIy42y2JjdRbx3cy_YTh7mrl7T6CzVjFYFxSfU7UPdO_2OF92Vf1TQK3mK7Z3WvHja-0a4b0r51Jxbcfp82mGxMyOTnl7uzCAs2PQDaR6rbyJzZeDOan2aToGvINC0uiS5v4eWovnGNkNrI"
  ];

  return (
    <section className="py-xxl bg-slate-50 dark:bg-slate-900 px-margin-mobile md:px-margin-desktop border-b border-slate-200 dark:border-slate-800 transition-colors duration-300" aria-labelledby="blog-heading">
      <div className="max-w-container-max mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-xl gap-4">
          <div>
            <h2 id="blog-heading" className="text-headline-lg-mobile md:text-headline-lg font-headline-lg-mobile md:font-headline-lg text-slate-900 dark:text-white mb-xs transition-colors duration-300">
              Latest Insights
            </h2>
            <p className="text-body-md font-body-md text-slate-650 dark:text-slate-400 transition-colors duration-300">
              Strategies, updates, and advice from academic experts.
            </p>
          </div>
          <Link
            href="/blog"
            className="text-label-md font-label-md text-orange-600 dark:text-orange-500 hover:text-orange-700 dark:hover:text-orange-400 inline-flex items-center gap-1"
            aria-label="View all blog posts"
          >
            View All Articles{" "}
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          {posts.map((post: any, idx: number) => {
            const gradient = cardGradients[idx % cardGradients.length];
            const hoverColor = hoverColors[idx % hoverColors.length];
            const coverImage = post.coverImage || defaultImages[idx % defaultImages.length];

            return (
              <div key={post.id} className="relative group h-full">
                <div className={`absolute -inset-1 bg-gradient-to-br ${gradient} rounded-3xl blur-xl opacity-40 group-hover:opacity-100 transition duration-500`} />
                <div className="relative bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden flex flex-col h-full transform group-hover:-translate-y-1 transition-all duration-500">
                  
                  {/* Aspect Cover Image */}
                  <div className="relative overflow-hidden aspect-[16/10] bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-white/5 transition-colors duration-300">
                    <img
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      src={coverImage}
                    />
                    {post.category && (
                      <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/20 text-[10px] uppercase font-bold px-3 py-1 rounded-full transition-colors duration-300">
                        {post.category.name}
                      </div>
                    )}
                  </div>

                  {/* Blog Card Body */}
                  <div className="p-lg flex flex-col flex-1">
                    <h3 className={`text-headline-md font-headline-md text-slate-900 dark:text-white mb-xs ${hoverColor} transition-colors line-clamp-2`}>
                      {post.title}
                    </h3>
                    <p className="text-body-md font-body-md text-slate-650 dark:text-slate-400 line-clamp-2 mb-sm flex-1 transition-colors duration-300">
                      {post.excerpt || "Read full article details on BTech Lateral Entry preparation."}
                    </p>
                    <Link
                      href={`/blog/${post.slug}`}
                      className={`text-label-md font-label-md text-slate-600 dark:text-slate-300 ${hoverColor} inline-flex items-center gap-1 mt-auto`}
                      aria-label={`Read ${post.title}`}
                    >
                      Read Article{" "}
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

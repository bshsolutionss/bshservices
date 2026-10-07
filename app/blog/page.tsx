import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { safeJsonLd } from "@/lib/json-ld";
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/site";
import {
  getFeaturedImage,
  getFeaturedImageAlt,
  getPostCategories,
  getPostDescription,
  getPostsPage,
  wpToPlainText,
} from "@/lib/wp";

type BlogPageProps = {
  searchParams: Promise<{ page?: string | string[] }>;
};

const POSTS_PER_PAGE = 9;
const BLOG_DESCRIPTION =
  "Practical guides from BSH Solutions on web development, digital marketing, design, AI automation, and business technology.";

export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
  const page = parsePageNumber((await searchParams).page);
  const path = page === 1 ? "/blog" : `/blog?page=${page}`;
  const pageLabel = page === 1 ? "Business Technology Blog" : `Business Technology Blog - Page ${page}`;

  return {
    title: pageLabel,
    description: BLOG_DESCRIPTION,
    alternates: { canonical: path },
    openGraph: {
      title: `${pageLabel} | BSH Solutions`,
      description: BLOG_DESCRIPTION,
      url: path,
      siteName: "BSH Solutions",
      type: "website",
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: `${pageLabel} | BSH Solutions`,
      description: BLOG_DESCRIPTION,
      images: [DEFAULT_OG_IMAGE.url],
    },
  };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const page = parsePageNumber((await searchParams).page);
  const { posts, totalPages } = await getPostsPage(page, POSTS_PER_PAGE);

  if (page > 1 && posts.length === 0) notFound();

  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Our <span className="text-primary text-blue-600">Blog</span>
          </h1>
          <p className="text-lg text-muted-foreground text-gray-600">
            Insights, updates, and practical guides for technology and business growth.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No posts found. Please check back later.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => {
              const featuredImg = getFeaturedImage(post);
              const postTitle = wpToPlainText(post.title?.rendered) || "Blog post";
              const featuredImgAlt =
                getFeaturedImageAlt(post) || postTitle || "Blog post cover image";
              const categories = getPostCategories(post);
              const date = new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });

              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col bg-card/50 rounded-2xl border border-border/50 overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
                >
                  <div className="relative h-48 sm:h-56 md:h-64 w-full overflow-hidden bg-muted">
                    {featuredImg ? (
                      <Image
                        src={featuredImg}
                        alt={featuredImgAlt}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-secondary/50 text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col flex-grow p-6">
                    {categories.length > 0 && (
                      <div className="text-xs font-semibold uppercase text-[#1A14A5] mb-2">
                        {categories.join(" / ")}
                      </div>
                    )}
                    <time dateTime={post.date} className="text-sm text-primary mb-3 font-medium">
                      {date}
                    </time>
                    <h2 className="text-xl font-bold mb-3 text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {postTitle}
                    </h2>
                    <p className="text-muted-foreground line-clamp-3 text-sm flex-grow mb-4 text-gray-600">
                      {getPostDescription(post)}
                    </p>
                    <div className="mt-auto flex items-center text-primary font-medium text-sm group-hover:underline">
                      Read article <span className="ml-2 group-hover:translate-x-1 transition-transform">-&gt;</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <nav aria-label="Blog pagination" className="mt-14 flex items-center justify-center gap-2">
            {page > 1 && (
              <Link
                rel="prev"
                href={page === 2 ? "/blog" : `/blog?page=${page - 1}`}
                className="rounded-lg border border-[#1A14A5]/20 bg-white px-4 py-2 text-sm font-semibold text-[#1A14A5] hover:border-[#1A14A5]"
              >
                Previous
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <Link
                key={pageNumber}
                href={pageNumber === 1 ? "/blog" : `/blog?page=${pageNumber}`}
                aria-current={pageNumber === page ? "page" : undefined}
                className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-semibold ${
                  pageNumber === page
                    ? "border-[#1A14A5] bg-[#1A14A5] text-white"
                    : "border-[#1A14A5]/20 bg-white text-[#1A14A5] hover:border-[#1A14A5]"
                }`}
              >
                {pageNumber}
              </Link>
            ))}
            {page < totalPages && (
              <Link
                rel="next"
                href={`/blog?page=${page + 1}`}
                className="rounded-lg border border-[#1A14A5]/20 bg-white px-4 py-2 text-sm font-semibold text-[#1A14A5] hover:border-[#1A14A5]"
              >
                Next
              </Link>
            )}
          </nav>
        )}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: page === 1 ? "BSH Solutions Blog" : `BSH Solutions Blog - Page ${page}`,
            description: BLOG_DESCRIPTION,
            url: `${SITE_URL}${page === 1 ? "/blog" : `/blog?page=${page}`}`,
            mainEntity: {
              "@type": "ItemList",
              itemListElement: posts.map((post, index) => ({
                "@type": "ListItem",
                position: (page - 1) * POSTS_PER_PAGE + index + 1,
                url: `${SITE_URL}/blog/${post.slug}`,
                name: wpToPlainText(post.title?.rendered),
              })),
            },
          }),
        }}
      />
    </div>
  );
}

function parsePageNumber(value: string | string[] | undefined): number {
  const parsed = Number(Array.isArray(value) ? value[0] : value ?? "1");
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

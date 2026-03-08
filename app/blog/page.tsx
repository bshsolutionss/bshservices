import Link from "next/link";
import Image from "next/image";
import { getPosts, getFeaturedImage } from "@/lib/wp";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | BSH Solutions",
  description:
    "Read the latest insights, news, and articles from BSH Solutions.",
  alternates: {
    canonical: "https://bshsolutionss.com/blog",
  },
  openGraph: {
    title: "Blog | BSH Solutions",
    description:
      "Read the latest insights, news, and articles from BSH Solutions.",
    url: "https://bshsolutionss.com/blog",
    siteName: "BSH Solutions",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | BSH Solutions",
    description:
      "Read the latest insights, news, and articles from BSH Solutions.",
  },
};

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Our <span className="text-primary text-blue-600">Blog</span>
          </h1>
          <p className="text-lg text-muted-foreground text-gray-400">
            Insights, updates, and deep dives into technology and business
            solutions.
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
                  <div className="relative h-64 w-full overflow-hidden bg-muted">
                    {featuredImg ? (
                      <Image
                        src={featuredImg}
                        alt={post.title.rendered}
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
                    <div className="text-sm text-primary mb-3 font-medium">
                      {date}
                    </div>
                    <h2
                      className="text-xl font-bold mb-3 text-foreground line-clamp-2 group-hover:text-primary transition-colors"
                      dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                    />
                    <div
                      className="text-muted-foreground line-clamp-3 text-sm flex-grow mb-4 text-gray-400"
                      dangerouslySetInnerHTML={{
                        __html: post.excerpt.rendered,
                      }}
                    />
                    <div className="mt-auto flex items-center text-primary font-medium text-sm group-hover:underline">
                      Read article{" "}
                      <span className="ml-2 group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

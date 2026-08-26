import Link from "next/link";
import { Newspaper, ArrowRight } from "lucide-react";
import type { BlogLink } from "@/lib/blog-links";

interface RelatedBlogPostsProps {
  posts: BlogLink[];
}

/** Links from a service page to the specific blog posts actually about that service — real topical internal linking, not a generic "read our blog" nudge. */
export default function RelatedBlogPosts({ posts }: RelatedBlogPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="py-16 px-6 lg:px-12 bg-[#F4F7FE]">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <Newspaper className="h-4 w-4 text-[#1A14A5]" aria-hidden="true" />
          <h2 className="text-xl font-bold text-[#231F20]">From Our Blog</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex items-center justify-between gap-3 rounded-xl bg-white border border-[#1A14A5]/10 p-5 hover:border-[#1A14A5]/30 hover:shadow-md transition-all"
            >
              <span className="font-medium text-[#231F20] group-hover:text-[#1A14A5] transition-colors">
                {post.title}
              </span>
              <ArrowRight
                className="h-4 w-4 text-[#1A14A5] shrink-0 group-hover:translate-x-1 transition-transform"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

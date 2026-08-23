import { getPostBySlug, getFeaturedImage, wpToPlainText } from "@/lib/wp";
import { sanitizeWpHtml } from "@/lib/sanitize-html";
import { safeJsonLd } from "@/lib/json-ld";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug);

  if (!post) {
    return {
      title: "Post Not Found | BSH Solutions",
    };
  }

  // Plain text (tags stripped, entities decoded) — anywhere this is used as
  // a raw string (title tag, meta description, JSON-LD) rather than
  // rendered as HTML, so WP's "[&hellip;]" etc. never leaks into a search
  // snippet. See lib/wp.ts's wpToPlainText for why this matters.
  const description = post.excerpt?.rendered
    ? wpToPlainText(post.excerpt.rendered)
    : "Read this article on BSH Solutions";
  const title = post.title?.rendered
    ? `${wpToPlainText(post.title.rendered)} | BSH Solutions`
    : "Blog | BSH Solutions";
  const url = `https://bshsolutionss.com/blog/${post.slug || resolvedParams.slug}`;
  const featuredImg = getFeaturedImage(post);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      siteName: "BSH Solutions",
      publishedTime: post.date,
      ...(featuredImg && {
        images: [
          {
            url: featuredImg,
            alt: title,
          },
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(featuredImg && {
        images: [featuredImg],
      }),
    },
  };
}

export default async function Post({ params }: Props) {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  const featuredImg = getFeaturedImage(post);
  const date = post.date
    ? new Date(post.date).toLocaleDateString("en-US", {
      dateStyle: "long",
    })
    : "";

  const cleanTitle = wpToPlainText(post.title?.rendered) || "Blog Post";
  const cleanExcerpt = wpToPlainText(post.excerpt?.rendered);

  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      <div className="container mx-auto px-4 flex flex-col items-center">
        <div className="w-full max-w-3xl mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-primary hover:text-primary/80 transition-colors mb-8 font-medium"
          >
            <span className="mr-2">←</span> Back to Blog
          </Link>

          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-foreground leading-tight break-words"
            dangerouslySetInnerHTML={{ __html: sanitizeWpHtml(post.title?.rendered || "") }}
          />

          <div className="flex items-center text-muted-foreground mb-10 text-gray-400">
            {post.date && <time dateTime={post.date}>{date}</time>}
            <span className="mx-3">•</span>
            {/* Adding 5 min read as placeholder placeholder if no specific reading time is provided by WP */}
            <span>By Author</span>
          </div>
        </div>

        {featuredImg && (
          <div className="w-full max-w-3xl mb-12 relative h-[200px] sm:h-[300px] md:h-[380px] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl">
            <Image
              src={featuredImg}
              alt={cleanTitle}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}

        <article className="w-full max-w-3xl prose prose-lg dark:prose-invert prose-blue mx-auto prose-img:rounded-xl prose-a:text-primary hover:prose-a:text-primary/80">
          <div dangerouslySetInnerHTML={{ __html: sanitizeWpHtml(post.content?.rendered || "") }} />
        </article>
      </div>

      {/* JSON-LD Structured Data for Blog Post */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: cleanTitle,
            description: cleanExcerpt,
            image: featuredImg ? [featuredImg] : [],
            datePublished: post.date,
            dateModified: post.date,
            author: [
              {
                "@type": "Organization",
                name: "BSH Solutions",
                url: "https://bshsolutionss.com",
              },
            ],
            publisher: {
              "@type": "Organization",
              name: "BSH Solutions",
              logo: {
                "@type": "ImageObject",
                url: "https://bshsolutionss.com/android-chrome-512x512.png",
              },
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://bshsolutionss.com/blog/${post.slug || resolvedParams.slug}`,
            },
          }),
        }}
      />
    </div>
  );
}

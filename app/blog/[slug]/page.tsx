import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { safeJsonLd } from "@/lib/json-ld";
import { sanitizeWpHtml } from "@/lib/sanitize-html";
import { SITE_URL } from "@/lib/site";
import {
  getFeaturedImage,
  getFeaturedImageAlt,
  getPostAuthorName,
  getPostBySlug,
  getPostCategories,
  getPostDescription,
  getPostSeoTitle,
  wpToPlainText,
} from "@/lib/wp";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
      robots: { index: false, follow: false },
    };
  }

  const postTitle = wpToPlainText(post.title?.rendered) || "Blog Post";
  const seoTitle = getPostSeoTitle(post);
  const description = getPostDescription(post);
  const path = `/blog/${post.slug || slug}`;
  const featuredImage = post.yoast_head_json?.og_image?.[0]?.url || getFeaturedImage(post);
  const authorName = getPostAuthorName(post);
  const categories = getPostCategories(post);

  return {
    title: { absolute: seoTitle },
    description,
    authors: [{ name: authorName }],
    alternates: { canonical: path },
    openGraph: {
      title: wpToPlainText(post.yoast_head_json?.og_title) || seoTitle,
      description: wpToPlainText(post.yoast_head_json?.og_description) || description,
      url: path,
      type: "article",
      siteName: "BSH Solutions",
      publishedTime: post.date,
      modifiedTime: post.modified || post.date,
      authors: [authorName],
      section: categories[0],
      ...(featuredImage && {
        images: [{ url: featuredImage, alt: getFeaturedImageAlt(post) || postTitle }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: wpToPlainText(post.yoast_head_json?.twitter_title) || seoTitle,
      description: wpToPlainText(post.yoast_head_json?.twitter_description) || description,
      ...(featuredImage && { images: [post.yoast_head_json?.twitter_image || featuredImage] }),
    },
  };
}

export default async function Post({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const featuredImage = getFeaturedImage(post);
  const cleanTitle = wpToPlainText(post.title?.rendered) || "Blog Post";
  const description = getPostDescription(post);
  const authorName = getPostAuthorName(post);
  const categories = getPostCategories(post);
  const publishedDate = formatDate(post.date);
  const modifiedDate = formatDate(post.modified || post.date);
  const wasUpdated = Boolean(post.modified && post.modified !== post.date);
  const articleUrl = `${SITE_URL}/blog/${post.slug || slug}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${articleUrl}#article`,
    headline: cleanTitle,
    description,
    image: featuredImage ? [featuredImage] : undefined,
    datePublished: post.date,
    dateModified: post.modified || post.date,
    inLanguage: "en",
    articleSection: categories,
    author: {
      "@type": authorName === "BSH Solutions Editorial Team" ? "Organization" : "Person",
      name: authorName,
      ...(authorName === "BSH Solutions Editorial Team" ? { url: SITE_URL } : {}),
    },
    publisher: { "@id": `${SITE_URL}/#organization` },
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: cleanTitle, item: articleUrl },
    ],
  };

  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      <div className="container mx-auto px-4 flex flex-col items-center">
        <header className="w-full max-w-3xl mb-8">
          <nav aria-label="Breadcrumb" className="mb-8 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#1A14A5]">Home</Link>
            <span aria-hidden="true" className="mx-2">/</span>
            <Link href="/blog" className="hover:text-[#1A14A5]">Blog</Link>
          </nav>

          {categories.length > 0 && (
            <p className="mb-3 text-sm font-semibold uppercase text-[#1A14A5]">
              {categories.join(" / ")}
            </p>
          )}

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-foreground leading-tight break-words">
            {cleanTitle}
          </h1>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600 mb-10">
            <span>By {authorName}</span>
            <span aria-hidden="true">|</span>
            <time dateTime={post.date}>Published {publishedDate}</time>
            {wasUpdated && (
              <>
                <span aria-hidden="true">|</span>
                <time dateTime={post.modified}>Updated {modifiedDate}</time>
              </>
            )}
          </div>
        </header>

        {featuredImage && (
          <div className="w-full max-w-3xl mb-12 relative h-[200px] sm:h-[300px] md:h-[380px] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl">
            <Image
              src={featuredImage}
              alt={getFeaturedImageAlt(post) || cleanTitle}
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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />
    </div>
  );
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

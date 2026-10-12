import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { safeJsonLd } from "@/lib/json-ld";
import { buildPublicPostSchema } from "@/lib/rankmath";
import { sanitizeWpHtml } from "@/lib/sanitize-html";
import { SITE_URL } from "@/lib/site";
import {
  DEFAULT_AUTHOR_NAME,
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
  const seo = post.seo;
  const seoTitle = getPostSeoTitle(post);
  const description = getPostDescription(post);
  // Always the public domain — never the WordPress origin Rank Math reports.
  const canonical = `${SITE_URL}/blog/${post.slug || slug}`;
  const ogImage = seo?.ogImage;
  const featuredImage = ogImage?.url || getFeaturedImage(post);
  const imageAlt = ogImage?.alt || getFeaturedImageAlt(post) || postTitle;
  const authorName = getPostAuthorName(post);
  const categories = getPostCategories(post);

  return {
    title: { absolute: seoTitle },
    description,
    authors: [{ name: authorName }],
    alternates: { canonical },
    // Indexability is decided here, not by WordPress: the CMS is noindexed on
    // purpose, and Rank Math's REST output says noindex for every post.
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
    openGraph: {
      title: seo?.ogTitle || seoTitle,
      description: seo?.ogDescription || description,
      url: canonical,
      type: "article",
      siteName: "BSH Solutions",
      locale: "en_US",
      publishedTime: post.date,
      modifiedTime: post.modified || post.date,
      authors: [authorName],
      section: categories[0],
      ...(featuredImage && {
        images: [
          {
            url: featuredImage,
            alt: imageAlt,
            ...(ogImage?.url === featuredImage && { width: ogImage.width, height: ogImage.height }),
          },
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: seo?.twitterTitle || seo?.ogTitle || seoTitle,
      description: seo?.twitterDescription || seo?.ogDescription || description,
      ...(featuredImage && { images: [seo?.twitterImage || featuredImage] }),
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

  // Rank Math's structured data (URLs mapped to the public domain, author PII
  // removed) when available; otherwise this page's own BlogPosting. Either way
  // the page emits exactly one BlogPosting and one BreadcrumbList —
  // Organization/WebSite come once, site-wide, from the root layout.
  const fallbackArticle = {
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
      "@type": authorName === DEFAULT_AUTHOR_NAME ? "Organization" : "Person",
      name: authorName,
      ...(authorName === DEFAULT_AUTHOR_NAME ? { url: SITE_URL } : {}),
    },
    publisher: { "@id": `${SITE_URL}/#organization` },
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
  };

  const breadcrumb = {
    "@type": "BreadcrumbList",
    "@id": `${articleUrl}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: cleanTitle, item: articleUrl },
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      ...(buildPublicPostSchema(post.seo ?? null, {
        articleUrl,
        title: cleanTitle,
        authorName,
        defaultAuthorName: DEFAULT_AUTHOR_NAME,
      }) ?? [fallbackArticle]),
      breadcrumb,
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
        dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }}
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

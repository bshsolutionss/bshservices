import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/site";

export const SITE_NAME = "BSH Solutions";
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

interface PageMetadataInput {
  /** Full <title>, brand included — used as-is (no layout template). Aim for ≤ 60 chars. */
  title: string;
  /** Aim for 140–160 chars. */
  description: string;
  /** Site-relative path, e.g. "/about". */
  path: string;
  keywords?: string[];
  image?: { url: string; alt?: string; width?: number; height?: number };
  type?: "website" | "article";
}

/**
 * Complete metadata for one public page. Next.js replaces (not merges) the
 * root layout's `openGraph`/`twitter` objects as soon as a page sets its own,
 * so every page goes through here to always get siteName, locale, image and a
 * page-specific Twitter card instead of inheriting the homepage's.
 */
export function pageMetadata({
  title,
  description,
  path,
  keywords,
  image = DEFAULT_OG_IMAGE,
  type = "website",
}: PageMetadataInput): Metadata {
  return {
    title: { absolute: title },
    description,
    ...(keywords && { keywords }),
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "en_US",
      type,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
  };
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${SITE_URL}${crumbs[crumbs.length - 1].path}#breadcrumb`,
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.path === "/" ? "" : crumb.path}`,
    })),
  };
}

interface WebPageJsonLdInput {
  type?: "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage";
  name: string;
  description: string;
  path: string;
  /** Home → … → this page. Omit on the homepage. */
  breadcrumbs?: Crumb[];
  /** Extra entities for the same @graph (ItemList, Person, …). */
  extra?: Record<string, unknown>[];
  /** Extra properties merged into the page entity itself (mainEntity, …). */
  page?: Record<string, unknown>;
}

/**
 * schema.org page entity (+ breadcrumbs) as one @graph, tied to the
 * site-wide Organization/WebSite entities the root layout emits.
 */
export function webPageJsonLd({
  type = "WebPage",
  name,
  description,
  path,
  breadcrumbs,
  extra = [],
  page = {},
}: WebPageJsonLdInput) {
  const url = `${SITE_URL}${path === "/" ? "" : path}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": type,
        "@id": `${url}#webpage`,
        url,
        name,
        description,
        inLanguage: "en",
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": ORGANIZATION_ID },
        publisher: { "@id": ORGANIZATION_ID },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: `${SITE_URL}${DEFAULT_OG_IMAGE.url}`,
        },
        ...(breadcrumbs && { breadcrumb: { "@id": `${url}#breadcrumb` } }),
        ...page,
      },
      ...(breadcrumbs ? [breadcrumbJsonLd(breadcrumbs)] : []),
      ...extra,
    ],
  };
}

/** ItemList of links, e.g. the services listed on a category page. */
export function itemListJsonLd(name: string, items: { name: string; path: string }[]) {
  return {
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: `${SITE_URL}${item.path}`,
    })),
  };
}

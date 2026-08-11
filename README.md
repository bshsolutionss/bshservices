This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Service Sub-Pages Architecture

The 5 service categories (`/Services/development`, `/designing`, `/marketing`, `/photography`, `/ai`)
each have 6 SEO-optimized sub-service pages, e.g. `/Services/development/website-development`,
`/Services/development/ecommerce-development`, `/Services/designing/ui-ux-design` — 30 pages total,
statically generated at build time.

**Why sub-routes instead of `app/services/[category]/[service]`:** this project already has
`app/Services/*` (capital S) with the 5 existing category pages. This dev machine's filesystem is
case-insensitive, so a sibling `app/services/` (lowercase) directory would silently collide with
`app/Services/`. The dynamic segment is nested one level deeper instead — inside each existing
category folder — which avoids the collision and keeps the existing category pages untouched.

### How it's wired together

```
URL: /Services/development/website-development
  → app/Services/development/[service]/page.tsx        (5 of these, one per category — ~6 lines each)
      → lib/services-page-factory.tsx                    (generateStaticParams/generateMetadata/404 logic, written once)
          → lib/services-data.ts                         (the single source of truth for all 30 services)
              → components/services/detail/ServiceDetailPage.tsx   (one shared template)
                  → Hero, ServiceSection, Breadcrumbs, Benefits, ProcessSteps,
                    WhyChooseUs, FaqAccordion, RelatedServices, ServiceCta, Form, Testimonial
```

- **`lib/services-data.ts`** — the centralized config. Each of the 30 services holds its `name`,
  `slug`, `category`, `description`, `features`, `benefits`, `technologies`, `faqs`, and `keywords`.
  To add a 31st service, add one object here (plus an image under `public/images/<category>/`) —
  no routing or component changes needed.
- **`lib/services-content.ts`** — small generator functions (`getProcessSteps`, `getWhyChooseUs`,
  `getCtaContent`) for the sections that are structurally identical within a category (e.g. "how we
  work" has the same 4 stages for every development service) so that copy isn't hand-duplicated 30
  times, while the rendered text still includes the specific service name.
- **`lib/services-page-factory.tsx`** — builds `generateStaticParams`, `generateMetadata` (unique
  title/description/canonical/OG/Twitter per page, via `next/metadata`), and the page component
  (looks up the service, calls `notFound()` for an unknown slug) for a given category. Each of the 5
  `app/Services/<category>/[service]/page.tsx` files just calls this once and re-exports the result.
- **`components/services/detail/`** — the reusable section components (`Breadcrumbs`, `Benefits`,
  `ProcessSteps`, `WhyChooseUs`, `FaqAccordion`, `RelatedServices`, `ServiceCta`, `ServiceJsonLd`).
  All are server components except `FaqAccordion` (needs client state for the open/close toggle).
  The overview/features/technologies section reuses the existing `components/services/ServiceSection`
  component rather than duplicating it.
- Every sub-service page emits `Service`, `BreadcrumbList`, and `FAQPage` JSON-LD, and is included in
  `app/sitemap.ts` (generated from the same `SERVICES` array — no hardcoded URL list to keep in sync).
- Each of the 5 category overview pages (`app/Services/<category>/page.tsx`) links to its matching
  sub-service pages via a "View Full Details" link (`ServiceSection`'s `learnMoreHref` prop).

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

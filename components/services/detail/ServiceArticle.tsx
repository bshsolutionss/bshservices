import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import type { ServiceArticle, ServiceArticleBlock } from "@/lib/services-articles";

interface ServiceArticleProps {
  article: ServiceArticle;
}

const CTA_URL = "https://bshsolutionss.com/book-consultation";

interface ArticleSection {
  id: string;
  heading: string;
  paragraphs: string[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Splits the flat block list into an intro (paragraphs before the first heading) plus one section per heading. */
function groupBlocks(blocks: ServiceArticleBlock[]): { intro: string[]; sections: ArticleSection[] } {
  const intro: string[] = [];
  const sections: ArticleSection[] = [];
  let current: ArticleSection | null = null;

  for (const block of blocks) {
    if (block.type === "heading") {
      current = { id: slugify(block.text), heading: block.text, paragraphs: [] };
      sections.push(current);
    } else if (current) {
      current.paragraphs.push(block.text);
    } else {
      intro.push(block.text);
    }
  }

  return { intro, sections };
}

/**
 * Splits the CTA sentence out of a paragraph's exact text so it can render
 * as a highlighted callout with a real button — the wording itself is
 * untouched, only the visual treatment (and the added button) differs.
 */
function renderParagraph(text: string) {
  if (!text.includes(CTA_URL)) return <p className="text-[#231F20]/70 leading-relaxed">{text}</p>;

  return (
    <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl bg-[#1A14A5]/5 border border-[#1A14A5]/15 p-4">
      <p className="flex-1 text-sm text-[#231F20]/80 leading-relaxed">{text}</p>
      <Link
        href="/book-consultation"
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#1A14A5] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#0e0a7a]"
      >
        Book Free Consultation <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

/**
 * Renders the complete, verbatim long-form guide supplied in `content/*.md`
 * for services that have one (see `lib/services-articles.ts`) — laid out
 * with the site's own card/number/color language (the same one Benefits,
 * ProcessSteps and WhyChooseUs use) instead of generic article typography.
 * Every word is preserved exactly as written; only the structure and visual
 * treatment are designed on top of it.
 *
 * The source file's own FAQ section is intentionally not repeated here —
 * it renders through `FaqAccordion` below, with matching FAQPage schema.
 */
export default function ServiceArticleSection({ article }: ServiceArticleProps) {
  const { intro, sections } = groupBlocks(article.blocks);
  const lastIndex = sections.length - 1;

  return (
    <section className="py-16 px-6 lg:px-12 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-3">
          <BookOpen className="h-4 w-4 text-[#1A14A5]" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-wide text-[#1A14A5]">
            The Complete Guide
          </span>
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold text-[#231F20] mb-6 text-center">
          {article.title}
        </h2>

        {intro.map((paragraph, index) => (
          <p
            key={index}
            className="max-w-3xl mx-auto text-center text-lg text-[#231F20]/70 leading-relaxed mb-4 last:mb-0"
          >
            {paragraph}
          </p>
        ))}

        {sections.length > 1 && (
          <nav
            aria-label="Guide sections"
            className="mt-10 rounded-2xl border border-[#1A14A5]/10 bg-[#F4F7FE] p-6"
          >
            <p className="text-sm font-bold text-[#231F20] mb-4">In This Guide</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="text-sm text-[#1A14A5]/80 hover:text-[#1A14A5] hover:underline"
                  >
                    {section.heading}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="mt-10 space-y-5">
          {sections.map((section, index) => (
            <div
              key={section.id}
              id={section.id}
              className={`scroll-mt-28 rounded-2xl border p-6 md:p-8 transition-colors ${
                index === lastIndex
                  ? "bg-[#1A14A5]/5 border-[#1A14A5]/20"
                  : "bg-white border-[#1A14A5]/10 hover:border-[#1A14A5]/25"
              }`}
            >
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-2xl font-extrabold text-[#1A14A5]/20 shrink-0">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-xl font-bold text-[#231F20]">{section.heading}</h3>
              </div>
              <div className="space-y-4 pl-0 md:pl-9">
                {section.paragraphs.map((paragraph, pIndex) => (
                  <div key={pIndex}>{renderParagraph(paragraph)}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

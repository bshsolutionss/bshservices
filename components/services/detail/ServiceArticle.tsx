import type { ServiceArticle } from "@/lib/services-articles";
import ArticleHeader from "./article/ArticleHeader";
import ArticleTopicSection from "./article/ArticleTopicSection";
import ArticleServicesGrid from "./article/ArticleServicesGrid";
import ArticleProcessTimeline from "./article/ArticleProcessTimeline";
import ArticleClosingCta from "./article/ArticleClosingCta";

interface ServiceArticleProps {
  article: ServiceArticle;
  image: string;
  imageAlt: string;
  /** Threaded into the closing CTA's booking link as ?service= — see ArticleClosingCta. */
  serviceName: string;
}

/**
 * Renders the complete, verbatim long-form guide supplied in `content/*.md`
 * for services that have one (see `lib/services-articles.ts`). Every word
 * is preserved exactly as written — nothing here is trimmed or paraphrased.
 * What *is* deliberately designed is the presentation: this is a service
 * page, not a blog article, so the content renders as a sequence of proper,
 * alternating-background page sections (image + intro, icon-tagged topic
 * bands, an icon-card services grid, a numbered process timeline, a solid
 * trust panel, a closing banner) — the same visual language the rest of
 * the site's service pages use — rather than one long continuous scroll of
 * text.
 *
 * The article's own FAQ section is intentionally not repeated here — it
 * renders via `FaqAccordion` below, with matching FAQPage schema.
 */
export default function ServiceArticleSection({ article, image, imageAlt, serviceName }: ServiceArticleProps) {
  let bandIndex = 0;

  return (
    <>
      <ArticleHeader intro={article.intro} image={image} imageAlt={imageAlt} />

      {article.sections.map((section, index) => {
        switch (section.kind) {
          case "topic":
          case "trust":
            return <ArticleTopicSection key={index} section={section} index={bandIndex++} />;
          case "list":
            return section.listKind === "services" ? (
              <ArticleServicesGrid key={index} section={section} index={bandIndex++} />
            ) : (
              <ArticleProcessTimeline key={index} section={section} index={bandIndex++} />
            );
          default:
            return null;
        }
      })}

      <ArticleClosingCta closing={article.closing} index={bandIndex++} serviceName={serviceName} />
    </>
  );
}

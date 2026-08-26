import type { ServiceArticle } from "@/lib/services-articles";
import ArticleHeader from "./article/ArticleHeader";
import ArticleTopicSection from "./article/ArticleTopicSection";
import ArticleServicesGrid from "./article/ArticleServicesGrid";
import ArticleProcessTimeline from "./article/ArticleProcessTimeline";
import ArticleClosingCta from "./article/ArticleClosingCta";

interface ServiceArticleProps {
  article: ServiceArticle;
}

/**
 * Renders the complete, verbatim long-form guide supplied in `content/*.md`
 * for services that have one (see `lib/services-articles.ts`). Every word
 * is preserved exactly as written — nothing here is trimmed or paraphrased.
 * What *is* deliberately designed is the presentation: the source content
 * is parsed into its actual semantic parts (topic prose, the named
 * "services" list, the numbered "process" list, the "why trusted" panel,
 * and the closing pitch), and each part renders through a purpose-built
 * component instead of one repeated generic block.
 *
 * The article's own FAQ section is intentionally not repeated here — it
 * renders via `FaqAccordion` below, with matching FAQPage schema.
 */
export default function ServiceArticleSection({ article }: ServiceArticleProps) {
  return (
    <section className="py-16 px-6 lg:px-12 bg-white">
      <ArticleHeader intro={article.intro} />

      {article.sections.map((section, index) => {
        switch (section.kind) {
          case "topic":
          case "trust":
            return <ArticleTopicSection key={index} section={section} />;
          case "list":
            return section.listKind === "services" ? (
              <ArticleServicesGrid key={index} section={section} />
            ) : (
              <ArticleProcessTimeline key={index} section={section} />
            );
          default:
            return null;
        }
      })}

      <ArticleClosingCta closing={article.closing} />
    </section>
  );
}

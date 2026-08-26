import { Lightbulb, Compass, TrendingUp, MessageCircle, PuzzleIcon, Users2, Star, ShieldCheck } from "lucide-react";
import type { ArticleSection } from "@/lib/services-articles";
import ArticleCtaCallout from "./ArticleCtaCallout";

interface ArticleTopicSectionProps {
  section: Extract<ArticleSection, { kind: "topic" | "trust" }>;
  /** Position among sibling sections — drives the alternating band background and icon, so this reads as a sequence of distinct page sections rather than one continuous scroll of prose. */
  index: number;
}

const ICONS = [Lightbulb, Compass, TrendingUp, MessageCircle, PuzzleIcon, Users2, Star];

/**
 * Renders a "what X actually means" / "why choose a professional X" /
 * deep-dive prose section — and the "Why We Are a Trusted X" section, in a
 * visually distinct highlighted variant. Each one is its own full-width
 * section with an alternating background band and a topic icon, so a
 * service page reads as a sequence of proper sections — the way the rest
 * of the site's service pages are built — instead of one long article.
 */
export default function ArticleTopicSection({ section, index }: ArticleTopicSectionProps) {
  const isTrust = section.kind === "trust";
  const bandBg = index % 2 === 0 ? "bg-[#F4F7FE]" : "bg-white";

  if (isTrust) {
    return (
      <section className={`${bandBg} py-14 px-6 lg:px-12`}>
        <div className="max-w-3xl mx-auto rounded-2xl bg-[#1A14A5] p-6 md:p-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <ShieldCheck className="h-5 w-5 text-white" aria-hidden="true" />
            </span>
            <h3 className="text-xl md:text-2xl font-bold text-white">{section.heading}</h3>
          </div>
          <div className="space-y-4">
            {section.paragraphs.map((paragraph, i) => (
              <p key={i} className="text-white/80 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
          {section.ctas.map((cta, i) => (
            <ArticleCtaCallout key={i} text={cta} dark />
          ))}
        </div>
      </section>
    );
  }

  const Icon = ICONS[index % ICONS.length];

  return (
    <section className={`${bandBg} py-14 px-6 lg:px-12`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1A14A5]/10">
            <Icon className="h-5 w-5 text-[#1A14A5]" aria-hidden="true" />
          </span>
          <h3 className="text-xl md:text-2xl font-bold text-[#231F20]">{section.heading}</h3>
        </div>
        <div className="space-y-4">
          {section.paragraphs.map((paragraph, i) => (
            <p key={i} className="text-[#231F20]/75 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
        {section.ctas.map((cta, i) => (
          <ArticleCtaCallout key={i} text={cta} />
        ))}
      </div>
    </section>
  );
}

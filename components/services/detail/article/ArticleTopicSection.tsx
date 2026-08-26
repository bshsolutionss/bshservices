import { ShieldCheck } from "lucide-react";
import type { ArticleSection } from "@/lib/services-articles";
import ArticleCtaCallout from "./ArticleCtaCallout";

interface ArticleTopicSectionProps {
  section: Extract<ArticleSection, { kind: "topic" | "trust" }>;
}

/**
 * Renders a "what X actually means" / "why choose a professional X" /
 * deep-dive prose section — and the "Why We Are a Trusted X" section, in a
 * visually distinct highlighted variant. Deliberately not a boxed card:
 * topic sections flow as continuous prose (like a real article), separated
 * by a hairline rule, so 8-11 of them in a row don't read as a stack of
 * repeated card widgets.
 */
export default function ArticleTopicSection({ section }: ArticleTopicSectionProps) {
  const isTrust = section.kind === "trust";

  if (isTrust) {
    return (
      <div className="max-w-3xl mx-auto my-10 rounded-2xl bg-[#1A14A5]/5 border border-[#1A14A5]/15 p-6 md:p-8">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="h-5 w-5 text-[#1A14A5]" aria-hidden="true" />
          <h3 className="text-xl font-bold text-[#231F20]">{section.heading}</h3>
        </div>
        <div className="space-y-4">
          {section.paragraphs.map((paragraph, index) => (
            <p key={index} className="text-[#231F20]/75 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
        {section.ctas.map((cta, index) => (
          <ArticleCtaCallout key={index} text={cta} />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 border-t border-[#1A14A5]/10 first:border-t-0 first:pt-0">
      <div className="flex items-start gap-4">
        <span className="mt-1.5 h-5 w-1 shrink-0 rounded-full bg-[#1A14A5]" aria-hidden="true" />
        <div className="min-w-0">
          <h3 className="text-xl md:text-2xl font-bold text-[#231F20] mb-3">{section.heading}</h3>
          <div className="space-y-4">
            {section.paragraphs.map((paragraph, index) => (
              <p key={index} className="text-[#231F20]/75 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
          {section.ctas.map((cta, index) => (
            <ArticleCtaCallout key={index} text={cta} />
          ))}
        </div>
      </div>
    </div>
  );
}

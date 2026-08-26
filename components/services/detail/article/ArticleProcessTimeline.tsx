import type { ArticleSection } from "@/lib/services-articles";
import ArticleCtaCallout from "./ArticleCtaCallout";

interface ArticleProcessTimelineProps {
  section: Extract<ArticleSection, { kind: "list"; listKind: "process" }>;
}

/**
 * The "Our X Process" section — a connected vertical timeline (numbered
 * circles joined by a line), not a card grid. Works cleanly for any step
 * count (source files range 4-6) without breakpoint-specific layout, and
 * reads unmistakably differently from the services grid above it.
 */
export default function ArticleProcessTimeline({ section }: ArticleProcessTimelineProps) {
  return (
    <div className="max-w-3xl mx-auto py-10 border-t border-[#1A14A5]/10">
      <div className="text-center mb-10">
        <h3 className="text-2xl md:text-3xl font-bold text-[#231F20] mb-3">{section.heading}</h3>
        {section.intro.map((paragraph, index) => (
          <p key={index} className="text-[#231F20]/70 leading-relaxed max-w-2xl mx-auto">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="relative">
        <div
          className="absolute left-5 top-2 bottom-2 w-px bg-[#1A14A5]/15"
          aria-hidden="true"
        />
        <ol className="space-y-8">
          {section.items.map((item, index) => (
            <li key={item.heading} className="relative pl-16">
              <span className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-[#1A14A5] text-white font-bold text-sm shadow-sm">
                {index + 1}
              </span>
              <h4 className="text-lg font-bold text-[#231F20] mb-1.5">{item.heading}</h4>
              <p className="text-[#231F20]/70 leading-relaxed">{item.paragraph}</p>
            </li>
          ))}
        </ol>
      </div>

      {section.ctas.map((cta, index) => (
        <ArticleCtaCallout key={index} text={cta} />
      ))}
    </div>
  );
}

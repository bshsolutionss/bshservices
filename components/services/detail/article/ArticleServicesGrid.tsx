import { Sparkles, Layers, Target, Zap, Award, Gem, Rocket, CheckCircle2 } from "lucide-react";
import type { ArticleSection } from "@/lib/services-articles";
import ArticleCtaCallout from "./ArticleCtaCallout";

interface ArticleServicesGridProps {
  section: Extract<ArticleSection, { kind: "list"; listKind: "services" }>;
}

const ICONS = [Sparkles, Layers, Target, Zap, Award, Gem, Rocket, CheckCircle2];

/** The "Our X Services" section — a proper icon-card showcase grid of the named sub-services, not a flat list. */
export default function ArticleServicesGrid({ section }: ArticleServicesGridProps) {
  return (
    <div className="max-w-5xl mx-auto py-10 border-t border-[#1A14A5]/10">
      <div className="max-w-2xl mx-auto text-center mb-8">
        <h3 className="text-2xl md:text-3xl font-bold text-[#231F20] mb-3">{section.heading}</h3>
        {section.intro.map((paragraph, index) => (
          <p key={index} className="text-[#231F20]/70 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {section.items.map((item, index) => {
          const Icon = ICONS[index % ICONS.length];
          return (
            <div
              key={item.heading}
              className="rounded-2xl border border-[#1A14A5]/10 bg-white p-6 hover:border-[#1A14A5]/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-[#1A14A5]/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-[#1A14A5]" aria-hidden="true" />
              </div>
              <h4 className="text-lg font-bold text-[#231F20] mb-2">{item.heading}</h4>
              <p className="text-sm text-[#231F20]/70 leading-relaxed">{item.paragraph}</p>
            </div>
          );
        })}
      </div>

      {section.ctas.map((cta, index) => (
        <ArticleCtaCallout key={index} text={cta} />
      ))}
    </div>
  );
}

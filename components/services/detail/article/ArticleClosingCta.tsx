import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { splitCtaSentence } from "./cta-link";

interface ArticleClosingCtaProps {
  closing: { heading: string; paragraphs: string[] };
  /** Position among sibling sections — drives the alternating band background. */
  index: number;
  /** Carried into the booking link as ?service= so BookingForm arrives pre-filled/pre-scored with this page's service context. */
  serviceName: string;
}

/** The source article's own closing pitch — its last heading + paragraph(s) — as a prominent banner. The trailing "Book ... at <url>" sentence loses its raw URL since the button right below already does that job. */
export default function ArticleClosingCta({ closing, index: sectionIndex, serviceName }: ArticleClosingCtaProps) {
  if (!closing.heading) return null;
  const bandBg = sectionIndex % 2 === 0 ? "bg-[#F4F7FE]" : "bg-white";

  return (
    <section className={`${bandBg} py-14 px-6 lg:px-12`}>
      <div className="max-w-4xl mx-auto">
        <div className="rounded-3xl bg-[#1A14A5] px-6 py-10 md:px-12 md:py-14 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">{closing.heading}</h3>
          <div className="max-w-2xl mx-auto space-y-3 mb-8">
            {closing.paragraphs.map((paragraph, index) => (
              <p key={index} className="text-white/80 leading-relaxed">
                {splitCtaSentence(paragraph)}
              </p>
            ))}
          </div>
          <Link
            href={`/book-consultation?service=${encodeURIComponent(serviceName)}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-[#1A14A5] font-semibold px-8 py-3.5 hover:bg-white/90 transition-colors"
          >
            Book Your Free Consultation <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

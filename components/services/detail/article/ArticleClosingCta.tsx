import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { splitCtaSentence } from "./cta-link";

interface ArticleClosingCtaProps {
  closing: { heading: string; paragraphs: string[] };
}

/** The source article's own closing pitch — its last heading + paragraph(s) — as a prominent banner. The trailing "Book ... at <url>" sentence loses its raw URL since the button right below already does that job. */
export default function ArticleClosingCta({ closing }: ArticleClosingCtaProps) {
  if (!closing.heading) return null;

  return (
    <div className="max-w-4xl mx-auto mt-10">
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
          href="/book-consultation"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-[#1A14A5] font-semibold px-8 py-3.5 hover:bg-white/90 transition-colors"
        >
          Book Your Free Consultation <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

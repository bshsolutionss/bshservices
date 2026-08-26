import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { splitCtaSentence } from "./cta-link";

interface ArticleCtaCalloutProps {
  /** The exact CTA sentence from the source content — its question is shown; the raw URL is never printed, only linked via the button. */
  text: string;
  /** Set when this callout sits on a solid dark background (e.g. the trust panel), so it doesn't blend in. */
  dark?: boolean;
}

/** A single mid-article engagement prompt, styled as a callout with a real button — never a bare printed URL. */
export default function ArticleCtaCallout({ text, dark = false }: ArticleCtaCalloutProps) {
  return (
    <div
      className={`my-6 flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl p-4 ${
        dark ? "bg-white/10 border border-white/15" : "bg-[#1A14A5]/5 border border-[#1A14A5]/15"
      }`}
    >
      <p className={`flex-1 text-sm leading-relaxed ${dark ? "text-white/85" : "text-[#231F20]/80"}`}>
        {splitCtaSentence(text)}
      </p>
      <Link
        href="/book-consultation"
        className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
          dark
            ? "bg-white text-[#1A14A5] hover:bg-white/90"
            : "bg-[#1A14A5] text-white hover:bg-[#0e0a7a]"
        }`}
      >
        Book Free Consultation <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

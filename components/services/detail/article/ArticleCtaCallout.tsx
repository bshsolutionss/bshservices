import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { splitCtaSentence } from "./cta-link";

interface ArticleCtaCalloutProps {
  /** The exact CTA sentence from the source content — its question is shown; the raw URL is never printed, only linked via the button. */
  text: string;
}

/** A single mid-article engagement prompt, styled as a callout with a real button — never a bare printed URL. */
export default function ArticleCtaCallout({ text }: ArticleCtaCalloutProps) {
  return (
    <div className="my-6 flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl bg-[#1A14A5]/5 border border-[#1A14A5]/15 p-4">
      <p className="flex-1 text-sm text-[#231F20]/80 leading-relaxed">{splitCtaSentence(text)}</p>
      <Link
        href="/book-consultation"
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#1A14A5] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#0e0a7a]"
      >
        Book Free Consultation <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

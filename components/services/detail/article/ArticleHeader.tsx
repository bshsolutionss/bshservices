import { BookOpen } from "lucide-react";

interface ArticleHeaderProps {
  intro: string[];
}

/**
 * The article's lede paragraph(s). The article's own title is NOT repeated
 * here — the Hero above already renders it as this page's actual H1 (real
 * content title, not a generic short label), so showing it again as an H2
 * immediately below would just be duplicate text.
 */
export default function ArticleHeader({ intro }: ArticleHeaderProps) {
  return (
    <div className="max-w-3xl mx-auto text-center mb-12">
      <div className="flex items-center justify-center gap-2 mb-5">
        <BookOpen className="h-4 w-4 text-[#1A14A5]" aria-hidden="true" />
        <span className="text-xs font-semibold uppercase tracking-wide text-[#1A14A5]">
          The Complete Guide
        </span>
      </div>
      {intro.map((paragraph, index) => (
        <p key={index} className="text-lg text-[#231F20]/70 leading-relaxed mb-4 last:mb-0">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

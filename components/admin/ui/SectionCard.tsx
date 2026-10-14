import { cn } from "@/lib/utils";
import { cardBase } from "./styles";

interface SectionCardProps {
  title?: string;
  /** Small line under the title. */
  subtitle?: string;
  /** Top-right slot — usually a button or a filter. */
  action?: React.ReactNode;
  /** Set false when the body renders its own edge-to-edge content (a table, a list). */
  padded?: boolean;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}

/** White panel used for every block of content in the admin panel. */
export default function SectionCard({
  title,
  subtitle,
  action,
  padded = true,
  className,
  bodyClassName,
  children,
}: SectionCardProps) {
  return (
    <section className={cn(cardBase, "overflow-hidden", className)}>
      {(title || action) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1A14A5]/10 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            {title && <h2 className="font-bold text-[#231F20]">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-[#231F20]/50">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={cn(padded && "px-5 py-5 sm:px-6", bodyClassName)}>{children}</div>
    </section>
  );
}

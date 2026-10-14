import Link from "next/link";
import { ChevronLeft } from "lucide-react";

/** Title block at the top of every admin page — same type scale and spacing everywhere. */
export default function PageHeader({
  title,
  subtitle,
  backHref,
  backLabel,
  actions,
  children,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  /** Right-aligned buttons. */
  actions?: React.ReactNode;
  /** Extra row under the title (filters, tabs). */
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          {backHref && (
            <Link
              href={backHref}
              className="mb-1.5 inline-flex items-center gap-1 text-sm font-medium text-[#1A14A5] hover:underline"
            >
              <ChevronLeft className="h-4 w-4" />
              {backLabel ?? "Back"}
            </Link>
          )}
          <h1 className="text-2xl font-extrabold text-[#231F20]">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-[#231F20]/60">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

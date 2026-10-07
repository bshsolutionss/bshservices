import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProjectShowcase from "@/components/portfolio/ProjectShowcase";
import ProjectGrid from "@/components/portfolio/ProjectGrid";
import { PORTFOLIO_PROJECTS } from "@/lib/portfolio-data";
import { cn } from "@/lib/utils";

// Data now lives in lib/portfolio-data.ts; re-exported for existing imports.
export { PORTFOLIO_PROJECTS } from "@/lib/portfolio-data";
export type { PortfolioProject } from "@/lib/portfolio-data";

interface OurPortfolioProps {
  /** Only feature the first N projects (omit for all). With a limit the grid is skipped. */
  limit?: number;
  /** Show a "View Full Portfolio" button next to the heading. */
  showViewAll?: boolean;
  /** Show the section heading + intro copy. Disable when the parent page already renders its own. */
  showHeading?: boolean;
  /** Force the "More projects" grid on or off (default: on only when there is no limit). */
  showGrid?: boolean;
  className?: string;
}

export function OurPortfolio({
  limit,
  showViewAll = false,
  showHeading = true,
  showGrid,
  className,
}: OurPortfolioProps) {
  const projects = typeof limit === "number" ? PORTFOLIO_PROJECTS.slice(0, limit) : PORTFOLIO_PROJECTS;
  const withGrid = showGrid ?? limit === undefined;

  return (
    <section
      id="portfolio"
      className={cn("relative overflow-hidden bg-[#F4F7FE] px-4 py-16 sm:px-6 lg:px-12 lg:py-20", className)}
    >
      {/* faint grid, like the hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(26,20,165,.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(26,20,165,.045) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 90% 80% at 50% 40%, #000 20%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 90% 80% at 50% 40%, #000 20%, transparent 80%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl">
        {showHeading && (
          <div className="mb-10 flex flex-col justify-between gap-6 md:mb-12 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-extrabold tracking-tight text-[#1A14A5] sm:text-4xl lg:text-5xl">
                Our <span className="text-[#231F20]">Portfolio</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#231F20]/70 sm:text-lg">
                Real live websites, dashboards, SaaS platforms, and scalable digital
                experiences crafted for our clients worldwide.
              </p>
            </div>

            {showViewAll && (
              <Button
                asChild
                className="h-auto w-fit gap-2 rounded-full bg-[#1A14A5] px-8 py-4 font-bold text-white hover:bg-[#0e0a7a]"
              >
                <Link href="/portfolio">
                  View Full Portfolio <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        )}

        <ProjectShowcase projects={projects} />

        {withGrid && (
          <div className="mt-16 lg:mt-20">
            <div className="mb-6 flex items-center justify-between gap-4 border-b border-[#1A14A5]/10 pb-4">
              <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-[#231F20]/60">All projects</h2>
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#231F20]/50">{projects.length} projects</span>
            </div>
            <ProjectGrid projects={projects} />
          </div>
        )}
      </div>
    </section>
  );
}

export default OurPortfolio;

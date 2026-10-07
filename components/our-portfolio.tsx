import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Reveal from "@/components/Reveal";
import { cn } from "@/lib/utils";

export interface PortfolioProject {
  title: string;
  image: string;
  category: string;
  link: string;
}

// Real, live client projects only.
export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    title: "Migration Republic",
    image: "/portfolio/migrationrepublic.webp",
    category: "Web Development",
    link: "https://migrationrepublic.com.au",
  },
  {
    title: "Migration Factor",
    image: "/portfolio/migrationfactor.webp",
    category: "Branding & Web",
    link: "https://migrationfactor.com.au",
  },
  {
    title: "Aisha Academy",
    image: "/portfolio/aishaacademy.webp",
    category: "EdTech Solution",
    link: "https://aisha-academy.com/",
  },
  {
    title: "Silwalo",
    image: "/portfolio/silwalo.webp",
    category: "eCommerce",
    link: "https://silwalo.com",
  },
  {
    title: "Admin Dashboard",
    image: "/portfolio/admindashboard.webp",
    category: "Custom Software",
    link: "https://home-decor-admins.vercel.app/",
  },
  {
    title: "Almacca",
    image: "/portfolio/almacca.webp",
    category: "Web Development",
    link: "https://almacca.com/",
  },
  {
    title: "Golden Shiruh LLC",
    image: "/portfolio/migrationrepublic.webp",
    category: "Agency Website",
    link: "https://goldenshiruhllc.com/",
  },
  {
    title: "ANH Supplies",
    image: "/portfolio/anhsupplies.webp",
    category: "eCommerce",
    link: "https://anhsupplies.com/",
  },
];

interface OurPortfolioProps {
  /** Only show the first N projects (omit to show all). */
  limit?: number;
  /** Show a "View Full Portfolio" button next to the heading. */
  showViewAll?: boolean;
  /** Show the section heading + intro copy. Disable when the parent page already renders its own. */
  showHeading?: boolean;
  className?: string;
}

export function OurPortfolio({
  limit,
  showViewAll = false,
  showHeading = true,
  className,
}: OurPortfolioProps) {
  const projects = typeof limit === "number" ? PORTFOLIO_PROJECTS.slice(0, limit) : PORTFOLIO_PROJECTS;

  return (
    <section id="portfolio" className={cn("bg-[#F4F7FE] px-4 py-16 sm:px-6 lg:px-12 lg:py-20", className)}>
      <div className="mx-auto max-w-7xl">
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

        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 xl:gap-8">
          {projects.map((project, index) => (
            <Reveal as="li" key={project.title} delay={(index % 3) * 70}>
              <article className="group relative h-full overflow-hidden rounded-3xl border border-[#1A14A5]/10 bg-white shadow-sm transition-all duration-300 focus-within:ring-2 focus-within:ring-[#1A14A5] hover:-translate-y-1.5 hover:border-[#1A14A5]/30 hover:shadow-xl">
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#F4F7FE]">
                  <Image
                    src={project.image}
                    alt={`${project.title} website screenshot`}
                    fill
                    // The first row is above the fold on the homepage.
                    priority={index < 3 && typeof limit === "number"}
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover object-top transition-[object-position] duration-[4000ms] ease-in-out group-hover:object-bottom"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#1A14A5] shadow-sm backdrop-blur">
                    {project.category}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 p-5 sm:p-6">
                  <h3 className="text-lg font-bold leading-snug text-[#231F20] sm:text-xl">
                    {/* Stretched link: the whole card is one accessible target. */}
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="after:absolute after:inset-0 after:content-[''] focus:outline-none"
                    >
                      {project.title}
                      <span className="sr-only"> (opens live site in a new tab)</span>
                    </a>
                  </h3>
                  <span
                    aria-hidden="true"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1A14A5]/5 text-[#1A14A5] transition-colors group-hover:bg-[#1A14A5] group-hover:text-white"
                  >
                    <ArrowUpRight className="h-5 w-5" />
                  </span>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default OurPortfolio;

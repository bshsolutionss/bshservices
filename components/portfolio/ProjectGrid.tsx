"use client";

import React, { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowUpRight, Eye } from "lucide-react";
import BrowserFrame from "@/components/portfolio/BrowserFrame";
import ProjectShot from "@/components/portfolio/ProjectShot";
import Reveal from "@/components/Reveal";
import { displayHost, getProjectPath, type PortfolioProject } from "@/lib/portfolio-data";

// The modal (and its live iframe) only loads once someone opens a preview.
const PreviewModal = dynamic(() => import("@/components/portfolio/PreviewModal"), { ssr: false });

interface ProjectGridProps {
  projects: PortfolioProject[];
  /** Render cards as <h3> (default) or <h2>. */
  headingLevel?: "h2" | "h3";
}

export default function ProjectGrid({ projects, headingLevel = "h3" }: ProjectGridProps) {
  const [preview, setPreview] = useState<PortfolioProject | null>(null);
  const close = useCallback(() => setPreview(null), []);
  const Heading = headingLevel;

  return (
    <>
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 xl:gap-8">
        {projects.map((project, i) => (
          <Reveal as="li" key={project.slug} delay={(i % 3) * 70}>
            <article className="group flex h-full flex-col rounded-[1.4rem] border border-[#1A14A5]/10 bg-white p-2.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#1A14A5]/30 hover:shadow-xl">
              <BrowserFrame host={displayHost(project.link)} compact className="shadow-none">
                <div className="relative">
                  <ProjectShot project={project} sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw" priority={i < 3} />
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[#0B0A2E]/80 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#34d399]" /> Live
                  </span>
                </div>
              </BrowserFrame>

              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1A14A5]">{project.category}</p>
                <Heading className="mt-1.5 text-xl font-bold leading-snug text-[#231F20]">
                  <Link href={getProjectPath(project)} className="hover:text-[#1A14A5] focus:outline-none focus-visible:underline">
                    {project.title}
                  </Link>
                </Heading>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#231F20]/70">{project.description}</p>

                <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Services delivered">
                  {project.services.slice(0, 3).map((s) => (
                    <li key={s} className="rounded-md border border-[#1A14A5]/10 bg-[#F4F7FE] px-2 py-1 font-mono text-[10.5px] text-[#231F20]/70">
                      {s}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-5">
                  <div className="grid grid-cols-2 gap-2.5 border-t border-[#1A14A5]/10 pt-4">
                    <button
                      type="button"
                      onClick={() => setPreview(project)}
                      aria-label={`Preview ${project.title}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#1A14A5]/15 bg-[#F4F7FE] px-3 py-2.5 text-sm font-semibold text-[#231F20] transition hover:border-[#1A14A5]/40 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A14A5]"
                    >
                      <Eye className="h-4 w-4" /> Preview
                    </button>
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#1A14A5]/15 bg-[#F4F7FE] px-3 py-2.5 text-sm font-semibold text-[#1A14A5] transition hover:border-[#1A14A5]/40 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A14A5]"
                    >
                      Live Site <ArrowUpRight className="h-4 w-4" />
                      <span className="sr-only"> (opens {project.title} in a new tab)</span>
                    </a>
                  </div>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </ul>

      {preview && <PreviewModal project={preview} onClose={close} />}
    </>
  );
}

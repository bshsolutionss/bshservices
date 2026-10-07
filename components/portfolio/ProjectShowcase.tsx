"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, ChevronLeft, ChevronRight } from "lucide-react";
import BrowserFrame from "@/components/portfolio/BrowserFrame";
import ProjectShot from "@/components/portfolio/ProjectShot";
import { displayHost, getProjectPath, type PortfolioProject } from "@/lib/portfolio-data";

interface ProjectShowcaseProps {
  projects: PortfolioProject[];
  /** Milliseconds between slides; 0 turns autoplay off. */
  autoplayMs?: number;
}

/**
 * Featured-project viewer: the site in a browser window next to a dark detail
 * panel. Autoplays, pauses on hover/focus and never autoplays for users who
 * prefer reduced motion.
 */
export default function ProjectShowcase({ projects, autoplayMs = 7000 }: ProjectShowcaseProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const count = projects.length;

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (!autoplayMs || paused || reduced || count < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), autoplayMs);
    return () => window.clearInterval(id);
  }, [autoplayMs, paused, reduced, count]);

  const project = projects[index];
  const go = (i: number) => setIndex((i + count) % count);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured projects"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="grid overflow-hidden rounded-[1.75rem] bg-[#0B0A2E] shadow-[0_40px_90px_-35px_rgba(26,20,165,0.7)] lg:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)]">
        {/* screen */}
        <div className="p-3 sm:p-5">
          <Link
            href={getProjectPath(project)}
            aria-label={`${project.title}: read the case study`}
            className="group relative block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <BrowserFrame host={displayHost(project.link)} className="border-white/10">
              <div key={project.slug} className="animate-in fade-in duration-500">
                <ProjectShot project={project} sizes="(max-width: 1024px) 100vw, 780px" priority={index === 0} />
              </div>
            </BrowserFrame>
            <span className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
              <span className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#1A14A5] shadow-lg">View Case Study</span>
            </span>
          </Link>
        </div>

        {/* detail panel */}
        <div className="flex flex-col border-t border-white/10 p-6 text-white sm:p-8 lg:border-l lg:border-t-0" aria-live="polite">
          <div key={project.slug} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">{project.industry}</p>
            <span className="mt-3 inline-flex items-center gap-2 rounded-md border border-[#34d399]/40 bg-[#34d399]/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#6ee7b7]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#34d399]" /> Live project
            </span>

            <h3 className="mt-5 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{project.title}</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-white/75">{project.tagline}</p>

            {project.metrics && project.metrics.length > 0 ? (
              <ul className="mt-6 grid grid-cols-2 gap-2.5">
                {project.metrics.map((m) => (
                  <li key={m.label} className="rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm">
                    <span className="block font-bold">{m.value}</span>
                    <span className="text-xs text-white/60">{m.label}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="mt-6 space-y-2.5">
                {project.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2.5 text-sm text-white/85">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#6ee7b7]" aria-hidden="true" />
                    {h}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-auto flex flex-col gap-2.5 pt-8">
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#1A14A5] transition hover:bg-[#EEF0FB] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0A2E]"
            >
              View Live Site <ArrowUpRight className="h-4 w-4" />
              <span className="sr-only"> (opens {project.title} in a new tab)</span>
            </a>
            <Link
              href={getProjectPath(project)}
              className="inline-flex items-center justify-center rounded-xl border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Case Study
            </Link>
          </div>
        </div>
      </div>

      {/* controls */}
      {count > 1 && (
        <div className="mt-5 flex items-center justify-center gap-4">
          <button
            type="button"
            aria-label="Previous project"
            onClick={() => go(index - 1)}
            className="grid h-9 w-9 place-items-center rounded-full border border-[#1A14A5]/20 bg-white text-[#1A14A5] transition hover:bg-[#1A14A5] hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2" role="tablist" aria-label="Choose a project">
            {projects.map((p, i) => (
              <button
                key={p.slug}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Show ${p.title}`}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${i === index ? "w-8 bg-[#1A14A5]" : "w-2 bg-[#1A14A5]/25 hover:bg-[#1A14A5]/50"}`}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Next project"
            onClick={() => go(index + 1)}
            className="grid h-9 w-9 place-items-center rounded-full border border-[#1A14A5]/20 bg-white text-[#1A14A5] transition hover:bg-[#1A14A5] hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, X } from "lucide-react";
import MonitorFrame from "@/components/portfolio/MonitorFrame";
import { displayHost, getProjectPath, type PortfolioProject } from "@/lib/portfolio-data";

interface PreviewModalProps {
  project: PortfolioProject;
  onClose: () => void;
}

/**
 * The project on a computer screen: scroll inside the monitor to see the
 * whole page. "Open live site" takes you to the real website.
 */
export default function PreviewModal({ project, onClose }: PreviewModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  // Esc to close, lock page scroll, and give focus back to whatever opened us.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      opener?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} preview`}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#07061f]/85 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div className="max-h-full w-full max-w-5xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* toolbar */}
        <div className="mb-3 flex items-center gap-3 text-white sm:mb-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold sm:text-lg">{project.title}</p>
            <p className="truncate text-xs text-white/60">{displayHost(project.link)}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            aria-label="Close preview"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* computer screen */}
        <MonitorFrame className="max-w-4xl">
          <div
            className="h-full overflow-y-auto overscroll-contain [scrollbar-color:#1A14A5_#EEF0FB] [scrollbar-width:thin]"
            tabIndex={0}
            aria-label={`Scrollable full-page screenshot of ${project.title}`}
          >
            {/* priority: this sits inside a scroll box, where lazy-loading can leave it blank */}
            <Image
              src={project.image}
              alt={`${project.title} full website screenshot`}
              width={project.imageWidth}
              height={project.imageHeight}
              priority
              sizes="(max-width: 1024px) 100vw, 900px"
              className="h-auto w-full"
            />
          </div>
        </MonitorFrame>

        {/* footer */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm">
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-semibold text-[#1A14A5] transition hover:bg-[#EEF0FB]"
          >
            Open live site <ExternalLink className="h-4 w-4" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          <Link
            href={getProjectPath(project)}
            className="inline-flex items-center rounded-full border border-white/30 px-5 py-2.5 font-semibold text-white transition hover:bg-white/10"
          >
            Case study
          </Link>
        </div>
      </div>
    </div>
  );
}

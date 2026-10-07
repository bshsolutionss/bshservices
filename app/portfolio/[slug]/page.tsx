import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Check } from "lucide-react";
import Breadcrumbs from "@/components/services/detail/Breadcrumbs";
import MonitorFrame from "@/components/portfolio/MonitorFrame";
import ProjectGrid from "@/components/portfolio/ProjectGrid";
import Contactform from "@/components/contactform";
import Image from "next/image";
import { safeJsonLd } from "@/lib/json-ld";
import {
  PORTFOLIO_PROJECTS,
  displayHost,
  getProject,
  getProjectPath,
  getRelatedProjects,
  projectJsonLd,
} from "@/lib/portfolio-data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return PORTFOLIO_PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  const title = `${project.title} — ${project.category} Case Study`;
  return {
    title,
    description: project.description,
    keywords: [project.title, project.category, ...project.keywords, "BSH Solutions portfolio"],
    alternates: { canonical: getProjectPath(project) },
    openGraph: {
      type: "article",
      title: `${title} | BSH Solutions`,
      description: project.description,
      url: getProjectPath(project),
      images: [{ url: project.image, alt: `${project.title} website screenshot` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | BSH Solutions`,
      description: project.description,
      images: [project.image],
    },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const related = getRelatedProjects(project.slug, 3);

  return (
    <div className="bg-[#F4F7FE]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(projectJsonLd(project)) }}
      />

      <div className="pt-20">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Portfolio", href: "/portfolio" },
            { label: project.title },
          ]}
        />
      </div>

      {/* Hero: title + facts, then the site on a computer screen */}
      <section className="px-4 pb-12 pt-6 sm:px-6 lg:px-12 lg:pb-16">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-[#1A14A5]">{project.category}</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-[#231F20] lg:text-6xl">
            {project.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#231F20]/70">{project.tagline}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1A14A5] px-6 py-3 font-semibold text-white shadow-md transition hover:bg-[#0e0a7a]"
            >
              Visit {displayHost(project.link)} <ArrowUpRight className="h-4 w-4" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>

          <div className="mt-10 lg:mt-14">
            <MonitorFrame className="max-w-4xl">
              <div
                tabIndex={0}
                aria-label={`Scrollable full-page screenshot of ${project.title}`}
                className="h-full overflow-y-auto overscroll-contain [scrollbar-color:#1A14A5_#EEF0FB] [scrollbar-width:thin]"
              >
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
            <p className="mt-3 text-center text-xs text-[#231F20]/50">Scroll inside the screen to see the whole page.</p>
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="px-4 pb-14 sm:px-6 lg:px-12 lg:pb-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-14">
          <div>
            <h2 className="text-2xl font-bold text-[#231F20] sm:text-3xl">Project overview</h2>
            <div className="mt-4 space-y-4 text-base leading-relaxed text-[#231F20]/75">
              {project.overview.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>

            <h2 className="mt-10 text-2xl font-bold text-[#231F20] sm:text-3xl">Highlights</h2>
            <ul className="mt-4 space-y-3">
              {project.highlights.map((h) => (
                <li key={h} className="flex items-start gap-3 text-[#231F20]/80">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#1A14A5] text-white">
                    <Check className="h-3 w-3" aria-hidden="true" />
                  </span>
                  {h}
                </li>
              ))}
            </ul>

            {project.metrics && project.metrics.length > 0 && (
              <>
                <h2 className="mt-10 text-2xl font-bold text-[#231F20] sm:text-3xl">Results</h2>
                <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {project.metrics.map((m) => (
                    <div key={m.label} className="rounded-2xl border border-[#1A14A5]/10 bg-white p-4">
                      <dt className="text-xs text-[#231F20]/60">{m.label}</dt>
                      <dd className="mt-1 text-2xl font-bold text-[#1A14A5]">{m.value}</dd>
                    </div>
                  ))}
                </dl>
              </>
            )}
          </div>

          <aside className="h-fit rounded-3xl border border-[#1A14A5]/10 bg-white p-6 shadow-sm lg:sticky lg:top-28">
            <h2 className="text-lg font-bold text-[#231F20]">Project details</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-wider text-[#231F20]/50">Industry</dt>
                <dd className="mt-1 font-medium text-[#231F20]">{project.industry}</dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-wider text-[#231F20]/50">Type</dt>
                <dd className="mt-1 font-medium text-[#231F20]">{project.category}</dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-wider text-[#231F20]/50">What we delivered</dt>
                <dd className="mt-2 flex flex-wrap gap-1.5">
                  {project.services.map((s) => (
                    <span key={s} className="rounded-md border border-[#1A14A5]/10 bg-[#F4F7FE] px-2 py-1 text-xs text-[#231F20]/80">
                      {s}
                    </span>
                  ))}
                </dd>
              </div>
              {project.tech && project.tech.length > 0 && (
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-wider text-[#231F20]/50">Built with</dt>
                  <dd className="mt-2 flex flex-wrap gap-1.5">
                    {project.tech.map((t) => (
                      <span key={t} className="rounded-md border border-[#1A14A5]/10 bg-[#F4F7FE] px-2 py-1 text-xs text-[#231F20]/80">
                        {t}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-wider text-[#231F20]/50">Live site</dt>
                <dd className="mt-1">
                  <a href={project.link} target="_blank" rel="noopener noreferrer" className="font-medium text-[#1A14A5] hover:underline">
                    {displayHost(project.link)}
                  </a>
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      {/* More projects */}
      <section className="px-4 pb-16 sm:px-6 lg:px-12 lg:pb-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-6 text-2xl font-bold text-[#231F20] sm:text-3xl">More projects</h2>
          <ProjectGrid projects={related} />
          <div className="mt-8 text-center">
            <Link href="/portfolio" className="font-semibold text-[#1A14A5] hover:underline">
              View the full portfolio →
            </Link>
          </div>
        </div>
      </section>

      <Contactform />
    </div>
  );
}

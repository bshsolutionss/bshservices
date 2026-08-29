"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Eye, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PortfolioProject {
  title: string;
  image: string;
  category: string;
  link: string;
  views: string;
  likes: string;
}

// Real, live client projects only.
export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    title: "Migration Republic",
    image: "/portfolio/migrationrepublic.webp",
    category: "Web Development",
    link: "https://migrationrepublic.com.au",
    views: "3.2K",
    likes: "540",
  },
  {
    title: "Migration Factor",
    image: "/portfolio/migrationfactor.webp",
    category: "Branding & Web",
    link: "https://migrationfactor.com.au",
    views: "2.1K",
    likes: "312",
  },
  {
    title: "Aisha Academy",
    image: "/portfolio/aishaacademy.webp",
    category: "EdTech Solution",
    link: "https://aisha-academy.com/",
    views: "1.9K",
    likes: "280",
  },
  {
    title: "Silwalo",
    image: "/portfolio/silwalo.webp",
    category: "eCommerce",
    link: "https://silwalo.com",
    views: "4.4K",
    likes: "761",
  },
  {
    title: "Admin Dashboard",
    image: "/portfolio/admindashboard.webp",
    category: "Custom Software",
    link: "https://home-decor-admins.vercel.app/",
    views: "1.2K",
    likes: "190",
  },
  {
    title: "Almacca",
    image: "/portfolio/almacca.webp",
    category: "Web Development",
    link: "https://almacca.com/",
    views: "980",
    likes: "120",
  },
  {
    title: "Golden Shiruh LLC",
    image: "/portfolio/migrationrepublic.webp",
    category: "Agency Website",
    link: "https://goldenshiruhllc.com/",
    views: "1.7K",
    likes: "260",
  },
  {
    title: "ANH Supplies",
    image: "/portfolio/anhsupplies.webp",
    category: "eCommerce",
    link: "https://anhsupplies.com/",
    views: "2.8K",
    likes: "420",
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
    <section id="portfolio" className={cn("py-20 px-6 lg:px-12 bg-[#F4F7FE]", className)}>
      <div className="max-w-7xl mx-auto">
        {showHeading && (
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="max-w-2xl"
            >
              <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-[#1A14A5]">
                Our <span className="text-[#231F20]">Portfolio</span>
              </h2>
              <p className="text-[#231F20]/70 text-lg mt-4 leading-relaxed">
                Real live websites, dashboards, SaaS platforms, and scalable digital
                experiences crafted for our clients worldwide.
              </p>
            </motion.div>

            {showViewAll && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <Button
                  asChild
                  className="bg-[#1A14A5] hover:bg-[#0e0a7a] text-white rounded-full px-8 py-6 h-auto font-bold gap-2"
                >
                  <Link href="/portfolio">
                    View Full Portfolio <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </motion.div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: (index % 6) * 0.05 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="rounded-3xl overflow-hidden border border-[#1A14A5]/10 bg-white hover:border-[#1A14A5]/30 transition-all duration-300 hover:-translate-y-2 shadow-sm hover:shadow-xl">
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative overflow-hidden"
                >
                  <div className="relative h-[240px] md:h-[260px] w-full bg-[#F4F7FE] overflow-hidden">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover object-top transition-all duration-[5000ms] ease-in-out group-hover:object-bottom"
                    />
                  </div>
                  <div className="absolute inset-0 bg-[#1A14A5]/0 group-hover:bg-[#1A14A5]/20 transition-all duration-500 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-all duration-500 bg-[#1A14A5] text-white px-6 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase shadow-lg translate-y-4 group-hover:translate-y-0">
                      View Live Site
                    </span>
                  </div>
                </a>

                <div className="p-6">
                  <span className="text-[10px] uppercase tracking-[3px] font-bold text-[#1A14A5]">
                    {project.category}
                  </span>
                  <div className="flex items-start justify-between gap-4 mt-2">
                    <h3 className="text-xl font-bold leading-snug text-[#231F20]">
                      {project.title}
                    </h3>
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-[#1A14A5]/5 hover:bg-[#1A14A5] flex items-center justify-center transition group/icon shrink-0"
                    >
                      <ExternalLink className="w-4 h-4 text-[#1A14A5] group-hover/icon:text-white transition" />
                    </a>
                  </div>
                  <div className="flex items-center gap-5 mt-4 text-sm text-[#231F20]/60 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-[#1A14A5]" />
                      {project.views}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-[#1A14A5]" />
                      {project.likes}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default OurPortfolio;

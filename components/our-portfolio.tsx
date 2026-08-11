"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ExternalLink,
  Eye,
  X,
  Code2,
  Palette,
  Megaphone,
  Smartphone,
  Camera,
  Layers,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Project {
  id: string;
  title: string;
  category: "web" | "uiux" | "marketing" | "mobile" | "photography";
  categoryName: string;
  description: string;
  fullDescription: string;
  image: string;
  tags: string[];
  client: string;
  year: string;
  metrics?: string;
  liveUrl?: string;
}

const PROJECTS: Project[] = [
  {
    id: "proj-1",
    title: "Apex E-Commerce Ecosystem",
    category: "web",
    categoryName: "Web Development",
    description:
      "High-performance online shopping platform with instant checkout & AI recommendations.",
    fullDescription:
      "Engineered a scalable, headless e-commerce store built with Next.js 14, Tailwind CSS, and Stripe integration. Enhanced load speeds by 65% and increased cart conversion rates significantly.",
    image:
      "https://images.unsplash.com/photo-1556742049-0a6754099a6d?q=80&w=1200&auto=format&fit=crop",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "Stripe"],
    client: "Apex Retail Group",
    year: "2024",
    metrics: "+140% Online Sales Growth",
    liveUrl: "https://example.com",
  },
  {
    id: "proj-2",
    title: "Nova Fintech Mobile Wallet",
    category: "mobile",
    categoryName: "Mobile Apps",
    description:
      "Secure, intuitive mobile banking app with biometric authentication & instant transfers.",
    fullDescription:
      "Designed and developed a cross-platform mobile application for modern digital banking. Features end-to-end encryption, multi-currency support, and real-time expense tracking.",
    image:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1200&auto=format&fit=crop",
    tags: ["React Native", "Node.js", "Figma", "Redux"],
    client: "Nova Financial Technologies",
    year: "2024",
    metrics: "500k+ Active Downloads",
    liveUrl: "https://example.com",
  },
  {
    id: "proj-3",
    title: "Lumina Brand Identity & UI System",
    category: "uiux",
    categoryName: "UI/UX Design",
    description:
      "Complete visual redesign and design system for a global SaaS enterprise.",
    fullDescription:
      "Crafted a cohesive visual design system including typography, color palettes, component library, and brand guidelines to streamline product design across desktop & web interfaces.",
    image:
      "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?q=80&w=1200&auto=format&fit=crop",
    tags: ["UI/UX", "Figma", "Design System", "Branding"],
    client: "Lumina SaaS Corp",
    year: "2023",
    metrics: "100% Brand Consistency",
    liveUrl: "https://example.com",
  },
  {
    id: "proj-4",
    title: "OmniGrowth Digital Marketing Campaign",
    category: "marketing",
    categoryName: "Marketing",
    description:
      "Multi-channel PPC & SEO growth strategy driving massive lead expansion.",
    fullDescription:
      "Executed targeted social media ad campaigns, SEO content clusters, and email automation flows. Scaled monthly organic traffic and lowered customer acquisition cost by 40%.",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop",
    tags: ["SEO", "Google Ads", "Content Strategy", "Analytics"],
    client: "OmniGrowth Global",
    year: "2024",
    metrics: "3.2x ROI on Paid Ads",
    liveUrl: "https://example.com",
  },
  {
    id: "proj-5",
    title: "Velox Commercial Photography",
    category: "photography",
    categoryName: "Photography",
    description:
      "High-definition product studio shoot & 4K brand promotional videos.",
    fullDescription:
      "Produced cinematic commercial imagery and video assets for product launch campaigns, digital billboards, and luxury print catalogs.",
    image:
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1200&auto=format&fit=crop",
    tags: ["Studio Shoot", "Lighting", "Color Grading", "Video"],
    client: "Velox Automotive",
    year: "2023",
    metrics: "Featured in Top Tech Publications",
    liveUrl: "https://example.com",
  },
  {
    id: "proj-6",
    title: "Pulse Health & Fitness App",
    category: "mobile",
    categoryName: "Mobile Apps",
    description:
      "AI-driven wellness tracker with wearable sync and custom workout plans.",
    fullDescription:
      "Built an iOS and Android fitness tracker featuring real-time health metrics integration, social workout sharing, and customized AI meal planning.",
    image:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop",
    tags: ["Flutter", "GraphQL", "HealthKit", "Firebase"],
    client: "Pulse Wearables",
    year: "2024",
    metrics: "4.9 Stars Rating",
    liveUrl: "https://example.com",
  },
];

const CATEGORIES = [
  { id: "all", label: "All Projects", icon: Layers },
  { id: "web", label: "Web Dev", icon: Code2 },
  { id: "uiux", label: "UI/UX Design", icon: Palette },
  { id: "marketing", label: "Marketing", icon: Megaphone },
  { id: "mobile", label: "Mobile Apps", icon: Smartphone },
  { id: "photography", label: "Photography", icon: Camera },
];

interface OurPortfolioProps {
  limit?: number;
  showViewAll?: boolean;
}

export function OurPortfolio({ limit, showViewAll = false }: OurPortfolioProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filteredProjects =
    activeCategory === "all"
      ? PROJECTS
      : PROJECTS.filter((p) => p.category === activeCategory);

  const displayedProjects = limit ? filteredProjects.slice(0, limit) : filteredProjects;

  return (
    <section id="portfolio" className="relative py-20 px-6 lg:px-16 bg-[#F4F7FE] overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* ====== Section Heading ====== */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-xs font-bold tracking-wider text-[#1A14A5] uppercase bg-[#1A14A5]/10 rounded-full">
            Featured Work & Case Studies
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-[#1A14A5] drop-shadow-sm">
            Our <span className="text-[#231F20]">Portfolio</span>
          </h2>
          <p className="mt-4 text-lg text-[#231F20]/80 max-w-2xl mx-auto">
            Explore our showcase of digital solutions designed and delivered with precision,
            creativity, and cutting-edge technology.
          </p>
        </motion.div>

        {/* ====== Filter Tabs ====== */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-10 flex gap-3 flex-wrap justify-center"
        >
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-[#1A14A5] text-white shadow-lg shadow-[#1A14A5]/30 scale-105"
                    : "bg-white text-[#231F20] hover:bg-white/80 shadow-sm"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* ====== Projects Grid ====== */}
        <motion.div
          layout
          className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {displayedProjects.map((project, idx) => (
              <motion.div
                layout
                key={project.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col border border-gray-100"
              >
                {/* Image Container */}
                <div className="relative h-64 w-full overflow-hidden bg-gray-100">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                  
                  {/* Category Pill */}
                  <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-[#1A14A5] text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm">
                    {project.categoryName}
                  </span>

                  {/* Quick Action Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
                    <button
                      onClick={() => setSelectedProject(project)}
                      className="p-3 bg-white text-[#1A14A5] rounded-full shadow-lg hover:bg-[#1A14A5] hover:text-white transition-colors duration-300 flex items-center gap-2 px-4 text-xs font-bold"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="text-xl font-extrabold text-[#231F20] group-hover:text-[#1A14A5] transition-colors duration-300">
                      {project.title}
                    </h3>
                    <p className="mt-2 text-sm text-[#231F20]/75 line-clamp-2">
                      {project.description}
                    </p>
                  </div>

                  {/* Tags & Footer */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-[#F4F7FE] text-[#231F20]/70 text-[11px] font-medium px-2.5 py-1 rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => setSelectedProject(project)}
                      className="w-full flex items-center justify-between text-sm font-bold text-[#1A14A5] hover:text-[#0e0a7a] transition-colors"
                    >
                      <span>Explore Case Study</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* ====== View All Button (for Home Page) ====== */}
        {showViewAll && (
          <div className="mt-14 text-center">
            <Button
              asChild
              size="lg"
              className="bg-[#1A14A5] hover:bg-[#0e0a7a] text-white px-8 py-6 rounded-2xl shadow-lg hover:shadow-xl font-bold transition-all text-base"
            >
              <Link href="/portfolio" className="inline-flex items-center gap-2">
                <span>View Full Portfolio</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* ====== Project Details Modal ====== */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl z-10 p-6 sm:p-8"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-[#1A14A5] hover:text-white transition-colors z-20"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Banner */}
              <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden mb-6">
                <img
                  src={selectedProject.image}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-4 left-4 bg-[#1A14A5] text-white text-xs font-bold px-3.5 py-1.5 rounded-full">
                  {selectedProject.categoryName}
                </span>
              </div>

              {/* Modal Body */}
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#231F20]">
                  {selectedProject.title}
                </h3>

                {/* Metadata Row */}
                <div className="flex flex-wrap gap-4 mt-4 py-3 border-y border-gray-100 text-xs sm:text-sm text-gray-600">
                  <div>
                    <span className="font-semibold text-[#231F20]">Client: </span>
                    {selectedProject.client}
                  </div>
                  <div>
                    <span className="font-semibold text-[#231F20]">Year: </span>
                    {selectedProject.year}
                  </div>
                  {selectedProject.metrics && (
                    <div className="flex items-center gap-1 text-[#1A14A5] font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      {selectedProject.metrics}
                    </div>
                  )}
                </div>

                <p className="mt-4 text-gray-700 text-sm sm:text-base leading-relaxed">
                  {selectedProject.fullDescription}
                </p>

                {/* Tech Stack */}
                <div className="mt-6">
                  <h4 className="text-xs font-bold text-[#231F20] uppercase tracking-wider mb-2">
                    Technologies Used
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-[#F4F7FE] text-[#1A14A5] text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#1A14A5]/10"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="mt-8 flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedProject(null)}
                    className="rounded-xl border-gray-300"
                  >
                    Close
                  </Button>
                  {selectedProject.liveUrl && (
                    <Button
                      asChild
                      className="bg-[#1A14A5] hover:bg-[#0e0a7a] text-white rounded-xl"
                    >
                      <a
                        href={selectedProject.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2"
                      >
                        <span>Visit Project</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default OurPortfolio;

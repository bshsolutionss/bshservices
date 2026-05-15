"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ExternalLink, ChevronLeft, Eye, Heart } from "lucide-react";
import Link from "next/link";
import Contactform from "@/components/contactform";

const PROJECTS = [
  {
    title: "Migration Republic",
    image: "/portfolio/migrationrepublic.png",
    category: "Web Development",
    link: "https://migrationrepublic.com.au",
    views: "3.2K",
    likes: "540",
  },
  {
    title: "Migration Factor",
    image: "/portfolio/migrationfactor.png",
    category: "Branding & Web",
    link: "https://migrationfactor.com.au",
    views: "2.1K",
    likes: "312",
  },
  {
    title: "Aisha Academy",
    image: "/portfolio/aishaacademy.png",
    category: "EdTech Solution",
    link: "https://aisha-academy.com/",
    views: "1.9K",
    likes: "280",
  },
  {
    title: "Silwalo",
    image: "/portfolio/silwalo.png",
    category: "eCommerce",
    link: "https://silwalo.com",
    views: "4.4K",
    likes: "761",
  },
  {
    title: "Admin Dashboard",
    image: "/portfolio/admindashboard.png",
    category: "Custom Software",
    link: "https://home-decor-admins.vercel.app/",
    views: "1.2K",
    likes: "190",
  },
  {
    title: "Almacca",
    image: "/portfolio/almacca.png",
    category: "Web Development",
    link: "https://almacca.com/",
    views: "980",
    likes: "120",
  },
  {
    title: "Golden Shiruh LLC",
    image: "/portfolio/goldenshiruhllc.png",
    category: "Agency Website",
    link: "https://goldenshiruhllc.com/",
    views: "1.7K",
    likes: "260",
  },
  {
    title: "ANH Supplies",
    image: "/portfolio/anhsupplies.png",
    category: "eCommerce",
    link: "https://anhsupplies.com/",
    views: "2.8K",
    likes: "420",
  },
];

export default function PortfolioPage() {
  return (
    <main className="bg-[#F4F7FE] min-h-screen text-[#231F20]">
      {/* HERO */}
      <section className="px-6 lg:px-12 pt-32 pb-16 border-b border-[#1A14A5]/10">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#1A14A5]/60 hover:text-[#1A14A5] transition mb-8 font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl lg:text-7xl font-extrabold tracking-tight text-[#1A14A5]"
          >
            Our Portfolio
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[#231F20]/70 text-lg mt-6 max-w-2xl leading-relaxed"
          >
            Modern websites, dashboards, SaaS platforms, and scalable digital
            experiences crafted for ambitious brands.
          </motion.p>
        </div>
      </section>

      {/* GRID */}
      <section className="px-6 lg:px-12 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {PROJECTS.map((project, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="group"
              >
                {/* CARD */}
                <div className="rounded-3xl overflow-hidden border border-[#1A14A5]/10 bg-white/70 backdrop-blur-md hover:border-[#1A14A5]/30 transition-all duration-300 hover:-translate-y-2 shadow-sm hover:shadow-xl">
                  {/* IMAGE */}
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
                        priority
                        className="object-cover object-top transition-all duration-[5000ms] ease-in-out group-hover:object-bottom"
                      />
                    </div>

                    {/* Overlay with View Project text */}
                    <div className="absolute inset-0 bg-[#1A14A5]/0 group-hover:bg-[#1A14A5]/20 transition-all duration-500 flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-all duration-500 bg-[#1A14A5] text-white px-6 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase shadow-lg translate-y-4 group-hover:translate-y-0">
                        View Project
                      </span>
                    </div>
                  </a>

                  {/* CONTENT */}
                  <div className="p-6">
                    {/* Category */}
                    <span className="text-[10px] uppercase tracking-[3px] font-bold text-[#1A14A5]/50">
                      {project.category}
                    </span>

                    {/* Title */}
                    <div className="flex items-start justify-between gap-4 mt-2">
                      <h2 className="text-xl font-bold leading-snug text-[#231F20]">
                        {project.title}
                      </h2>

                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-[#1A14A5]/5 hover:bg-[#1A14A5] flex items-center justify-center transition group/icon"
                      >
                        <ExternalLink className="w-4 h-4 text-[#1A14A5] group-hover/icon:text-white transition" />
                      </a>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-5 mt-5 text-sm text-[#231F20]/50 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-[#1A14A5]/40" />
                        {project.views}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Heart className="w-4 h-4 text-[#1A14A5]/40" />
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

      {/* CONTACT */}
      <section className="bg-white/50 border-t border-[#1A14A5]/10 py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <Contactform />
        </div>
      </section>
    </main>
  );
}

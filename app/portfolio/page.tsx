"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ExternalLink, ChevronLeft } from "lucide-react";
import Link from "next/link";
import Contactform from "@/components/contactform";

const PROJECTS = [
  {
    title: "Migration Republic",
    image: "/portfolio/migrationrepublic.png",
    description: "A comprehensive platform for migration and visa services, featuring automated assessment tools and client portals.",
    category: "Web Development",
    link: "https://migrationrepublic.com.au",
  },
  {
    title: "Migration Factor",
    image: "/portfolio/migrationfactor.png",
    description: "Professional consultancy website designed for high conversions and authority in the immigration sector.",
    category: "Branding & Web",
    link: "https://migrationfactor.com.au",
  },
  {
    title: "Aisha Academy",
    image: "/portfolio/aishaacademy.png",
    description: "An advanced Learning Management System (LMS) providing educational resources and course tracking.",
    category: "EdTech Solution",
    link: "https://aishaacademy.com",
  },
  {
    title: "Silwalo",
    image: "/portfolio/silwalo.png",
    description: "Luxury fashion and custom tailoring eCommerce experience with high-end visual storytelling.",
    category: "eCommerce",
    link: "https://silwalo.com",
  },
  {
    title: "Admin Dashboard",
    image: "/portfolio/admindashboard.png",
    description: "Internal CRM and project management system designed for operational efficiency and data visualization.",
    category: "Custom Software",
    link: "#",
  },
];

export default function PortfolioPage() {
  return (
    <main className="bg-white">
      {/* ====== Hero Section ====== */}
      <section className="relative pt-32 pb-20 px-6 lg:px-16 bg-[#1A14A5] text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
          <svg viewBox="0 0 400 400" className="w-full h-full">
            <path d="M0,200 Q100,100 200,200 T400,200" fill="none" stroke="white" strokeWidth="2" />
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </Link>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl lg:text-7xl font-extrabold mb-6"
          >
            Our Work
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/80 max-w-2xl"
          >
            Explore our collection of successful projects where innovation meets design. We help brands scale through technical excellence.
          </motion.p>
        </div>
      </section>

      {/* ====== Project List ====== */}
      <section className="py-24 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto space-y-32">
          {PROJECTS.map((project, index) => (
            <motion.div 
              key={project.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 lg:gap-20 items-center`}
            >
              {/* Image Column */}
              <div className="w-full lg:w-3/5">
                <div className="relative overflow-hidden rounded-3xl shadow-2xl group bg-[#f8f9fa] border border-gray-100">
                  <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/12]">
                    <Image 
                      src={project.image} 
                      alt={project.title}
                      fill
                      className="object-contain p-4 transition-transform duration-1000 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-all duration-500 pointer-events-none" />
                </div>
              </div>

              {/* Text Column */}
              <div className="w-full lg:w-2/5">
                <span className="text-[#1A14A5] font-bold tracking-widest text-sm uppercase mb-4 block">
                  {project.category}
                </span>
                <h2 className="text-4xl font-extrabold text-[#231F20] mb-6">
                  {project.title}
                </h2>
                <p className="text-lg text-[#231F20]/70 mb-8 leading-relaxed">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-4">
                  <a 
                    href={project.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-[#1A14A5] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#231F20] transition-all flex items-center gap-2"
                  >
                    Visit Website <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ====== CTA Section ====== */}
      <div className="bg-[#F4F7FE] py-20">
         <Contactform />
      </div>
    </main>
  );
}

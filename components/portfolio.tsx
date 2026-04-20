"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const PROJECTS = [
  {
    title: "Migration Republic",
    image: "/portfolio/migrationrepublic.png",
    description: "Full-scale migration services platform.",
    link: "https://migrationrepublic.com.au",
  },
  {
    title: "Migration Factor",
    image: "/portfolio/migrationfactor.png",
    description: "Expert visa and immigration consultancy.",
    link: "https://migrationfactor.com.au",
  },
  {
    title: "Aisha Academy",
    image: "/portfolio/aishaacademy.png",
    description: "Online education and learning management system.",
    link: "https://aishaacademy.com",
  },
  {
    title: "Silwalo",
    image: "/portfolio/silwalo.png",
    description: "Premium fashion and tailoring services.",
    link: "https://silwalo.com",
  },
  {
    title: "Admin Dashboard",
    image: "/portfolio/admindashboard.png",
    description: "Advanced analytics and management CRM.",
    link: "#",
  },
];

const Portfolio = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const router = useRouter();

  return (
    <section id="portfolio" className="py-24 px-6 lg:px-16 bg-[#f8f9fa]">
      <div className="max-w-7xl mx-auto">
        {/* ====== Heading ====== */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <h2 className="text-4xl lg:text-5xl font-extrabold text-[#1A14A5] mb-4">
              Featured <span className="text-[#231F20]">Portfolio</span>
            </h2>
            <p className="text-lg text-[#231F20]/70">
              A glimpse into the digital experiences we&apos;ve crafted for our global clients. From complex CRMs to high-converting eCommerce stores.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <Button 
              variant="outline" 
              className="border-[#1A14A5] text-[#1A14A5] hover:bg-[#1A14A5] hover:text-white rounded-xl px-8 py-6 h-auto font-bold flex gap-2 items-center"
              onClick={() => router.push("/portfolio")}
            >
              View Full Portfolio <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>

        {/* ====== Project Grid ====== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PROJECTS.slice(0, 6).map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="group relative h-[400px] rounded-3xl overflow-hidden shadow-lg bg-[#f8f9fa] border border-gray-100"
            >
              <Image
                src={project.image}
                alt={project.title}
                fill
                className="object-contain p-4 transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A14A5] via-[#1A14A5]/60 to-transparent opacity-0 group-hover:opacity-90 transition-all duration-500" />
              
              {/* Content */}
              <div className="absolute inset-x-0 bottom-0 p-8 transform translate-y-10 group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="text-2xl font-bold text-white mb-2">{project.title}</h3>
                <p className="text-white/80 text-sm mb-6 line-clamp-2">
                  {project.description}
                </p>
                <div className="flex gap-4">
                   <a 
                    href={project.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-white text-[#1A14A5] px-4 py-2 rounded-xl text-sm font-bold hover:bg-opacity-90 transition-all"
                   >
                     Live Site <ExternalLink className="w-3 h-3" />
                   </a>
                </div>
              </div>

              {/* Index Number */}
              <div className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-bold text-sm">
                {String(index + 1).padStart(2, '0')}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;

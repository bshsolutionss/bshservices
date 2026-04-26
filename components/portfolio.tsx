"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Heart, ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const PROJECTS = [
  {
    title: "Migration Republic - Full-scale platform",
    image: "/portfolio/migrationrepublic.png",
    author: "Migration Republic",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    views: "12.5K",
    likes: "1.9K",
    link: "https://migrationrepublic.com.au",
  },
  {
    title: "Migration Factor - Visa consultancy",
    image: "/portfolio/migrationfactor.png",
    author: "Migration Factor",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    views: "8.2K",
    likes: "940",
    link: "https://migrationfactor.com.au",
  },
  {
    title: "Aisha Academy - LMS Platform",
    image: "/portfolio/aishaacademy.png",
    author: "Aisha Academy",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mimi",
    views: "15.1K",
    likes: "2.3K",
    link: "https://aishaacademy.com",
  },
  {
    title: "Silwalo - Premium tailoring services",
    image: "/portfolio/silwalo.png",
    author: "Silwalo",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack",
    views: "5.4K",
    likes: "420",
    link: "https://silwalo.com",
  },
  {
    title: "Admin Dashboard - Analytics CRM",
    image: "/portfolio/admindashboard.png",
    author: "Admin Dashboard",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jocelyn",
    views: "19.2K",
    likes: "1.7K",
    link: "#",
  },
  {
    title: "Brillance SaaS Landing Page",
    image: "/portfolio/migrationrepublic.png", // fallback placeholder to keep a balanced 3-column grid
    author: "Brillance",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=George",
    views: "12.5K",
    likes: "1.9K",
    link: "#",
  }
];

const Portfolio = () => {
  const router = useRouter();

  return (
    <section id="portfolio" className="py-24 px-6 lg:px-16 bg-[#0a0a0a]">
      <div className="max-w-[1400px] mx-auto">
        {/* ====== Heading ====== */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-4">
              Featured <span className="text-gray-500">Portfolio</span>
            </h2>
            <p className="text-lg text-gray-400">
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
              className="border-white text-white bg-transparent hover:bg-white hover:text-black rounded-full px-8 py-6 h-auto font-bold flex gap-2 items-center transition-all"
              onClick={() => router.push("/portfolio")}
            >
              View Full Portfolio <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>

        {/* ====== Project Grid ====== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {PROJECTS.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group cursor-pointer flex flex-col gap-4"
              onClick={() => window.open(project.link, "_blank")}
            >
              {/* Image Container */}
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#1a1a1a]">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              
              {/* Info Container */}
              <div className="flex items-start gap-3 px-1">
                {/* Avatar */}
                <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 mt-0.5 bg-gray-800">
                  <Image
                    src={project.avatar}
                    alt={project.author}
                    fill
                    className="object-cover"
                  />
                </div>
                
                {/* Text & Stats */}
                <div className="flex flex-col overflow-hidden w-full">
                  <h3 className="text-[15px] font-semibold text-white truncate group-hover:text-gray-300 transition-colors">
                    {project.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-[13px] text-gray-400 font-medium">
                    <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                      <Users className="w-4 h-4" />
                      {project.views}
                    </span>
                    <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                      <Heart className="w-4 h-4" />
                      {project.likes}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;

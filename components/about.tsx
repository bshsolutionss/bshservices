"use client";

import React from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

// three.js is ~hundreds of KB — load it client-side only, after first paint.
const BshHub3D = dynamic(() => import("@/components/BshHub3D"), {
  ssr: false,
  loading: () => <div className="aspect-square w-full" aria-hidden="true" />,
});

const About = () => {
  return (
    <section
      id="about"
      className="relative py-16 px-6 sm:px-8 lg:px-16 bg-[#F4F7FE] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Brand Image */}
        <motion.div
          initial={{ opacity: 0, x: -100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="flex justify-center"
        >
          <div className="relative w-[320px] sm:w-[420px] md:w-[480px] lg:w-[500px]">
            <BshHub3D />
          </div>
        </motion.div>

        {/* Right Side - Content */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="space-y-6 text-center lg:text-left"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1A14A5] drop-shadow-sm">
            About <span className="text-[#231F20]">BSH Solutions</span>
          </h2>

          <p className="text-base sm:text-lg text-[#231F20]/80 leading-relaxed">
            <strong>
              Business Smart Hub – A hub for all business tech needs.
            </strong>{" "}
            At BSH Solutions, we aim to be the ultimate technology partner for
            businesses, providing everything from{" "}
            <span className="font-semibold">design and marketing</span> to{" "}
            <span className="font-semibold">
              software, AI, and hardware solutions
            </span>
            . Our mission is to help businesses of all sizes{" "}
            <span className="text-[#1A14A5] font-bold">
              transform, scale, and thrive
            </span>{" "}
            in the digital age with complete, innovative, and future-ready
            solutions.
          </p>

          {/* Explanation Boxes */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {[
              {
                title: "Business",
                text: "Focused on empowering startups, enterprises, and businesses to grow, scale, and compete in a digital-first world.",
              },
              {
                title: "Smart",
                text: "Represents innovation, intelligence, and efficiency with data-driven, AI-powered, and future-proof solutions.",
              },
              {
                title: "Hub",
                text: "A one-stop destination for branding, marketing, web & app development, AI, and hardware solutions.",
              },
            ].map((box, index) => (
              <div
                key={index}
                className="p-6 bg-white/60 backdrop-blur-lg rounded-2xl shadow-md hover:shadow-xl transition"
              >
                <h3 className="text-xl font-bold text-[#1A14A5]">
                  {box.title}
                </h3>
                <p className="mt-2 text-sm text-[#231F20]/80">{box.text}</p>
              </div>
            ))}
          </div>

          {/* Brand Positioning */}
          <blockquote className="mt-8 italic text-base sm:text-lg text-[#231F20] bg-[#1A14A5]/10 p-6 rounded-2xl shadow-md border-l-4 border-[#1A14A5]">
            “BSH – Business Smart Hub is your one-stop technology partner,
            helping physical and digital businesses transform, innovate, and
            thrive through smart, scalable, and future-ready solutions.”
          </blockquote>
        </motion.div>
      </div>
    </section>
  );
};

export default About;

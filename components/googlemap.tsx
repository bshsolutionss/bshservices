"use client";

import React from "react";
import { motion } from "framer-motion";

const GoogleMap = () => {
  return (
    <section className="py-20 px-6 lg:px-20 bg-[#F4F7FE]">
      <div className="max-w-6xl mx-auto">

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold text-gray-900 text-center"
        >
          Our Location
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-3 text-gray-600 text-center"
        >
          Visit BSH Solutions — Your trusted partner in digital innovation.
        </motion.p>

        {/* Map Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="
            mt-12 bg-white/50 backdrop-blur-xl rounded-3xl shadow-2xl 
            border border-white/20 relative overflow-hidden
            hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)]
            transition-all duration-500
          "
        >
          {/* Gradient Border (premium effect) */}
          <div className="absolute inset-0 rounded-3xl p-[2px] bg-gradient-to-r from-[#1A14A5] to-[#6D5DFB] opacity-20 pointer-events-none" />

          {/* Map */}
          <div className="relative w-full h-[350px] md:h-[450px] rounded-3xl overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3451795.9819468017!2d58.3669866!3d29.9322565!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x254f24b2eba7e175%3A0x7f929dca204ffe3b!2sBSH%20Solutions!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen={true}
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GoogleMap;

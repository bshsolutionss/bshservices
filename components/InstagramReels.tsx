"use client";

import React from "react";
import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import Script from "next/script";

const InstagramReels = () => {
  return (
    <section className="py-20 px-6 lg:px-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Elfsight Instagram Feed Widget */}
        <div className="relative min-h-[400px] flex justify-center items-center">
          <Script
            src="https://elfsightcdn.com/platform.js"
            strategy="lazyOnload"
          />
          <div
            className="elfsight-app-39e99bfb-93b7-4770-ac6b-48f81273c307 w-full mx-auto"
            data-elfsight-app-lazy
          ></div>
        </div>
      </div>
    </section>
  );
};

export default InstagramReels;

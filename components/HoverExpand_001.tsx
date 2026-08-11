"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import "swiper/css";
import "swiper/css/effect-creative";
import "swiper/css/pagination";
import "swiper/css/autoplay";

import { cn } from "@/lib/utils";
import Image from "next/image";

const Skiper52 = () => {
 const images = [
    {
      src: "https://i.pinimg.com/1200x/b5/f4/8e/b5f48ea8142b932cd58ad9ff8833fc16.jpg",
      alt: "Description 1",
      code: "# 01",
    },
    {
      src: "https://i.pinimg.com/736x/2b/d1/f4/2bd1f4cfc69c7cbdd7e438409eb97a8c.jpg",
      alt: "Description 2",
      code: "# 02",
    },
    {
      src: "https://i.pinimg.com/1200x/24/0c/e0/240ce0b9581a246b5b2780002a95f4a4.jpg",
      alt: "Description 3",
      code: "# 03",
    },
    {
      src: "https://i.pinimg.com/736x/65/1c/e4/651ce47c0e0dc7e15cf727244315f935.jpg",
      alt: "Description 4",
      code: "# 04",
    },
    {
      src: "https://i.pinimg.com/1200x/b5/f4/8e/b5f48ea8142b932cd58ad9ff8833fc16.jpg",
      alt: "Description 1",
      code: "# 01",
    },
    {
      src: "https://i.pinimg.com/736x/2b/d1/f4/2bd1f4cfc69c7cbdd7e438409eb97a8c.jpg",
      alt: "Description 2",
      code: "# 02",
    },
    {
      src: "https://i.pinimg.com/1200x/24/0c/e0/240ce0b9581a246b5b2780002a95f4a4.jpg",
      alt: "Description 3",
      code: "# 03",
    },
    {
      src: "https://i.pinimg.com/736x/65/1c/e4/651ce47c0e0dc7e15cf727244315f935.jpg",
      alt: "Description 4",
      code: "# 04",
    },
    

  ];

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden bg-[#f5f4f3]">
      <HoverExpand_001 className="" images={images} />{" "}
    </div>
    
  );
};

export { Skiper52 };

const HoverExpand_001 = ({
  images,
  className,
}: {
  images: { src: string; alt: string; code: string }[];
  className?: string;
}) => {
  const [activeImage, setActiveImage] = useState<number | null>(1);

  return (
   <motion.div
      initial={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        duration: 0.3,
        delay: 0.5,
      }}
      className={cn(
        "relative w-full max-w-7xl px-5 sm:px-8 md:px-10 mx-auto",
        className
      )}
    >
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <div className="flex w-full items-center justify-center gap-2 sm:gap-3 md:gap-4">
          {images.map((image, index) => (
            <motion.div
              key={index}
              className="relative cursor-pointer overflow-hidden rounded-3xl shadow-md"
              initial={{ width: "3rem", height: "18rem" }}
              animate={{
                width: activeImage === index ? "22rem" : "5rem",
                height: activeImage === index ? "22rem" : "22rem",
              }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              onClick={() => setActiveImage(index)}
              onHoverStart={() => setActiveImage(index)}
            >
              {/* Overlay gradient */}
              <AnimatePresence>
                {activeImage === index && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"
                  />
                )}
              </AnimatePresence>

              {/* Text overlay */}
              <AnimatePresence>
                {activeImage === index && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute flex h-full w-full flex-col items-end justify-end p-4"
                  >
                    <p className="text-left text-sm text-white/70">
                      {image.code}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

   
              <Image
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover"
                width={500}
                height={500}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export { HoverExpand_001 };
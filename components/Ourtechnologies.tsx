"use client";
import React from "react";
import {
  SiJavascript,
  SiNextdotjs,
  SiReact,
  SiTailwindcss,
  SiThreedotjs,
  SiAngular,
  SiPhp,
  SiShopify,
  SiWordpress,
  SiWoocommerce,
  SiStripe,
  SiPaypal,
 
  SiFlutter,
  SiApple,
  SiAndroid,
  SiNodedotjs,
  SiPython,
    SiDotnet,
  SiSupabase,
  SiFirebase,
  SiPrisma,

  SiGithub,
  SiDocker,

  SiAdobephotoshop,
  SiAdobeillustrator,

  SiAdobeaftereffects,
  SiAdobepremierepro,
  SiFigma,
  SiCanva,
  SiAdobexd,
  SiSketch,
  SiInvision,
  SiNotion,
  SiGrammarly,
  SiGoogledocs,
  SiMailchimp,


  
 
  SiSemrush,
  SiGoogle,
  SiMeta,
  SiBuffer,
  SiHootsuite,





   SiOpenai,
  SiTensorflow,
  SiPytorch,
  SiHuggingface,
  SiKeras,
  SiScikitlearn,
  SiAmazon,
  SiGooglecloud,
 
} from "react-icons/si";

const techStack = [
  { name: "JavaScript", icon: <SiJavascript color="#F7DF1E" /> },
  { name: "Next.js", icon: <SiNextdotjs color="#000" /> },
  { name: "React", icon: <SiReact color="#61DBFB" /> },
  { name: "Tailwind CSS", icon: <SiTailwindcss color="#38BDF8" /> },
  { name: "Three.js", icon: <SiThreedotjs color="#000000" /> },
  { name: "Angular", icon: <SiAngular color="#DD0031" /> },
  { name: "PHP", icon: <SiPhp color="#777BB4" /> },
  { name: "Shopify", icon: <SiShopify color="#96BF48" /> },
  { name: "WordPress", icon: <SiWordpress color="#21759B" /> },
  { name: "WooCommerce", icon: <SiWoocommerce color="#96588A" /> },
  { name: "Stripe", icon: <SiStripe color="#635BFF" /> },
  { name: "PayPal", icon: <SiPaypal color="#00457C" /> },

  { name: "Flutter", icon: <SiFlutter color="#02569B" /> },
  { name: "iOS", icon: <SiApple color="#A2AAAD" /> },
  { name: "Android", icon: <SiAndroid color="#3DDC84" /> },
  { name: "Node.js", icon: <SiNodedotjs color="#339933" /> },
  { name: "Python", icon: <SiPython color="#3776AB" /> },

  { name: ".NET", icon: <SiDotnet color="#512BD4" /> },
  { name: "Supabase", icon: <SiSupabase color="#3ECF8E" /> },
  { name: "Firebase", icon: <SiFirebase color="#FFCA28" /> },
  { name: "Prisma", icon: <SiPrisma color="#2D3748" /> },

  { name: "GitHub", icon: <SiGithub color="#000" /> },
  { name: "Docker", icon: <SiDocker color="#2496ED" /> },

  { name: "Photoshop", icon: <SiAdobephotoshop color="#31A8FF" /> },
  { name: "Illustrator", icon: <SiAdobeillustrator color="#FF9A00" /> },
  { name: "After Effects", icon: <SiAdobeaftereffects color="#9999FF" /> },
  { name: "Premiere Pro", icon: <SiAdobepremierepro color="#9999FF" /> },
  { name: "Figma", icon: <SiFigma color="#F24E1E" /> },
  { name: "Canva", icon: <SiCanva color="#00C4CC" /> },
  { name: "Adobe XD", icon: <SiAdobexd color="#FF61F6" /> },
  { name: "Sketch", icon: <SiSketch color="#F7B500" /> },
  { name: "InVision", icon: <SiInvision color="#FF3366" /> },
  { name: "Notion", icon: <SiNotion color="#000" /> },
  { name: "Grammarly", icon: <SiGrammarly color="#15C39A" /> },
  { name: "Google Docs", icon: <SiGoogledocs color="#4285F4" /> },
  { name: "Mailchimp", icon: <SiMailchimp color="#FFE01B" /> },
  
  
  
  
  { name: "Semrush", icon: <SiSemrush color="#FF642D" /> },
  { name: "Google Search Console", icon: <SiGoogle color="#4285F4" /> },
  { name: "Meta Business Suite", icon: <SiMeta color="#0866FF" /> },
  { name: "Buffer", icon: <SiBuffer color="#000000" /> },
  { name: "Hootsuite", icon: <SiHootsuite color="#1D9BF0" /> },






    { name: "OpenAI", icon: <SiOpenai color="#412991" /> },
  { name: "TensorFlow", icon: <SiTensorflow color="#FF6F00" /> },
  { name: "PyTorch", icon: <SiPytorch color="#EE4C2C" /> },
  { name: "Hugging Face", icon: <SiHuggingface color="#FFCC4D" /> },
  { name: "Keras", icon: <SiKeras color="#D00000" /> },
  { name: "Scikit-Learn", icon: <SiScikitlearn color="#F7931E" /> },
  { name: "AWS AI", icon: <SiAmazon color="#FF9900" /> },
  { name: "Google Cloud AI", icon: <SiGooglecloud color="#4285F4" /> },
 
];

export default function OurTechnologies() {
  // Categorizing the tech stack for better visual flow
  const devStack = techStack.filter((t) =>
    [
      "JavaScript",
      "Next.js",
      "React",
      "Tailwind CSS",
      "Node.js",
      "Python",
      ".NET",
      "Supabase",
      "Firebase",
      "Prisma",
      "GitHub",
      "Docker",
      "Angular",
      "PHP",
      "Three.js",
    ].includes(t.name)
  );

  const designStack = techStack.filter((t) =>
    [
      "Figma",
      "Photoshop",
      "Illustrator",
      "After Effects",
      "Premiere Pro",
      "Adobe XD",
      "Sketch",
      "InVision",
      "Canva",
      "iOS",
      "Android",
      "Flutter",
      "Shopify",
      "WordPress",
      "WooCommerce",
    ].includes(t.name)
  );

  const toolStack = techStack.filter(
    (t) => !devStack.some(d => d.name === t.name) && !designStack.some(d => d.name === t.name)
  );

  const MarqueeRow = ({
    items,
    reverse = false,
    duration = "40s",
  }: {
    items: typeof techStack;
    reverse?: boolean;
    duration?: string;
  }) => (
    <div
      className="group flex overflow-hidden py-4 select-none pause-on-hover"
      style={{ "--duration": duration } as React.CSSProperties}
    >
      <div className={reverse ? "animate-marquee-reverse" : "animate-marquee"}>
        {[...items, ...items].map((tech, index) => (
          <div
            key={index}
            className="flex items-center gap-4 mx-4 px-6 py-4 bg-white/5 backdrop-blur-md border border-zinc-200 rounded-2xl transition-all duration-300 hover:bg-white/10 hover:border-zinc-300 hover:scale-105 group/item"
          >
            <div className="text-3xl md:text-4xl grayscale group-hover/item:grayscale-0 transition-all duration-300">
              {tech.icon}
            </div>
            <span className="text-sm md:text-base font-medium text-slate-700 whitespace-nowrap">
              {tech.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <section className="w-full py-24 bg-gradient-to-b from-zinc-100 via-white to-zinc-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-[#1A14A5] to-[#4b35ff] bg-clip-text text-transparent">
          Our Technologies
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed">
          We leverage the most advanced and modern tools to build scalable, 
          high-performance solutions for your business.
        </p>
      </div>

      <div className="relative">
        {/* Gradient Overlays for smooth edges */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-zinc-100 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-zinc-100 to-transparent z-10 pointer-events-none"></div>

        <div className="flex flex-col gap-2">
          <MarqueeRow items={devStack} duration="50s" />
          <MarqueeRow items={designStack} reverse duration="60s" />
          <MarqueeRow items={toolStack} duration="55s" />
        </div>
      </div>
    </section>
  );
}

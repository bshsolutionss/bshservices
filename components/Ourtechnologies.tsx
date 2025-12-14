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
  return (
    <section className="w-full py-16 text-white">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-10 text-[#0f0b7a]">
          Our Technologies
        </h2>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6 place-items-center">
          {techStack.map((tech, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center space-y-2 hover:scale-110 transition-transform duration-300"
            >
              <div className="text-4xl md:text-5xl">{tech.icon}</div>
              <p className="text-xs md:text-sm font-medium text-[#0f0b7a]">
                {tech.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

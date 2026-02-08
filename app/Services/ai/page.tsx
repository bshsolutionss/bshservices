"use client";
import Hero from "@/components/services/Hero";
import Testimonial from "@/components/testimonial";
import ServiceSection from "@/components/services/ServiceSection";
import Form from "@/components/services/Form";

// Icons
import { FaRobot, FaCogs, FaVideo, FaSearch } from "react-icons/fa";
import { SiGooglecloud, SiChatbot, SiZapier, SiOpenai } from "react-icons/si";
import { MdIntegrationInstructions } from "react-icons/md";

export default function AIServicesPage() {
  return (
    <>
      <Hero
        title="AI-Powered Business Services"
        subtitle="We help businesses automate, scale, and grow using modern AI solutions that deliver real, measurable results."
        image="/images/ai/ai.png"
      />

      <section className="text-center py-16">
        <h2 className="text-4xl font-bold">Our AI Expertise</h2>
      </section>

      {/* ===== 1. AI Automation ===== */}
      <ServiceSection
        id="ai-automation"
        title="AI Automation"
        description="We automate workflows using AI agents, APIs, and automation platforms — helping you save hours every week."
        features={[
          "Process automation with AI agents",
          "Data entry & reporting automation",
          "Email & CRM automation",
          "Custom workflow creation",
        ]}
        tech={[
          { name: "Zapier", icon: <SiZapier color="#FF4A00" /> },
          { name: "Make.com", icon: <FaCogs color="#0B84F3" /> },
          { name: "OpenAI", icon: <SiOpenai color="#15AABF" /> },
          { name: "Google Cloud AI", icon: <SiGooglecloud color="#4285F4" /> },
        ]}
        image="/images/ai/1.png"
      />

      {/* ===== 2. Social Media Automation ===== */}
      <ServiceSection
        id="social-media-automation"
        title="Social Media Automation"
        description="Automated posting, AI content creation, engagement tools, and smart scheduling that keeps you active 24/7."
        features={[
          "Auto-posting systems",
          "AI-generated posts & captions",
          "Safe engagement automation",
          "Growth & analytics automation",
        ]}
        tech={[
          { name: "ChatGPT", icon: <SiOpenai color="#15AABF" /> },
          { name: "Meta API", icon: <FaRobot color="#1C1C1C" /> },
          { name: "Zapier", icon: <SiZapier color="#FF4A00" /> },
          { name: "Buffer AI", icon: <FaCogs color="#6F42C1" /> },
        ]}
        image="/images/ai/2.png"
        reverse
      />

      {/* ===== 3. AI Chatbots ===== */}
      <ServiceSection
        id="ai-chatbots"
        title="AI Chatbots"
        description="AI chatbots for websites, WhatsApp, Facebook, and CRM systems — trained on your business data."
        features={[
          "WhatsApp AI chatbots",
          "Website AI assistants",
          "Custom RAG-trained bots",
          "CRM-integrated support agents",
        ]}
        tech={[
          { name: "Botpress", icon: <SiChatbot color="#00B8D9" /> },
          { name: "OpenAI GPT", icon: <SiOpenai color="#15AABF" /> },
          { name: "Meta AI", icon: <FaRobot color="#000" /> },
          { name: "Dialogflow", icon: <SiGooglecloud color="#4285F4" /> },
        ]}
        image="/images/ai/3.png"
      />

      {/* ===== 4. AI Website Integration ===== */}
      <ServiceSection
        id="ai-website-integration"
        title="AI Integration for Websites"
        description="Embed AI tools such as chat assistants, recommendations, personalized content, and advanced search."
        features={[
          "AI chat widget",
          "Smart product recommendations",
          "AI-based search systems",
          "Custom API integrations",
        ]}
        tech={[
          { name: "OpenAI API", icon: <SiOpenai color="#15AABF" /> },
          { name: "Next.js", icon: <MdIntegrationInstructions color="#333" /> },
          { name: "Pinecone Vector DB", icon: <FaCogs color="#0B84F3" /> },
          { name: "LangChain", icon: <FaRobot color="#444" /> },
        ]}
        image="/images/ai/4.png"
        reverse
      />

      {/* ===== 5. AEO (AI Enablement) ===== */}
      <ServiceSection
        id="aeo"
        title="AEO – AI Enablement"
        description="We analyze your business and provide a complete AI roadmap to increase efficiency and revenue."
        features={[
          "AI audit for your business",
          "Automation suggestions",
          "AI tools setup",
          "Growth plan using AI",
        ]}
        tech={[
          { name: "AI Audit Tools", icon: <FaSearch color="#1C7ED6" /> },
          { name: "Custom AI Strategy", icon: <FaCogs /> },
          { name: "Workflow Automation", icon: <SiZapier color="#FF4A00" /> },
          { name: "GPT Solutions", icon: <SiOpenai color="#15AABF" /> },
        ]}
        image="/images/ai/5.png"
      />

      {/* ===== 6. AI Video Automation ===== */}
      <ServiceSection
        id="ai-video-automation"
        title="AI Video Automation"
        description="Bulk video creation using AI—script, voiceover, editing, and publishing workflows."
        features={[
          "Bulk video generation",
          "AI voiceovers",
          "Auto-editing workflows",
          "YouTube & TikTok automation",
        ]}
        tech={[
          { name: "Pika Labs", icon: <FaVideo color="#F03E3E" /> },
          { name: "Runway ML", icon: <FaVideo /> },
          { name: "CapCut AI", icon: <FaCogs color="#0B84F3" /> },
          { name: "ElevenLabs", icon: <FaRobot /> },
        ]}
        image="/images/ai/6.png"
        reverse
      />

      <Testimonial />
      <section id="ai-form">
        <Form serviceName="AI Services" />
      </section>
    </>
  );
}

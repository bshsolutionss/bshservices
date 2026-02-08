"use client";
import Hero from "@/components/services/Hero";
import ServiceSection from "@/components/services/ServiceSection";
import Form from "@/components/services/Form";

import {
  SiGoogleads,
  SiMeta,
  SiLinkedin,
  SiGoogleanalytics,
  SiCanva,
  SiBuffer,
  SiHootsuite,
  SiSemrush,
  SiYoast,
  SiMailchimp,
  SiHubspot,
  SiNotion,
  SiGrammarly,
  SiWordpress,
  SiGoogledocs,
  SiInstagram,
  SiTiktok,
  SiUpwork,
} from "react-icons/si";

import { FaSearchengin, FaUserFriends, FaGoogle } from "react-icons/fa";

export default function MarketingPage() {
  return (
    <>
      <Hero
        title="Digital Marketing Services"
        subtitle="We help your brand grow, engage, and convert through data-driven digital marketing strategies."
        image="/images/Marketing.png"
      />

      <section id="marketing-expertise" className="text-center py-16">
        <h2 className="text-4xl font-bold">Our Marketing Expertise</h2>
      </section>

      {/* ===== 1. PPC Advertising ===== */}
      <section id="ppc-advertising">
        <ServiceSection
          title="PPC Advertising"
          description="Maximize your ROI with performance-driven Pay-Per-Click advertising. We create and manage high-converting ad campaigns that bring measurable results."
          features={[
            "Keyword and audience research",
            "Google & Meta ad campaign setup",
            "A/B testing for ad creatives",
            "Conversion tracking and optimization",
          ]}
          tech={[
            { name: "Google Ads", icon: <SiGoogleads color="#4285F4" /> },
            { name: "Meta Ads", icon: <SiMeta color="#1877F2" /> },
            { name: "LinkedIn Ads", icon: <SiLinkedin color="#0A66C2" /> },
            {
              name: "Google Analytics",
              icon: <SiGoogleanalytics color="#F9AB00" />,
            },
          ]}
          image="/images/Marketing/1.png"
        />
      </section>

      {/* ===== 2. Social Media Marketing ===== */}
      <section id="social-media-marketing">
        <ServiceSection
          title="Social Media Marketing"
          description="We help brands grow through engaging social media content and targeted campaigns that connect with your audience on every platform."
          features={[
            "Social media strategy & management",
            "Creative post & reel design",
            "Influencer collaborations",
            "Audience engagement & analytics",
          ]}
          tech={[
            { name: "Meta Business Suite", icon: <SiMeta color="#1877F2" /> },
            { name: "Canva", icon: <SiCanva color="#00C4CC" /> },
            { name: "Buffer", icon: <SiBuffer color="#323B43" /> },
            { name: "Hootsuite", icon: <SiHootsuite color="#FF7A00" /> },
          ]}
          image="/images/Marketing/2.png"
          reverse
        />
      </section>

      {/* ===== 3. SEO Optimization ===== */}
      <section id="seo-optimization">
        <ServiceSection
          title="SEO Optimization"
          description="Boost your organic visibility and climb search rankings with our comprehensive SEO strategies tailored to your business goals."
          features={[
            "On-page & technical SEO",
            "Keyword research and content strategy",
            "Backlink building and audits",
            "Performance tracking & reporting",
          ]}
          tech={[
            { name: "Semrush", icon: <SiSemrush color="#FF6B00" /> },
            {
              name: "Google Search Console",
              icon: <FaSearchengin color="#34A853" />,
            },
            { name: "Yoast SEO", icon: <SiYoast color="#A4286A" /> },
            { name: "Google", icon: <FaGoogle color="#4285F4" /> },
          ]}
          image="/images/Marketing/3.png"
        />
      </section>

      {/* ===== 4. Email Marketing ===== */}
      <section id="email-marketing">
        <ServiceSection
          title="Email Marketing"
          description="Deliver the right message to the right audience with personalized, automated email campaigns that convert and retain customers."
          features={[
            "Automated drip campaigns",
            "Segmentation & personalization",
            "Newsletter design",
            "Performance analytics",
          ]}
          tech={[
            { name: "Mailchimp", icon: <SiMailchimp color="#FFE01B" /> },
            { name: "HubSpot", icon: <SiHubspot color="#FF7A59" /> },
            { name: "WordPress", icon: <SiWordpress color="#21759B" /> },
            { name: "Google Docs", icon: <SiGoogledocs color="#34A853" /> },
          ]}
          image="/images/Marketing/4.png"
          reverse
        />
      </section>

      {/* ===== 5. Content Marketing ===== */}
      <section id="content-marketing">
        <ServiceSection
          title="Content Marketing"
          description="We create impactful content strategies that educate, inspire, and convert — from blog posts to videos and social media campaigns."
          features={[
            "Blog writing and SEO content",
            "Video and visual content production",
            "Content strategy and planning",
            "Cross-channel distribution",
          ]}
          tech={[
            { name: "Notion", icon: <SiNotion color="#000" /> },
            { name: "Grammarly", icon: <SiGrammarly color="#15C39A" /> },
            { name: "WordPress", icon: <SiWordpress color="#21759B" /> },
            { name: "Google Docs", icon: <SiGoogledocs color="#34A853" /> },
          ]}
          image="/images/Marketing/5.png"
        />
      </section>

      {/* ===== 6. Influencer Marketing ===== */}
      <section id="influencer-marketing">
        <ServiceSection
          title="Influencer Marketing"
          description="Amplify your brand’s reach by partnering with trusted influencers and creators who align with your vision and audience."
          features={[
            "Influencer research and outreach",
            "Campaign planning and execution",
            "Contract and deliverable management",
            "Performance measurement and reporting",
          ]}
          tech={[
            { name: "Upwork", icon: <SiUpwork color="#6FDA44" /> },
            {
              name: "Community Tools",
              icon: <FaUserFriends color="#9333EA" />,
            },
            { name: "Instagram", icon: <SiInstagram color="#E4405F" /> },
            { name: "TikTok", icon: <SiTiktok color="#010101" /> },
          ]}
          image="/images/Marketing/6.png"
          reverse
        />
      </section>

      <section id="marketing-form">
        <Form serviceName="Marketing" />
      </section>
    </>
  );
}

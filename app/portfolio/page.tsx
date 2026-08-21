import type { Metadata } from "next";
import Header from "@/components/header";
// import Footer from "@/components/footer";
import Contactform from "@/components/contactform";
import { OurPortfolio } from "@/components/our-portfolio";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Explore real, live client projects by BSH Solutions — websites, dashboards, eCommerce stores, and SaaS platforms built for businesses worldwide.",
  keywords: [
    "BSH Solutions portfolio",
    "web development projects",
    "client case studies",
    "live websites",
  ],
  alternates: { canonical: "https://bshsolutionss.com/portfolio" },
  openGraph: {
    title: "Portfolio | BSH Solutions",
    description:
      "Real, live client projects — websites, dashboards, eCommerce stores, and SaaS platforms built by BSH Solutions.",
    url: "https://bshsolutionss.com/portfolio",
  },
};

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-[#F4F7FE]">
      <Header />
      <main className="pt-24 pb-12">
        {/* Page heading */}
        <section className="px-6 lg:px-12 pt-8 pb-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-[#1A14A5]">
              Our Client <span className="text-[#231F20]">Projects</span>
            </h1>

            <p className="text-[#231F20]/70 text-lg mt-4 max-w-2xl leading-relaxed">
              Real live websites, dashboards, SaaS platforms, and scalable digital
              experiences crafted for our clients worldwide.
            </p>
          </div>
        </section>

        {/* Shared portfolio grid (real client projects) */}
        <OurPortfolio showHeading={false} />
      </main>

      <Contactform />
      {/* <Footer /> */}
    </div>
  );
}

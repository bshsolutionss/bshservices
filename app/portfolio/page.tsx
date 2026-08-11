import React from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Contactform from "@/components/contactform";
import { OurPortfolio } from "@/components/our-portfolio";

export const metadata = {
  title: "Our Portfolio | Business Smart Hub",
  description:
    "Browse our portfolio of digital projects, web development, UI/UX design, and marketing case studies.",
};

const PortfolioPage = () => {
  return (
    <div className="min-h-screen bg-[#F4F7FE]">
      <Header />
      <main className="pt-24 pb-12">
        <OurPortfolio />
      </main>
      <Contactform />
      <Footer />
    </div>
  );
};

export default PortfolioPage;

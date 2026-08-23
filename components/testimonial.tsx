"use client";

import React, { useEffect } from "react";
import { Star, MessageSquare } from "lucide-react";

const Testimonial: React.FC = () => {
  useEffect(() => {
    // Dynamically inject SociableKit script so it reliably executes on initial load & SPA navigation
    const scriptSrc = "https://widgets.sociablekit.com/reviews/widget.js";
    const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = scriptSrc;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <section id="testimonials" className="py-20 bg-[#F4F7FE]/50 px-4 sm:px-6 lg:px-12 border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A14A5]/10 text-[#1A14A5] text-xs sm:text-sm font-semibold mb-4">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>Verified Client Feedback</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#231F20] tracking-tight">
            What Our <span className="text-[#1A14A5]">Clients Say</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-600">
            Real reviews and experiences from founders and businesses who partner with BSH Solutions to build and scale.
          </p>
        </div>

        {/* Google Reviews Widget Container */}
        <div className="w-full min-h-[300px] bg-white rounded-3xl p-4 sm:p-8 shadow-sm border border-gray-100/80">
          <div className="sk-ww-reviews" data-embed-id="25707200"></div>
        </div>

        {/* CTA to write a review */}
        <div className="mt-12 text-center">
          <a
            href="https://g.page/r/CTv-TyDKnZJ_EAI/review"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 bg-[#1A14A5] text-white px-7 py-3.5 rounded-2xl font-semibold hover:bg-[#231F20] transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5"
          >
            <MessageSquare size={18} />
            <span>Write a Review on Google</span>
            <Star size={16} className="fill-amber-300 text-amber-300 ml-1" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;

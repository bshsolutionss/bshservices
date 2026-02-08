"use client";
import { Star } from "lucide-react";

const Testimonial = () => {
  return (
    <section id="testimonials" className="py-20 bg-white px-6 lg:px-20">
      {/* <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          What Our Clients Say
        </h2>
        <p className="mt-3 text-gray-600">
          Hear from business leaders who partnered with BSH to transform and
          grow their companies.
        </p>
      </div> */}

      <div className="mt-16 text-center">
        <a
          href="https://g.page/r/CTv-TyDKnZJ_EAI/review"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#1A14A5] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#231F20] transition-all shadow-lg hover:shadow-xl"
        >
          <Star size={20} fill="currentColor" />
          Write a Review on Google
        </a>
      </div>
    </section>
  );
};

export default Testimonial;

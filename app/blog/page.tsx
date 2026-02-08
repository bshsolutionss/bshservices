import React from "react";
import Testimonial from "@/components/testimonial";

const page = () => {
  return (
    <>
      <div className="py-20 text-center">
        <h1 className="text-4xl font-bold">Blog</h1>
        <p className="mt-4 text-gray-600">Our latest insights and news.</p>
      </div>
      <Testimonial />
    </>
  );
};

export default page;

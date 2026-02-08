import React from "react";
import Testimonial from "@/components/testimonial";

const page = () => {
  return (
    <>
      <div className="py-20 text-center">
        <h1 className="text-4xl font-bold">Case Studies</h1>
        <p className="mt-4 text-gray-600">Real-world examples of our work.</p>
      </div>
      <Testimonial />
    </>
  );
};

export default page;

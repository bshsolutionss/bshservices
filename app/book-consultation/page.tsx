import type { Metadata } from "next";
import Hero from "@/components/services/Hero";
import Testimonial from "@/components/testimonial";
import BookingForm from "@/components/BookingForm";

export const metadata: Metadata = {
  title: "Book a Free Consultation",
  description:
    "Book a free consultation with BSH Solutions. Pick a date and time that works for you and tell us about your project — no obligation.",
  keywords: [
    "book a consultation",
    "free consultation BSH Solutions",
    "schedule a call",
    "book a meeting",
  ],
  alternates: { canonical: "https://bshsolutionss.com/book-consultation" },
  openGraph: {
    title: "Book a Free Consultation | BSH Solutions",
    description: "Pick a date and time that works for you — no obligation, no pressure.",
    url: "https://bshsolutionss.com/book-consultation",
  },
};

export default function BookConsultationPage() {
  return (
    <>
      <Hero
        title="Book a Free Consultation"
        subtitle="Pick a date and time that works for you. We'll walk through your project, answer questions, and map out next steps — no obligation."
        image="/images/3dlogo.jpeg"
      />

      <section className="py-20 px-6 bg-[#F4F7FE]">
        <BookingForm />
      </section>

      <Testimonial />
    </>
  );
}

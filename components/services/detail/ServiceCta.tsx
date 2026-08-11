interface ServiceCtaProps {
  heading: string;
  subtext: string;
}

/** Server-rendered CTA banner shown directly above the lead-gen form. */
export default function ServiceCta({ heading, subtext }: ServiceCtaProps) {
  return (
    <div className="max-w-3xl mx-auto text-center px-6 pt-16">
      <h2 className="text-3xl lg:text-4xl font-bold text-[#231F20] mb-3">{heading}</h2>
      <p className="text-[#231F20]/70 text-lg">{subtext}</p>
    </div>
  );
}

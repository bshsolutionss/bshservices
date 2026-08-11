import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ServiceDefinition } from "@/lib/services-data";
import { getServicePath } from "@/lib/services-data";

interface RelatedServicesProps {
  services: ServiceDefinition[];
}

/** Server-rendered internal links to other services in the same category. */
export default function RelatedServices({ services }: RelatedServicesProps) {
  if (services.length === 0) return null;

  return (
    <section className="py-16 px-6 lg:px-12 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl lg:text-4xl font-bold text-[#231F20] mb-10 text-center">
          Related Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service) => (
            <Link
              key={service.slug}
              href={getServicePath(service)}
              className="group rounded-2xl overflow-hidden border border-[#1A14A5]/10 bg-[#F4F7FE] hover:border-[#1A14A5]/30 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative h-40 w-full bg-white">
                <Image
                  src={service.image}
                  alt={`${service.name} — BSH Solutions`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-[#231F20] mb-1">{service.name}</h3>
                <p className="text-sm text-[#231F20]/60 mb-3">{service.shortDescription}</p>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1A14A5]">
                  Learn more
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

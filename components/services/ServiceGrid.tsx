import ServiceCard from "./ServiceCard"
import { LucideIcon } from "lucide-react"

interface Service {
  title: string
  desc: string
  icon: LucideIcon
}

interface ServiceGridProps {
  services: Service[]
}

export default function ServiceGrid({ services }: ServiceGridProps) {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-6xl mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-3 px-4">
        {services.map((service) => (
          <ServiceCard key={service.title} {...service} />
        ))}
      </div>
    </section>
  )
}

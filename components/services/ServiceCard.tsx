import { LucideIcon } from "lucide-react"

interface ServiceCardProps {
  title: string
  desc: string
  icon: LucideIcon
}

export default function ServiceCard({ title, desc, icon: Icon }: ServiceCardProps) {
  return (
    <div className="p-6 rounded-2xl shadow-sm border border-border bg-card hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="text-muted-foreground">{desc}</p>
    </div>
  )
}

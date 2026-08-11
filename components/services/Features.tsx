interface FeaturesProps {
  features: string[]
}

export default function Features({ features }: FeaturesProps) {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-4xl mx-auto text-center px-4">
        <h2 className="text-2xl font-semibold mb-6">Key Features</h2>
        <ul className="grid gap-4 sm:grid-cols-2 text-left">
          {features.map((feature) => (
            <li
              key={feature}
              className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-900 shadow-sm"
            >
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

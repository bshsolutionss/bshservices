interface TechWeUseProps {
 
  tech: string[]
}

export default function TechWeUse({ tech }: TechWeUseProps) {
  return (
    <section className="py-16 bg-gray-100 dark:bg-zinc-800">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-semibold mb-6">Tech We Use</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {tech.map((item) => (
            <span
              key={item}
              className="px-4 py-2 bg-white dark:bg-zinc-900 rounded-full text-sm shadow-sm"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

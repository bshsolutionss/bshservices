import Image from "next/image";
import type { PortfolioProject } from "@/lib/portfolio-data";

interface ProjectShotProps {
  project: PortfolioProject;
  sizes: string;
  priority?: boolean;
  className?: string;
}

/**
 * The top of a full-page screenshot in a fixed window. When an ancestor has
 * the `group` class, hovering it slowly scrolls the page down to the bottom.
 */
export default function ProjectShot({ project, sizes, priority = false, className = "aspect-[16/10]" }: ProjectShotProps) {
  return (
    <div className={`relative w-full overflow-hidden bg-[#EEF0FB] ${className}`}>
      <Image
        src={project.image}
        alt={`${project.title} website screenshot`}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover object-top transition-[object-position] duration-[6000ms] ease-in-out group-hover:object-bottom"
      />
    </div>
  );
}

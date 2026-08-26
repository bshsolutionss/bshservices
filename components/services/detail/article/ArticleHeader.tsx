import Image from "next/image";

interface ArticleHeaderProps {
  intro: string[];
  image: string;
  imageAlt: string;
}

/**
 * The article's opening — a real image + intro split panel (the same
 * pattern the rest of the site's service pages use), not centered text on
 * its own. The article's own title is NOT repeated here — the Hero above
 * already renders it as this page's actual H1.
 */
export default function ArticleHeader({ intro, image, imageAlt }: ArticleHeaderProps) {
  return (
    <section className="bg-white py-14 md:py-16 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-14">
        <div className="w-full md:w-2/5 shrink-0">
          <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-xl">
            <Image
              src={image}
              alt={imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </div>
        </div>
        <div className="w-full md:w-3/5 text-center md:text-left">
          {intro.map((paragraph, index) => (
            <p key={index} className="text-lg text-[#231F20]/70 leading-relaxed mb-4 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

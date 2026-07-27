import Image from "next/image";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  image?: string;
}

export default function PageHero({ title, subtitle, image }: PageHeroProps) {
  return (
    <section className="relative pt-40 pb-24 bg-dark-2 overflow-hidden">
      {/* Optional background image */}
      {image && (
        <>
          <Image src={image} alt={title} fill className="object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-dark/80 to-dark/60" />
        </>
      )}

      {/* Subtle top border accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        <p className="label mb-4">PCM</p>
        <h1
          className="display-headline text-display-lg mb-4"
          style={{ fontFamily: "var(--font-barlow)" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-white/50 text-base max-w-xl leading-relaxed">
            {subtitle}
          </p>
        )}
        <div className="mt-6 w-12 h-px bg-accent" />
      </div>
    </section>
  );
}

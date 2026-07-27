"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";

type Slide = {
  headline: string;
  ctaPrimary: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
  image: string;
};

type Social = { label: string; href: string };

interface HeroSlideshowProps {
  slides: Slide[];
  socials: Social[];
}

const INTERVAL = 6000;

export default function HeroSlideshow({ slides, socials }: HeroSlideshowProps) {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (index === current || isTransitioning) return;
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrent(index);
        setIsTransitioning(false);
      }, 400);
    },
    [current, isTransitioning]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      goTo((current + 1) % slides.length);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, [current, goTo, slides.length]);

  const slide = slides[current];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Slides — pre-render all, show active */}
      {slides.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0, zIndex: 0 }}
        >
          <Image
            src={s.image}
            alt={s.headline}
            fill
            priority={i === 0}
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-dark/75" />
        </div>
      ))}

      {/* Vertical social sidebar — desktop only */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-6 z-20">
        <div className="h-16 w-px bg-white/20" />
        <div className="flex flex-col items-center gap-5">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-white transition-colors"
              style={{
                writingMode: "vertical-rl",
                textOrientation: "mixed",
                transform: "rotate(180deg)",
                fontSize: "10px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              {s.label}
            </a>
          ))}
        </div>
        <div className="h-16 w-px bg-white/20" />
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute right-6 bottom-12 hidden lg:flex flex-col items-center gap-4 z-20"
        style={{ writingMode: "vertical-rl" }}
      >
        <span className="text-white/30 text-xs font-semibold uppercase tracking-widest">
          Scroll
        </span>
        <div className="h-16 w-px bg-white/20" />
      </div>

      {/* Slide content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-24 py-32 pt-40">
        <h1
          className="text-white font-extrabold leading-none mb-10 max-w-3xl transition-opacity duration-400"
          style={{
            fontFamily: "var(--font-barlow)",
            fontSize: "clamp(3rem, 8vw, 5.5rem)",
            opacity: isTransitioning ? 0 : 1,
            transition: "opacity 0.4s ease",
          }}
        >
          {slide.headline}
        </h1>

        <div
          className="flex flex-col sm:flex-row gap-4"
          style={{
            opacity: isTransitioning ? 0 : 1,
            transition: "opacity 0.4s ease",
          }}
        >
          <Link href={slide.ctaPrimary.href} className="btn-outline-white">
            {slide.ctaPrimary.label}
          </Link>
          <Link href={slide.ctaSecondary.href} className="btn-filled">
            {slide.ctaSecondary.label}
          </Link>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="transition-all duration-300"
            style={{
              width: i === current ? "24px" : "8px",
              height: "8px",
              borderRadius: "4px",
              background: i === current ? "white" : "rgba(255,255,255,0.3)",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          />
        ))}
      </div>
    </section>
  );
}
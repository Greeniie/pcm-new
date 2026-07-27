import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Mail, Play, Calendar, Clock, MapPin } from "lucide-react";
import HeroSlideshow from "@/components/HeroSlideshow";
import { supabase } from "@/lib/supabase";
import type { SiteContent, Service, Testimony, Event } from "@/lib/supabase";
import fallbackContent from "@/data/content.json";
import fallbackServices from "@/data/services.json";

export const revalidate = 0;

async function getData() {
  const [{ data: contentRow }, { data: servicesData }, { data: testimoniesData }, { data: eventsData }] =
    await Promise.all([
      supabase.from("content").select("*").eq("id", 1).single(),
      supabase.from("services").select("*").order("sort_order"),
      supabase.from("testimonies").select("*").order("created_at"),
      supabase.from("events").select("*").order("created_at", { ascending: false }),
    ]);

  const content = (contentRow as SiteContent) ?? null;
  return {
    hero:        content?.hero        ?? (fallbackContent as any).hero,
    about:       content?.about       ?? (fallbackContent as any).about,
    contact:     content?.contact     ?? (fallbackContent as any).contact,
    services:    (servicesData as Service[])   ?? (fallbackServices as Service[]),
    testimonies: (testimoniesData as Testimony[]) ?? (fallbackContent as any).testimonies,
    featuredEvent: ((eventsData as Event[]) ?? []).find((e) => e.featured) ?? null,
  };
}

export default async function HomePage() {
  const { hero, about, contact, services, testimonies, featuredEvent } = await getData();
  const sermons = (fallbackContent as any).sermons; // sermons config stays in JSON for now

  const socials = [
    { label: "Instagram", href: contact.instagram },
    { label: "Youtube",   href: contact.youtube },
    { label: "Facebook",  href: contact.facebook },
  ];

  return (
    <>
      {/* ── HERO SLIDESHOW ── */}
      <HeroSlideshow slides={hero.slides} socials={socials} />

      {/* ── BECOME PART — full bleed ── */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <Image src="/images/hero-bg-3009.jpg" alt="PCM Congregation" fill className="object-cover object-center" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(13,13,13,1) 0%, rgba(13,13,13,0.98) 45%, rgba(13,13,13,0.88) 70%, rgba(13,13,13,0.75) 100%)" }} />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 py-24">
          <div className="max-w-lg">
            <p className="label mb-5">Welcome to PCM</p>
            <h2 className="text-white font-extrabold leading-tight mb-8"
              style={{ fontFamily: "var(--font-barlow)", fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>
              {about.headline}
            </h2>
            <p className="text-white/60 text-base leading-relaxed max-w-md">{about.description}</p>
          </div>
        </div>
      </section>

      {/* ── WEEKLY MEETINGS ── */}
      <section className="bg-dark-2 py-20 lg:py-28 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <p className="label mb-8">Weekly Meetings.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
            {services.map((service, i) => (
              <div key={service.id}
                className={`py-10 ${i < services.length - (services.length % 2 === 0 ? 2 : 1) ? "border-b border-white/10" : ""}`}>
                <h3 className="text-white font-extrabold text-2xl sm:text-3xl mb-4" style={{ fontFamily: "var(--font-barlow)" }}>
                  {service.title}.
                </h3>
                <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-sm">{service.description}</p>
                <div className="space-y-2">
                  {[{ icon: Calendar, text: service.day }, { icon: Clock, text: service.time }, { icon: MapPin, text: service.location }].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-3 py-2 border-t border-white/5">
                      <Icon size={13} className="text-white/30 shrink-0" />
                      <span className="text-white/50 text-xs uppercase tracking-wider font-medium">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIES ── */}
      <section className="bg-dark py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="display-headline mb-3"
              style={{ fontFamily: "var(--font-barlow)", fontSize: "clamp(1.75rem, 4vw, 2.75rem)", letterSpacing: "0.08em" }}>
              Testimonies
            </h2>
            <p className="text-white/40 text-sm">Be inspired by what God is doing in the lives of His people.</p>
          </div>
          <div className="space-y-5">
            {testimonies.map((t: Testimony) => (
              <div key={t.id} className="bg-dark-3 rounded-lg p-8 border-l-2 border-accent/50 hover:border-accent transition-all">
                <h3 className="text-white font-bold text-xl mb-3" style={{ fontFamily: "var(--font-barlow)" }}>{t.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed mb-4">{t.body}</p>
                <p className="text-white/40 text-xs text-right font-medium">— {t.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MESSAGE ARCHIVES — full bleed ── */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <Image src="/images/hero-bg-3005.jpg" alt="Message Archives" fill className="object-cover object-center" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(13,13,13,1) 0%, rgba(13,13,13,0.98) 45%, rgba(13,13,13,0.75) 65%, rgba(13,13,13,0.55) 100%)" }} />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          <div className="flex items-center">
            <div className="max-w-lg">
              <p className="label mb-5">Message Archives</p>
              <h2 className="text-white font-extrabold leading-tight mb-8"
                style={{ fontFamily: "var(--font-barlow)", fontSize: "clamp(2.25rem, 4vw, 3.5rem)" }}>
                {sermons.headline}
              </h2>
              <p className="text-white/60 text-base leading-relaxed">{sermons.description}</p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-5">
            {["Watch the Video", "Listen to the Message"].map((label) => (
              <a key={label} href={contact.youtube} target="_blank" rel="noopener noreferrer"
                className="w-full max-w-xs text-center py-4 text-white text-xs font-semibold uppercase tracking-widest hover:text-white/70 transition-colors border-b border-white/20 hover:border-white/50">
                {label}
              </a>
            ))}
            <div className="w-full max-w-xs pt-4 text-center">
              <p className="text-white/40 text-xs leading-relaxed mb-5">{sermons.subscribeNote}</p>
              <a href={contact.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <div className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-500 transition-colors flex items-center justify-center mx-auto">
                  <Play size={18} fill="white" className="text-white ml-0.5" />
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED EVENT ── */}
      {featuredEvent && (
        <section className="relative min-h-[60vh] flex items-center overflow-hidden">
          <Image src="/images/laughter2025.jpg" alt={featuredEvent.title} fill className="object-cover" />
          <div className="absolute inset-0 bg-dark/80" />
          <div className="relative w-full max-w-7xl mx-auto px-6 lg:px-10 py-20">
            <div className="max-w-2xl">
              <p className="label mb-4">{featuredEvent.category}</p>
              <h2 className="display-headline mb-3"
                style={{ fontFamily: "var(--font-barlow)", fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>
                {featuredEvent.title}
              </h2>
              {featuredEvent.theme && (
                <p className="text-accent-light text-lg italic mb-6">&ldquo;{featuredEvent.theme}&rdquo;</p>
              )}
              <p className="text-white/60 text-sm leading-relaxed mb-8 max-w-lg">{featuredEvent.description}</p>
              <div className="flex flex-col sm:flex-row gap-3 text-white/50 text-xs uppercase tracking-wider mb-8">
                <span className="flex items-center gap-2"><Calendar size={12} /> {featuredEvent.dates}</span>
                <span className="hidden sm:block">·</span>
                <span className="flex items-center gap-2"><Clock size={12} /> {featuredEvent.times}</span>
              </div>
              <Link href="/events" className="btn-outline-white">Learn More</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── SOCIAL LINKS BAR ── */}
      <section className="bg-dark-2 py-16 border-y border-white/5">
        <div className="max-w-2xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
          {[
            { label: "Facebook",  icon: Facebook,  href: contact.facebook },
            { label: "Instagram", icon: Instagram, href: contact.instagram },
            { label: "Email",     icon: Mail,      href: `mailto:${contact.email}` },
          ].map((s) => (
            <a key={s.label} href={s.href} target={s.href.startsWith("mailto") ? "_self" : "_blank"}
              rel="noopener noreferrer" className="flex flex-col items-center gap-3 group">
              <div className="icon-circle group-hover:bg-white/10"><s.icon size={20} /></div>
              <span className="text-xs font-semibold uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">
                {s.label}
              </span>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
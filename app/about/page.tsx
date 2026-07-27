import PageHero from "@/components/PageHero";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { SiteContent } from "@/lib/supabase";
import fallback from "@/data/content.json";
import { Eye, Target, Heart, Users } from "lucide-react";

export const revalidate = 0;

const values = [
  { icon: Heart,  title: "Love",      desc: "We love God and love people, creating a welcoming community for all." },
  { icon: Target, title: "Purpose",   desc: "Every believer is called and equipped to fulfil their God-given purpose." },
  { icon: Eye,    title: "Vision",    desc: "We see beyond the natural and trust God for the impossible." },
  { icon: Users,  title: "Community", desc: "Together we grow, together we serve, together we impact the world." },
];

async function getAbout() {
  const { data } = await supabase.from("content").select("about").eq("id", 1).single();
  return (data as SiteContent | null)?.about ?? (fallback as any).about;
}

export default async function AboutPage() {
  const about = await getAbout();

  return (
    <>
      <PageHero title={about.headline} subtitle={about.description} image="/images/hero-bg-3010.jpeg" />

      {/* ── Vision & Mission ── */}
      <section className="bg-dark py-20 lg:py-28 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            <div>
              <p className="label mb-4">Our Vision</p>
              <h2 className="display-headline mb-6" style={{ fontFamily: "var(--font-barlow)", fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}>
                Where We're Headed
              </h2>
              <div className="w-10 h-px bg-accent mb-6" />
              <p className="text-white/60 leading-relaxed">{about.vision}</p>
            </div>
            <div>
              <p className="label mb-4">Our Mission</p>
              <h2 className="display-headline mb-6" style={{ fontFamily: "var(--font-barlow)", fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}>
                What We Do
              </h2>
              <div className="w-10 h-px bg-accent mb-6" />
              <p className="text-white/60 leading-relaxed">{about.mission}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Leadership ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[80vh] border-t border-white/5">
        <div className="relative min-h-[420px] lg:min-h-0">
          <Image src={about.pastor.image} alt="Senior Pastors" fill className="object-cover object-center" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(13,13,13,0) 50%, rgba(13,13,13,0.8) 100%)" }} />
        </div>
        <div className="bg-dark flex items-center px-8 sm:px-12 lg:px-16 py-20 lg:py-0">
          <div className="w-full max-w-md">
            <p className="label mb-6">Leadership</p>
            <h2 className="text-white font-extrabold leading-tight mb-6"
              style={{ fontFamily: "var(--font-barlow)", fontSize: "clamp(1.3rem, 2vw, 1.75rem)" }}>
              {about.pastor.name} &amp; {about.pastor.wife}
            </h2>
            <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-8">{about.pastor.title}</p>
            <div className="w-10 h-px bg-accent/30 mb-8" />
            <p className="text-white/60 text-sm leading-relaxed">{about.pastor.bio}</p>
          </div>
        </div>
      </section>

      {/* ── Core Values ── */}
      <section className="bg-dark-2 py-20 lg:py-28 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="mb-14">
            <p className="label mb-4">What We Stand For</p>
            <h2 className="display-headline" style={{ fontFamily: "var(--font-barlow)", fontSize: "clamp(2rem, 4vw, 3rem)" }}>
              Our Core Values
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-white/10 rounded-lg overflow-hidden">
            {values.map((val, i) => (
              <div key={val.title}
                className={`p-8 bg-dark-3 hover:bg-dark-4 transition-colors group ${i < 3 ? "lg:border-r border-white/10" : ""} ${i < 2 ? "sm:border-b lg:border-b-0 border-white/10" : ""}`}>
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/20 transition-colors">
                  <val.icon size={20} className="text-accent" />
                </div>
                <h3 className="text-white font-bold text-lg mb-3" style={{ fontFamily: "var(--font-barlow)" }}>{val.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-dark py-20 border-t border-white/5">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="label mb-4">Come As You Are</p>
          <h2 className="display-headline mb-6" style={{ fontFamily: "var(--font-barlow)", fontSize: "clamp(2rem, 4vw, 3rem)" }}>
            You Are Welcome Here
          </h2>
          <p className="text-white/50 text-sm leading-relaxed mb-10 max-w-md mx-auto">
            We'd love to meet you. Join us any Sunday and experience the warmth of the PCM family.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/services" className="btn-outline-white">View Services</Link>
            <Link href="/contact" className="btn-filled">Get In Touch</Link>
          </div>
        </div>
      </section>
    </>
  );
}
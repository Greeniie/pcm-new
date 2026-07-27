"use client";

import PageHero from "@/components/PageHero";
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { SiteContent } from "@/lib/supabase";
import fallback from "@/data/content.json";

type ContactData = SiteContent["contact"];

export default function ContactPage() {
  const [contact, setContact] = useState<ContactData>((fallback as any).contact);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  useEffect(() => {
    supabase.from("content").select("contact").eq("id", 1).single().then(({ data }) => {
      if (data) setContact((data as SiteContent).contact);
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <PageHero title="Contact Us" subtitle="We'd love to hear from you." />

      <section className="bg-dark py-20 lg:py-28 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

            {/* Contact info */}
            <div>
              <p className="label mb-4">Reach Us</p>
              <h2 className="display-headline mb-10"
                style={{ fontFamily: "var(--font-barlow)", fontSize: "clamp(2rem, 4vw, 3rem)" }}>
                Get In Touch
              </h2>
              <div className="space-y-0">
                {[
                  { icon: MapPin, label: "Our Address", content: contact.address, link: (contact as any).mapsUrl, linkLabel: "Get Directions ↗" },
                  { icon: Phone, label: "Hotlines", content: contact.phones.join("  ·  "), link: `tel:+234${contact.phones[0].replace(/^0/, "")}`, linkLabel: null },
                  { icon: Mail, label: "Email", content: contact.email, link: `mailto:${contact.email}`, linkLabel: null },
                ].map((item) => (
                  <div key={item.label} className="flex gap-5 py-7 border-b border-white/5">
                    <div className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center shrink-0 mt-0.5">
                      <item.icon size={16} className="text-white/50" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-1.5">{item.label}</p>
                      <p className="text-white/70 text-sm leading-relaxed mb-2">{item.content}</p>
                      {item.link && item.linkLabel && (
                        <a href={item.link} target="_blank" rel="noopener noreferrer"
                          className="text-accent text-xs font-semibold uppercase tracking-wider hover:text-accent-light transition-colors flex items-center gap-1">
                          {item.linkLabel} <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-8 flex gap-4">
                {[
                  { icon: Facebook, href: contact.facebook, label: "Facebook" },
                  { icon: Instagram, href: contact.instagram, label: "Instagram" },
                  { icon: Youtube, href: contact.youtube, label: "YouTube" },
                ].map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    aria-label={s.label} className="icon-circle" style={{ width: "44px", height: "44px" }}>
                    <s.icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            {/* Message form */}
            <div>
              <p className="label mb-4">Send a Message</p>
              <h2 className="display-headline mb-10"
                style={{ fontFamily: "var(--font-barlow)", fontSize: "clamp(2rem, 4vw, 3rem)" }}>
                We'll Get Back to You
              </h2>
              {submitted ? (
                <div className="py-16 text-center border border-white/10 rounded-lg bg-dark-3">
                  <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-3">Message Sent</p>
                  <p className="text-white/60 text-sm">Thank you for reaching out. We'll respond within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {[
                    { label: "Your Name", key: "name", type: "text", placeholder: "Full name" },
                    { label: "Email Address", key: "email", type: "email", placeholder: "your@email.com" },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="block text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">{f.label}</label>
                      <input type={f.type} required value={form[f.key as keyof typeof form]}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                        placeholder={f.placeholder}
                        className="w-full px-0 py-3 bg-transparent border-b border-white/15 focus:border-white/40 focus:outline-none text-white text-sm placeholder-white/20 transition-colors" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">Message</label>
                    <textarea required rows={5} value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="How can we help you?"
                      className="w-full px-0 py-3 bg-transparent border-b border-white/15 focus:border-white/40 focus:outline-none text-white text-sm placeholder-white/20 transition-colors resize-none" />
                  </div>
                  <div className="pt-4">
                    <button type="submit" className="btn-outline-white">Send Message</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
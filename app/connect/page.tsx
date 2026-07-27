"use client";

import PageHero from "@/components/PageHero";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export default function ConnectPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", age: "", availability: "", comments: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const fields = [
    { label: "Full Name", name: "name", type: "text", placeholder: "Your full name", required: true, half: true },
    { label: "Email Address", name: "email", type: "email", placeholder: "your@email.com", required: true, half: true },
    { label: "Phone Number", name: "phone", type: "tel", placeholder: "08012345678", required: true, half: true },
    { label: "Age", name: "age", type: "text", placeholder: "Your age", required: false, half: true },
    { label: "Availability (Day & Time)", name: "availability", type: "text", placeholder: "e.g. Weekends, evenings after 6pm", required: false, half: false },
  ];

  return (
    <>
      <PageHero
        title="Connect Groups"
        subtitle="Get connected with a community of believers who will walk alongside you in faith."
      />

      <section className="bg-dark py-20 lg:py-28 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6">

          {submitted ? (
            <div className="text-center py-24">
              <CheckCircle2 size={48} className="text-accent mx-auto mb-6" />
              <p className="label mb-3">You're Connected!</p>
              <h2
                className="display-headline mb-4"
                style={{ fontFamily: "var(--font-barlow)", fontSize: "clamp(2rem, 4vw, 3rem)" }}
              >
                Thank You
              </h2>
              <p className="text-white/50 text-sm">
                A member of our team will contact you soon to connect you with the right group.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-12">
                <p className="label mb-4">Join a Group</p>
                <h2
                  className="display-headline mb-4"
                  style={{ fontFamily: "var(--font-barlow)", fontSize: "clamp(2rem, 4vw, 3rem)" }}
                >
                  Get Connected
                </h2>
                <p className="text-white/50 text-sm leading-relaxed max-w-lg">
                  Connect Groups are small, intentional communities where you can grow in faith, build meaningful relationships, and experience authentic community.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {fields.filter((f) => f.half).map((f) => (
                    <div key={f.name}>
                      <label className="block text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">
                        {f.label} {f.required && <span className="text-accent">*</span>}
                      </label>
                      <input
                        type={f.type}
                        name={f.name}
                        required={f.required}
                        value={form[f.name as keyof typeof form]}
                        onChange={handleChange}
                        placeholder={f.placeholder}
                        className="w-full px-0 py-3 bg-transparent border-b border-white/15 focus:border-white/40 focus:outline-none text-white text-sm placeholder-white/20 transition-colors"
                      />
                    </div>
                  ))}
                </div>

                {fields.filter((f) => !f.half).map((f) => (
                  <div key={f.name}>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">
                      {f.label}
                    </label>
                    <input
                      type={f.type}
                      name={f.name}
                      value={form[f.name as keyof typeof form]}
                      onChange={handleChange}
                      placeholder={f.placeholder}
                      className="w-full px-0 py-3 bg-transparent border-b border-white/15 focus:border-white/40 focus:outline-none text-white text-sm placeholder-white/20 transition-colors"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">
                    Comments or Questions
                  </label>
                  <textarea
                    name="comments"
                    value={form.comments}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tell us anything you'd like us to know..."
                    className="w-full px-0 py-3 bg-transparent border-b border-white/15 focus:border-white/40 focus:outline-none text-white text-sm placeholder-white/20 transition-colors resize-none"
                  />
                </div>

                <div className="pt-4">
                  <button type="submit" className="btn-outline-white">
                    Get Connected
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </section>
    </>
  );
}

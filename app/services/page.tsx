import PageHero from "@/components/PageHero";
import Link from "next/link";
import { Calendar, Clock, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Service } from "@/lib/supabase";
import fallbackServices from "@/data/services.json";

export const revalidate = 0; // revalidate every 60 seconds

async function getServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error || !data?.length) return fallbackServices as Service[];
  return data;
}

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <>
      <PageHero
        title="Church Services"
        subtitle="Join us as we have an awesome time in God's presence. There's a service for every day of the week."
        image="/images/biblestudy.jpg"
      />

      <section className="bg-dark py-20 lg:py-28 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <p className="label mb-8">Weekly Meetings.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
            {services.map((service, i) => (
              <div
                key={service.id}
                className={`py-10 border-b border-white/10 ${
                  i === services.length - 1 || i === services.length - 2 ? "md:border-b-0" : ""
                } ${i === services.length - 1 ? "border-b-0" : ""}`}
              >
                <h3
                  className="text-white font-extrabold text-2xl sm:text-3xl mb-4"
                  style={{ fontFamily: "var(--font-barlow)" }}
                >
                  {service.title}.
                </h3>
                <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-sm">
                  {service.description}
                </p>
                <div className="space-y-0">
                  {[
                    { icon: Calendar, text: service.day },
                    { icon: Clock, text: service.time },
                    { icon: MapPin, text: service.location },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-3 py-2.5 border-t border-white/5">
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

      <section className="bg-dark-2 py-16 border-t border-white/5">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="display-headline mb-4"
            style={{ fontFamily: "var(--font-barlow)", fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}>
            First Time Visiting?
          </h2>
          <p className="text-white/50 text-sm leading-relaxed mb-8">
            We'd love to welcome you. Join a connect group or reach out to us before your first visit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/connect" className="btn-outline-white">Join a Connect Group</Link>
            <Link href="/contact" className="btn-filled">Contact Us</Link>
          </div>
        </div>
      </section>
    </>
  );
}
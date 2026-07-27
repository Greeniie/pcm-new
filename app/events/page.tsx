import PageHero from "@/components/PageHero";
import Image from "next/image";
import { Calendar, Clock, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Event } from "@/lib/supabase";

export const revalidate = 0;

async function getEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data;
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <>
      <PageHero
        title="Events"
        subtitle="Don't miss what God is doing at PCM. Stay updated with our latest programmes."
        image="/images/laughter2025.jpg"
      />

      <section className="bg-dark py-20 lg:py-28 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          {events.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-white/30 text-sm uppercase tracking-widest">
                No upcoming events at the moment. Check back soon.
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {events.map((event, i) => (
                <div key={event.id}
                  className={`grid grid-cols-1 lg:grid-cols-2 min-h-[50vh] ${i < events.length - 1 ? "border-b border-white/10" : ""}`}>
                  {/* Image side */}
                  <div className={`relative min-h-[300px] lg:min-h-0 ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                    {event.image ? (
                      <>
                        <Image src={event.image} alt={event.title} fill className="object-cover" />
                        <div className="absolute inset-0 bg-dark/50" />
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-dark-3" />
                    )}
                    {event.featured && (
                      <div className="absolute top-6 left-6">
                        <span className="px-3 py-1.5 bg-accent text-white text-xs font-semibold uppercase tracking-widest">Featured</span>
                      </div>
                    )}
                  </div>

                  {/* Content side */}
                  <div className={`bg-dark-2 flex items-center px-8 sm:px-12 lg:px-16 py-16 lg:py-0 ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                    <div className="max-w-lg">
                      <p className="label mb-4">{event.category}</p>
                      <h2 className="display-headline mb-3"
                        style={{ fontFamily: "var(--font-barlow)", fontSize: "clamp(2rem, 4vw, 3.25rem)" }}>
                        {event.title}
                      </h2>
                      {event.theme && (
                        <p className="text-accent-light italic text-base mb-5">&ldquo;{event.theme}&rdquo;</p>
                      )}
                      <p className="text-white/55 text-sm leading-relaxed mb-8">{event.description}</p>
                      <div className="space-y-0">
                        {[
                          { icon: Calendar, text: event.dates },
                          { icon: Clock, text: event.times },
                          { icon: MapPin, text: event.location },
                        ].map(({ icon: Icon, text }) => (
                          <div key={text} className="flex items-center gap-3 py-3 border-t border-white/5">
                            <Icon size={13} className="text-accent shrink-0" />
                            <span className="text-white/50 text-xs uppercase tracking-wider font-medium">{text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
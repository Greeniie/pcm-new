import PageHero from "@/components/PageHero";
import { supabase } from "@/lib/supabase";
import type { SiteContent } from "@/lib/supabase";
import fallback from "@/data/content.json";
import { Clock, Youtube, ExternalLink } from "lucide-react";

export const revalidate = 0;

async function getContact() {
  const { data } = await supabase.from("content").select("contact").eq("id", 1).single();
  return (data as SiteContent | null)?.contact ?? (fallback as any).contact;
}

export default async function SermonsPage() {
  const contact = await getContact();

  return (
    <>
      <PageHero
        title="Sermons"
        subtitle="Messages from the Word of God that reveal the mind of God."
      />

      {/* Coming soon */}
      <section className="bg-dark py-24 lg:py-32 border-t border-white/5">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-4 border border-white/10 rounded-full text-white/40 text-xs font-semibold uppercase tracking-widest mb-16">
            <Clock size={14} className="text-accent shrink-0" />
            Message archive coming soon
          </div>

          <h2
            className="text-white font-extrabold uppercase tracking-widest mb-6"
            style={{
              fontFamily: "var(--font-barlow)",
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              letterSpacing: "0.12em",
            }}
          >
            Watch Us Online
          </h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-md mx-auto mb-12">
            While our full sermon archive is being set up, you can watch messages, highlights,
            and live streams on our YouTube channel.
          </p>

          {contact.youtube && (
            <a
              href={contact.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-accent text-white font-bold text-sm uppercase tracking-widest rounded-full hover:bg-accent/90 transition-colors"
            >
              <Youtube size={18} />
              Visit Our Channel
              <ExternalLink size={14} className="opacity-60" />
            </a>
          )}
        </div>
      </section>

      {/* Scripture */}
      <section className="bg-dark-2 py-16 border-t border-white/5">
        <div className="max-w-xl mx-auto px-6 text-center">
          <p
            className="text-white/70 text-lg italic leading-relaxed"
            style={{ fontFamily: "var(--font-barlow)" }}
          >
            &ldquo;Faith comes from hearing the message, and the message is heard through the word about Christ.&rdquo;
          </p>
          <p className="text-white/30 text-xs uppercase tracking-widest mt-4">Romans 10:17</p>
        </div>
      </section>
    </>
  );
}
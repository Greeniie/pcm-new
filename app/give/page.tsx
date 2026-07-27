import PageHero from "@/components/PageHero";
import { supabase } from "@/lib/supabase";
import type { SiteContent } from "@/lib/supabase";
import fallback from "@/data/content.json";
import { Clock } from "lucide-react";

export const revalidate = 0;

async function getGiving() {
  const { data } = await supabase.from("content").select("giving").eq("id", 1).single();
  return (data as SiteContent | null)?.giving ?? (fallback as any).giving;
}

export default async function GivePage() {
  const giving = await getGiving();

  return (
    <>
      <PageHero title="Give" subtitle="Support the work of ministry and partner with God's purpose." />

      <section className="bg-dark py-24 lg:py-32 border-t border-white/5">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-white font-extrabold uppercase tracking-widest mb-6"
            style={{ fontFamily: "var(--font-barlow)", fontSize: "clamp(1.75rem, 4vw, 2.75rem)", letterSpacing: "0.12em" }}>
            {giving.headline}
          </h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-md mx-auto mb-16">{giving.description}</p>

          <div className="space-y-10 mb-20">
            {giving.banks.map((b: { bank: string; accountNumber: string; accountName: string }) => (
              <div key={b.bank} className="space-y-1.5">
                <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">{b.bank}</p>
                <p className="text-white font-extrabold"
                  style={{ fontFamily: "var(--font-barlow)", fontSize: "clamp(1.5rem, 3vw, 2rem)", letterSpacing: "0.05em" }}>
                  {b.accountNumber}
                </p>
                <p className="text-white/40 text-xs uppercase tracking-widest">{b.accountName}</p>
              </div>
            ))}
          </div>

          <div className="inline-flex items-center gap-3 px-6 py-4 border border-white/10 rounded-full text-white/40 text-xs font-semibold uppercase tracking-widest">
            <Clock size={14} className="text-accent shrink-0" />
            {giving.onlineGivingNote}
          </div>
        </div>
      </section>

      <section className="bg-dark-2 py-16 border-t border-white/5">
        <div className="max-w-xl mx-auto px-6 text-center">
          <p className="text-white/70 text-lg italic leading-relaxed" style={{ fontFamily: "var(--font-barlow)" }}>
            &ldquo;Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.&rdquo;
          </p>
          <p className="text-white/30 text-xs uppercase tracking-widest mt-4">2 Corinthians 9:7</p>
        </div>
      </section>
    </>
  );
}
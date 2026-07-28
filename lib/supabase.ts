import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Public client — safe in both client and server components
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client — server-only (SUPABASE_SERVICE_ROLE_KEY has no NEXT_PUBLIC_ prefix
// so it is never sent to the browser). Only import this in server components / route handlers.
export const supabaseAdmin =
  typeof process.env.SUPABASE_SERVICE_ROLE_KEY === "string"
    ? createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : supabase; // fallback to anon client in browser context

// ── Types ────────────────────────────────────────────────────

export type Service = {
  id: string;
  title: string;
  description: string;
  day: string;
  time: string;
  location: string;
  icon: string;
  sort_order: number;
};

export type Event = {
  id: string;
  title: string;
  theme?: string;
  description: string;
  dates: string;
  times: string;
  location: string;
  image?: string;
  featured: boolean;
  category: string;
  created_at?: string;
};

export type Testimony = {
  id: string;
  title: string;
  body: string;
  author: string;
  created_at?: string;
};

export type HeroSlide = {
  headline: string;
  ctaPrimary: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
  image: string;
};

export type SiteContent = {
  id: number;
  hero: { slides: HeroSlide[] };
  about: {
    headline: string;
    tagline: string;
    description: string;
    vision: string;
    mission: string;
    pastor: {
      name: string;
      wife: string;
      title: string;
      image: string;
      bio: string;
    };
  };
  giving: {
    headline: string;
    description: string;
    onlineGivingNote: string;
    banks: { bank: string; accountNumber: string; accountName: string }[];
  };
  contact: {
    address: string;
    phones: string[];
    email: string;
    facebook: string;
    instagram: string;
    youtube: string;
    mapsUrl: string;
  };
};

// ── Storage helper ────────────────────────────────────────────
// Requires a public bucket named "pcm-media" in your Supabase project.
// Dashboard → Storage → New bucket → Name: pcm-media → Public: true
export async function uploadToStorage(file: File, folder = "uploads"): Promise<string | null> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const { data, error } = await supabase.storage.from("pcm-media").upload(path, file, { upsert: true });
  if (error) return null;
  return supabase.storage.from("pcm-media").getPublicUrl(data.path).data.publicUrl;
}

// Tither profile (one row per church member)
export type Tither = {
  id: string;
  name: string;
  phone?: string;
  department?: string;
  tithe_card_number?: string;
  created_at?: string;
};

// Individual tithe payment — exact date, multiple per month allowed
export type TitheRecord = {
  id: string;
  tither_id: string;
  amount: number;
  date: string;       // "YYYY-MM-DD"
  notes?: string;
  created_at?: string;
};
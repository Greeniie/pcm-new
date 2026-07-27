"use client";

import AdminShell from "@/components/AdminShell";
import { useEffect, useState } from "react";
import { Save, Info, Plus, Trash2, Loader2, Upload, X } from "lucide-react";
import {
  supabase,
  uploadToStorage,
  type SiteContent,
  type Testimony,
  type HeroSlide,
} from "@/lib/supabase";
import fallback from "@/data/content.json";

// ── Constants ──────────────────────────────────────────────────────────────

const inputCls =
  "w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400/30 text-sm text-gray-900";

const DEFAULT_CONTENT: SiteContent = {
  id: 1,
  hero: { slides: (fallback as any).hero.slides },
  about: (fallback as any).about,
  giving: (fallback as any).giving,
  contact: (fallback as any).contact,
};

const BLANK_SLIDE: HeroSlide = {
  headline: "",
  ctaPrimary: { label: "", href: "" },
  ctaSecondary: { label: "", href: "" },
  image: "",
};

// ── Sub-components OUTSIDE parent — prevents focus loss on keystroke ───────

function Field({
  label,
  value,
  onChange,
  textarea = false,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
      </label>
      {hint && <p className="text-xs text-gray-400 mb-2">{hint}</p>}
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className={`${inputCls} resize-none`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        />
      )}
    </div>
  );
}

function SlideImageField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadToStorage(file, "hero");
    setUploading(false);
    if (url) onChange(url);
    e.target.value = "";
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        Background Image
      </label>
      <p className="text-xs text-gray-400 mb-2">
        Upload a photo or enter a path (e.g. /images/banner1.jpg)
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/images/banner1.jpg"
          className={`${inputCls} flex-1`}
        />
        <label
          className={`flex items-center gap-1.5 px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-medium cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
            uploading
              ? "text-gray-400 bg-gray-50"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          {uploading ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Upload size={13} />
          )}
          {uploading ? "Uploading…" : "Upload"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
            disabled={uploading}
          />
        </label>
      </div>
    </div>
  );
}

// ── Page component ─────────────────────────────────────────────────────────

export default function AdminContentPage() {
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "hero" | "about" | "testimonies" | "contact"
  >("hero");
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    const [{ data: cData }, { data: tData }] = await Promise.all([
      supabase.from("content").select("*").eq("id", 1).single(),
      supabase.from("testimonies").select("*").order("created_at"),
    ]);
    if (cData) setContent(cData as SiteContent);
    if (tData) setTestimonies(tData as Testimony[]);
    setLoading(false);
  }

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }

  async function saveContent() {
    setSaving(true);
    const { hero, about, giving, contact } = content;
    const { error } = await supabase
      .from("content")
      .upsert({ id: 1, hero, about, giving, contact });
    setSaving(false);
    if (error) return showToast("Error: " + error.message, "error");
    showToast("Content saved!");
  }

  async function addTestimony() {
    const t: Testimony = {
      id: Date.now().toString(),
      title: "",
      body: "",
      author: "",
    };
    const { error } = await supabase.from("testimonies").insert(t);
    if (error) return showToast("Error: " + error.message, "error");
    setTestimonies([...testimonies, t]);
  }

  async function updateTestimony(
    id: string,
    key: keyof Testimony,
    value: string,
  ) {
    setTestimonies(
      testimonies.map((t) => (t.id === id ? { ...t, [key]: value } : t)),
    );
  }

  async function saveTestimonies() {
    setSaving(true);
    const { error } = await supabase
      .from("testimonies")
      .upsert(testimonies.map(({ created_at, ...t }) => t));
    setSaving(false);
    if (error) return showToast("Error: " + error.message, "error");
    showToast("Testimonies saved!");
  }

  async function deleteTestimony(id: string) {
    const { error } = await supabase.from("testimonies").delete().eq("id", id);
    if (error) return showToast("Error: " + error.message, "error");
    setTestimonies(testimonies.filter((t) => t.id !== id));
    showToast("Testimony deleted.");
  }

  // ── Slide helpers ──────────────────────────────────────────────────────
  const updateSlide = (i: number, patch: Partial<HeroSlide>) => {
    const slides = content.hero.slides.map((s, idx) =>
      idx === i ? { ...s, ...patch } : s,
    );
    setContent({ ...content, hero: { slides } });
  };

  const updateSlideCta = (
    i: number,
    cta: "ctaPrimary" | "ctaSecondary",
    key: "label" | "href",
    val: string,
  ) => {
    const slides = content.hero.slides.map((s, idx) =>
      idx === i ? { ...s, [cta]: { ...s[cta], [key]: val } } : s,
    );
    setContent({ ...content, hero: { slides } });
  };

  const addSlide = () => {
    setContent({
      ...content,
      hero: { slides: [...content.hero.slides, { ...BLANK_SLIDE }] },
    });
  };

  const removeSlide = (i: number) => {
    if (content.hero.slides.length <= 1) return; // always keep at least one
    setContent({
      ...content,
      hero: { slides: content.hero.slides.filter((_, idx) => idx !== i) },
    });
  };

  // ── Tabs ──────────────────────────────────────────────────────────────
  const tabs = [
    { id: "hero" as const, label: "Hero Slides" },
    { id: "about" as const, label: "About" },
    { id: "testimonies" as const, label: "Testimonies" },
    { id: "contact" as const, label: "Contact" },
  ];

  if (loading)
    return (
      <AdminShell>
        <div className="flex items-center justify-center py-32 text-gray-400">
          <Loader2 size={24} className="animate-spin mr-2" /> Loading…
        </div>
      </AdminShell>
    );

  return (
    <AdminShell>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Site Content</h2>
          <p className="text-sm text-gray-500">
            Changes save directly to Supabase.
          </p>
        </div>

        {toast && (
          <div
            className={`p-3 rounded-xl text-sm font-medium border ${
              toast.type === "success"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {toast.type === "success" ? "✓" : "✕"} {toast.msg}
          </div>
        )}

        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
          {/* ── HERO SLIDES ─────────────────────────────────────────── */}
          {activeTab === "hero" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  {content.hero.slides.length} slide
                  {content.hero.slides.length !== 1 ? "s" : ""} · minimum 1
                  required
                </p>
                <button
                  onClick={addSlide}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-gray-300 text-gray-500 text-xs rounded-lg hover:border-gray-400 hover:text-gray-700 transition-colors"
                >
                  <Plus size={13} /> Add Slide
                </button>
              </div>

              {content.hero.slides.map((slide, i) => (
                <div
                  key={i}
                  className="p-5 bg-gray-50 rounded-xl border border-gray-100 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Slide {i + 1}
                    </p>
                    <button
                      onClick={() => removeSlide(i)}
                      disabled={content.hero.slides.length <= 1}
                      title={
                        content.hero.slides.length <= 1
                          ? "Cannot delete the only slide"
                          : "Delete slide"
                      }
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <Field
                    label="Headline"
                    value={slide.headline}
                    onChange={(v) => updateSlide(i, { headline: v })}
                  />
                  <SlideImageField
                    value={slide.image}
                    onChange={(v) => updateSlide(i, { image: v })}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Primary Button
                      </p>
                      <Field
                        label="Label"
                        value={slide.ctaPrimary.label}
                        onChange={(v) =>
                          updateSlideCta(i, "ctaPrimary", "label", v)
                        }
                      />
                      <Field
                        label="Link"
                        value={slide.ctaPrimary.href}
                        onChange={(v) =>
                          updateSlideCta(i, "ctaPrimary", "href", v)
                        }
                      />
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Secondary Button
                      </p>
                      <Field
                        label="Label"
                        value={slide.ctaSecondary.label}
                        onChange={(v) =>
                          updateSlideCta(i, "ctaSecondary", "label", v)
                        }
                      />
                      <Field
                        label="Link"
                        value={slide.ctaSecondary.href}
                        onChange={(v) =>
                          updateSlideCta(i, "ctaSecondary", "href", v)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── ABOUT ───────────────────────────────────────────────── */}
          {activeTab === "about" && (
            <>
              <Field
                label="Headline"
                value={content.about.headline}
                onChange={(v) =>
                  setContent({
                    ...content,
                    about: { ...content.about, headline: v },
                  })
                }
              />
              <Field
                label="Description"
                value={content.about.description}
                onChange={(v) =>
                  setContent({
                    ...content,
                    about: { ...content.about, description: v },
                  })
                }
                textarea
              />
              <Field
                label="Vision Statement"
                value={content.about.vision}
                onChange={(v) =>
                  setContent({
                    ...content,
                    about: { ...content.about, vision: v },
                  })
                }
                textarea
              />
              <Field
                label="Mission Statement"
                value={content.about.mission}
                onChange={(v) =>
                  setContent({
                    ...content,
                    about: { ...content.about, mission: v },
                  })
                }
                textarea
              />
              <hr className="border-gray-100" />
              <h4 className="font-semibold text-gray-900">Pastor Info</h4>
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Pastor Name"
                  value={content.about.pastor.name}
                  onChange={(v) =>
                    setContent({
                      ...content,
                      about: {
                        ...content.about,
                        pastor: { ...content.about.pastor, name: v },
                      },
                    })
                  }
                />
                <Field
                  label="Wife's Name"
                  value={content.about.pastor.wife}
                  onChange={(v) =>
                    setContent({
                      ...content,
                      about: {
                        ...content.about,
                        pastor: { ...content.about.pastor, wife: v },
                      },
                    })
                  }
                />
              </div>
              <Field
                label="Bio"
                value={content.about.pastor.bio}
                onChange={(v) =>
                  setContent({
                    ...content,
                    about: {
                      ...content.about,
                      pastor: { ...content.about.pastor, bio: v },
                    },
                  })
                }
                textarea
              />
            </>
          )}

          {/* ── TESTIMONIES ─────────────────────────────────────────── */}
          {activeTab === "testimonies" && (
            <div className="space-y-5">
              {testimonies.map((t) => (
                <div
                  key={t.id}
                  className="p-5 bg-gray-50 rounded-xl border border-gray-100 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Testimony
                    </span>
                    <button
                      onClick={() => deleteTestimony(t.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <Field
                    label="Title"
                    value={t.title}
                    onChange={(v) => updateTestimony(t.id, "title", v)}
                  />
                  <Field
                    label="Story"
                    value={t.body}
                    onChange={(v) => updateTestimony(t.id, "body", v)}
                    textarea
                  />
                  <Field
                    label="Author"
                    value={t.author}
                    onChange={(v) => updateTestimony(t.id, "author", v)}
                  />
                </div>
              ))}
              <button
                onClick={addTestimony}
                className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 text-gray-500 text-sm rounded-xl hover:border-gray-400 hover:text-gray-700 transition-colors w-full justify-center"
              >
                <Plus size={16} /> Add Testimony
              </button>
            </div>
          )}

          {/* ── CONTACT ─────────────────────────────────────────────── */}
          {activeTab === "contact" && (
            <>
              <Field
                label="Address"
                value={content.contact.address}
                onChange={(v) =>
                  setContent({
                    ...content,
                    contact: { ...content.contact, address: v },
                  })
                }
                textarea
              />
              {content.contact.phones.map((phone, i) => (
                <Field
                  key={i}
                  label={`Phone ${i + 1}`}
                  value={phone}
                  onChange={(v) => {
                    const phones = [...content.contact.phones];
                    phones[i] = v;
                    setContent({
                      ...content,
                      contact: { ...content.contact, phones },
                    });
                  }}
                />
              ))}
              <Field
                label="Email"
                value={content.contact.email}
                onChange={(v) =>
                  setContent({
                    ...content,
                    contact: { ...content.contact, email: v },
                  })
                }
              />
              <Field
                label="Facebook URL"
                value={content.contact.facebook}
                onChange={(v) =>
                  setContent({
                    ...content,
                    contact: { ...content.contact, facebook: v },
                  })
                }
              />
              <Field
                label="Instagram URL"
                value={content.contact.instagram}
                onChange={(v) =>
                  setContent({
                    ...content,
                    contact: { ...content.contact, instagram: v },
                  })
                }
              />
              <Field
                label="YouTube URL"
                value={content.contact.youtube}
                onChange={(v) =>
                  setContent({
                    ...content,
                    contact: { ...content.contact, youtube: v },
                  })
                }
              />
            </>
          )}

          <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
            <button
              onClick={
                activeTab === "testimonies" ? saveTestimonies : saveContent
              }
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-60"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Save Changes
            </button>
            <div className="flex items-center gap-1.5 text-xs text-amber-600">
              <Info size={13} />
              <span>Changes go live immediately — no re-deploy needed.</span>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

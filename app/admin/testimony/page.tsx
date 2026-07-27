"use client";

import AdminShell from "@/components/AdminShell";
import { useState } from "react";
import { Save, Info, Plus, Trash2 } from "lucide-react";
import initialContent from "@/data/content.json";

type Testimony = { id: string; title: string; body: string; author: string };

export default function AdminContentPage() {
  const [content, setContent] = useState(initialContent);
  const [saveMsg, setSaveMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"hero" | "about" | "testimonies" | "contact">("hero");

  const showSaved = () => {
    setSaveMsg("Content saved! Re-deploy to publish changes.");
    setTimeout(() => setSaveMsg(""), 4000);
  };

  const Field = ({ label, value, onChange, textarea = false, hint }: {
    label: string; value: string; onChange: (v: string) => void; textarea?: boolean; hint?: string;
  }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-2">{hint}</p>}
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400/30 text-sm resize-none" />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400/30 text-sm" />
      )}
    </div>
  );

  const addTestimony = () => {
    const t: Testimony = { id: Date.now().toString(), title: "", body: "", author: "" };
    setContent({ ...content, testimonies: [...content.testimonies, t] });
  };

  const updateTestimony = (id: string, key: keyof Testimony, value: string) => {
    setContent({
      ...content,
      testimonies: content.testimonies.map((t) => t.id === id ? { ...t, [key]: value } : t),
    });
  };

  const deleteTestimony = (id: string) => {
    setContent({ ...content, testimonies: content.testimonies.filter((t) => t.id !== id) });
  };

  const tabs = [
    { id: "hero" as const, label: "Hero" },
    { id: "about" as const, label: "About" },
    { id: "testimonies" as const, label: "Testimonies" },
    { id: "contact" as const, label: "Contact" },
  ];

  return (
    <AdminShell>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Site Content</h2>
          <p className="text-sm text-gray-500">Update the main content across your website.</p>
        </div>

        {saveMsg && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium">
            ✓ {saveMsg}
          </div>
        )}

        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit flex-wrap">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          {activeTab === "hero" && (
            <>
              <Field label="Headline" value={content.hero.headline}
                onChange={(v) => setContent({ ...content, hero: { ...content.hero, headline: v } })} />
              <Field label="Sub-headline" value={content.hero.subheadline}
                onChange={(v) => setContent({ ...content, hero: { ...content.hero, subheadline: v } })}
                textarea hint="Short description shown below the headline" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Primary CTA Label" value={content.hero.ctaPrimary.label}
                  onChange={(v) => setContent({ ...content, hero: { ...content.hero, ctaPrimary: { ...content.hero.ctaPrimary, label: v } } })} />
                <Field label="Secondary CTA Label" value={content.hero.ctaSecondary.label}
                  onChange={(v) => setContent({ ...content, hero: { ...content.hero, ctaSecondary: { ...content.hero.ctaSecondary, label: v } } })} />
              </div>
            </>
          )}

          {activeTab === "about" && (
            <>
              <Field label="Headline" value={content.about.headline}
                onChange={(v) => setContent({ ...content, about: { ...content.about, headline: v } })} />
              <Field label="Description" value={content.about.description}
                onChange={(v) => setContent({ ...content, about: { ...content.about, description: v } })} textarea />
              <Field label="Vision Statement" value={content.about.vision}
                onChange={(v) => setContent({ ...content, about: { ...content.about, vision: v } })} textarea />
              <Field label="Mission Statement" value={content.about.mission}
                onChange={(v) => setContent({ ...content, about: { ...content.about, mission: v } })} textarea />
              <hr className="border-gray-100" />
              <h4 className="font-semibold text-gray-900">Pastor Info</h4>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Pastor Name" value={content.about.pastor.name}
                  onChange={(v) => setContent({ ...content, about: { ...content.about, pastor: { ...content.about.pastor, name: v } } })} />
                <Field label="Title" value={content.about.pastor.title}
                  onChange={(v) => setContent({ ...content, about: { ...content.about, pastor: { ...content.about.pastor, title: v } } })} />
              </div>
              <Field label="Bio" value={content.about.pastor.bio}
                onChange={(v) => setContent({ ...content, about: { ...content.about, pastor: { ...content.about.pastor, bio: v } } })} textarea />
            </>
          )}

          {activeTab === "testimonies" && (
            <div className="space-y-5">
              {content.testimonies.map((t) => (
                <div key={t.id} className="p-5 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Testimony</span>
                    <button onClick={() => deleteTestimony(t.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <Field label="Title" value={t.title} onChange={(v) => updateTestimony(t.id, "title", v)} />
                  <Field label="Story" value={t.body} onChange={(v) => updateTestimony(t.id, "body", v)} textarea />
                  <Field label="Author" value={t.author} onChange={(v) => updateTestimony(t.id, "author", v)} />
                </div>
              ))}
              <button onClick={addTestimony}
                className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 text-gray-500 text-sm rounded-xl hover:border-gray-400 hover:text-gray-700 transition-colors w-full justify-center">
                <Plus size={16} /> Add Testimony
              </button>
            </div>
          )}

          {activeTab === "contact" && (
            <>
              <Field label="Address" value={content.contact.address}
                onChange={(v) => setContent({ ...content, contact: { ...content.contact, address: v } })} textarea />
              {content.contact.phones.map((phone, i) => (
                <Field key={i} label={`Phone ${i + 1}`} value={phone}
                  onChange={(v) => {
                    const phones = [...content.contact.phones];
                    phones[i] = v;
                    setContent({ ...content, contact: { ...content.contact, phones } });
                  }} />
              ))}
              <Field label="Email" value={content.contact.email}
                onChange={(v) => setContent({ ...content, contact: { ...content.contact, email: v } })} />
              <Field label="Facebook URL" value={content.contact.facebook}
                onChange={(v) => setContent({ ...content, contact: { ...content.contact, facebook: v } })} />
              <Field label="Instagram URL" value={content.contact.instagram}
                onChange={(v) => setContent({ ...content, contact: { ...content.contact, instagram: v } })} />
              <Field label="YouTube URL" value={content.contact.youtube}
                onChange={(v) => setContent({ ...content, contact: { ...content.contact, youtube: v } })} />
            </>
          )}

          <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
            <button onClick={showSaved}
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-700 transition-colors">
              <Save size={16} /> Save Changes
            </button>
            <div className="flex items-center gap-1.5 text-xs text-amber-600">
              <Info size={13} />
              <span>Connect a database to persist changes without re-deploying.</span>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
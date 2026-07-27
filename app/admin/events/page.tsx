"use client";

import AdminShell from "@/components/AdminShell";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Save, X, Star, Loader2, Upload } from "lucide-react";
import { supabase, uploadToStorage, type Event } from "@/lib/supabase";

const BLANK: Event = {
  id: "", title: "", theme: "", description: "", dates: "", times: "",
  location: "26/28 Adewunmi Abudu Street, Ajao Estate, Lagos",
  image: "", featured: false, category: "Special Event",
};

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400/30 text-sm text-gray-900";

// ── Defined OUTSIDE parent — prevents focus loss on every keystroke ──

function Field({
  label, value, onChange, textarea = false,
}: {
  label: string; value: string; onChange: (v: string) => void; textarea?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3}
          className={`${inputCls} resize-none`} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
      )}
    </div>
  );
}

function ImageField({
  value, onChange,
}: {
  value: string; onChange: (v: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadToStorage(file, "events");
    setUploading(false);
    if (url) onChange(url);
    // reset input so the same file can be re-selected
    e.target.value = "";
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">Image</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="URL or upload below"
          className={`${inputCls} flex-1`}
        />
        <label className={`flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
          uploading ? "text-gray-400 bg-gray-50" : "text-gray-600 hover:bg-gray-50"
        }`}>
          {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
          {uploading ? "Uploading…" : "Upload"}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
        </label>
      </div>
      {value && (
        <p className="text-xs text-gray-400 mt-1 truncate">{value}</p>
      )}
    </div>
  );
}

function EventForm({
  data, setData, onSave, onCancel, saving, isNew = false,
}: {
  data: Event;
  setData: (e: Event) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  isNew?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Title"    value={data.title}       onChange={(v) => setData({ ...data, title: v })} />
        <Field label="Theme"    value={data.theme ?? ""} onChange={(v) => setData({ ...data, theme: v })} />
        <Field label="Category" value={data.category}    onChange={(v) => setData({ ...data, category: v })} />
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Featured</label>
          <label className="flex items-center gap-2 cursor-pointer mt-2">
            <input type="checkbox" checked={data.featured} onChange={(e) => setData({ ...data, featured: e.target.checked })}
              className="w-4 h-4 rounded" />
            <span className="text-sm text-gray-700">Show as featured on homepage</span>
          </label>
        </div>
      </div>
      <Field label="Description" value={data.description} onChange={(v) => setData({ ...data, description: v })} textarea />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Dates"    value={data.dates}    onChange={(v) => setData({ ...data, dates: v })} />
        <Field label="Times"    value={data.times}    onChange={(v) => setData({ ...data, times: v })} />
        <Field label="Location" value={data.location} onChange={(v) => setData({ ...data, location: v })} />
        <ImageField value={data.image ?? ""} onChange={(v) => setData({ ...data, image: v })} />
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={onSave} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg disabled:opacity-60">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {isNew ? "Add Event" : "Save Changes"}
        </button>
        <button onClick={onCancel} className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg">
          <X size={14} /> Cancel
        </button>
      </div>
    </div>
  );
}

// ── Page component ──────────────────────────────────────────────────────────

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Event | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newEvent, setNewEvent] = useState<Event>({ ...BLANK });
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => { fetchEvents(); }, []);

  async function fetchEvents() {
    setLoading(true);
    const { data, error } = await supabase.from("events").select("*").order("created_at", { ascending: false });
    if (!error && data) setEvents(data);
    setLoading(false);
  }

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }

  const startEdit = (e: Event) => { setEditId(e.id); setEditForm({ ...e }); setIsAdding(false); };
  const cancelEdit = () => { setEditId(null); setEditForm(null); };

  async function saveEdit() {
    if (!editForm) return;
    setSaving(true);
    const { id, created_at, ...payload } = editForm;
    const { error } = await supabase.from("events").update(payload).eq("id", editId!);
    setSaving(false);
    if (error) return showToast("Error: " + error.message, "error");
    setEvents(events.map((e) => (e.id === editId ? editForm : e)));
    setEditId(null); setEditForm(null);
    showToast("Event updated.");
  }

  async function deleteEvent(id: string) {
    if (!confirm("Delete this event?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) return showToast("Error: " + error.message, "error");
    setEvents(events.filter((e) => e.id !== id));
    showToast("Event deleted.");
  }

  async function addEvent() {
    const id = newEvent.title.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
    const { created_at, ...payload } = { ...newEvent, id };
    const { error } = await supabase.from("events").insert(payload);
    if (error) return showToast("Error: " + error.message, "error");
    setEvents([{ ...newEvent, id }, ...events]);
    setIsAdding(false); setNewEvent({ ...BLANK });
    showToast("Event added.");
  }

  return (
    <AdminShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Events</h2>
            <p className="text-sm text-gray-500">{events.length} event(s)</p>
          </div>
          <button onClick={() => { setIsAdding(true); setEditId(null); }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors">
            <Plus size={16} /> Add Event
          </button>
        </div>

        {toast && (
          <div className={`p-3 rounded-xl text-sm font-medium border ${
            toast.type === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}>
            {toast.type === "success" ? "✓" : "✕"} {toast.msg}
          </div>
        )}

        {isAdding && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <h3 className="font-bold text-gray-900 mb-4">New Event</h3>
            <EventForm
              data={newEvent}
              setData={setNewEvent}
              onSave={addEvent}
              onCancel={() => setIsAdding(false)}
              saving={saving}
              isNew
            />
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 size={24} className="animate-spin mr-2" /> Loading…
          </div>
        ) : events.length === 0 && !isAdding ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
            <Star size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No events yet. Add your first event above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {editId === event.id && editForm ? (
                  <div className="p-6">
                    <EventForm
                      data={editForm}
                      setData={setEditForm as (e: Event) => void}
                      onSave={saveEdit}
                      onCancel={cancelEdit}
                      saving={saving}
                    />
                  </div>
                ) : (
                  <div className="p-5 flex items-start gap-4">
                    {event.image && (
                      <img src={event.image} alt={event.title}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 bg-gray-100" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">{event.title}</h3>
                        {event.featured && (
                          <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                            <Star size={9} fill="white" /> Featured
                          </span>
                        )}
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{event.category}</span>
                      </div>
                      {event.theme && <p className="text-amber-600 text-sm italic mb-1">"{event.theme}"</p>}
                      <p className="text-gray-500 text-sm line-clamp-2">{event.description}</p>
                      <p className="text-xs text-gray-400 mt-2">{event.dates} · {event.times}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => startEdit(event)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => deleteEvent(event.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
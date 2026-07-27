"use client";

import AdminShell from "@/components/AdminShell";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Save, X, Calendar, Clock, MapPin, Loader2 } from "lucide-react";
import { supabase, type Service } from "@/lib/supabase";

const BLANK: Omit<Service, "sort_order"> = {
  id: "", title: "", description: "", day: "", time: "",
  location: "26/28 Adewunmi Abudu Street, Ajao Estate", icon: "church",
};

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400/30 text-sm text-gray-900";

// Defined OUTSIDE parent — prevents React from treating it as a new component
// type on every render, which would unmount/remount the input and lose focus.
function Field({
  label, value, onChange, textarea = false,
}: {
  label: string; value: string; onChange: (v: string) => void; textarea?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
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

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Service | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newService, setNewService] = useState<Omit<Service, "sort_order">>(BLANK);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => { fetchServices(); }, []);

  async function fetchServices() {
    setLoading(true);
    const { data, error } = await supabase.from("services").select("*").order("sort_order");
    if (!error && data) setServices(data);
    setLoading(false);
  }

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }

  const startEdit = (s: Service) => { setEditId(s.id); setEditForm({ ...s }); setIsAdding(false); };
  const cancelEdit = () => { setEditId(null); setEditForm(null); };

  async function saveEdit() {
    if (!editForm) return;
    setSaving(true);
    const { error } = await supabase.from("services").update(editForm).eq("id", editId!);
    setSaving(false);
    if (error) return showToast("Error: " + error.message, "error");
    setServices(services.map((s) => (s.id === editId ? editForm : s)));
    setEditId(null); setEditForm(null);
    showToast("Service updated.");
  }

  async function deleteService(id: string) {
    if (!confirm("Delete this service?")) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) return showToast("Error: " + error.message, "error");
    setServices(services.filter((s) => s.id !== id));
    showToast("Service deleted.");
  }

  async function addService() {
    const id = newService.title.toLowerCase().replace(/\s+/g, "-");
    const record: Service = { ...newService, id, sort_order: services.length + 1 };
    const { error } = await supabase.from("services").insert(record);
    if (error) return showToast("Error: " + error.message, "error");
    setServices([...services, record]);
    setIsAdding(false); setNewService(BLANK);
    showToast("Service added.");
  }

  return (
    <AdminShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Church Services</h2>
            <p className="text-sm text-gray-500">{services.length} services total</p>
          </div>
          <button
            onClick={() => { setIsAdding(true); setEditId(null); }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors"
          >
            <Plus size={16} /> Add Service
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
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-gray-900">New Service</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Title"    value={newService.title}    onChange={(v) => setNewService({ ...newService, title: v })} />
              <Field label="Day"      value={newService.day}      onChange={(v) => setNewService({ ...newService, day: v })} />
              <Field label="Time"     value={newService.time}     onChange={(v) => setNewService({ ...newService, time: v })} />
              <Field label="Location" value={newService.location} onChange={(v) => setNewService({ ...newService, location: v })} />
            </div>
            <Field label="Description" value={newService.description} onChange={(v) => setNewService({ ...newService, description: v })} textarea />
            <div className="flex gap-3 pt-2">
              <button onClick={addService} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg">
                <Plus size={14} /> Add
              </button>
              <button onClick={() => setIsAdding(false)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg">
                <X size={14} /> Cancel
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 size={24} className="animate-spin mr-2" /> Loading…
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {editId === service.id && editForm ? (
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Title"    value={editForm.title}    onChange={(v) => setEditForm({ ...editForm, title: v })} />
                      <Field label="Day"      value={editForm.day}      onChange={(v) => setEditForm({ ...editForm, day: v })} />
                      <Field label="Time"     value={editForm.time}     onChange={(v) => setEditForm({ ...editForm, time: v })} />
                      <Field label="Location" value={editForm.location} onChange={(v) => setEditForm({ ...editForm, location: v })} />
                    </div>
                    <Field label="Description" value={editForm.description} onChange={(v) => setEditForm({ ...editForm, description: v })} textarea />
                    <div className="flex gap-3 pt-2">
                      <button onClick={saveEdit} disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg disabled:opacity-60">
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                      </button>
                      <button onClick={cancelEdit} className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg">
                        <X size={14} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900">{service.title}</h3>
                      <p className="text-gray-500 text-sm mt-1 line-clamp-2">{service.description}</p>
                      <div className="flex flex-wrap gap-4 mt-3">
                        <span className="flex items-center gap-1.5 text-xs text-gray-700 font-medium"><Calendar size={11} />{service.day}</span>
                        <span className="flex items-center gap-1.5 text-xs text-gray-500"><Clock size={11} />{service.time}</span>
                        <span className="flex items-center gap-1.5 text-xs text-gray-500"><MapPin size={11} />{service.location}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => startEdit(service)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => deleteService(service.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
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
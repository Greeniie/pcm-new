"use client";

import AdminShell from "@/components/AdminShell";
import { useEffect, useState } from "react";
import { Plus, Trash2, Search, X, Loader2, DollarSign, TrendingUp, Users } from "lucide-react";
import { supabase, type Tither } from "@/lib/supabase";

const BLANK: Omit<Tither, "id" | "created_at"> = {
  name: "", email: "", phone: "", amount: 0,
  date: new Date().toISOString().split("T")[0],
  payment_method: "bank_transfer", bank: "", reference: "", notes: "",
};

const PAYMENT_METHODS = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cash",          label: "Cash" },
  { value: "pos",           label: "POS" },
  { value: "online",        label: "Online" },
];

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400/30 text-sm text-gray-900";

// Defined OUTSIDE parent to prevent focus loss on keystroke
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  );
}

export default function AdminTithersPage() {
  const [tithers, setTithers] = useState<Tither[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newRecord, setNewRecord] = useState<Omit<Tither, "id" | "created_at">>(BLANK);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => { fetchTithers(); }, []);

  async function fetchTithers() {
    setLoading(true);
    const { data, error } = await supabase
      .from("tithers")
      .select("*")
      .order("date", { ascending: false });
    if (!error && data) setTithers(data as Tither[]);
    setLoading(false);
  }

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }

  async function addTither() {
    if (!newRecord.name.trim()) return showToast("Name is required.", "error");
    if (!newRecord.amount || newRecord.amount <= 0) return showToast("Enter a valid amount.", "error");
    setSaving(true);
    const { data, error } = await supabase.from("tithers").insert(newRecord).select().single();
    setSaving(false);
    if (error) return showToast("Error: " + error.message, "error");
    setTithers([data as Tither, ...tithers]);
    setIsAdding(false); setNewRecord(BLANK);
    showToast("Record added.");
  }

  async function deleteTither(id: string) {
    if (!confirm("Delete this record?")) return;
    const { error } = await supabase.from("tithers").delete().eq("id", id);
    if (error) return showToast("Error: " + error.message, "error");
    setTithers(tithers.filter((t) => t.id !== id));
    showToast("Record deleted.");
  }

  const filtered = tithers.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.reference ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const totalAmount = filtered.reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <AdminShell>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Tithers & Offerings</h2>
            <p className="text-sm text-gray-500">Record and track giving</p>
          </div>
          <button onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors">
            <Plus size={16} /> Add Record
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Records", value: filtered.length, icon: Users, color: "bg-blue-50 text-blue-600" },
            { label: "Total Given", value: `₦${totalAmount.toLocaleString()}`, icon: TrendingUp, color: "bg-green-50 text-green-600" },
            {
              label: "This Month",
              value: (() => {
                const m = new Date().toISOString().slice(0, 7);
                const sum = tithers.filter(t => t.date.startsWith(m)).reduce((s, t) => s + Number(t.amount), 0);
                return `₦${sum.toLocaleString()}`;
              })(),
              icon: DollarSign,
              color: "bg-amber-50 text-amber-600",
            },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon size={18} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
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

        {/* Add form */}
        {isAdding && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-gray-900">New Giving Record</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Full Name *">
                <input className={inputCls} value={newRecord.name}
                  onChange={(e) => setNewRecord({ ...newRecord, name: e.target.value })} placeholder="e.g. Sis. Grace Abel" />
              </Field>
              <Field label="Amount (₦) *">
                <input type="number" className={inputCls} value={newRecord.amount || ""}
                  onChange={(e) => setNewRecord({ ...newRecord, amount: parseFloat(e.target.value) || 0 })} placeholder="0.00" />
              </Field>
              <Field label="Date">
                <input type="date" className={inputCls} value={newRecord.date}
                  onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })} />
              </Field>
              <Field label="Payment Method">
                <select className={inputCls} value={newRecord.payment_method}
                  onChange={(e) => setNewRecord({ ...newRecord, payment_method: e.target.value })}>
                  {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </Field>
              <Field label="Bank">
                <input className={inputCls} value={newRecord.bank ?? ""}
                  onChange={(e) => setNewRecord({ ...newRecord, bank: e.target.value })} placeholder="UBA / FCMB" />
              </Field>
              <Field label="Transaction Reference">
                <input className={inputCls} value={newRecord.reference ?? ""}
                  onChange={(e) => setNewRecord({ ...newRecord, reference: e.target.value })} placeholder="Optional" />
              </Field>
              <Field label="Phone">
                <input className={inputCls} value={newRecord.phone ?? ""}
                  onChange={(e) => setNewRecord({ ...newRecord, phone: e.target.value })} placeholder="Optional" />
              </Field>
              <Field label="Email">
                <input type="email" className={inputCls} value={newRecord.email ?? ""}
                  onChange={(e) => setNewRecord({ ...newRecord, email: e.target.value })} placeholder="Optional" />
              </Field>
              <Field label="Notes">
                <input className={inputCls} value={newRecord.notes ?? ""}
                  onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })} placeholder="Optional note" />
              </Field>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={addTither} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 disabled:opacity-60 transition-colors">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Save Record
              </button>
              <button onClick={() => { setIsAdding(false); setNewRecord(BLANK); }}
                className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition-colors">
                <X size={14} /> Cancel
              </button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or reference…"
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-400/30 text-gray-900" />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 size={24} className="animate-spin mr-2" /> Loading records…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
            <DollarSign size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{search ? "No matches found." : "No giving records yet. Add the first one above."}</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Method</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bank / Ref</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t, i) => (
                    <tr key={t.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${i === filtered.length - 1 ? "border-0" : ""}`}>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-gray-900">{t.name}</p>
                        {(t.phone || t.email) && (
                          <p className="text-xs text-gray-400">{t.phone ?? t.email}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-gray-900">
                        ₦{Number(t.amount).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500">
                        {new Date(t.date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full capitalize">
                          {t.payment_method.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs">
                        {t.bank && <span>{t.bank}</span>}
                        {t.bank && t.reference && <span className="text-gray-300 mx-1">·</span>}
                        {t.reference && <span className="font-mono">{t.reference}</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <button onClick={() => deleteTither(t.id)}
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 border-t border-gray-100">
                    <td className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</td>
                    <td className="px-5 py-3 text-right font-bold text-gray-900">₦{totalAmount.toLocaleString()}</td>
                    <td colSpan={4}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
"use client";

import AdminShell from "@/components/AdminShell";
import { useEffect, useState } from "react";
import {
  ArrowLeft, Plus, Trash2, Flame, Loader2,
  Phone, Building2, CreditCard, Calendar, Pencil, Save, X,
} from "lucide-react";
import { supabase, type Tither, type TitheRecord } from "@/lib/supabase";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

// ── Helpers ────────────────────────────────────────────────────
function getPrevMonth(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
}

function calculateStreak(records: TitheRecord[]): number {
  if (!records.length) return 0;
  const months = Array.from(new Set(records.map((r) => r.date.slice(0, 7)))).sort().reverse();
  let streak = 1, cur = months[0];
  for (let i = 1; i < months.length; i++) {
    if (months[i] === getPrevMonth(cur)) { streak++; cur = months[i]; }
    else break;
  }
  return streak;
}

function formatDate(d: string): string {
  return new Date(d + "T00:00:00").toLocaleDateString("en-NG", {
    day: "numeric", month: "long", year: "numeric",
  });
}

// ── Field — outside parent to prevent focus loss ───────────────
const inputCls =
  "w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400/30 text-sm text-gray-900";

const inputClsLight =
  "w-full px-3 py-1.5 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  );
}

function FieldLight({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-white/50 mb-1">{label}</label>
      {children}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────
export default function TitherDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [tither, setTither] = useState<Tither | null>(null);
  const [records, setRecords] = useState<TitheRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ── Edit tither profile state ──────────────────────────────
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "", phone: "", department: "", tithe_card_number: "",
  });

  // ── Edit tithe record state ────────────────────────────────
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editRecordForm, setEditRecordForm] = useState({ date: "", amount: "", notes: "" });

  // ── New record form ────────────────────────────────────────
  const [newRecord, setNewRecord] = useState({
    date: new Date().toISOString().split("T")[0],
    amount: "",
    notes: "",
  });

  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => { if (id) fetchData(); }, [id]);

  async function fetchData() {
    setLoading(true);
    const [{ data: tData }, { data: rData }] = await Promise.all([
      supabase.from("tithers").select("*").eq("id", id).single(),
      supabase.from("tithe_records").select("*").eq("tither_id", id).order("date", { ascending: false }),
    ]);
    if (tData) {
      const t = tData as Tither;
      setTither(t);
      setProfileForm({
        name: t.name,
        phone: t.phone ?? "",
        department: t.department ?? "",
        tithe_card_number: t.tithe_card_number ?? "",
      });
    }
    if (rData) setRecords(rData as TitheRecord[]);
    setLoading(false);
  }

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }

  // ── Tither CRUD ────────────────────────────────────────────
  async function saveProfile() {
    if (!profileForm.name.trim()) return showToast("Name is required.", "error");
    setSaving(true);
    const { error } = await supabase.from("tithers").update(profileForm).eq("id", id);
    setSaving(false);
    if (error) return showToast("Error: " + error.message, "error");
    setTither({ ...tither!, ...profileForm });
    setEditingProfile(false);
    showToast("Profile updated.");
  }

  async function deleteTither() {
    if (!confirm(`Delete ${tither?.name} and ALL their tithe records? This cannot be undone.`)) return;
    const { error } = await supabase.from("tithers").delete().eq("id", id);
    if (error) return showToast("Error: " + error.message, "error");
    router.push("/admin/tithers");
  }

  // ── Tithe record CRUD ──────────────────────────────────────
  async function recordTithe() {
    if (!newRecord.amount || Number(newRecord.amount) <= 0)
      return showToast("Enter a valid amount.", "error");
    setSaving(true);
    const { error } = await supabase.from("tithe_records").insert({
      tither_id: id,
      date: newRecord.date,
      amount: parseFloat(newRecord.amount),
      notes: newRecord.notes || null,
    });
    setSaving(false);
    if (error) return showToast("Error: " + error.message, "error");
    showToast(`₦${Number(newRecord.amount).toLocaleString()} recorded for ${formatDate(newRecord.date)}.`);
    setNewRecord({ date: new Date().toISOString().split("T")[0], amount: "", notes: "" });
    fetchData();
  }

  function startEditRecord(r: TitheRecord) {
    setEditingRecordId(r.id);
    setEditRecordForm({ date: r.date, amount: String(r.amount), notes: r.notes ?? "" });
  }

  async function saveEditRecord() {
    if (!editRecordForm.amount || Number(editRecordForm.amount) <= 0)
      return showToast("Enter a valid amount.", "error");
    setSaving(true);
    const { error } = await supabase.from("tithe_records").update({
      date: editRecordForm.date,
      amount: parseFloat(editRecordForm.amount),
      notes: editRecordForm.notes || null,
    }).eq("id", editingRecordId!);
    setSaving(false);
    if (error) return showToast("Error: " + error.message, "error");
    setRecords(records.map((r) =>
      r.id === editingRecordId
        ? { ...r, date: editRecordForm.date, amount: parseFloat(editRecordForm.amount), notes: editRecordForm.notes || undefined }
        : r
    ));
    setEditingRecordId(null);
    showToast("Record updated.");
  }

  async function deleteRecord(recordId: string) {
    if (!confirm("Delete this record?")) return;
    const { error } = await supabase.from("tithe_records").delete().eq("id", recordId);
    if (error) return showToast("Error: " + error.message, "error");
    setRecords(records.filter((r) => r.id !== recordId));
    showToast("Record deleted.");
  }

  // ── Computed stats ─────────────────────────────────────────
  const streak        = calculateStreak(records);
  const totalAllTime  = records.reduce((s, r) => s + Number(r.amount), 0);
  const uniqueMonths  = new Set(records.map((r) => r.date.slice(0, 7))).size;
  const currentMonth  = new Date().toISOString().slice(0, 7);
  const paidThisMonth = records.some((r) => r.date.startsWith(currentMonth));
  const thisMonthTotal = records
    .filter((r) => r.date.startsWith(currentMonth))
    .reduce((s, r) => s + Number(r.amount), 0);

  // ── Loading / not-found ────────────────────────────────────
  if (loading) return (
    <AdminShell>
      <div className="flex items-center justify-center py-32 text-gray-400">
        <Loader2 size={24} className="animate-spin mr-2" /> Loading…
      </div>
    </AdminShell>
  );

  if (!tither) return (
    <AdminShell>
      <div className="max-w-3xl mx-auto">
        <Link href="/admin/tithers" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6">
          <ArrowLeft size={16} /> Back to Tithers
        </Link>
        <div className="text-center py-32 text-gray-400">Tither not found.</div>
      </div>
    </AdminShell>
  );

  return (
    <AdminShell>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Back */}
        <Link href="/admin/tithers"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors w-fit">
          <ArrowLeft size={16} /> Back to Tithers
        </Link>

        {/* Profile card */}
        <div className="bg-gray-900 rounded-2xl p-6 text-white">
          {editingProfile ? (
            /* ── Edit mode ── */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FieldLight label="Full Name *">
                  <input className={inputClsLight} value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
                </FieldLight>
                <FieldLight label="Phone">
                  <input className={inputClsLight} value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
                </FieldLight>
                <FieldLight label="Department">
                  <input className={inputClsLight} value={profileForm.department}
                    onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })} />
                </FieldLight>
                <FieldLight label="Tithe Card Number">
                  <input className={inputClsLight} value={profileForm.tithe_card_number}
                    onChange={(e) => setProfileForm({ ...profileForm, tithe_card_number: e.target.value })} />
                </FieldLight>
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={saveProfile} disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 text-sm font-semibold rounded-lg disabled:opacity-60 hover:bg-gray-100 transition-colors">
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save
                </button>
                <button onClick={() => setEditingProfile(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white/80 text-sm rounded-lg hover:bg-white/20 transition-colors">
                  <X size={13} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            /* ── View mode ── */
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-xl font-bold">{tither.name}</h2>
                <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3">
                  {tither.phone && (
                    <span className="flex items-center gap-1.5 text-sm text-white/70">
                      <Phone size={13} /> {tither.phone}
                    </span>
                  )}
                  {tither.department && (
                    <span className="flex items-center gap-1.5 text-sm text-white/70">
                      <Building2 size={13} /> {tither.department}
                    </span>
                  )}
                  {tither.tithe_card_number && (
                    <span className="flex items-center gap-1.5 text-sm text-white/70">
                      <CreditCard size={13} /> {tither.tithe_card_number}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {paidThisMonth ? (
                  <span className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-full">
                    ✓ Paid this month
                  </span>
                ) : (
                  <span className="px-3 py-1.5 bg-white/10 text-white/60 text-xs font-semibold rounded-full">
                    Not yet this month
                  </span>
                )}
                <button onClick={() => setEditingProfile(true)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors" title="Edit profile">
                  <Pencil size={14} className="text-white/70" />
                </button>
                <button onClick={deleteTither}
                  className="p-2 bg-white/10 hover:bg-red-500/80 rounded-lg transition-colors" title="Delete tither">
                  <Trash2 size={14} className="text-white/70" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame size={16} className={streak > 0 ? "text-amber-500" : "text-gray-300"} />
              <span className={`text-2xl font-bold ${streak > 0 ? "text-amber-600" : "text-gray-400"}`}>
                {streak}
              </span>
            </div>
            <p className="text-xs text-gray-500">Month Streak</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
            <p className="text-2xl font-bold text-gray-900">{uniqueMonths}</p>
            <p className="text-xs text-gray-500">Months Paid</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
            <p className="text-xl font-bold text-gray-900">₦{thisMonthTotal.toLocaleString()}</p>
            <p className="text-xs text-gray-500">This Month</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
            <p className="text-xl font-bold text-gray-900">₦{totalAllTime.toLocaleString()}</p>
            <p className="text-xs text-gray-500">All-Time</p>
          </div>
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

        {/* Record tithe */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-gray-900">Record a Tithe</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Date">
              <input type="date" className={inputCls} value={newRecord.date}
                onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })} />
            </Field>
            <Field label="Amount (₦) *">
              <input type="number" className={inputCls} value={newRecord.amount}
                onChange={(e) => setNewRecord({ ...newRecord, amount: e.target.value })}
                placeholder="0.00" min="0" />
            </Field>
            <Field label="Notes (optional)">
              <input className={inputCls} value={newRecord.notes}
                onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                placeholder="e.g. First fruits" />
            </Field>
          </div>
          <button onClick={recordTithe} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 disabled:opacity-60 transition-colors">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Record Tithe
          </button>
        </div>

        {/* History */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">History</h3>
            <span className="text-xs text-gray-400">{records.length} record{records.length !== 1 ? "s" : ""}</span>
          </div>

          {records.length === 0 ? (
            <div className="text-center py-14 text-gray-400">
              <Calendar size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No tithes recorded yet.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Notes</th>
                  <th className="px-6 py-3 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  editingRecordId === r.id ? (
                    /* ── Inline edit row ── */
                    <tr key={r.id} className="border-b border-amber-100 bg-amber-50/40">
                      <td className="px-4 py-2">
                        <input type="date" className={inputCls} value={editRecordForm.date}
                          onChange={(e) => setEditRecordForm({ ...editRecordForm, date: e.target.value })} />
                      </td>
                      <td className="px-4 py-2">
                        <input type="number" className={`${inputCls} text-right`} value={editRecordForm.amount}
                          onChange={(e) => setEditRecordForm({ ...editRecordForm, amount: e.target.value })}
                          placeholder="0.00" min="0" />
                      </td>
                      <td className="px-4 py-2 hidden sm:table-cell">
                        <input className={inputCls} value={editRecordForm.notes}
                          onChange={(e) => setEditRecordForm({ ...editRecordForm, notes: e.target.value })}
                          placeholder="Notes" />
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex gap-1.5">
                          <button onClick={saveEditRecord} disabled={saving}
                            className="p-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-60 transition-colors">
                            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                          </button>
                          <button onClick={() => setEditingRecordId(null)}
                            className="p-1.5 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 transition-colors">
                            <X size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    /* ── View row ── */
                    <tr key={r.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${i === records.length - 1 ? "border-0" : ""}`}>
                      <td className="px-6 py-3.5 font-medium text-gray-900">{formatDate(r.date)}</td>
                      <td className="px-6 py-3.5 text-right font-bold text-gray-900">₦{Number(r.amount).toLocaleString()}</td>
                      <td className="px-6 py-3.5 text-gray-400 text-xs hidden sm:table-cell">{r.notes ?? "—"}</td>
                      <td className="px-6 py-3.5">
                        <div className="flex gap-1.5 justify-end">
                          <button onClick={() => startEditRecord(r)}
                            className="p-1.5 text-gray-300 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => deleteRecord(r.id)}
                            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t border-gray-100">
                  <td className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">All-time total</td>
                  <td className="px-6 py-3 text-right font-bold text-gray-900">₦{totalAllTime.toLocaleString()}</td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
"use client";

import AdminShell from "@/components/AdminShell";
import { useEffect, useState } from "react";
import { Plus, Search, X, Loader2, Flame, Trophy, Users, ChevronRight, Trash2 } from "lucide-react";
import { supabase, type Tither, type TitheRecord } from "@/lib/supabase";
import Link from "next/link";

// ── Streak helpers ─────────────────────────────────────────────
function getPrevMonth(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
}

function calculateStreak(records: TitheRecord[]): number {
  if (!records.length) return 0;
  // Derive unique months from exact dates
  const months = [...new Set(records.map((r) => r.date.slice(0, 7)))].sort().reverse();
  let streak = 1, cur = months[0];
  for (let i = 1; i < months.length; i++) {
    if (months[i] === getPrevMonth(cur)) { streak++; cur = months[i]; }
    else break;
  }
  return streak;
}

// ── Field — outside parent to prevent focus loss ───────────────
const inputCls =
  "w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400/30 text-sm text-gray-900";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  );
}

// ── Types ──────────────────────────────────────────────────────
type TitherWithStats = Tither & {
  streak: number;
  totalAmount: number;
  monthsPaid: number;
  paidThisMonth: boolean;
};

// ── Page ───────────────────────────────────────────────────────
export default function AdminTithersPage() {
  const [tithers, setTithers] = useState<TitherWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newTither, setNewTither] = useState({
    name: "", phone: "", department: "", tithe_card_number: "",
  });
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [{ data: tData }, { data: rData }] = await Promise.all([
      supabase.from("tithers").select("*").order("name"),
      supabase.from("tithe_records").select("*"),
    ]);

    if (tData && rData) {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const records = rData as TitheRecord[];

      const withStats: TitherWithStats[] = (tData as Tither[])
        .map((t) => {
          const myRecords = records.filter((r) => r.tither_id === t.id);
          return {
            ...t,
            streak: calculateStreak(myRecords),
            totalAmount: myRecords.reduce((s, r) => s + Number(r.amount), 0),
            monthsPaid: new Set(myRecords.map((r) => r.date.slice(0, 7))).size,
            paidThisMonth: myRecords.some((r) => r.date.startsWith(currentMonth)),
          };
        })
        // Sort: streak desc, then total amount desc
        .sort((a, b) => b.streak - a.streak || b.totalAmount - a.totalAmount);

      setTithers(withStats);
    }
    setLoading(false);
  }

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }

  async function addTither() {
    if (!newTither.name.trim()) return showToast("Name is required.", "error");
    setSaving(true);
    const { error } = await supabase.from("tithers").insert(newTither);
    setSaving(false);
    if (error) return showToast("Error: " + error.message, "error");
    setIsAdding(false);
    setNewTither({ name: "", phone: "", department: "", tithe_card_number: "" });
    showToast("Tither added.");
    fetchAll();
  }

  const filtered = tithers.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.department ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (t.tithe_card_number ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const totalAllTime = tithers.reduce((s, t) => s + t.totalAmount, 0);
  const currentMonth = new Date().toISOString().slice(0, 7);

  const rankLabel = (i: number) =>
    i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`;

  return (
    <AdminShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Tithers</h2>
            <p className="text-sm text-gray-500">{tithers.length} members · ranked by streak</p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors"
          >
            <Plus size={16} /> Add Tither
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{tithers.length}</p>
              <p className="text-xs text-gray-500">Total Tithers</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Flame size={18} className="text-amber-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{tithers[0]?.streak ?? 0}</p>
              <p className="text-xs text-gray-500">Top Streak</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 col-span-2 sm:col-span-1">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <Trophy size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">₦{totalAllTime.toLocaleString()}</p>
              <p className="text-xs text-gray-500">All-Time Total</p>
            </div>
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

        {/* Add form */}
        {isAdding && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-gray-900">New Tither</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name *">
                <input className={inputCls} value={newTither.name}
                  onChange={(e) => setNewTither({ ...newTither, name: e.target.value })}
                  placeholder="e.g. Sis. Grace Abel" />
              </Field>
              <Field label="Phone">
                <input className={inputCls} value={newTither.phone}
                  onChange={(e) => setNewTither({ ...newTither, phone: e.target.value })}
                  placeholder="08012345678" />
              </Field>
              <Field label="Department">
                <input className={inputCls} value={newTither.department}
                  onChange={(e) => setNewTither({ ...newTither, department: e.target.value })}
                  placeholder="e.g. Choir, Ushering" />
              </Field>
              <Field label="Tithe Card Number">
                <input className={inputCls} value={newTither.tithe_card_number}
                  onChange={(e) => setNewTither({ ...newTither, tithe_card_number: e.target.value })}
                  placeholder="e.g. TC-001" />
              </Field>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={addTither} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 disabled:opacity-60 transition-colors">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add Tither
              </button>
              <button onClick={() => setIsAdding(false)}
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, department, or card number…"
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-400/30 text-gray-900"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Leaderboard */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 size={24} className="animate-spin mr-2" /> Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
            <Trophy size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {search ? "No matches found." : "No tithers yet. Add the first one above."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {filtered.map((t, i) => (
              <div key={t.id} className="relative group border-b border-gray-50 last:border-0">
              <Link
                href={`/admin/tithers/${t.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors"
              >
                {/* Rank */}
                <div className="w-8 text-center shrink-0">
                  {i < 3 ? (
                    <span className="text-xl leading-none">{rankLabel(i)}</span>
                  ) : (
                    <span className="text-sm font-bold text-gray-400">{i + 1}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900 truncate">{t.name}</p>
                    {t.paidThisMonth && (
                      <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-md shrink-0">
                        ✓ This month
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    {t.department && (
                      <span className="text-xs text-gray-500">{t.department}</span>
                    )}
                    {t.tithe_card_number && (
                      <span className="text-xs font-mono text-gray-400">{t.tithe_card_number}</span>
                    )}
                  </div>
                </div>

                {/* Streak */}
                <div className="shrink-0 text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <Flame size={14} className={t.streak > 0 ? "text-amber-500" : "text-gray-300"} />
                    <span className={`font-bold text-sm ${t.streak > 0 ? "text-amber-600" : "text-gray-400"}`}>
                      {t.streak}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{t.streak === 1 ? "month" : "months"}</p>
                </div>

                {/* Total */}
                <div className="shrink-0 text-right hidden sm:block">
                  <p className="font-bold text-sm text-gray-900">₦{t.totalAmount.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{t.monthsPaid} payment{t.monthsPaid !== 1 ? "s" : ""}</p>
                </div>

                <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
              </Link>
              {/* Delete button sits outside the Link to avoid navigation */}
              <button
                onClick={async () => {
                  if (!confirm(`Delete ${t.name} and all their records?`)) return;
                  const { error } = await supabase.from("tithers").delete().eq("id", t.id);
                  if (!error) fetchAll();
                }}
                className="absolute right-14 top-1/2 -translate-y-1/2 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                title="Delete tither"
              >
                <Trash2 size={14} />
              </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
"use client";

import AdminShell from "@/components/AdminShell";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Calendar, Star, FileText, ArrowRight, HandCoins, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const quickLinks = [
  { title: "Manage Services",   desc: "Edit weekly church service schedule", href: "/admin/services", icon: Calendar,   color: "bg-blue-50 border-blue-100",   iconColor: "text-blue-600 bg-blue-100" },
  { title: "Manage Events",     desc: "Add or edit upcoming events",         href: "/admin/events",   icon: Star,       color: "bg-amber-50 border-amber-100", iconColor: "text-amber-600 bg-amber-100" },
  { title: "Site Content",      desc: "Update hero, about, contact details", href: "/admin/content",  icon: FileText,   color: "bg-green-50 border-green-100", iconColor: "text-green-600 bg-green-100" },
  { title: "Tithers & Giving",  desc: "Record and track giving",             href: "/admin/tithers",  icon: HandCoins,  color: "bg-purple-50 border-purple-100", iconColor: "text-purple-600 bg-purple-100" },
];

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ services: 0, events: 0, tithers: 0, thisMonth: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      const [services, events, tithers] = await Promise.all([
        supabase.from("services").select("id", { count: "exact", head: true }),
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("tithers").select("amount, date"),
      ]);
      const m = new Date().toISOString().slice(0, 7);
      const thisMonth = (tithers.data ?? [])
        .filter((t) => t.date.startsWith(m))
        .reduce((s: number, t: { amount: number }) => s + Number(t.amount), 0);
      setCounts({
        services: services.count ?? 0,
        events: events.count ?? 0,
        tithers: tithers.data?.length ?? 0,
        thisMonth,
      });
      setLoading(false);
    }
    fetchCounts();
  }, []);

  return (
    <AdminShell>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Welcome */}
        <div className="bg-gray-900 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <h2 className="text-2xl font-bold mb-2">Welcome to PCM Admin</h2>
            <p className="text-white/70 max-w-md">
              Changes are saved and go live immediately.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {loading ? (
            <div className="col-span-4 flex items-center justify-center py-8 text-gray-400">
              <Loader2 size={20} className="animate-spin mr-2" /> Loading stats…
            </div>
          ) : [
            { label: "Services",    value: counts.services,                             icon: Calendar },
            { label: "Events",      value: counts.events,                               icon: Star },
            { label: "Givers",      value: counts.tithers,                              icon: HandCoins },
            { label: "This Month",  value: `₦${counts.thisMonth.toLocaleString()}`,    icon: FileText },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <stat.icon size={18} className="text-gray-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Manage</h3>
          <div className="grid grid-cols-1 gap-4">
            {quickLinks.map((item) => (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-4 p-5 rounded-2xl border ${item.color} hover:shadow-md transition-all group`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.iconColor}`}>
                  <item.icon size={22} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
                <ArrowRight size={18} className="text-gray-400 group-hover:text-gray-700 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center pb-4">
          PCM Admin
        </p>
      </div>
    </AdminShell>
  );
}

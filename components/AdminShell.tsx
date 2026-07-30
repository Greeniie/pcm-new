"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Calendar,
  Star,
  FileText,
  LogOut,
  Menu,
  X,
  ChevronRight,
  HandCoins,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Services", href: "/admin/services", icon: Calendar },
  { label: "Events", href: "/admin/events", icon: Star },
  { label: "Site Content", href: "/admin/content", icon: FileText },
  { label: "Tithers", href: "/admin/tithers", icon: HandCoins },
];

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    // Clear the cookie — middleware will redirect on next request
    document.cookie = "pcm_admin=; path=/; Max-Age=0";
    router.push("/admin/login");
  };

  return (
    <div className="h-screen overflow-hidden flex bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 h-full bg-gray-900 flex flex-col transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center bg-white/10">
            <Image
              src="/images/logo.png"
              alt="PCM Logo"
              width={36}
              height={36}
              className="object-contain"
            />
          </div>
          <div>
            <p className="text-white font-bold text-sm">PCM Admin</p>
            <p className="text-white/40 text-xs">Content Manager</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-amber-500 text-white"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <item.icon size={18} />
                {item.label}
                {isActive && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 text-white/60 hover:text-white text-sm transition-colors rounded-lg hover:bg-white/5"
          >
            View Website ↗
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-white/60 hover:text-red-400 text-sm transition-colors w-full rounded-lg hover:bg-white/5"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
          <button
            className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div>
            <h1 className="font-bold text-gray-900 text-sm">
              {navItems.find(
                (n) =>
                  n.href === pathname ||
                  (n.href !== "/admin" && pathname.startsWith(n.href)),
              )?.label ?? "Dashboard"}
            </h1>
            <p className="text-xs text-gray-500">
              Pentecostal Canaanland Mission
            </p>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

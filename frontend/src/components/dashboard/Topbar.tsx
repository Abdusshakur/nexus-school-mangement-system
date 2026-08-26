import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Menu, Search, Bell, ChevronLeft } from "lucide-react";
import { getNavItems } from "./navItems";
import { useUIStore } from "../../store/ui";
import { useAuthStore } from "../../store/auth";
import { ROUTES } from "../../config/routes";

export function Topbar() {
  const location = useLocation();
  const { sidebarCollapsed: collapsed, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();
  const [search, setSearch] = useState("");

  const role = user?.role || "admin";
  const NAV_ITEMS = getNavItems(role);

  const theme = {
    accent: "text-indigo-600",
    focusRing: "focus:ring-indigo-600/15 focus:border-indigo-600",
  };

  const firstName = user?.first_name || "";
  const lastName = user?.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim();

  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "";

  const profile = {
    initials,
    name: fullName,
    role: user?.role === "teacher" ? "Teacher" : "Administrator",
  };

  const currentLabel =
    NAV_ITEMS.find((n) => {
      if (
        n.href === ROUTES.ADMIN.DASHBOARD ||
        n.href === ROUTES.TEACHER.DASHBOARD
      ) {
        return location.pathname === n.href;
      }
      return location.pathname.startsWith(n.href);
    })?.label ?? "";

  return (
    <header
      id="dashboard-topbar"
      className="h-16 bg-white flex items-center px-6 gap-4 shrink-0 font-sans border-b border-slate-200"
    >
      {/* Hamburger */}
      <button
        onClick={toggleSidebar}
        className="p-1.5 rounded-lg text-slate-500 transition-colors cursor-pointer hover:bg-slate-100 bg-transparent"
      >
        {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
      </button>

      {/* School name + current page */}
      <div>
        <p className="font-semibold text-slate-900 text-sm leading-none font-sans">
          Nexus Academy
        </p>
        <p
          className="text-slate-400 leading-none mt-0.5 font-sans"
          style={{ fontSize: 12 }}
        >
          {currentLabel}
        </p>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-sm ml-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search students, classes, or reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all ${theme.focusRing}`}
          />
        </div>
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">
        {/* Bell */}
        <button className="relative p-2 rounded-lg text-slate-500 transition-colors cursor-pointer hover:bg-slate-100">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600" />
        </button>

        <div className="h-8 w-px bg-slate-200" />

        {/* Profile Dropdown (static for now) */}
        <div className="flex items-center gap-3 pl-1 cursor-pointer group">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white bg-indigo-600`}
          >
            {profile.initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-slate-900 leading-tight">
              {profile.name}
            </p>
            <p className="text-xs text-slate-500 font-medium">{profile.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

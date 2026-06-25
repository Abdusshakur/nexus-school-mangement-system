import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Menu, X, Search, Bell } from "lucide-react";
import { NAV_ITEMS } from "./navItems";

interface TopbarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Topbar({ collapsed, onToggle }: TopbarProps) {
  const location = useLocation();
  const [search, setSearch] = useState("");

  const currentLabel =
    NAV_ITEMS.find((n) =>
      n.href === "/"
        ? location.pathname === "/"
        : location.pathname.startsWith(n.href),
    )?.label ?? "";

  return (
    <header
      id="dashboard-topbar"
      className="h-16 bg-white flex items-center px-6 gap-4 flex-shrink-0 font-sans"
      style={{ borderBottom: "1px solid #E2E8F0" }}
    >
      {/* Hamburger */}
      <button
        onClick={onToggle}
        className="p-1.5 rounded-lg text-slate-500 transition-colors cursor-pointer"
        style={{ background: "transparent" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = "#F1F5F9";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "transparent";
        }}
      >
        {collapsed ? <Menu size={20} /> : <X size={20} />}
      </button>

      {/* School name + current page */}
      <div>
        <p className="font-semibold text-slate-900 text-sm leading-none font-sans">
          Westwood Academy
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
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students, teachers…"
            className="w-full pl-8 pr-4 py-2 text-sm rounded-lg transition-all font-sans"
            style={{
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              color: "#0F172A",
              outline: "none",
            }}
            onFocus={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#6366F1";
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 0 0 3px rgba(99,102,241,0.15)";
            }}
            onBlur={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          />
        </div>
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">
        {/* Bell */}
        <button
          className="relative p-2 rounded-lg text-slate-500 transition-colors cursor-pointer"
          style={{ background: "transparent" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "#F1F5F9";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        >
          <Bell size={20} />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: "#6366F1" }}
          />
        </button>

        {/* Profile */}
        <div
          className="flex items-center gap-2.5 pl-3"
          style={{ borderLeft: "1px solid #E2E8F0" }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "#6366F1" }}
          >
            <span className="text-white font-semibold" style={{ fontSize: 13 }}>
              SA
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-900 leading-none font-sans">
              Sarah Admin
            </p>
            <p
              className="text-slate-400 leading-none mt-0.5 font-sans"
              style={{ fontSize: 11 }}
            >
              Administrator
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

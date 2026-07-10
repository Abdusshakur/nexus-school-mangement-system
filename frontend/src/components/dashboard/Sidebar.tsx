import { Link, useLocation } from "react-router-dom";
import { ChevronRight, LogOut } from "lucide-react";
import { NAV_ITEMS } from "./navItems";

interface SidebarProps {
  collapsed: boolean;
}

export function Sidebar({ collapsed }: SidebarProps) {
  const location = useLocation();

  return (
    <aside
      id="dashboard-sidebar"
      className="flex flex-col h-full transition-all duration-300 font-inter"
      style={{
        width: collapsed ? 72 : 256,
        background: "#1E1B4B",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0">
          <span className="font-bold text-white">N</span>
        </div>
        {!collapsed && (
          <div>
            <p className="text-white font-semibold text-base leading-tight">
              Nexus
            </p>
          </div>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              title={item.label}
              className="flex items-center gap-3 mx-3 mb-1 px-3 py-2.5 rounded-lg transition-colors duration-150"
              style={
                active
                  ? { background: "#6366F1", color: "#fff" }
                  : { color: "#A5B4FC" }
              }
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(255,255,255,0.08)";
                  (e.currentTarget as HTMLElement).style.color = "#fff";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "";
                  (e.currentTarget as HTMLElement).style.color = "#A5B4FC";
                }
              }}
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && (
                <>
                  <span className="text-sm font-medium flex-1 truncate">
                    {item.label}
                  </span>
                  {active && (
                    <ChevronRight size={14} style={{ opacity: 0.6 }} />
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div
        className="px-3 py-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <Link
          to="/login"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 font-sans"
          style={{ color: "#A5B4FC" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              "rgba(255,255,255,0.08)";
            (e.currentTarget as HTMLElement).style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "";
            (e.currentTarget as HTMLElement).style.color = "#A5B4FC";
          }}
        >
          <LogOut size={18} className="text-red-400" />
          {!collapsed && (
            <span className="text-sm font-medium text-red-400">Logout</span>
          )}
        </Link>
      </div>
    </aside>
  );
}

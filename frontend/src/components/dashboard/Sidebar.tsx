import { Link, useLocation } from "react-router-dom";
import { ChevronRight, LogOut } from "lucide-react";
import { getNavItems } from "./navItems";
import { useUIStore } from "../../store/ui";
import { useAuthStore } from "../../store/auth";
import { ROUTES } from "../../config/routes";

export function Sidebar() {
  const location = useLocation();
  const { sidebarCollapsed: collapsed } = useUIStore();
  const { user, logout } = useAuthStore();
  const role = user?.role || "admin";
  const NAV_ITEMS = getNavItems(role);


  const theme = {
    sidebar: "bg-indigo-950",
    activeLink: "bg-indigo-600",
    hoverLink: "hover:bg-white/10 hover:text-white",
    inactiveText: "text-indigo-200",
    logoBg: "bg-indigo-600",
  };

  return (
    <aside
      id="dashboard-sidebar"
      className={`flex flex-col h-full transition-all duration-300 shrink-0 ${theme.sidebar}`}
      style={{
        width: collapsed ? 72 : 256,
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-5 border-b border-white/10"
      >
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${theme.logoBg}`}
        >
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
          // Exact match for dashboard roots, prefix match for subpages
          const active =
            (item.href === ROUTES.ADMIN.DASHBOARD &&
              location.pathname === ROUTES.ADMIN.DASHBOARD) ||
            (item.href === ROUTES.TEACHER.DASHBOARD &&
              location.pathname === ROUTES.TEACHER.DASHBOARD) ||
            (item.href !== ROUTES.ADMIN.DASHBOARD &&
              item.href !== ROUTES.TEACHER.DASHBOARD &&
              location.pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              to={item.href}
              title={item.label}
              className={`flex items-center gap-3 mx-3 mb-1 px-3 py-2.5 rounded-lg transition-colors duration-150 ${
                active
                  ? `${theme.activeLink} text-white`
                  : `${theme.inactiveText} ${theme.hoverLink}`
              }`}
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
        className="px-3 py-4 border-t border-white/10"
      >
        <Link
          to="/login"
          onClick={() => {
            logout();
          }}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 font-sans ${theme.inactiveText} ${theme.hoverLink}`}
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

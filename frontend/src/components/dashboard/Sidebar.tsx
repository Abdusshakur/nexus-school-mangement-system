import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, ChevronDown, LogOut, CalendarCheck, ClipboardList, QrCode } from "lucide-react";
import { getNavItems } from "./navItems";
import { useUIStore } from "../../store/ui";
import { useAuthStore } from "../../store/auth";
import { ROUTES } from "../../config/routes";

export function Sidebar() {
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const location = useLocation();
  const { sidebarCollapsed: collapsed } = useUIStore();
  const { user, logout } = useAuthStore();
  const role = user?.role || "admin";
  const NAV_ITEMS = getNavItems(role);

  const ATTENDANCE_SUB_ITEMS = [
    { label: "Class Attendance", href: ROUTES.ADMIN.ATTENDANCE_CLASSES, icon: CalendarCheck },
    { label: "Teacher Assignment", href: ROUTES.ADMIN.ATTENDANCE_TEACHERS, icon: ClipboardList },
    { label: "QR Scanner", href: ROUTES.ADMIN.ATTENDANCE_TEACHER_RECORDS, icon: QrCode }
  ];


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
              
          const isAttendanceParent = item.label === "Attendance" && role === "admin";
          const isAttendanceSubroute = location.pathname.startsWith(ROUTES.ADMIN.ATTENDANCE);

          return (
            <div key={item.href} className="w-full">
              <Link
                to={isAttendanceParent ? "#" : item.href}
                title={item.label}
                onClick={(e) => {
                  if (isAttendanceParent) {
                    e.preventDefault();
                    setAttendanceOpen(!attendanceOpen);
                  }
                }}
                className={`flex items-center gap-3 mx-3 mb-1 px-3 py-2.5 rounded-lg transition-colors duration-150 ${
                  active || (isAttendanceParent && isAttendanceSubroute)
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
                    {isAttendanceParent ? (
                      attendanceOpen ? (
                        <ChevronDown size={14} className="opacity-60" />
                      ) : (
                        <ChevronRight size={14} className="opacity-60" />
                      )
                    ) : (
                      active && <ChevronRight size={14} className="opacity-60" />
                    )}
                  </>
                )}
              </Link>

              {/* Tree-view children for Attendance */}
              {isAttendanceParent && attendanceOpen && !collapsed && (
                <div className="relative ml-6 mr-3 mb-1">
                  {/* Vertical guide line running the full height of the subtree */}
                  <div className="absolute left-[15px] top-0 bottom-[10px] w-px bg-indigo-500/35 rounded-[1px]" />

                  {ATTENDANCE_SUB_ITEMS.map((sub, idx) => {
                    const isLast = idx === ATTENDANCE_SUB_ITEMS.length - 1;
                    const subActive = location.pathname === sub.href;
                    return (
                      <div key={sub.href + sub.label} className="relative flex items-center">
                        {/* Horizontal connector: elbow for last, T-branch for others */}
                        <div
                          className={`absolute left-[15px] top-1/2 w-[12px] border-l border-b border-indigo-500/35 ${
                            isLast
                              ? "h-[50%] -translate-y-full rounded-bl-[3px]"
                              : "h-[1px] -translate-y-1/2"
                          }`}
                        />
                        <Link
                          to={sub.href}
                          title={sub.label}
                          className={`flex items-center gap-2 rounded-md transition-colors duration-150 ml-[30px] mb-[2px] px-2.5 py-[5px] flex-1 ${
                            subActive
                              ? "bg-indigo-500/20 text-white"
                              : "text-indigo-200 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <sub.icon size={13} className="shrink-0 opacity-85" />
                          <span className="text-xs font-medium">{sub.label}</span>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
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

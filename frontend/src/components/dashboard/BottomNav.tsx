import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogOut, ChevronDown, ChevronRight } from "lucide-react";
import { getPrimaryNavItems, getNavItems, ADMIN_ATTENDANCE_SUB_ITEMS } from "./navItems";
import { useAuthStore } from "../../store/auth";

export function BottomNav() {
  const { user, logout } = useAuthStore();
  const role = user?.role || "admin";
  const location = useLocation();
  const primaryItems = getPrimaryNavItems(role);
  const allItems = getNavItems(role);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around h-16 px-2">
          {primaryItems.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? "text-indigo-600" : "text-slate-500 active:bg-slate-50"}`}
              >
                <item.icon
                  size={22}
                  className={isActive ? "fill-indigo-50 text-indigo-600" : "text-slate-500"}
                />
                <span className={`text-[10px] font-medium text-center leading-tight px-1 ${isActive ? "font-bold" : ""}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Menu Toggle Tab */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isMenuOpen ? "text-indigo-600" : "text-slate-500 active:bg-slate-50"}`}
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            <span className={`text-[10px] font-medium text-center leading-tight px-1 ${isMenuOpen ? "font-bold" : ""}`}>
              Menu
            </span>
          </button>
        </div>
      </nav>

      {/* Full Screen Menu Overlay */}
      <div
        className={`md:hidden fixed inset-0 z-30 bg-white transition-transform duration-300 ease-in-out ${isMenuOpen ? "translate-y-0" : "translate-y-full"}`}
        style={{ top: 0, paddingBottom: "64px" }}
      >
        <div className="flex flex-col h-full overflow-y-auto px-6 py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Menu</h2>
            <p className="text-sm text-slate-500">All modules & settings</p>
          </div>

          <div className="grid gap-3">
            {allItems.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              const isAttendance = item.label === "Attendance" && role === "admin";
              return (
                <div key={item.href} className="w-full">
                  <Link
                    to={isAttendance ? "#" : item.href}
                    onClick={(e) => {
                      if (isAttendance) {
                        e.preventDefault();
                        setAttendanceOpen(!attendanceOpen);
                      } else {
                        setIsMenuOpen(false);
                      }
                    }}
                    className={`flex items-center gap-4 p-4 rounded-xl border ${isActive ? "bg-indigo-50 border-indigo-100 text-indigo-700" : "bg-white border-slate-200 text-slate-700 active:bg-slate-50"} transition-colors`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isActive ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"}`}>
                      <item.icon size={20} />
                    </div>
                    <span className="font-semibold text-base flex-1">{item.label}</span>
                    {isAttendance && (
                      attendanceOpen ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronRight size={20} className="text-slate-400" />
                    )}
                  </Link>

                  {isAttendance && attendanceOpen && (
                    <div className="mt-2 ml-4 pl-4 border-l-2 border-indigo-100 flex flex-col gap-2">
                      {ADMIN_ATTENDANCE_SUB_ITEMS.map((sub) => {
                        const subActive = location.pathname === sub.href;
                        return (
                          <Link
                            key={sub.href}
                            to={sub.href}
                            onClick={() => setIsMenuOpen(false)}
                            className={`flex items-center gap-3 p-3 rounded-xl border ${subActive ? "bg-indigo-50 border-indigo-100 text-indigo-700" : "bg-white border-slate-100 text-slate-600 active:bg-slate-50"} transition-colors`}
                          >
                            <sub.icon size={18} className={subActive ? "text-indigo-600" : "text-slate-400"} />
                            <span className="font-medium text-sm">{sub.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 pb-20">
            <button
              onClick={() => {
                setIsMenuOpen(false);
                logout();
              }}
              className="flex items-center gap-4 p-4 w-full rounded-xl bg-red-50 text-red-600 active:bg-red-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-100 text-red-600">
                <LogOut size={20} />
              </div>
              <span className="font-semibold text-base">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

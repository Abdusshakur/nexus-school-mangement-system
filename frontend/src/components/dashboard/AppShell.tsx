import React from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { BottomNav } from "./BottomNav";
import { useAuthStore } from "../../store/auth";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { user } = useAuthStore();
  const role = user?.role || "admin";
  
  const bgClass = role === "teacher" ? "bg-slate-50" : "bg-indigo-50";

  return (
    <div id="dashboard-app-shell" className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar />
        <main className={`flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 pb-24 md:pb-6 transition-colors ${bgClass}`}>
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}

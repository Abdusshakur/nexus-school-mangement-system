import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { AppShell } from "../components/dashboard/AppShell";
import { useAuthStore } from "../store/auth";

export function DashboardLayout() {
  const { refreshUser } = useAuthStore();

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

import { Outlet } from "react-router-dom";
import { AppShell } from "../../components/dashboard/AppShell";

export function DashboardLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

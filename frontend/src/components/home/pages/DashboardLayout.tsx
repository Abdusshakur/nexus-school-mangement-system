import { Outlet } from "react-router-dom";
import { AppShell } from "../../dashboard/components/AppShell";

export function DashboardLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

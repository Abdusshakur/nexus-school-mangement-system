import React from "react";
import { Outlet } from "react-router-dom";
import { AppShell } from "../components/AppShell";

export function DashboardLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

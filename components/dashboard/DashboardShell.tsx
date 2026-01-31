"use client";

import * as React from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        <Sidebar />
        <main className="min-w-0 space-y-6">{children}</main>
      </div>
    </div>
  );
}

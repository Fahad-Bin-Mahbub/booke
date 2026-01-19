import * as React from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr]">
        <Sidebar />
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}

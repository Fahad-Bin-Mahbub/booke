"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth/client";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 10,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AutoSeed />
        {children}
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AutoSeed() {
  React.useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const key = "booke_seed_attempted";
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");

      // Seed only if the DB looks empty (server checks without wiping existing data).
      void fetch("/api/seed?ifEmpty=1", { method: "POST" });
    } catch {
      // no-op
    }
  }, []);
  return null;
}

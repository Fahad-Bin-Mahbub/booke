"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/client";
import { EmptyState } from "@/components/EmptyState";
import Link from "next/link";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, isReady } = useAuth();

  React.useEffect(() => {
    if (isReady && !token) router.replace("/login");
  }, [isReady, token, router]);

  if (!token) {
    return (
      <EmptyState
        title="Login required"
        description="Please login to access your dashboard."
        action={
          <Link href="/login" className="btn btn-primary">Go to login</Link>
        }
      />
    );
  }

  return <>{children}</>;
}

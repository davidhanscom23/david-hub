"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/fitops/app-shell";
import { useFitOps } from "@/components/providers/fitops-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { ready, state } = useFitOps();
  const router = useRouter();

  useEffect(() => {
    if (ready && !state.authenticated) router.replace("/login");
  }, [ready, state.authenticated, router]);

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-[var(--fit-muted)]">
        Loading…
      </div>
    );
  }

  if (!state.authenticated) return null;

  return <AppShell>{children}</AppShell>;
}

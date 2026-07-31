"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFitOps } from "@/components/providers/fitops-provider";

export default function HomePage() {
  const { ready, state } = useFitOps();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    router.replace(state.authenticated ? "/today" : "/login");
  }, [ready, state.authenticated, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[var(--fit-bg)] text-sm text-[var(--fit-muted)]">
      Loading FitOps Daily…
    </div>
  );
}

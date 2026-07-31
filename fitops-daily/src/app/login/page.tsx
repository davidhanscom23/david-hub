"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFitOps } from "@/components/providers/fitops-provider";
import { SafetyNotice } from "@/components/fitops/safety-notice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const { ready, state, loginDemo } = useFitOps();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabaseReady = isSupabaseConfigured();

  useEffect(() => {
    if (ready && state.authenticated) router.replace("/today");
  }, [ready, state.authenticated, router]);

  async function handleSupabaseAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!supabaseReady) return;
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      if (mode === "signin") {
        const { error: err } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
      }
      loginDemo();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--fit-accent)]">
            FitOps Daily
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--fit-text)]">
            Sign in privately
          </h1>
          <p className="mt-2 text-sm text-[var(--fit-muted)]">
            Know today&apos;s workout, mark what you did, and keep a simple
            journal.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--fit-border)] bg-[var(--fit-surface)] p-6 shadow-[0_8px_30px_rgba(31,36,28,0.06)]">
          {supabaseReady ? (
            <form onSubmit={handleSupabaseAuth} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 bg-[var(--fit-bg)]"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete={
                    mode === "signin" ? "current-password" : "new-password"
                  }
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5 bg-[var(--fit-bg)]"
                />
              </div>
              {error && (
                <p className="text-sm text-[var(--fit-alert)]">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? "Working…"
                  : mode === "signin"
                    ? "Sign in"
                    : "Create account"}
              </Button>
              <button
                type="button"
                className="w-full text-center text-sm text-[var(--fit-muted)] hover:text-[var(--fit-text)]"
                onClick={() =>
                  setMode((m) => (m === "signin" ? "signup" : "signin"))
                }
              >
                {mode === "signin"
                  ? "Need an account? Sign up"
                  : "Have an account? Sign in"}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-[var(--fit-muted)]">
                Supabase is not configured yet. Use local demo mode to try the
                full MVP on this device. Data stays in your browser.
              </p>
              <button
                type="button"
                className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-[var(--fit-primary)] px-4 text-sm font-medium text-white hover:bg-[var(--fit-primary)]/90"
                onClick={() => loginDemo()}
              >
                Continue in demo mode
              </button>
            </div>
          )}

          {supabaseReady && (
            <div className="mt-4 border-t border-[var(--fit-border)] pt-4">
              <button
                type="button"
                className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-[var(--fit-border)] bg-[var(--fit-bg)] px-4 text-sm font-medium hover:bg-[var(--fit-surface)]"
                onClick={() => loginDemo()}
              >
                Continue in local demo mode
              </button>
            </div>
          )}
        </div>

        <SafetyNotice compact />
      </div>
    </div>
  );
}

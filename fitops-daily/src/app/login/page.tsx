"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFitOps } from "@/components/providers/fitops-provider";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const {
    ready,
    state,
    loginDemo,
    signupLocal,
    loginLocal,
    loginWithSupabaseSession,
  } = useFitOps();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const supabaseReady = isSupabaseConfigured();

  useEffect(() => {
    if (ready && state.authenticated) router.replace("/today");
  }, [ready, state.authenticated, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);

    try {
      if (supabaseReady) {
        const supabase = createClient();

        if (mode === "signup") {
          const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: {
                display_name: displayName.trim() || email.split("@")[0],
              },
            },
          });
          if (error) throw error;
          if (data.session && data.user) {
            loginWithSupabaseSession({
              userId: data.user.id,
              email: data.user.email ?? email.trim(),
              displayName:
                (data.user.user_metadata?.display_name as string) ||
                displayName.trim() ||
                null,
            });
            router.push("/today");
            return;
          }
          setMessage(
            "Account created. Check your email to confirm, then sign in. (If email confirmation is disabled in Supabase, you can sign in immediately.)",
          );
          setMode("signin");
          return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        if (!data.user) throw new Error("Sign-in succeeded but no user was returned.");
        loginWithSupabaseSession({
          userId: data.user.id,
          email: data.user.email ?? email.trim(),
          displayName:
            (data.user.user_metadata?.display_name as string) || null,
        });
        router.push("/today");
        return;
      }

      if (mode === "signup") {
        await signupLocal({
          email,
          password,
          displayName: displayName.trim() || email.split("@")[0],
        });
        router.push("/today");
        return;
      }

      await loginLocal(email, password);
      router.push("/today");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-4 py-10">
      <div className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Shield className="h-6 w-6" />
        </div>
        <h1 className="font-display text-3xl font-bold tracking-wide">FITOPS DAILY</h1>
        <p className="text-sm text-muted-foreground">
          Private military-style workout tracker. Create your own account to keep
          logs separate from friends.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-4 grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant={mode === "signin" ? "default" : "outline"}
            onClick={() => {
              setMode("signin");
              setMessage(null);
            }}
          >
            Sign in
          </Button>
          <Button
            type="button"
            variant={mode === "signup" ? "default" : "outline"}
            onClick={() => {
              setMode("signup");
              setMessage(null);
            }}
          >
            Create account
          </Button>
        </div>

        <form className="space-y-3" onSubmit={onSubmit}>
          {mode === "signup" ? (
            <div className="space-y-1.5">
              <Label htmlFor="name">Display name</Label>
              <Input
                id="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="David"
                autoComplete="name"
              />
            </div>
          ) : null}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
          </div>
          <Button className="w-full" type="submit" disabled={busy}>
            {busy ? "Working…" : mode === "signup" ? "Create account" : "Sign in"}
          </Button>
        </form>

        {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}

        <p className="mt-4 text-xs text-muted-foreground">
          {supabaseReady
            ? "Accounts use Supabase Auth. Each person gets their own session and training data."
            : "No Supabase env vars detected — accounts stay on this device only. For friends on other phones, deploy with Supabase Auth (see README)."}
        </p>
      </div>

      <Button
        variant="secondary"
        onClick={() => {
          loginDemo();
          router.push("/today");
        }}
      >
        Continue in demo mode
      </Button>
    </main>
  );
}

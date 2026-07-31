"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  ChartNoAxesCombined,
  Dumbbell,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/today", label: "Today", icon: CalendarDays },
  { href: "/routine", label: "Routine", icon: Dumbbell },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/progress", label: "Progress", icon: ChartNoAxesCombined },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--fit-border)] bg-[var(--fit-surface)]/95 backdrop-blur md:hidden">
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-1 py-2 text-[11px] font-medium transition-colors",
                  active
                    ? "text-[var(--fit-primary)]"
                    : "text-[var(--fit-muted)] hover:text-[var(--fit-text)]",
                )}
              >
                <Icon className="size-5" strokeWidth={active ? 2.4 : 2} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 border-r border-[var(--fit-border)] bg-[var(--fit-surface)] md:block">
      <div className="sticky top-0 flex h-dvh flex-col gap-6 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--fit-accent)]">
            FitOps
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-[var(--fit-text)]">
            Daily
          </h1>
        </div>
        <ul className="space-y-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-[var(--fit-primary)] text-white"
                      : "text-[var(--fit-muted)] hover:bg-[var(--fit-bg)] hover:text-[var(--fit-text)]",
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
        <p className="mt-auto text-xs leading-relaxed text-[var(--fit-muted)]">
          Private training log. Three workouts a week. Recovery counts.
        </p>
      </div>
    </aside>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-[var(--fit-bg)] text-[var(--fit-text)]">
      <SideNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24 pt-5 md:px-8 md:pb-10 md:pt-8">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_GROUPS } from "./nav-items";
import type { Role } from "@/lib/session";

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();

  return (
    <nav className="flex w-56 shrink-0 flex-col gap-6 border-r border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-6">
      <Link href="/dashboard" className="flex items-center gap-2 px-2">
        <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md ring-1 ring-[var(--color-border)]">
          <Image
            src="/logo.png"
            alt="Asia Digital Frontend Venture"
            fill
            sizes="36px"
            className="object-cover object-left"
          />
        </span>
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-sm font-semibold text-[var(--color-text)]">TCMS</span>
          <span className="truncate text-[10px] text-[var(--color-text-muted)]">Asia Digital Frontend Venture</span>
        </span>
      </Link>
      {NAV_GROUPS.map((group) => {
        const items = group.items.filter((item) => !item.roles || item.roles.includes(role));
        if (items.length === 0) return null;
        return (
          <div key={group.title}>
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              {group.title}
            </p>
            <ul className="flex flex-col gap-0.5">
              {items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block rounded-md px-2 py-1.5 text-sm ${
                        active
                          ? "bg-[var(--color-accent)] text-white"
                          : "text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

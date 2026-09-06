"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, ChartNoAxesCombined, Dumbbell, House, LibraryBig, Settings } from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  { href: "/app", label: "Overview", icon: House },
  { href: "/app/plan", label: "My plan", icon: Dumbbell },
  { href: "/app/plans", label: "Library", icon: LibraryBig },
  { href: "/app/progress", label: "Progress", icon: ChartNoAxesCombined },
  { href: "/app/coach", label: "Coach", icon: Bot },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function AppNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  return (
    <nav className={cn(mobile ? "grid grid-cols-6" : "space-y-1")}>
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/app" || href === "/app/plan" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg text-sm transition-colors",
              mobile ? "flex-col justify-center gap-1 px-1 py-2 text-[10px]" : "px-3 py-2.5",
              active ? "bg-sidebar-accent text-primary" : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

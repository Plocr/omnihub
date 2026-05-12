"use client";

import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function Sidebar() {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "all";

  return (
    <aside className="w-60 shrink-0 hidden lg:block">
      <nav className="sticky top-20 space-y-1">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={cat.id === "all" ? "/explore" : `/explore?category=${cat.id}`}
            className={cn(
              "block rounded-md px-3 py-2 text-sm transition-colors",
              currentCategory === cat.id
                ? "bg-accent font-medium text-foreground"
                : "text-muted hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {cat.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

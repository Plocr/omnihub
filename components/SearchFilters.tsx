"use client";

import { useRouter } from "next/navigation";
import { CATEGORIES, SOURCE_TYPES } from "@/lib/constants";

interface SearchFiltersProps {
  currentQuery: string;
  currentCategory: string;
  currentSourceType: string;
}

export function SearchFilters({
  currentQuery,
  currentCategory,
  currentSourceType,
}: SearchFiltersProps) {
  const router = useRouter();

  function navigate(params: Record<string, string>) {
    const sp = new URLSearchParams();
    if (currentQuery) sp.set("q", currentQuery);
    Object.entries(params).forEach(([k, v]) => {
      if (v) sp.set(k, v);
    });
    router.push(`/search?${sp.toString()}`);
  }

  return (
    <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
      <select
        defaultValue={currentCategory}
        onChange={(e) => navigate({ category: e.target.value })}
        className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
      >
        <option value="">全部分类</option>
        {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
          <option key={cat.id} value={cat.id}>{cat.label}</option>
        ))}
      </select>

      <select
        defaultValue={currentSourceType}
        onChange={(e) => navigate({ source_type: e.target.value })}
        className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
      >
        <option value="">全部类型</option>
        {SOURCE_TYPES.map((t) => (
          <option key={t.id} value={t.id}>{t.label}</option>
        ))}
      </select>
    </div>
  );
}

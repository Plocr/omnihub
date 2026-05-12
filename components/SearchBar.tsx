"use client";

import { Input } from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function SearchBar({
  initialQuery = "",
  compact = false,
}: {
  initialQuery?: string;
  compact?: boolean;
}) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="relative">
        <Input
          type="search"
          placeholder="搜索..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-9 w-48 text-sm"
        />
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl">
      <Input
        type="search"
        placeholder="搜索 API 项目、技能、工具..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="h-12 px-4 text-base"
      />
    </form>
  );
}

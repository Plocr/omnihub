import { createServerSupabaseClient } from "@/lib/supabase/server";
import { FeedCard } from "@/components/FeedCard";
import { SearchBar } from "@/components/SearchBar";
import { SearchFilters } from "@/components/SearchFilters";
import { CATEGORIES } from "@/lib/constants";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    source_type?: string;
    page?: string;
  }>;
}

async function SearchResults({ searchParams }: SearchPageProps) {
  const sp = await searchParams;
  const q = sp.q?.trim();
  const category = sp.category;
  const sourceType = sp.source_type;
  const page = Math.max(1, parseInt(sp.page ?? "1"));
  const limit = 20;

  if (!q) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg text-muted">输入关键词搜索工具和项目</p>
      </div>
    );
  }

  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from("items")
    .select("id, title, description, link, source_type, category, tags, quality_score, popularity, image_url, published_at", { count: "exact" })
    .eq("status", "active")
    .or(`title.ilike.%${q}%,description.ilike.%${q}%`);

  if (category) query = query.eq("category", category);
  if (sourceType) query = query.eq("source_type", sourceType);

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1).order("quality_score", { ascending: false });

  const { data: items, count } = await query;
  const totalPages = count ? Math.ceil(count / limit) : 1;

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-muted">
          搜索 &ldquo;{q}&rdquo; 找到 {count ?? 0} 个结果
          {category && ` · 分类: ${CATEGORIES.find((c) => c.id === category)?.label ?? category}`}
        </p>
      </div>

      {items && items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(items as any[]).map((item) => (
            <FeedCard key={item.id} {...item} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-lg text-muted">未找到相关结果</p>
          <p className="text-sm text-muted-foreground mt-1">试试其他关键词，或浏览分类目录</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-8">
          {page > 1 && (
            <a
              href={`/search?q=${encodeURIComponent(q)}&page=${page - 1}${category ? `&category=${category}` : ""}${sourceType ? `&source_type=${sourceType}` : ""}`}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-4 text-sm hover:bg-accent"
            >
              上一页
            </a>
          )}
          <span className="px-4 text-sm text-muted">第 {page} / {totalPages} 页</span>
          {page < totalPages && (
            <a
              href={`/search?q=${encodeURIComponent(q)}&page=${page + 1}${category ? `&category=${category}` : ""}${sourceType ? `&source_type=${sourceType}` : ""}`}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-4 text-sm hover:bg-accent"
            >
              下一页
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default async function SearchPage(props: SearchPageProps) {
  const sp = await props.searchParams;
  const q = sp.q ?? "";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight mb-6">搜索</h1>
        <div className="flex justify-center">
          <SearchBar initialQuery={q} />
        </div>
      </div>

      <SearchFilters
        currentQuery={q}
        currentCategory={sp.category ?? ""}
        currentSourceType={sp.source_type ?? ""}
      />

      <div className="mx-auto max-w-5xl">
        <SearchResults searchParams={props.searchParams} />
      </div>
    </div>
  );
}

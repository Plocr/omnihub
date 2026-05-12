import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { FeedCard } from "@/components/FeedCard";
import { CATEGORIES, ITEMS_PER_PAGE, SORT_OPTIONS } from "@/lib/constants";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

interface ExplorePageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    source_type?: string;
    tag?: string;
    sort?: string;
  }>;
}

async function ExploreGrid({ searchParams }: ExplorePageProps) {
  const sp = await searchParams;
  const supabase = await createServerSupabaseClient();
  const page = Math.max(1, parseInt(sp.page ?? "1"));

  let query = supabase
    .from("items")
    .select("id, title, description, link, source_type, category, tags, quality_score, popularity, image_url, published_at", { count: "exact" })
    .eq("status", "active");

  if (sp.category) query = query.eq("category", sp.category);
  if (sp.source_type) query = query.eq("source_type", sp.source_type);
  if (sp.tag) query = query.contains("tags", [sp.tag]);

  const sort = sp.sort ?? "latest";
  if (sort === "trending") {
    query = query.order("quality_score", { ascending: false });
  } else if (sort === "popular") {
    query = query.order("popularity", { ascending: false });
  } else {
    query = query.order("published_at", { ascending: false });
  }

  const from = (page - 1) * ITEMS_PER_PAGE;
  query = query.range(from, from + ITEMS_PER_PAGE - 1);

  const { data: items, count } = await query;
  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 1;

  const currentCategory = sp.category ?? "all";
  const catLabel = CATEGORIES.find((c) => c.id === currentCategory)?.label ?? "全部";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{catLabel}</h1>
        <p className="text-sm text-muted">共 {count ?? 0} 个项目</p>
      </div>

      {items && items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(items as any[]).map((item) => (
            <FeedCard key={item.id} {...item} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-lg text-muted">暂无内容</p>
          <p className="text-sm text-muted-foreground mt-1">
            换个分类试试，或者等数据更新后再来看看
          </p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-8">
          {page > 1 && (
            <a
              href={`/explore?page=${page - 1}&category=${currentCategory}&sort=${sort}`}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-4 text-sm hover:bg-accent"
            >
              上一页
            </a>
          )}
          <span className="px-4 text-sm text-muted">
            第 {page} / {totalPages} 页
          </span>
          {page < totalPages && (
            <a
              href={`/explore?page=${page + 1}&category=${currentCategory}&sort=${sort}`}
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

export default async function ExplorePage(props: ExplorePageProps) {
  const sp = await props.searchParams;
  const sort = sp.sort ?? "latest";

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-8 sm:px-6">
      <Sidebar />
      <div className="flex-1">
        {/* Sort tabs */}
        <div className="mb-6 flex items-center gap-1 rounded-lg border border-border p-1 w-fit">
          {SORT_OPTIONS.map((s) => (
            <a
              key={s.id}
              href={`/explore?sort=${s.id}${sp.category ? `&category=${sp.category}` : ""}`}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                sort === s.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {s.label}
            </a>
          ))}
        </div>

        <Suspense
          fallback={
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 animate-pulse rounded-lg border border-border bg-accent" />
              ))}
            </div>
          }
        >
          <ExploreGrid searchParams={props.searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

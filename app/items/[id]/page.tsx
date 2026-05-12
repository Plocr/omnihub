import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FeedCard } from "@/components/FeedCard";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface ItemPageProps {
  params: Promise<{ id: string }>;
}

const SOURCE_TYPE_LABELS: Record<string, string> = {
  api: "API",
  skill: "技能",
  tool: "工具",
  article: "文章",
};

export default async function ItemPage({ params }: ItemPageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: item, error } = await supabase
    .from("items")
    .select("*")
    .eq("id", id)
    .eq("status", "active")
    .single();

  if (error || !item) notFound();

  const { data: related } = await supabase
    .from("items")
    .select("id, title, description, link, source_type, category, tags, quality_score, popularity, published_at")
    .eq("category", item.category)
    .eq("status", "active")
    .neq("id", id)
    .limit(4);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-muted">
        <Link href="/" className="hover:text-foreground">首页</Link>
        <span className="mx-2">/</span>
        <Link href="/explore" className="hover:text-foreground">发现</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{item.title.slice(0, 30)}…</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Badge variant={item.source_type === "api" ? "primary" : item.source_type === "skill" ? "success" : "secondary"}>
            {SOURCE_TYPE_LABELS[item.source_type] ?? item.source_type}
          </Badge>
          {item.category && <Badge variant="default">{item.category}</Badge>}
        </div>

        <h1 className="text-3xl font-bold tracking-tight">{item.title}</h1>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted">
          {item.published_at && (
            <span>发布于 {formatDate(item.published_at)}</span>
          )}
          {item.popularity > 0 && <span>★ {item.popularity}</span>}
          {item.quality_score > 0 && (
            <span>质量评分: {item.quality_score.toFixed(1)}</span>
          )}
          {item.tags?.length > 0 && (
            <span className="flex gap-1">
              {item.tags.map((tag: string) => (
                <Link
                  key={tag}
                  href={`/explore?tag=${tag}`}
                  className="rounded bg-accent px-2 py-0.5 text-xs hover:bg-accent/80"
                >
                  {tag}
                </Link>
              ))}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mb-8 rounded-lg border border-border bg-card p-6">
        {item.description && (
          <p className="text-lg leading-relaxed text-muted mb-4">{item.description}</p>
        )}
        {item.content && (
          <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-muted">
            <pre className="whitespace-pre-wrap text-sm text-foreground">{item.content}</pre>
          </div>
        )}
      </div>

      {/* API/Skill metadata */}
      {item.api_metadata && Object.keys(item.api_metadata).length > 0 && (
        <div className="mb-8 rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">API 详情</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            {Object.entries(item.api_metadata).map(([key, value]) => (
              <div key={key}>
                <dt className="text-muted">{key}</dt>
                <dd className="font-medium">{String(value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {item.skill_metadata && Object.keys(item.skill_metadata).length > 0 && (
        <div className="mb-8 rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">技能详情</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            {Object.entries(item.skill_metadata).map(([key, value]) => (
              <div key={key}>
                <dt className="text-muted">{key}</dt>
                <dd className="font-medium">{String(value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* CTA */}
      <div className="mb-12 flex items-center gap-4 rounded-lg border border-border bg-secondary p-4">
        <div className="flex-1">
          <p className="text-sm font-medium">访问原始资源</p>
          <p className="text-sm text-muted">在原始网站上查看完整项目</p>
        </div>
        <a href={item.link} target="_blank" rel="noopener noreferrer">
          <Button>查看原文 →</Button>
        </a>
      </div>

      {/* Related */}
      {related && related.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-6">相关推荐</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {(related as any[]).map((r) => (
              <FeedCard key={r.id} {...r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();

  const { data: featured } = await supabase
    .from("items")
    .select("*")
    .eq("status", "active")
    .eq("is_featured", true)
    .order("quality_score", { ascending: false })
    .limit(3);

  const { data: latest } = await supabase
    .from("items")
    .select("id, title, description, link, source_type, category, tags, quality_score, popularity, published_at")
    .eq("status", "active")
    .order("published_at", { ascending: false })
    .limit(8);

  const { data: trending } = await supabase
    .from("items")
    .select("id, title, description, link, source_type, category, tags, quality_score, popularity, published_at")
    .eq("status", "active")
    .order("quality_score", { ascending: false })
    .limit(4);

  const { count: totalItems } = await supabase
    .from("items")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  const { count: totalSources } = await supabase
    .from("sources")
    .select("*", { count: "exact", head: true });

  const { data: typeCounts } = await supabase
    .from("items")
    .select("source_type")
    .eq("status", "active");

  const typeDist: Record<string, number> = {};
  typeCounts?.forEach((i) => {
    typeDist[i.source_type] = (typeDist[i.source_type] ?? 0) + 1;
  });

  const categories = [
    { id: "ai-api", label: "AI & APIs" },
    { id: "dev-tool", label: "开发工具" },
    { id: "frontend", label: "前端" },
    { id: "backend", label: "后端" },
    { id: "data", label: "数据" },
  ];

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-background to-secondary/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              发现最好的{" "}
              <span className="text-primary">开发者工具</span>
            </h1>
            <p className="mt-4 text-lg text-muted">
              API 项目、Claude Code 技能、开源工具的精选聚合平台，帮你找到下一个好工具。
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link href="/explore">
                <Button size="lg">浏览发现</Button>
              </Link>
              <Link href="/search">
                <Button variant="outline" size="lg">搜索</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">{totalItems ?? 0}</p>
                <p className="text-sm text-muted">收录项目</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">{totalSources ?? 0}</p>
                <p className="text-sm text-muted">数据来源</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">{typeDist.api ?? 0}</p>
                <p className="text-sm text-muted">API</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">{typeDist.skill ?? 0}</p>
                <p className="text-sm text-muted">技能</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured */}
      {featured && featured.length > 0 && (
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
            <h2 className="text-xl font-semibold mb-6">精选推荐</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {featured.map((item: any) => (
                <Link key={item.id} href={`/items/${item.id}`}>
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardContent className="p-4">
                      <Badge variant="primary" className="mb-2">
                        {item.source_type}
                      </Badge>
                      <CardTitle className="mb-1">{item.title}</CardTitle>
                      <CardDescription>
                        {item.description?.slice(0, 100)}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending */}
      {trending && trending.length > 0 && (
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">热门推荐</h2>
              <Link href="/explore?sort=trending" className="text-sm text-primary hover:underline">
                查看全部 →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(trending as any[]).map((item) => (
                <Link key={item.id} href={`/items/${item.id}`}>
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="warning">{item.source_type === "api" ? "API" : item.source_type === "skill" ? "技能" : "工具"}</Badge>
                        {item.popularity > 0 && (
                          <span className="text-xs text-muted">★ {item.popularity}</span>
                        )}
                      </div>
                      <CardTitle className="text-sm mb-1">{item.title}</CardTitle>
                      {item.description && (
                        <CardDescription className="text-xs line-clamp-2">
                          {item.description}
                        </CardDescription>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">最近更新</h2>
            <Link href="/explore" className="text-sm text-primary hover:underline">
              查看全部 →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(latest as any[]).map((item) => (
              <Link key={item.id} href={`/items/${item.id}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={item.source_type === "api" ? "primary" : item.source_type === "skill" ? "success" : "secondary"}>
                        {item.source_type === "api" ? "API" : item.source_type === "skill" ? "技能" : "工具"}
                      </Badge>
                      {item.category && (
                        <span className="text-xs text-muted-foreground">
                          {item.category}</span>
                      )}
                    </div>
                    <CardTitle className="text-sm mb-1">{item.title}</CardTitle>
                    {item.description && (
                      <CardDescription className="text-xs line-clamp-2">
                        {item.description}
                      </CardDescription>
                    )}
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted">
                      {item.published_at && (
                        <span>{new Date(item.published_at).toLocaleDateString("zh-CN")}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h2 className="text-xl font-semibold mb-6">分类浏览</h2>
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/explore?category=${cat.id}`}>
              <Button variant="outline" size="sm">{cat.label}</Button>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

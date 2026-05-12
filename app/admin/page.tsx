import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

async function AdminPanel() {
  const supabase = await createServerSupabaseClient();

  const { count: totalItems } = await supabase
    .from("items").select("*", { count: "exact", head: true });

  const { count: activeItems } = await supabase
    .from("items").select("*", { count: "exact", head: true }).eq("status", "active");

  const { count: draftItems } = await supabase
    .from("items").select("*", { count: "exact", head: true }).eq("status", "draft");

  const { data: sources } = await supabase
    .from("sources").select("*").order("name");

  const { data: recentItems } = await supabase
    .from("items").select("id, title, source_type, status, quality_score, created_at")
    .order("created_at", { ascending: false }).limit(10);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">管理面板</h1>
        <p className="text-sm text-muted mt-1">系统概览</p>
      </div>

      {/* Stats grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted">总条目</p>
            <p className="text-2xl font-bold">{totalItems ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted">已发布 / 草稿</p>
            <p className="text-2xl font-bold">{activeItems ?? 0}<span className="text-lg text-muted-foreground"> / {draftItems ?? 0}</span></p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted">数据源</p>
            <p className="text-2xl font-bold">{sources?.length ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Sources */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>数据源</CardTitle>
          <CardDescription>已配置的内容来源及同步状态</CardDescription>
        </CardHeader>
        <CardContent>
          {sources && sources.length > 0 ? (
            <div className="divide-y divide-border">
              {sources.map((source: any) => (
                <div key={source.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-sm">{source.name}</p>
                    <p className="text-xs text-muted">{source.type} · {source.item_count} 条</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={source.sync_status === "active" ? "success" : "warning"}>
                      {source.sync_status === "active" ? "正常" : "异常"}
                    </Badge>
                    {source.last_sync_at && (
                      <span className="text-xs text-muted">{new Date(source.last_sync_at).toLocaleDateString("zh-CN")}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">暂无数据源</p>
          )}
        </CardContent>
      </Card>

      {/* Recent items */}
      <Card>
        <CardHeader>
          <CardTitle>最近条目</CardTitle>
          <CardDescription>最近 10 条添加到数据库的内容</CardDescription>
        </CardHeader>
        <CardContent>
          {recentItems && recentItems.length > 0 ? (
            <div className="divide-y divide-border">
              {recentItems.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary" className="text-[10px]">
                        {item.source_type === "api" ? "API" : item.source_type === "skill" ? "技能" : "工具"}
                      </Badge>
                      <span className="text-xs text-muted">评分: {item.quality_score.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={item.status === "active" ? "success" : item.status === "draft" ? "warning" : "default"}>
                      {item.status === "active" ? "已发布" : item.status === "draft" ? "草稿" : "已归档"}
                    </Badge>
                    <span className="text-xs text-muted">{new Date(item.created_at).toLocaleDateString("zh-CN")}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">暂无内容</p>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 rounded-lg border border-warning/20 bg-warning/5 p-4">
        <p className="text-sm text-warning">⚠ 管理面板暂无鉴权。生产环境请在环境变量中设置 ADMIN_PASSWORD 并实现登录验证。</p>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return <AdminPanel />;
}

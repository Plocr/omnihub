export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted">
            <span className="text-primary">◆</span>
            <span>OmniHub</span>
            <span className="text-muted-foreground">·</span>
            <span>开发者工具发现平台</span>
          </div>
          <p className="text-xs text-muted-foreground">
            基于 Next.js & Supabase 构建
          </p>
        </div>
      </div>
    </footer>
  );
}

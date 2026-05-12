export const CATEGORIES = [
  { id: "all", label: "全部分类" },
  { id: "ai-api", label: "AI & APIs" },
  { id: "dev-tool", label: "开发工具" },
  { id: "frontend", label: "前端" },
  { id: "backend", label: "后端" },
  { id: "data", label: "数据与分析" },
  { id: "devops", label: "DevOps 与基础设施" },
  { id: "mobile", label: "移动端" },
  { id: "security", label: "安全" },
  { id: "other", label: "其他" },
] as const;

export const SOURCE_TYPES = [
  { id: "api", label: "API" },
  { id: "skill", label: "技能" },
  { id: "tool", label: "工具" },
  { id: "article", label: "文章" },
] as const;

export const SORT_OPTIONS = [
  { id: "latest", label: "最新" },
  { id: "trending", label: "热门" },
  { id: "popular", label: "最多收藏" },
] as const;

export const ITEMS_PER_PAGE = 20;

export const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD;

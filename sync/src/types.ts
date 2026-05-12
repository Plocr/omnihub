export interface SourceConfig {
  id: string;
  name: string;
  type: "github" | "api_directory" | "skill_registry" | "rss" | "manual";
  url?: string;
  config: Record<string, unknown>;
}

export interface FeedItem {
  title: string;
  description?: string;
  content?: string;
  link: string;
  source_type: "api" | "skill" | "tool" | "article";
  category?: string;
  tags?: string[];
  api_metadata?: Record<string, unknown>;
  skill_metadata?: Record<string, unknown>;
  image_url?: string;
  popularity?: number;
  published_at?: string;
}

export interface SyncResult {
  sourceId: string;
  inserted: number;
  updated: number;
  errors: string[];
}

import Parser from "rss-parser";
import type { FeedItem, SourceConfig } from "../types.js";

const parser = new Parser({
  timeout: 15000,
  headers: {
    "User-Agent": "OmniHub/1.0",
  },
});

export async function fetchRSS(source: SourceConfig): Promise<FeedItem[]> {
  if (!source.url) {
    throw new Error("RSS source requires a URL");
  }

  const feed = await parser.parseURL(source.url);
  const defaultType = (source.config.default_type as FeedItem["source_type"]) ?? "article";

  return (feed.items ?? []).slice(0, 50).map((item) => ({
    title: item.title ?? "Untitled",
    description: stripHtml(item.contentSnippet ?? item.content ?? "").slice(0, 500),
    content: item.content ?? undefined,
    link: item.link ?? item.guid ?? "",
    source_type: defaultType,
    tags: extractTags(item.categories),
    image_url: extractImage(item),
    published_at: item.isoDate ?? item.pubDate ?? undefined,
  }));
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function extractTags(
  categories?: string[],
): string[] {
  if (!categories) return [];
  return categories.map((c) => c.toLowerCase().trim()).filter(Boolean);
}

function extractImage(item: Parser.Item): string | undefined {
  // Try media:content
  const media = (item as any)["media:content"];
  if (media?.$.url) return media.$.url;

  // Try enclosure
  if (item.enclosure?.url) return item.enclosure.url;

  return undefined;
}

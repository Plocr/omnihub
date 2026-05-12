import type { FeedItem } from "./types.js";

interface EnrichmentResult {
  description: string;
  tags: string[];
  category: string;
  quality_score: number;
}

const CATEGORIES = [
  "ai-api",
  "dev-tool",
  "frontend",
  "backend",
  "data",
  "devops",
  "mobile",
  "security",
  "other",
];

/**
 * Enrich content using Claude API.
 * Falls back to basic heuristic enrichment if no API key is configured.
 */
export async function enrichItem(item: FeedItem): Promise<EnrichmentResult> {
  if (process.env.ANTHROPIC_API_KEY) {
    return enrichWithClaude(item);
  }
  return enrichHeuristic(item);
}

async function enrichWithClaude(item: FeedItem): Promise<EnrichmentResult> {
  const prompt = `You are a content curator for a developer tools discovery platform.
Analyze this item and return JSON with:
- description: a clear 1-2 sentence summary (max 150 chars)
- tags: 2-4 relevant tags (lowercase)
- category: one of: ${CATEGORIES.join(", ")}
- quality_score: 0-10 rating based on clarity, usefulness, and completeness

Item:
Title: ${item.title}
Description: ${item.description ?? "N/A"}
Tags provided: ${(item.tags ?? []).join(", ")}

Return valid JSON only, no markdown.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    console.warn(`Claude API error: ${response.status}, using heuristic`);
    return enrichHeuristic(item);
  }

  const data = (await response.json()) as any;
  const text = data.content?.[0]?.text ?? "";

  try {
    return JSON.parse(text) as EnrichmentResult;
  } catch {
    console.warn("Failed to parse Claude response, using heuristic");
    return enrichHeuristic(item);
  }
}

function enrichHeuristic(item: FeedItem): EnrichmentResult {
  const text = `${item.title} ${item.description ?? ""} ${(item.tags ?? []).join(" ")}`.toLowerCase();

  // Category detection
  let category = "other";
  if (/\b(ai|llm|gpt|machine.learning|openai|anthropic|claude)\b/.test(text)) {
    category = "ai-api";
  } else if (/\b(react|vue|angular|frontend|css|ui|web)\b/.test(text)) {
    category = "frontend";
  } else if (/\b(backend|api|server|rest|graphql|express|fastapi)\b/.test(text)) {
    category = "backend";
  } else if (
    /\b(database|data|analytics|sql|bigquery|snowflake|etl)\b/.test(text)
  ) {
    category = "data";
  } else if (/\b(devops|ci|cd|docker|kubernetes|deploy|infra)\b/.test(text)) {
    category = "devops";
  } else if (/\b(tool|cli|developer|terminal|plugin)\b/.test(text)) {
    category = "dev-tool";
  }

  // Quality score
  const hasDescription = (item.description?.length ?? 0) > 20;
  const hasTags = (item.tags?.length ?? 0) > 0;
  const hasContent = (item.content?.length ?? 0) > 100;
  const score = Math.min(10, (hasDescription ? 3 : 0) + (hasTags ? 2 : 0) + (hasContent ? 3 : 0) + (item.popularity && item.popularity > 100 ? 2 : 0));

  return {
    description: item.description?.slice(0, 150) ?? "",
    tags: item.tags ?? [],
    category,
    quality_score: score,
  };
}

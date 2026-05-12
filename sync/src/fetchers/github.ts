import type { FeedItem, SourceConfig } from "../types.js";

interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  topics: string[];
  language: string | null;
  updated_at: string;
  pushed_at: string;
}

export async function fetchGitHubTrending(
  source: SourceConfig,
): Promise<FeedItem[]> {
  const language = source.config.language ?? "";
  const since = source.config.since ?? "weekly";
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(`created:>${daysAgo(30)} stars:>50`)}&sort=stars&order=desc&per_page=25`;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${await response.text()}`);
  }

  const data = (await response.json()) as { items: GitHubRepo[] };

  return data.items.map((repo) => ({
    title: repo.name,
    description: repo.description ?? undefined,
    link: repo.html_url,
    source_type: inferSourceType(repo),
    tags: [...(repo.topics ?? []), repo.language].filter(Boolean) as string[],
    popularity: repo.stargazers_count,
    published_at: repo.pushed_at,
  }));
}

export async function fetchGitHubRepo(
  owner: string,
  repo: string,
): Promise<FeedItem | null> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}`,
    { headers },
  );

  if (!response.ok) return null;

  const data = (await response.json()) as GitHubRepo;

  return {
    title: data.name,
    description: data.description ?? undefined,
    link: data.html_url,
    source_type: "tool",
    tags: [...(data.topics ?? []), data.language].filter(Boolean) as string[],
    popularity: data.stargazers_count,
    published_at: data.pushed_at,
  };
}

function inferSourceType(repo: GitHubRepo): FeedItem["source_type"] {
  const topics = (repo.topics ?? []).map((t) => t.toLowerCase());
  const desc = (repo.description ?? "").toLowerCase();

  if (topics.includes("api") || desc.includes("api") || desc.includes("rest")) {
    return "api";
  }
  if (
    topics.includes("claude-code-skill") ||
    topics.includes("skill") ||
    desc.includes("skill")
  ) {
    return "skill";
  }
  if (topics.includes("tool") || desc.includes("tool") || desc.includes("cli")) {
    return "tool";
  }
  return "tool";
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0]!;
}

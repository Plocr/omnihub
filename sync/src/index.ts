import { createClient } from "@supabase/supabase-js";
import { fetchGitHubTrending } from "./fetchers/github.js";
import { fetchRSS } from "./fetchers/rss.js";
import { enrichItem } from "./enrich.js";
import type { FeedItem, SourceConfig, SyncResult } from "./types.js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncSource(source: SourceConfig): Promise<SyncResult> {
  console.log(`Syncing source: ${source.name} (${source.type})`);

  const result: SyncResult = {
    sourceId: source.id,
    inserted: 0,
    updated: 0,
    errors: [],
  };

  try {
    let items: FeedItem[] = [];

    switch (source.type) {
      case "github":
        items = await fetchGitHubTrending(source);
        break;
      case "rss":
        items = await fetchRSS(source);
        break;
      default:
        console.warn(`Unsupported source type: ${source.type}`);
        return result;
    }

    console.log(`  Fetched ${items.length} items`);

    for (const item of items) {
      try {
        // Enrich the item
        const enrichment = await enrichItem(item);

        const enrichedItem = {
          source_id: source.id,
          title: item.title,
          description: enrichment.description || item.description,
          link: item.link,
          source_type: item.source_type,
          category: enrichment.category || item.category,
          tags: [...new Set([...(enrichment.tags ?? []), ...(item.tags ?? [])])],
          api_metadata: item.api_metadata ?? {},
          skill_metadata: item.skill_metadata ?? {},
          quality_score: enrichment.quality_score,
          popularity: item.popularity ?? 0,
          image_url: item.image_url,
          published_at: item.published_at ?? new Date().toISOString(),
          status: "active",
        };

        // Upsert by link
        const { error, status } = await supabase
          .from("items")
          .upsert(enrichedItem, {
            onConflict: "link",
            ignoreDuplicates: false,
          })
          .select("id");

        if (error) {
          result.errors.push(`Upsert error for ${item.link}: ${error.message}`);
        } else if (status === 201) {
          result.inserted++;
        } else {
          result.updated++;
        }
      } catch (err) {
        result.errors.push(`Error processing ${item.title}: ${String(err)}`);
      }
    }
  } catch (err) {
    result.errors.push(`Source sync error: ${String(err)}`);
  }

  // Update source sync status
  await supabase
    .from("sources")
    .update({
      last_sync_at: new Date().toISOString(),
      item_count: result.inserted + result.updated,
      sync_status: result.errors.length > 0 ? "error" : "active",
    })
    .eq("id", source.id);

  console.log(
    `  Done: ${result.inserted} inserted, ${result.updated} updated, ${result.errors.length} errors`,
  );

  return result;
}

async function main() {
  console.log("OmniHub Sync Starting...\n");

  // Fetch all active sources from Supabase
  const { data: sources, error } = await supabase
    .from("sources")
    .select("*")
    .eq("sync_status", "active");

  if (error) {
    console.error("Failed to fetch sources:", error.message);
    process.exit(1);
  }

  if (!sources || sources.length === 0) {
    console.log("No active sources found. Run the SQL migration first.");
    process.exit(0);
  }

  console.log(`Found ${sources.length} active source(s)\n`);

  const results: SyncResult[] = [];

  for (const source of sources) {
    const result = await syncSource(source as SourceConfig);
    results.push(result);
  }

  // Summary
  console.log("\n=== Sync Summary ===");
  const totalInserted = results.reduce((sum, r) => sum + r.inserted, 0);
  const totalUpdated = results.reduce((sum, r) => sum + r.updated, 0);
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
  console.log(`Inserted: ${totalInserted}`);
  console.log(`Updated: ${totalUpdated}`);
  console.log(`Errors: ${totalErrors}`);

  if (totalErrors > 0) {
    console.log("\nErrors:");
    results.forEach((r) => {
      r.errors.forEach((e) => console.log(`  [${r.sourceId}] ${e}`));
    });
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

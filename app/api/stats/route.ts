import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();

  // Total counts
  const { count: totalItems } = await supabase
    .from("items")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  const { count: totalSources } = await supabase
    .from("sources")
    .select("*", { count: "exact", head: true });

  // Count by source_type
  const { data: typeCounts } = await supabase
    .from("items")
    .select("source_type")
    .eq("status", "active");

  const typeDistribution: Record<string, number> = {};
  typeCounts?.forEach((item) => {
    typeDistribution[item.source_type] = (typeDistribution[item.source_type] ?? 0) + 1;
  });

  // Count by category
  const { data: catCounts } = await supabase
    .from("items")
    .select("category")
    .eq("status", "active");

  const categoryDistribution: Record<string, number> = {};
  catCounts?.forEach((item) => {
    if (item.category) {
      categoryDistribution[item.category] = (categoryDistribution[item.category] ?? 0) + 1;
    }
  });

  // Top items by quality score
  const { data: topItems } = await supabase
    .from("items")
    .select("id, title, source_type, quality_score, popularity")
    .eq("status", "active")
    .order("quality_score", { ascending: false })
    .limit(10);

  return Response.json({
    totalItems: totalItems ?? 0,
    totalSources: totalSources ?? 0,
    typeDistribution,
    categoryDistribution,
    topItems,
  });
}

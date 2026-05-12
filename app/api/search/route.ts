import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(request.url);

  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category");
  const sourceType = searchParams.get("source_type");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));

  if (!q) {
    return Response.json({ error: "请提供搜索关键词" }, { status: 400 });
  }

  let query = supabase
    .from("items")
    .select("id, title, description, link, source_type, category, tags, quality_score, popularity, image_url, published_at", { count: "exact" })
    .eq("status", "active");

  // Use ILIKE for Chinese-friendly search (works for both English and Chinese)
  query = query.or(
    `title.ilike.%${q}%,description.ilike.%${q}%`,
  );

  if (category) query = query.eq("category", category);
  if (sourceType) query = query.eq("source_type", sourceType);

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1).order("quality_score", { ascending: false });

  const { data: items, error, count } = await query;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    items,
    pagination: {
      page,
      limit,
      total: count ?? 0,
      totalPages: count ? Math.ceil(count / limit) : 0,
    },
    query: q,
  });
}

import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(request.url);

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));
  const category = searchParams.get("category");
  const sourceType = searchParams.get("source_type");
  const tag = searchParams.get("tag");
  const sort = searchParams.get("sort") ?? "latest";
  const featured = searchParams.get("featured");

  let query = supabase
    .from("items")
    .select("id, title, description, link, source_type, category, tags, quality_score, popularity, image_url, published_at, created_at", { count: "exact" })
    .eq("status", "active");

  // Filters
  if (category) query = query.eq("category", category);
  if (sourceType) query = query.eq("source_type", sourceType);
  if (tag) query = query.contains("tags", [tag]);
  if (featured === "true") query = query.eq("is_featured", true);

  // Sorting
  if (sort === "trending") {
    query = query.order("quality_score", { ascending: false });
  } else if (sort === "popular") {
    query = query.order("popularity", { ascending: false });
  } else {
    query = query.order("published_at", { ascending: false });
  }

  // Pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

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
  });
}

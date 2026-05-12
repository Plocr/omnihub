import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createServerSupabaseClient();
  const { id } = await params;

  const { data: item, error } = await supabase
    .from("items")
    .select("*")
    .eq("id", id)
    .eq("status", "active")
    .single();

  if (error || !item) {
    return Response.json({ error: "Item not found" }, { status: 404 });
  }

  // Fetch related items (same category, excluding self)
  const { data: related } = await supabase
    .from("items")
    .select("id, title, source_type, category, published_at")
    .eq("category", item.category)
    .eq("status", "active")
    .neq("id", id)
    .limit(4);

  return Response.json({ item, related: related ?? [] });
}

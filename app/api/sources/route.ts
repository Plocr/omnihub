import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();

  const { data: sources, error } = await supabase
    .from("sources")
    .select("id, name, type, sync_status, last_sync_at, item_count, created_at")
    .order("name");

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ sources });
}

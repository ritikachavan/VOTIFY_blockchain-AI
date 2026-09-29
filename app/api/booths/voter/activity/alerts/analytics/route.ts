import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSupabaseClient } from "@/lib/supabase-request";

export async function GET(request: NextRequest) {
  try {
    const { client } = await getAuthenticatedSupabaseClient(request);
    if (!client) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const boothId = request.nextUrl.searchParams.get("booth_id");
    let query = client
      .from("election_stats")
      .select("id,booth_id,total_entries,clean_entries,flagged_entries,duplicate_attempts,outside_geofence_count,timestamp,updated_at")
      .order("timestamp", { ascending: false });
    if (boothId) query = query.eq("booth_id", boothId);
    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ records: data });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error("Election statistics API read failed", error);
    return NextResponse.json({ error: "Unable to load election statistics." }, { status: 500 });
  }
}
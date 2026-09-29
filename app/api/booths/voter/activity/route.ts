import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSupabaseClient } from "@/lib/supabase-request";

// GET activity log with filters
export async function GET(req: NextRequest) {
  try {
    const { client } = await getAuthenticatedSupabaseClient(req);
    if (!client) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const params = req.nextUrl.searchParams;
    const boothId = params.get("booth_id");
    const suspicious = params.get("is_suspicious");
    if (suspicious !== null && suspicious !== "true" && suspicious !== "false") {
      return NextResponse.json({ error: "is_suspicious must be true or false." }, { status: 400 });
    }
    let query = client
      .from("voter_activity_log")
      .select("id,voter_id,booth_id,entry_time,exit_time,geofence_status,is_suspicious,flags")
      .order("entry_time", { ascending: false });
    if (boothId) query = query.eq("booth_id", boothId);
    if (suspicious !== null) query = query.eq("is_suspicious", suspicious === "true");
    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error("Voter activity API read failed", error);
    return NextResponse.json({ error: "Unable to load voter activity." }, { status: 500 });
  }
}

// POST new activity entry
export async function POST(req: NextRequest) {
  return NextResponse.json({ error: "Voter activity inserts are not permitted by the supplied RLS policies." }, { status: 403 });
}
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSupabaseClient } from "@/lib/supabase-request";

// GET all alerts
export async function GET(req: NextRequest) {
  try {
    const { client } = await getAuthenticatedSupabaseClient(req);
    if (!client) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const params = req.nextUrl.searchParams;
    const boothId = params.get("booth_id");
    const resolved = params.get("is_resolved");
    const severity = params.get("severity");
    if (resolved !== null && resolved !== "true" && resolved !== "false") {
      return NextResponse.json({ error: "is_resolved must be true or false." }, { status: 400 });
    }
    let query = client
      .from("alerts")
      .select("id,alert_type,severity,description,booth_id,is_resolved,resolved_at,created_at,updated_at")
      .order("created_at", { ascending: false });
    if (boothId) query = query.eq("booth_id", boothId);
    if (resolved !== null) query = query.eq("is_resolved", resolved === "true");
    if (severity) query = query.eq("severity", severity);
    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error("Alerts API read failed", error);
    return NextResponse.json({ error: "Unable to load alerts." }, { status: 500 });
  }
}
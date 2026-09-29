import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSupabaseClient } from "@/lib/supabase-request";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { client } = await getAuthenticatedSupabaseClient(request);
    if (!client) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const { id } = await context.params;
    const { data, error } = await client
      .from("voter_activity_log")
      .select("id,voter_id,booth_id,entry_time,exit_time,geofence_status,is_suspicious,flags")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Activity record not found." }, { status: 404 });
    return NextResponse.json(data);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error("Voter activity API read failed", error);
    return NextResponse.json({ error: "Unable to load activity record." }, { status: 500 });
  }
}

export async function PUT() {
  return NextResponse.json({ error: "Voter activity updates are not permitted by the supplied RLS policies." }, { status: 403 });
}
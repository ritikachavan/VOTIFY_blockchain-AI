import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSupabaseClient } from "@/lib/supabase-request";

export async function POST(request: NextRequest) {
  try {
    const { client } = await getAuthenticatedSupabaseClient(request);
    if (!client) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || !("voter_id" in body) || !("booth_id" in body)) {
      return NextResponse.json({ error: "voter_id and booth_id are required." }, { status: 400 });
    }
    const voterId = body.voter_id;
    const boothId = body.booth_id;
    if (typeof voterId !== "string" || !voterId.trim() || typeof boothId !== "string" || !boothId.trim()) {
      return NextResponse.json({ error: "voter_id and booth_id must be non-empty strings." }, { status: 400 });
    }
    const { data, error } = await client
      .from("voter_activity_log")
      .select("id,entry_time")
      .eq("voter_id", voterId)
      .eq("booth_id", boothId)
      .order("entry_time", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return NextResponse.json({ isDuplicate: Boolean(data), lastEntryTime: data?.entry_time ?? null });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error("Duplicate check failed", error);
    return NextResponse.json({ error: "Unable to check voter activity." }, { status: 500 });
  }
}
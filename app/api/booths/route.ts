import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSupabaseClient } from "@/lib/supabase-request";

// GET all booths
export async function GET(req: NextRequest) {
  try {
    const { client } = await getAuthenticatedSupabaseClient(req);
    if (!client) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const { data, error } = await client
      .from("booths")
      .select("id,booth_code,booth_name,location,district,state,latitude,longitude,capacity,created_at,updated_at")
      .order("booth_name", { ascending: true });
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error("Booth API read failed", error);
    return NextResponse.json({ error: "Unable to load booth records." }, { status: 500 });
  }
}

// POST new booth
export async function POST(req: NextRequest) {
  return NextResponse.json({ error: "Booth creation is not permitted by the supplied RLS policies." }, { status: 403 });
}
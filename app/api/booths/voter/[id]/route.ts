import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSupabaseClient } from "@/lib/supabase-request";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { client } = await getAuthenticatedSupabaseClient(request);
    if (!client) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const { id } = await context.params;
    const { data, error } = await client
      .from("voters")
      .select("id,voter_id,full_name,age,gender,state,district,booth_id,has_voted,voted_at")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Voter not found." }, { status: 404 });
    return NextResponse.json(data);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error("Voter API read failed", error);
    return NextResponse.json({ error: "Unable to load voter record." }, { status: 500 });
  }
}

export async function PUT() {
  return NextResponse.json({ error: "Voter updates are not permitted by the supplied RLS policies." }, { status: 403 });
}
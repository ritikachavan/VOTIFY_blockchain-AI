import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSupabaseClient } from "@/lib/supabase-request";

// GET all voters
export async function GET(request: NextRequest) {
  try {
    const { client } = await getAuthenticatedSupabaseClient(request);
    if (!client) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const params = request.nextUrl.searchParams;
    const boothId = params.get("booth_id");
    const hasVoted = params.get("has_voted");
    if (hasVoted !== null && hasVoted !== "true" && hasVoted !== "false") {
      return NextResponse.json({ error: "has_voted must be true or false." }, { status: 400 });
    }
    let query = client
      .from("voters")
      .select("id,voter_id,full_name,age,gender,state,district,booth_id,has_voted,voted_at")
      .order("full_name", { ascending: true });
    if (boothId) query = query.eq("booth_id", boothId);
    if (hasVoted !== null) query = query.eq("has_voted", hasVoted === "true");
    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error("Voter API read failed", error);
    return NextResponse.json({ error: "Unable to load voter records." }, { status: 500 });
  }
}

// POST new voter
export async function POST() {
  return NextResponse.json({ error: "Voter creation is not permitted by the supplied RLS policies." }, { status: 403 });
}
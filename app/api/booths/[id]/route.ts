import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSupabaseClient } from "@/lib/supabase-request";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { client } = await getAuthenticatedSupabaseClient(request);
    if (!client) return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
    const { id } = await context.params;
    const { data, error } = await client
      .from("booths")
      .select("id,booth_code,booth_name,location,district,state,latitude,longitude,capacity,created_at,updated_at")
      .eq("booth_code", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json(
      { error: "Booth not found." },
      { status: 404 }
    );
    return NextResponse.json(data);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error("Booth API read failed", error);
    return NextResponse.json(
      { error: "Unable to load booth record." },
      { status: 500 }
    );
  }
}

export async function PUT() {
  return NextResponse.json(
    { error: "Booth updates are not permitted by the supplied RLS policies." },
    { status: 403 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Booth deletion is not permitted by the supplied RLS policies." },
    { status: 403 }
  );
}
import { NextResponse } from "next/server"

export async function PUT() {
  return NextResponse.json(
    { error: "Alert updates are not permitted by the supplied RLS policies." },
    { status: 403 }
  );
}
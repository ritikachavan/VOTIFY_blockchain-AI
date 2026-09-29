import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { NextRequest } from "next/server"
import type { Database } from "@/lib/database.types"

export async function getAuthenticatedSupabaseClient(
  request: NextRequest
): Promise<{ client: SupabaseClient<Database> | null }> {
  const authorization = request.headers.get("authorization")
  if (!authorization?.match(/^Bearer\s+\S+$/i)) return { client: null }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase is not configured on the server.")
  }

  const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: { headers: { Authorization: authorization } },
  })
  const { data, error } = await client.auth.getUser()
  if (error || !data.user) return { client: null }

  return { client }
}
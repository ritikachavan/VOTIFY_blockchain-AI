"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export type AuthenticatedRowsState<Row> = {
  status: "loading" | "error" | "empty" | "ready"
  rows: Row[]
  error: string | null
  /** "supabase" when real rows are shown; "demo" when the supplied fallback dataset is shown. */
  source: "supabase" | "demo"
}

/**
 * Loads rows from Supabase. When the query returns no rows, errors, or is
 * blocked by RLS, an optional `loadFallback` dataset (from lib/mock-data.ts)
 * is returned instead so pages never show an empty state when original demo
 * data exists. Real Supabase data always takes precedence.
 */
export function useAuthenticatedRows<Row>(
  loadRows: () => PromiseLike<{
    data: Row[] | null
    error: { message: string } | null
  }>,
  loadFallback?: () => Row[]
): AuthenticatedRowsState<Row> {
  const [state, setState] = useState<AuthenticatedRowsState<Row>>({
    status: "loading",
    rows: [],
    error: null,
    source: "supabase",
  })

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const { data, error } = await loadRows()
        if (error) throw error

        const rows = data ?? []
        if (active) {
          if (rows.length > 0) {
            setState({ status: "ready", rows, error: null, source: "supabase" })
          } else if (loadFallback) {
            setState({ status: "ready", rows: loadFallback(), error: null, source: "demo" })
          } else {
            setState({ status: "empty", rows: [], error: null, source: "supabase" })
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Unable to load authenticated Supabase data", error)
        }
        if (active) {
          if (loadFallback) {
            setState({ status: "ready", rows: loadFallback(), error: null, source: "demo" })
          } else {
            setState({
              status: "error",
              rows: [],
              error: "The records could not be loaded. Check Supabase configuration and RLS access.",
              source: "supabase",
            })
          }
        }
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [loadRows, loadFallback])

  return state
}
"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export type AuthenticatedRowsState<Row> = {
  status: "loading" | "error" | "empty" | "ready"
  rows: Row[]
  error: string | null
}

export function useAuthenticatedRows<Row>(
  loadRows: () => PromiseLike<{
    data: Row[] | null
    error: { message: string } | null
  }>
): AuthenticatedRowsState<Row> {
  const [state, setState] = useState<AuthenticatedRowsState<Row>>({
    status: "loading",
    rows: [],
    error: null,
  })

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const { data, error } = await loadRows()
        if (error) throw error

        const rows = data ?? []
        if (active) {
          setState({
            status: rows.length === 0 ? "empty" : "ready",
            rows,
            error: null,
          })
        }
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Unable to load authenticated Supabase data", error)
        }
        if (active) {
          setState({
            status: "error",
            rows: [],
            error: "The records could not be loaded. Check Supabase configuration and RLS access.",
          })
        }
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [loadRows])

  return state
}
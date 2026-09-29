import type { Database } from "@/lib/database.types"
import { alerts, booths, voterActivities, voterRegistry } from "@/lib/mock-data"

/**
 * Reshapes the ORIGINAL datasets in lib/mock-data.ts into the Supabase table
 * row shapes used by the dashboard pages. No new data is created here – the
 * values come verbatim (or as direct field renames) from the existing demo
 * datasets. Used as the `loadFallback` for `useAuthenticatedRows` so pages
 * display demo data whenever Supabase is empty, errors, or is RLS-blocked.
 */

type BoothRow = Database["public"]["Tables"]["booths"]["Row"]
type AlertRow = Database["public"]["Tables"]["alerts"]["Row"]
type VoterRow = Database["public"]["Tables"]["voters"]["Row"]
type ActivityRow = Database["public"]["Tables"]["voter_activity_log"]["Row"]

export function demoBoothRows(): BoothRow[] {
  return booths.map((booth) => ({
    id: booth.id,
    booth_code: booth.id,
    booth_name: booth.name,
    location: booth.region,
    district: booth.district,
    state: booth.state,
    latitude: booth.latitude,
    longitude: booth.longitude,
    capacity: booth.expectedVotes,
    created_at: booth.lastSync,
    updated_at: booth.lastSync,
  }))
}

export function demoAlertRows(): AlertRow[] {
  return alerts.map((alert) => ({
    id: alert.id,
    alert_type: alert.title,
    severity: alert.severity,
    description: alert.description,
    booth_id: alert.boothId,
    voter_id: null,
    activity_id: null,
    is_resolved: alert.resolved,
    resolved_at: null,
    resolved_by: null,
    created_at: alert.timestamp,
    updated_at: alert.timestamp,
  }))
}

export function demoVoterRows(): VoterRow[] {
  return voterRegistry.map((voter) => ({
    id: voter.id,
    voter_id: voter.voterId,
    full_name: voter.name,
    email: null,
    phone: null,
    gender: voter.gender,
    age: voter.age,
    state: voter.state,
    district: voter.district,
    booth_id: voter.boothId,
    has_voted: voter.hasVoted,
    voted_at: voter.voteTimestamp,
    created_at: null,
    updated_at: null,
  }))
}

export function demoActivityRows(): ActivityRow[] {
  return voterActivities.map((entry) => ({
    id: entry.id,
    voter_id: entry.voterId,
    booth_id: entry.boothId,
    entry_time: entry.timestamp,
    exit_time: null,
    geofence_status: entry.geofenceStatus,
    is_suspicious: !entry.verified,
    flags: entry.flag ? [entry.flag] : [],
    latitude: entry.latitude,
    longitude: entry.longitude,
    image_url: entry.imageUrl,
    created_at: entry.timestamp,
    updated_at: entry.timestamp,
  }))
}

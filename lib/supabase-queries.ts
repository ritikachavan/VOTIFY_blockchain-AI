import { supabase } from "@/lib/supabase"

export const loadBooths = () =>
  supabase
    .from("booths")
    .select("id,booth_code,booth_name,location,district,state,latitude,longitude,capacity,created_at,updated_at")
    .order("booth_name", { ascending: true })

export const loadVoters = () =>
  supabase
    .from("voters")
    .select("id,voter_id,full_name,gender,age,state,district,booth_id,has_voted,voted_at")
    .order("full_name", { ascending: true })

export const loadAlerts = () =>
  supabase
    .from("alerts")
    .select("id,alert_type,severity,description,booth_id,is_resolved,created_at")
    .order("created_at", { ascending: false })

export const loadVoterActivity = () =>
  supabase
    .from("voter_activity_log")
    .select("id,voter_id,booth_id,entry_time,exit_time,geofence_status,is_suspicious,flags")
    .order("entry_time", { ascending: false })

export const loadElectionStats = () =>
  supabase
    .from("election_stats")
    .select("id,booth_id,total_entries,clean_entries,flagged_entries,duplicate_attempts,outside_geofence_count,timestamp,updated_at")
    .order("timestamp", { ascending: false })
export type Database = {
  public: {
    Tables: {
      alerts: {
        Row: {
          id: string
          alert_type: string
          severity: string | null
          description: string | null
          booth_id: string | null
          voter_id: string | null
          activity_id: string | null
          is_resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          alert_type: string
          severity?: string | null
          description?: string | null
          booth_id?: string | null
          voter_id?: string | null
          activity_id?: string | null
          is_resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          alert_type?: string
          severity?: string | null
          description?: string | null
          booth_id?: string | null
          voter_id?: string | null
          activity_id?: string | null
          is_resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      approved_voters: {
        Row: { id_number: string }
        Insert: { id_number: string }
        Update: { id_number?: string }
        Relationships: []
      }
      booth_activity: {
        Row: {
          id: number
          candidate_choice: string | null
          voter_status: string
          timestamp: string | null
        }
        Insert: {
          id?: number
          candidate_choice?: string | null
          voter_status: string
          timestamp?: string | null
        }
        Update: {
          id?: number
          candidate_choice?: string | null
          voter_status?: string
          timestamp?: string | null
        }
        Relationships: []
      }
      booths: {
        Row: {
          id: string
          booth_code: string
          booth_name: string
          location: string
          district: string | null
          state: string | null
          latitude: number | null
          longitude: number | null
          capacity: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          booth_code: string
          booth_name: string
          location: string
          district?: string | null
          state?: string | null
          latitude?: number | null
          longitude?: number | null
          capacity?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          booth_code?: string
          booth_name?: string
          location?: string
          district?: string | null
          state?: string | null
          latitude?: number | null
          longitude?: number | null
          capacity?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      candidates: {
        Row: { id: string; name: string | null; election_id: string | null }
        Insert: { id?: string; name?: string | null; election_id?: string | null }
        Update: { id?: string; name?: string | null; election_id?: string | null }
        Relationships: []
      }
      deceased_list: {
        Row: { id_number: string }
        Insert: { id_number: string }
        Update: { id_number?: string }
        Relationships: []
      }
      election_stats: {
        Row: {
          id: string
          booth_id: string | null
          total_entries: number | null
          clean_entries: number | null
          flagged_entries: number | null
          duplicate_attempts: number | null
          outside_geofence_count: number | null
          timestamp: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          booth_id?: string | null
          total_entries?: number | null
          clean_entries?: number | null
          flagged_entries?: number | null
          duplicate_attempts?: number | null
          outside_geofence_count?: number | null
          timestamp?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          booth_id?: string | null
          total_entries?: number | null
          clean_entries?: number | null
          flagged_entries?: number | null
          duplicate_attempts?: number | null
          outside_geofence_count?: number | null
          timestamp?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      elections: {
        Row: { id: string; title: string | null; start_time: string | null; end_time: string | null }
        Insert: { id?: string; title?: string | null; start_time?: string | null; end_time?: string | null }
        Update: { id?: string; title?: string | null; start_time?: string | null; end_time?: string | null }
        Relationships: []
      }
      officials: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string | null
          designation: string | null
          assigned_booths: unknown[] | null
          is_active: boolean | null
          role: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name: string
          email: string
          phone?: string | null
          designation?: string | null
          assigned_booths?: unknown[] | null
          is_active?: boolean | null
          role?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          phone?: string | null
          designation?: string | null
          assigned_booths?: unknown[] | null
          is_active?: boolean | null
          role?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          name: string | null
          id_number: string | null
          dob: string | null
          status: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name?: string | null
          id_number?: string | null
          dob?: string | null
          status?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          id_number?: string | null
          dob?: string | null
          status?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      voter_activity_log: {
        Row: {
          id: string
          voter_id: string
          booth_id: string | null
          entry_time: string | null
          exit_time: string | null
          geofence_status: string | null
          is_suspicious: boolean | null
          flags: unknown[] | null
          latitude: number | null
          longitude: number | null
          image_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          voter_id: string
          booth_id?: string | null
          entry_time?: string | null
          exit_time?: string | null
          geofence_status?: string | null
          is_suspicious?: boolean | null
          flags?: unknown[] | null
          latitude?: number | null
          longitude?: number | null
          image_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          voter_id?: string
          booth_id?: string | null
          entry_time?: string | null
          exit_time?: string | null
          geofence_status?: string | null
          is_suspicious?: boolean | null
          flags?: unknown[] | null
          latitude?: number | null
          longitude?: number | null
          image_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      voters: {
        Row: {
          id: string
          voter_id: string
          full_name: string | null
          email: string | null
          phone: string | null
          gender: string | null
          age: number | null
          state: string | null
          district: string | null
          booth_id: string | null
          has_voted: boolean | null
          voted_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          voter_id: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          gender?: string | null
          age?: number | null
          state?: string | null
          district?: string | null
          booth_id?: string | null
          has_voted?: boolean | null
          voted_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          voter_id?: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          gender?: string | null
          age?: number | null
          state?: string | null
          district?: string | null
          booth_id?: string | null
          has_voted?: boolean | null
          voted_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      votes: {
        Row: { id: string; user_id: string | null; election_id: string | null; candidate_id: string | null; created_at: string | null }
        Insert: { id?: string; user_id?: string | null; election_id?: string | null; candidate_id?: string | null; created_at?: string | null }
        Update: { id?: string; user_id?: string | null; election_id?: string | null; candidate_id?: string | null; created_at?: string | null }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
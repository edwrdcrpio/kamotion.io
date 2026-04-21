export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      cards: {
        Row: {
          archived_at: string | null
          archived_from_column: string | null
          assignee: string
          column_name: string
          created_at: string
          created_by: string | null
          due_date: string | null
          estimated_duration: string | null
          id: string
          notes: string | null
          position: number
          priority: string
          request_date: string
          requester: string
          status: string
          task: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          archived_from_column?: string | null
          assignee: string
          column_name?: string
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          estimated_duration?: string | null
          id?: string
          notes?: string | null
          position?: number
          priority?: string
          request_date?: string
          requester: string
          status?: string
          task: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          archived_from_column?: string | null
          assignee?: string
          column_name?: string
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          estimated_duration?: string | null
          id?: string
          notes?: string | null
          position?: number
          priority?: string
          request_date?: string
          requester?: string
          status?: string
          task?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cards_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          last_logged_in_at: string | null
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id: string
          last_logged_in_at?: string | null
          role?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          last_logged_in_at?: string | null
          role?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          active: boolean
          created_at: string
          email: string | null
          id: string
          name: string
          role: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          email?: string | null
          id?: string
          name: string
          role?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          role?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      current_user_role: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      mark_logged_in: { Args: never; Returns: string }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

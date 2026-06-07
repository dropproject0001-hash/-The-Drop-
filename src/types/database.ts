export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: 'tanod' | 'admin' | 'super_admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: 'tanod' | 'admin' | 'super_admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: 'tanod' | 'admin' | 'super_admin'
          created_at?: string
          updated_at?: string
        }
      }
      drops: {
        Row: {
          id: string
          title: string
          description: string | null
          lat: number
          lng: number
          created_by: string
          assigned_to: string | null
          status: 'active' | 'pending' | 'completed' | 'cancelled'
          qr_code: string | null
          notes_encrypted: string | null
          completed_by: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
          pickup_order: number | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          lat: number
          lng: number
          created_by: string
          assigned_to?: string | null
          status?: 'active' | 'pending' | 'completed' | 'cancelled'
          qr_code?: string | null
          notes_encrypted?: string | null
          completed_by?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
          pickup_order?: number | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          lat?: number
          lng?: number
          created_by?: string
          assigned_to?: string | null
          status?: 'active' | 'pending' | 'completed' | 'cancelled'
          qr_code?: string | null
          notes_encrypted?: string | null
          completed_by?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
          pickup_order?: number | null
        }
      }
      locations: {
        Row: {
          id: string
          user_id: string
          lat: number
          lng: number
          accuracy: number | null
          speed: number | null
          recorded_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lat: number
          lng: number
          accuracy?: number | null
          speed?: number | null
          recorded_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lat?: number
          lng?: number
          accuracy?: number | null
          speed?: number | null
          recorded_at?: string
        }
      }
      activity_log: {
        Row: {
          id: string
          actor_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          ts: string
        }
        Insert: {
          id?: string
          actor_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          ts?: string
        }
        Update: {
          id?: string
          actor_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          ts?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          body: string | null
          data: Json | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          body?: string | null
          data?: Json | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          body?: string | null
          data?: Json | null
          read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

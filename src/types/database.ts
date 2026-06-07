/**
 * @file src/types/database.ts
 *
 * FIX C-3: Type definitions now match the actual Supabase SQL schema
 * defined in supabase/migrations/001_init.sql.
 *
 * Previous version had wrong role enum ('tanod' instead of 'client')
 * and wrong status enum ('pending'/'completed'/'cancelled' instead of
 * 'claimed'/'expired').
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          /** Aligned to SQL: user_role enum ('super_admin', 'admin', 'client') */
          role: 'super_admin' | 'admin' | 'client';
          display_name: string;
          avatar_url: string | null;
          is_online: boolean;
          last_seen: string;
          push_endpoint: string | null;
          push_keys: Json | null;
          created_at: string;
        };
        Insert: {
          id: string;
          role?: 'super_admin' | 'admin' | 'client';
          display_name: string;
          avatar_url?: string | null;
          is_online?: boolean;
          last_seen?: string;
          push_endpoint?: string | null;
          push_keys?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: 'super_admin' | 'admin' | 'client';
          display_name?: string;
          avatar_url?: string | null;
          is_online?: boolean;
          last_seen?: string;
          push_endpoint?: string | null;
          push_keys?: Json | null;
          created_at?: string;
        };
      };
      drops: {
        Row: {
          id: string;
          created_by: string;
          assigned_to: string;
          lat: number;
          lng: number;
          title: string;
          notes_encrypted: string | null;
          photo_url: string | null;
          video_url: string | null;
          qr_token: string;
          /** Aligned to SQL: drop_status enum ('active', 'claimed', 'expired') */
          status: 'active' | 'claimed' | 'expired';
          pickup_order: number;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_by: string;
          assigned_to: string;
          lat: number;
          lng: number;
          title: string;
          notes_encrypted?: string | null;
          photo_url?: string | null;
          video_url?: string | null;
          qr_token?: string;
          status?: 'active' | 'claimed' | 'expired';
          pickup_order?: number;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          created_by?: string;
          assigned_to?: string;
          lat?: number;
          lng?: number;
          title?: string;
          notes_encrypted?: string | null;
          photo_url?: string | null;
          video_url?: string | null;
          qr_token?: string;
          status?: 'active' | 'claimed' | 'expired';
          pickup_order?: number;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      locations: {
        Row: {
          id: number;
          user_id: string;
          lat: number;
          lng: number;
          heading: number | null;
          accuracy: number | null;
          speed: number | null;
          altitude: number | null;
          recorded_at: string;
        };
        Insert: {
          user_id: string;
          lat: number;
          lng: number;
          heading?: number | null;
          accuracy?: number | null;
          speed?: number | null;
          altitude?: number | null;
          recorded_at?: string;
        };
        Update: {
          user_id?: string;
          lat?: number;
          lng?: number;
          heading?: number | null;
          accuracy?: number | null;
          speed?: number | null;
          altitude?: number | null;
          recorded_at?: string;
        };
      };
      pickups: {
        Row: {
          id: string;
          drop_id: string;
          client_id: string;
          confirmed_at: string;
          method: 'qr_scan' | 'manual';
          scan_lat: number | null;
          scan_lng: number | null;
        };
        Insert: {
          id?: string;
          drop_id: string;
          client_id: string;
          confirmed_at?: string;
          method: 'qr_scan' | 'manual';
          scan_lat?: number | null;
          scan_lng?: number | null;
        };
        Update: never; // pickups are immutable
      };
      messages: {
        Row: {
          id: string;
          room_id: string;
          sender_id: string;
          body: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          sender_id: string;
          body: string;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          read_at?: string | null;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: 'drop_created' | 'drop_claimed' | 'drop_expired' | 'user_login' | 'message_received';
          title: string;
          body: string;
          entity_id: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'drop_created' | 'drop_claimed' | 'drop_expired' | 'user_login' | 'message_received';
          title: string;
          body: string;
          entity_id?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          read?: boolean;
        };
      };
      activity_log: {
        Row: {
          id: number;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          meta: Json;
          ts: string;
        };
        Insert: {
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          meta?: Json;
          ts?: string;
        };
        Update: never; // activity_log is immutable
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      user_role: 'super_admin' | 'admin' | 'client';
      drop_status: 'active' | 'claimed' | 'expired';
      pickup_method: 'qr_scan' | 'manual';
    };
  };
}

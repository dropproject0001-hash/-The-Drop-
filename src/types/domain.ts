/**
 * @file src/types/domain.ts
 *
 * FIX C-3: Domain types now derive from the corrected database.ts schema.
 * UserRole is now 'super_admin' | 'admin' | 'client' (not 'tanod').
 * DropStatus is now 'active' | 'claimed' | 'expired'.
 */
import { Database } from './database';

export type UserRole = Database['public']['Tables']['profiles']['Row']['role'];
export type DropStatus = Database['public']['Tables']['drops']['Row']['status'];

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Drop = Database['public']['Tables']['drops']['Row'];
export type LocationBroadcast = Database['public']['Tables']['locations']['Row'];
export type ActivityLog = Database['public']['Tables']['activity_log']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type Pickup = Database['public']['Tables']['pickups']['Row'];

/** A drop enriched with the calculated distance from the current user's position. */
export interface DropWithDistance extends Drop {
  distance?: number;
}

/** A normalised marker datum for the map layer. */
export interface MapMarker {
  id: string;
  type: 'drop' | 'user';
  lat: number;
  lng: number;
  status?: DropStatus | 'online' | 'offline';
  title: string;
  meta?: unknown;
}

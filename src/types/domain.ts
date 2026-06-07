import { Database } from './database';

export type UserRole = Database['public']['Tables']['profiles']['Row']['role'];
export type DropStatus = Database['public']['Tables']['drops']['Row']['status'];

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Drop = Database['public']['Tables']['drops']['Row'];
export type LocationBroadcast = Database['public']['Tables']['locations']['Row'];
export type ActivityLog = Database['public']['Tables']['activity_log']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];

/**
 * Domain layer types extending raw database models where necessary
 */
export interface DropWithDistance extends Drop {
  distance?: number; // Calculated distance from current user
}

export interface MapMarker {
  id: string;
  type: 'drop' | 'user';
  lat: number;
  lng: number;
  status?: DropStatus | 'online' | 'offline';
  title: string;
  meta?: any;
}

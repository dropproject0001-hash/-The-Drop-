// User / Profile
export interface Profile {
  id: string;
  email?: string;
  phone?: string;
  role: 'super_admin' | 'dropper' | 'client';
  alias?: string;
  username?: string;
  phone_verified?: boolean;
  created_by?: string;
  created_at: string;
  updated_at?: string;
}

// Drop
export interface Drop {
  id: string;
  status: 'pending' | 'active' | 'executed' | 'completed' | 'cancelled';
  created_by: string;
  dropper_id?: string;
  client_id?: string;
  location?: {
    lat: number;
    lng: number;
  };
  qr_code?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

// Live Location Update
export interface LocationUpdate {
  id?: string;
  drop_id: string;
  lat: number;
  lng: number;
  timestamp: string;
  accuracy?: number;
}

// Message (Encrypted Chat)
export interface Message {
  id: string;
  drop_id: string;
  sender_id: string;
  content: string;           // Encrypted content
  created_at: string;
}

// Audit Log
export interface AuditLog {
  id: string;
  action: string;
  performed_by: string;
  target_user?: string;
  details: Record<string, any>;
  created_at: string;
}

// OTP Code (for reference)
export interface OtpCode {
  id: string;
  phone: string;
  code: string;
  purpose: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

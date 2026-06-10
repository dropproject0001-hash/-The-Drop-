# 📡 REAL-TIME LOCATION & GPS TELEMETRY SYSTEM
## Project Identity: The Drop (Droppin Ops v1.0)
---

### 1. Tactical Assessment
This document outlines the high-security, ultra-resilient, offline-ready location tracking system implemented for **The Drop**. This system provides field operators, admins, and super admins with precise real-time situational awareness (Mamburao Area of Operations) while protecting operational security via strict validation, rate limiting, and defensive fallback engines.

---

### 2. End-to-End System Architecture

```mermaid
graph TD
    %% Clients
    D[Dropper / Admin GPS] -->|LocationBroadcastService| B[broadcast-location Edge Function]
    D_Off[Dropper Offline] -->|Local Queuing| DB[(Dexie Local Outbox)]
    DB -->|Auto-Sync when Online| B

    %% Security Gate
    B -->|1. Auth Validation / JWT| Auth[Supabase Auth]
    B -->|2. Role Check: operators only| Prof[profiles Table]
    B -->|3. Strict Mode Check: drop_id| DS[drops Table Status]
    B -->|4. Rate Limit (4s)| RLCheck{Within Rate Limit?}
    
    %% Storage & Dispatch
    RLCheck -->|Yes| Ins[locations Table INSERT]
    RLCheck -->|No| Reject[429 Rate Limit Exceeded]
    
    %% Audit & Realtime
    Ins -->|Trigger| Realtime[Supabase Realtime INSERT]
    Ins -->|Audit Log| Act[activity_log Table]
    
    %% Consumers
    Realtime -->|useLiveLocations Hook| Map[DropMap: Pulsing live markers]
    Realtime -->|useLiveLocations Hook| Dash[SuperAdminLiveDashboard]
    Realtime -->|usePresenceTracking| Pres[Active Presence HUD]
```

---

### 3. Core Capabilities & Mechanics

#### A. Unified `LocationBroadcastService` (`src/services/LocationBroadcastService.ts`)
A robust singleton service orchestrating GPS tracking, background queuing, network detection, and agent presence.
- **Auto-Tracking**: Uses `navigator.geolocation.watchPosition` with high precision constraints.
- **Offline Outbox**: Integrates a client-side transaction queue using **Dexie IndexedDB** to absorb intermittent network deadzones.
- **Queue Flusher**: Periodically retries uploading queued entries every 15 seconds or immediately when the device gains network connectivity.
- **Presence Engine**: Tracks active field agents in real-time using Supabase Presence.

#### B. Combined Secure Edge Function (`supabase/functions/broadcast-location/index.ts`)
All broadcasts pass through a service-role gateway guarding the database write-path.
- **Authentication**: Validates standard user session JWT flags.
- **Authorization**: Verifies the actor is in the operator tier (`super_admin`, `admin`, `dropper`).
- **Strict Goods Eye Mode**: If `STRICT_GOODS_EYE=true` is enabled in Deno environments:
  - `drop_id` parameter is strictly **mandatory**.
  - Drop must exist, be `active`, and have assigned ownership/creator correlation matching the broadcasting agent.
- **Rate Limiting**: Enforces a strict 4-second minimum interval (`RATE_LIMIT_MS`) per individual user. Violations receive high-priority HTTP `429 Too Many Requests` responses indicating wait-time cooldowns.
- **Telemetry Records**: Automatically writes GPS tuples to `locations` using secure system timestamps.
- **Audit Logging**: Inserts immutable logging strings directly into `activity_log` for full non-repudiation tracking.

#### C. Real-Time Consumer Hook (`src/hooks/realtime/useLiveLocations.ts`)
- Group-aggregates incoming GPS positions by `user_id`.
- Auto-prunes and manages memory size limiters.
- Yields immediate connection health status variables (`connecting`, `connected`, `error`).

#### D. Live Markers with Visual Pulse (`src/components/map/DropMap.tsx`)
- Displays green pulsing halos around live agent coordinates for exactly 8 seconds after each transmission is recorded relative to chronological system clocks.
- Keeps outer boundaries clean with desktop-first responsive styling and dedicated offline tile backup triggers.

---

### 4. Security Configuration

#### database RLS Enforcement (`supabase/migrations/006_rls_cleanup_for_edge_functions.sql`)
```sql
DROP POLICY IF EXISTS "operators can broadcast location" ON public.locations;

CREATE POLICY "operators can broadcast location"
ON public.locations
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND 
  public.my_role() IN ('super_admin', 'admin', 'dropper')
);
```
*Note: RLS acts as a robust secondary defense-in-depth shield. The primary business validation, rate limiting, and write-path logic are securely encapsulated inside the serverless Edge Function runtimes.*

---

### 5. Tactical Debugging Panel (`src/components/debug/LocationDebugPanel.tsx`)
Exposes full manual controls over telemetry for QA validation or test deployments.

#### Features Matrix:
1. **Network Status Indicator**: Real-time evaluation of client connection capabilities.
2. **Local Queue Size Counter**: Reflects exact IndexedDB outbox rows pending synchronization.
3. **Tracking Mode Toggle**: Switches background watcher modules on demand.
4. **Active Agent Presence List**: Evaluates realtime WebSocket subscribers globally.
5. **Direct Operations**:
   - `START / STOP TRACKING`
   - `FLUSH QUEUE`: Manually forces a synchronization loop attempt.
   - `CLEAR QUEUE`: Empties local database tables to clear stale test logs.

#### Developer Enablement:
Instantly render the UI from the browser console on any device/environment:
```js
localStorage.setItem('show_location_debug', 'true');
location.reload();
```

---

### 6. Verification Checklist & Operations Tests

To verify full integration, follow these operational steps:
1. **Verify Compilation**: Compile build is verified green.
2. **Activate Debug View**: Enter `localStorage.setItem('show_location_debug', 'true')` in developer tools.
3. **Simulate Offline Bounds**:
   - Turn on tracking.
   - Set browser throttle to "Offline".
   - View pending queue indices ascending.
   - Turn network back online; observe local counts returning securely to zero as items flush.

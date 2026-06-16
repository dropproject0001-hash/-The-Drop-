# @drop/core — Tactical Workflow Engine

The core execution engine for **The Drop (Droppin Ops)**. It orchestrates the lifecycle of tactical field operations, including drop management, real-time location broadcasting, and secure state transitions.

## Project Context
The Drop is a mobile-first PWA designed for secure product drops. This package (`@drop/core`) provides the headless logic for the "Execution Engine" used by both the Admin and Dropper interfaces.

## File Paths
- **Source:** `packages/core/src/Workflow.ts`
- **Types:** Derived from `src/types/domain.ts`

## API Documentation

### `Workflow` Class

The main entry point for orchestrating field operations.

#### Methods

##### `createDrop(payload)`
Initializes a new drop in the system.
- **Parameters:**
  - `payload`: `Omit<Drop, 'id' | 'created_at' | 'updated_at'>` - The data for the new drop.
- **Returns:** `Promise<Drop>` - The created drop object.
- **Constraints:** Inherits RLS and database validation from Supabase.
- **Success Criteria:** 80% unit test coverage.

##### `updateDropStatus(dropId, status)`
Transitions a drop to a new status.
- **Parameters:**
  - `dropId`: `string` - Unique identifier of the drop.
  - `status`: `DropStatus` - Target status ('active', 'claimed', 'expired').
- **Returns:** `Promise<void>`
- **Constraints:** Must follow the centralized transition logic in `dropsService`.

##### `startFieldOperation(dropId, options?)`
Starts a live field operation for a specific drop, initiating GPS tracking and Realtime Presence.
- **Parameters:**
  - `dropId`: `string` - The ID of the drop to track.
  - `options?`: `OperationOptions` - Configuration for the tracking session.
- **Returns:** `Promise<void>`
- **Side Effects:** Triggers `LocationBroadcastService.startTracking`.

##### `endFieldOperation()`
Ends the current field operation and stops GPS broadcasting.
- **Returns:** `void`

##### `getOperationStatus()`
Returns the current state of the execution engine.
- **Returns:** `OperationStatus`
  - `isActive`: boolean
  - `activeDropId`: string | null
  - `isBroadcasting`: boolean

## Usage Example

```typescript
import { workflow } from '@drop/core';

// 1. Initiate a field operation for a specific drop
await workflow.startFieldOperation('drop-888', {
  onLocationUpdate: (loc) => {
    console.log('[GPS] Tactical Update:', loc.lat, loc.lng);
  },
  onError: (err) => {
    console.error('[OPERATIONAL FAILURE]:', err);
  }
});

// 2. Monitor execution status
const { isActive, isBroadcasting } = workflow.getOperationStatus();
if (isActive && isBroadcasting) {
  console.log('Operation Live. GPS Broadcasting active.');
}

// 3. Conclude operation
workflow.endFieldOperation();
```

## Constraints & Requirements
- **API Contract:** Do not modify the existing method signatures or return types as they are consumed by the mobile PWA frontend.
- **Performance:** Throttling and battery optimization are handled internally by `LocationBroadcastService`.
- **Test Coverage:** Maintain a minimum of **80% test coverage** for all logic within this package.
- **Environment:** Requires `import.meta.env` for configuration (Vite environment).

## Success Criteria
- [ ] 80% Unit Test Coverage.
- [ ] Successful TypeScript compilation with zero errors.
- [ ] Zero regressions in existing `LocationBroadcastService` functionality.

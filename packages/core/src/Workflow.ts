import { supabase } from '@/lib/supabase';
import type { Drop, DropStatus, LiveLocation } from '@/types/domain';
import { locationBroadcastService } from '@/services/LocationBroadcastService';
import { dropsService } from '@/services/drops';

/**
 * Configuration for the Workflow engine.
 */
export interface WorkflowConfig {
  /** Enables debug logging for tactical operations. */
  debug?: boolean;
  /** Encryption key for coordinate obfuscation (optional). */
  encryptionKey?: string;
}

/**
 * Options for starting a field operation.
 */
export interface OperationOptions {
  /** Callback for real-time location updates. */
  onLocationUpdate?: (location: LiveLocation) => void;
  /** Callback for operation errors. */
  onError?: (error: any) => void;
  /** Whether to enable high accuracy GPS. */
  highAccuracy?: boolean;
}

/**
 * Current status of the execution engine.
 */
export interface OperationStatus {
  /** Whether an operation is currently active. */
  isActive: boolean;
  /** The ID of the drop being tracked, if any. */
  activeDropId: string | null;
  /** Whether the device is currently broadcasting GPS. */
  isBroadcasting: boolean;
}

/**
 * Main execution engine for tactical field operations.
 *
 * The Workflow engine centralizes the orchestration of drop lifecycles,
 * real-time location broadcasting, and state transitions.
 */
export class Workflow {
  private config: WorkflowConfig;
  private activeDropId: string | null = null;

  constructor(config: WorkflowConfig = {}) {
    this.config = config;
  }

  /**
   * Initializes a new drop in the system.
   *
   * @param payload - The data for the new drop.
   * @returns The created drop object.
   * @throws Error if creation fails or user is unauthorized.
   */
  async createDrop(payload: Omit<Drop, 'id' | 'created_at' | 'updated_at'>): Promise<Drop> {
    const { data, error } = await supabase
      .from('drops')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data as Drop;
  }

  /**
   * Transitions a drop to a new status.
   *
   * @param dropId - The unique identifier of the drop.
   * @param status - The target status ('active', 'claimed', 'expired').
   * @throws Error if the transition is invalid or unauthorized.
   */
  async updateDropStatus(dropId: string, status: DropStatus): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required');

    const result = await dropsService.transitionStatus(dropId, status, user.id);
    if (!result.success) {
      throw new Error(result.message || 'Failed to transition status');
    }
  }

  /**
   * Starts a live field operation for a specific drop.
   *
   * This method begins GPS tracking and real-time location broadcasting
   * tied to the specified drop ID.
   *
   * @param dropId - The ID of the drop to track.
   * @param options - Configuration for the tracking session.
   */
  async startFieldOperation(dropId: string, options: OperationOptions = {}): Promise<void> {
    this.activeDropId = dropId;
    await locationBroadcastService.startTracking({
      dropId,
      onUpdate: options.onLocationUpdate,
      onError: options.onError
    });

    if (this.config.debug) {
      console.log(`[Workflow] Started field operation for drop: ${dropId}`);
    }
  }

  /**
   * Ends the current field operation and stops GPS broadcasting.
   */
  endFieldOperation(): void {
    locationBroadcastService.stopTracking();
    const previousDropId = this.activeDropId;
    this.activeDropId = null;

    if (this.config.debug) {
      console.log(`[Workflow] Ended field operation for drop: ${previousDropId}`);
    }
  }

  /**
   * Returns the current state of the execution engine.
   *
   * @returns The active operation status.
   */
  getOperationStatus(): OperationStatus {
    return {
      isActive: this.activeDropId !== null,
      activeDropId: this.activeDropId,
      isBroadcasting: locationBroadcastService.isCurrentlyBroadcasting()
    };
  }
}

/**
 * Singleton instance of the Workflow engine.
 */
export const workflow = new Workflow({
  debug: false
});

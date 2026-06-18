# Workflow Engine Architecture
The Workflow engine in `packages/core/src/Workflow.ts` acts as a high-level orchestrator for tactical operations. It wraps lower-level services (`dropsService`, `locationBroadcastService`) into a cohesive "Execution Engine" API.

Key Patterns:
- **Singleton Instance**: Exported for easy use across the PWA.
- **Stateful Operations**: Tracks the `activeDropId` to manage the lifecycle of a field operation.
- **Alias Compliance**: Uses `@/` aliases to maintain compatibility with the main Vite/TS configuration.

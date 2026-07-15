# State Boundaries & Local-First UI (Tolk)

Tolk uses a local-first architecture. The UI is primarily driven by local storage, treating the server as a synchronization engine.

## 1. Storage Layers

### SQLite (Persistent Relational Data)
**What lives here**: 
- Chats (Rooms)
- Messages (History)
- The Chat Wall items
- Echoes (Received & Pending)
- Outbox (Pending actions to sync with server)
**Rules**:
- The single source of truth for the Chat List and Message History.
- Fast local queries (including FTS for search) power the UI.
- All incoming WebSocket events write to SQLite *first*, which then triggers a re-render.

### MMKV (Fast Key-Value Store)
**What lives here**:
- Session tokens (Auth)
- User Preferences (Theme, Notifications, Storage policies)
- Navigation state / Cursors (e.g., last read position, scroll offsets)
- Feature flags
**Rules**:
- Used for synchronous, blazing-fast reads on app startup.
- Never used for lists of unbounded size (like messages).

### Zustand (In-Memory App State)
**What lives here**:
- Ephemeral UI state (e.g., "is keyboard open", "is composer focused", "current active column in pager").
- Live Drafts (Live Thoughts feature) before they are sent.
- Currently active audio/video playback state.
**Rules**:
- Do **NOT** persist Zustand stores to disk if the data belongs in MMKV or SQLite.
- Zustand acts as the glue for UI interactions, not as the primary data cache.

## 2. The Outbox Pattern (Optimistic UI)
1. User sends a message -> 
2. Inserted into local SQLite Outbox table (status = `pending`, `client_id` generated) -> 
3. UI immediately displays the message (Optimistic update) ->
4. Background worker attempts to send via network (HTTPS/WS) ->
5. On success (Ack): Update SQLite status to `sent`, map `client_id` to server `seq`.
6. On failure: Update SQLite status to `failed` -> UI shows retry icon.

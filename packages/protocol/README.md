# `@tolk/protocol`

Shared API contracts for **web**, **iOS**, and **Android**.

## Goals

- Single OpenAPI source of truth  
- Generated TypeScript types for `apps/web` and `apps/mobile`  
- Event name constants for WebSocket  

## Status

Scaffold placeholder — filled by backend Phase B0+.

## Planned layout

```
packages/protocol/
  openapi.yaml
  src/
    events.ts
    index.ts
  package.json
```

## Event names (draft)

```ts
export const WsEvents = {
  MessageCreated: 'message.created',
  MessageEdited: 'message.edited',
  MessageDeleted: 'message.deleted',
  ReactionUpdated: 'reaction.updated',
  ShelfPinned: 'shelf.pinned',
  ShelfUnpinned: 'shelf.unpinned',
  PostCreated: 'post.created',
  PostDeleted: 'post.deleted',
  PostLiked: 'post.liked',
  PostCommented: 'post.commented',
  EchoCreated: 'echo.created',
  EchoOpened: 'echo.opened',
  EchoDismissed: 'echo.dismissed',
  ReceiptRead: 'receipt.read',
  PresenceTyping: 'presence.typing',
  SessionRevoked: 'session.revoked',
} as const;
```

See `docs/BACKEND_AGENT_PROMPT.md` for full REST surface.

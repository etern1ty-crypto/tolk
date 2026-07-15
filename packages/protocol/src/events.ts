/** WebSocket event names — keep in sync with OpenAPI / backend */
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

export type WsEventName = (typeof WsEvents)[keyof typeof WsEvents];

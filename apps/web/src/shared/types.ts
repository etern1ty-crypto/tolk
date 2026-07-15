export type Id = string;

export type MainTab = 'wall' | 'chats' | 'profile';
export type MessageStatus = 'pending' | 'sent' | 'failed' | 'read';
export type MessageKind = 'text' | 'media' | 'voice' | 'circle' | 'file';
export type AuthStep = 'phone' | 'otp' | 'profile' | 'done';
export type SettingsRoute =
  | null
  | 'hub'
  | 'account'
  | 'sessions'
  | 'appearance'
  | 'privacy'
  | 'storage'
  | 'chats'
  | 'about';
export type PostOrigin = 'wall' | 'profile';

export interface User {
  id: Id;
  username: string;
  displayName: string;
  phone?: string;
  bio?: string;
  online?: boolean;
  /** CSS gradient or color for profile banner */
  banner: string;
}

export interface Chat {
  id: Id;
  type: 'dm' | 'group';
  title: string;
  preview: string;
  unread: number;
  timeLabel: string;
  pinned?: boolean;
  muted?: boolean;
  online?: boolean;
  peerId?: Id;
}

export interface Message {
  id: Id;
  chatId: Id;
  senderId: Id;
  kind: MessageKind;
  text: string;
  status: MessageStatus;
  createdAt: number;
  isEcho?: boolean;
  /** voice duration sec */
  durationSec?: number;
  reactions: Record<string, string[]>; // emoji -> userIds
  replyToId?: Id;
  replyPreview?: string;
}

export interface Post {
  id: Id;
  authorId: Id;
  text: string;
  createdAt: number;
  origin: PostOrigin;
  onWall: boolean;
  /** if reposted from another post */
  repostOfId?: Id;
  likedBy: Id[];
  comments: Comment[];
  /** mock image: gradient key or url */
  media?: {
    kind: 'image' | 'color';
    src: string;
    alt?: string;
  };
}

export interface Comment {
  id: Id;
  userId: Id;
  text: string;
  createdAt: number;
}

export interface EchoItem {
  id: Id;
  fromUserId: Id;
  fromName: string;
  chatId: Id;
  messageId: Id;
  text: string;
  status: 'pending' | 'opened' | 'dismissed';
  createdAt: number;
}

export interface ShelfItem {
  id: Id;
  chatId: Id;
  messageId: Id;
  pinnedBy: Id;
  pinnedAt: number;
  text: string;
}

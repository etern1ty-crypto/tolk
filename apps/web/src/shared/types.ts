export type Id = string;

export type MainTab = 'wall' | 'chats' | 'search' | 'profile';
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
  lastSeenAt?: number;
  /** id from BANNER_PATTERNS */
  bannerPatternId: string;
  avatarRef?: string;
  /** Custom banner photo URL above avatar */
  bannerRef?: string;
}

export interface Chat {
  id: Id;
  type: 'dm' | 'group' | 'channel';
  title: string;
  description?: string;
  isPublic?: boolean;
  myRole?: 'owner' | 'admin' | 'member';
  memberCount?: number;
  preview: string;
  unread: number;
  timeLabel: string;
  pinned?: boolean;
  muted?: boolean;
  online?: boolean;
  peerId?: Id;
  /** id from CHAT_THEMES */
  themeId?: string;
  customWallpaperRef?: string;
  avatarRef?: string;
  latestMessageCreatedAt?: number;
  peerLastReadSeq?: number;
}

export interface Message {
  id: Id;
  chatId: Id;
  senderId: Id;
  kind: MessageKind;
  text: string;
  status: MessageStatus;
  createdAt: number;
  seq?: number;
  isEcho?: boolean;
  /** voice duration sec */
  durationSec?: number;
  reactions: Record<string, string[]>; // emoji -> userIds
  replyToId?: Id;
  replyPreview?: string;
  media?: {
    url: string;
    filename?: string;
    mime?: string;
    size?: number;
    durationSec?: number;
  };
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
  media?: {
    kind: 'pattern' | 'image';
    patternId?: string;
    url?: string;
    media_id?: string;
    alt?: string;
    items?: string[];
    height?: number;
    fontSize?: number;
    fontFamily?: string;
  };
}

export interface Comment {
  id: Id;
  userId: Id;
  text: string;
  createdAt: number;
  parentId?: Id | null;
  likedBy?: Id[];
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
  mediaUrl?: string;
  kind?: string;
}

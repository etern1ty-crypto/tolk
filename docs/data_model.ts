export type Id = string;

export interface User {
  id: Id;
  username: string;
  display_name: string;
  avatar_ref?: string;
  bio?: string;
}

export interface Chat {
  id: Id;
  type: 'dm' | 'group';
  title?: string;
  updated_at: number;
}

export interface Message {
  id: Id;
  chat_id: Id;
  sender_id: Id;
  seq?: number;
  kind: 'text' | 'media' | 'voice' | 'file';
  text?: string;
  status: 'pending' | 'sent' | 'failed' | 'read';
}

/** Закреп на полке чата (бывш. WallItem / «стена чата») */
export interface ShelfItem {
  id: Id;
  chat_id: Id;
  message_id: Id;
  pinned_by: Id;
  pinned_at: number;
  sort_key: number;
}

/** Пост на стене пользователя */
export interface WallPost {
  id: Id;
  author_id: Id;
  text: string;
  created_at: number;
  visibility?: 'contacts' | 'everyone' | 'nobody';
}

export interface Echo {
  id: Id;
  from_user: Id;
  to_user: Id;
  payload_ref: Id;
  status: 'pending' | 'opened' | 'dismissed';
}

/** @deprecated use ShelfItem */
export type WallItem = ShelfItem;

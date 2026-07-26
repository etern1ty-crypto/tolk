import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  INITIAL_POSTS,
  ME,
  USERS,
} from '../mocks/fixtures';
import {
  BANNER_PATTERNS,
  CHAT_THEMES,
  DEFAULT_CHAT_THEME_ID,
  resolveChatThemeId,
} from '../shared/patterns';
import { soundEffects, THEME_SOUND_PACK, type SoundPackId } from '../shared/soundEffects';
import type {
  AuthStep,
  Chat,
  EchoItem,
  MainTab,
  Message,
  Post,
  SettingsRoute,
  ShelfItem,
  User,
} from '../shared/types';

const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:3000';
};
const API_URL = getApiUrl();

/** Merge author/commenter cards from feed payloads into users map */
export function mergeUsersFromPosts(
  posts: any[],
  base: Record<string, User> = {}
): Record<string, User> {
  const users = { ...base };
  const put = (u: Partial<User> & { id: string }) => {
    if (!u.id) return;
    const prev = users[u.id];
    users[u.id] = {
      id: u.id,
      username: u.username ?? prev?.username ?? '',
      displayName: u.displayName || prev?.displayName || '…',
      bio: u.bio ?? prev?.bio,
      online: u.online ?? prev?.online,
      lastSeenAt: u.lastSeenAt ?? prev?.lastSeenAt,
      bannerPatternId: u.bannerPatternId || prev?.bannerPatternId || 'mint_wave',
      avatarRef: u.avatarRef ?? prev?.avatarRef,
      bannerRef: u.bannerRef ?? prev?.bannerRef,
    };
  };

  for (const p of posts || []) {
    if (p.authorId) {
      put({
        id: p.authorId,
        displayName: p.authorDisplayName,
        username: p.authorUsername,
        avatarRef: p.authorAvatarRef,
        bannerPatternId: p.authorBannerPatternId,
      });
    }
    for (const c of p.comments || []) {
      if (c.userId) {
        put({
          id: c.userId,
          displayName: c.displayName,
          username: c.username,
          avatarRef: c.avatarRef,
        });
      }
    }
  }
  return users;
}

/** Ответ сервера -> ShelfItem. Сервер вкладывает само сообщение, чтобы полку
 *  можно было отрисовать без запроса на каждый закреп. */
// Отмечает эхо прочитанным или закрытым на сервере, иначе указатель вернётся
// при следующем запуске.
function markEchoesSeen(
  items: { id: string }[],
  action: 'open' | 'dismiss',
  get: () => { token: string | null }
): void {
  const token = get().token;
  if (!token) return;
  for (const e of items) {
    fetchApi(`/echoes/${e.id}/${action}`, { method: 'POST' }, token).catch((err) =>
      console.error('Не удалось отметить эхо:', err)
    );
  }
}

// Эхо с сервера: отправитель приходит вложенным объектом, а внутри клиента
// хранится плоско — как его кладёт отправляющая сторона.
function echoFromApi(x: any): EchoItem {
  return {
    id: x.id,
    fromUserId: x.from?.id ?? '',
    fromName: x.from?.displayName || x.from?.username || 'Кто-то',
    chatId: x.chatId,
    messageId: x.messageId,
    text: x.message?.text || `[${x.message?.kind ?? 'сообщение'}]`,
    status: x.status ?? 'pending',
    createdAt: Number(x.createdAt) || Date.now(),
  };
}

function shelfFromApi(x: any): any {
  const m = x?.message ?? {};
  const body =
    (m.text && String(m.text).trim()) ||
    (m.kind === 'media' ? 'Фото' : m.kind === 'voice' ? 'Голосовое' : m.kind === 'circle' ? 'Кружок' : 'Сообщение');
  return {
    id: x.id,
    chatId: x.chatId,
    messageId: x.messageId,
    pinnedBy: x.pinnedBy,
    pinnedAt: Number(x.pinnedAt) || Date.now(),
    text: body,
    mediaUrl: m.media?.url,
    kind: m.kind,
  };
}

export async function fetchApi(path: string, options: RequestInit = {}, token?: string | null) {
  const headers = new Headers(options.headers || {});
  if (options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });
  if (!res.ok) {
    const errorText = await res.text();
    let errorObj;
    try {
      errorObj = JSON.parse(errorText);
    } catch {
      errorObj = { error: errorText };
    }
    // Код ответа кладём на саму ошибку. Раньше наружу уходил только текст
    // сервера, и «Unauthorized» невозможно было отличить от любой другой
    // неудачи — проверка на «401» в тексте не срабатывала никогда.
    const err = new Error(errorObj.error || `HTTP ${res.status}`) as Error & { status: number };
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

let activeSocket: WebSocket | null = null;
let lastTypingSent = 0;
let typingTimeout: number | undefined;
let reconnectCount = 0;

let lastUserActivity = Date.now();
if (typeof window !== 'undefined') {
  const bump = () => {
    lastUserActivity = Date.now();
  };
  window.addEventListener('pointerdown', bump, { passive: true });
  window.addEventListener('keydown', bump, { passive: true });
  window.addEventListener('scroll', bump, { passive: true });
  document.addEventListener('visibilitychange', bump);
}

function isUserAfk(ms = 60_000) {
  if (typeof document === 'undefined') return true;
  if (document.visibilityState === 'hidden') return true;
  return Date.now() - lastUserActivity >= ms;
}

function showBrowserNotification(data: any, store: any) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const state = store.getState();
  if (!state.browserNotificationsEnabled) return;
  if (state.notifPrefs && state.notifPrefs.messages === false) return;

  const isBackground = document.visibilityState === 'hidden';
  const afk = isUserAfk(45_000);
  // Active in this chat and not AFK → skip OS toast
  if (state.activeChatId === data.chatId && !isBackground && !afk) return;

  const sender = state.users[data.senderId] || { displayName: 'Пользователь' };
  const title = sender.displayName || sender.username || 'Новое сообщение';

  let body = '';
  if (data.kind === 'text') {
    body = data.text;
  } else if (data.kind === 'voice') {
    body = '🎤 Голосовое сообщение';
  } else if (data.kind === 'circle') {
    body = '🎥 Видеосообщение';
  } else if (data.kind === 'media') {
    body = '🖼️ Изображение';
  } else {
    body = '📎 Вложение';
  }

  try {
    // Prefer SW path on mobile PWA when available
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        body,
        tag: data.chatId,
        url: `/?chat=${encodeURIComponent(data.chatId)}`,
      });
      return;
    }

    const notification = new Notification(title, {
      body,
      tag: data.chatId,
      renotify: true,
    } as any);

    notification.onclick = () => {
      window.focus();
      state.setActiveChat(data.chatId);
      notification.close();
    };
  } catch (e) {
    console.error('Failed to create browser notification:', e);
  }
}

function connectWebSocket(token: string, store: any) {
  if (activeSocket) {
    if (activeSocket.readyState === WebSocket.CONNECTING || activeSocket.readyState === WebSocket.OPEN) {
      return;
    }
    activeSocket.close();
  }
  
  const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = import.meta.env.VITE_WS_URL
    ? `${import.meta.env.VITE_WS_URL}?token=${token}`
    : `${wsProto}//${window.location.host}/ws?token=${token}`;
  const ws = new WebSocket(wsUrl);
  activeSocket = ws;
  
  ws.onopen = () => {
    console.log('[WS] Connected successfully');
    reconnectCount = 0; // Reset backoff counter on success
    
    // Auto catch-up missed messages and chats on connection/reconnection
    const state = store.getState();
    if (state.token) {
      state.initApi().catch((e: any) => console.error('[WS] Catch-up sync failed:', e));
    }
  };
  
  ws.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data);
      const { event: wsEvent, data } = payload;
      
      if (wsEvent === 'reaction.updated') {
        // Сервер шлёт всю карту реакций — заменяем, а не сводим.
        const { messages } = store.getState();
        store.setState({
          messages: messages.map((m: any) =>
            m.id === data.messageId ? { ...m, reactions: data.reactions ?? {} } : m
          ),
        });
        return;
      }

      if (wsEvent === 'shelf.pinned') {
        const { shelfItems } = store.getState();
        if (!shelfItems.some((x: any) => x.messageId === data.messageId)) {
          store.setState({ shelfItems: [shelfFromApi(data), ...shelfItems] });
        }
        return;
      }

      if (wsEvent === 'shelf.unpinned') {
        const { shelfItems } = store.getState();
        store.setState({
          shelfItems: shelfItems.filter((x: any) => x.messageId !== data.messageId),
        });
        return;
      }

      if (wsEvent === 'message.edited') {
        const { messages } = store.getState();
        store.setState({
          messages: messages.map((m: any) =>
            m.id === data.id ? { ...m, text: data.text, editedAt: data.editedAt } : m
          ),
        });
        return;
      }

      if (wsEvent === 'message.deleted') {
        const { messages } = store.getState();
        store.setState({
          messages: messages.map((m: any) =>
            m.id === data.id ? { ...m, deleted: true, text: '', media: undefined } : m
          ),
        });
        return;
      }

      if (wsEvent === 'message.created') {
        const { messages, chats, activeChatId } = store.getState();
        const cid = data.client_id || data.clientId;
        if (messages.some((m: any) => m.id === data.id || m.id === cid)) {
          store.setState({
            messages: messages.map((m: any) => 
              (m.id === data.id || m.id === cid) 
                ? { ...m, id: data.id, seq: data.seq, status: 'sent', createdAt: data.createdAt } 
                : m
            )
          });
          return;
        }

        const isFromMe = data.senderId === store.getState().me.id;
        const isEcho = data.isEcho || data.is_echo;
        if (!isFromMe && !isEcho) {
          const chat = chats.find((c: any) => c.id === data.chatId);
          if (chat && !chat.muted) {
            const state = store.getState();
            if (state.notificationSound !== 'silent') {
              soundEffects.volume = state.soundVolume;
              if (activeChatId === data.chatId) {
                soundEffects.playReceivedSoft();
              } else {
                soundEffects.playTheme(state.notificationSound);
              }
            }
          }
          const state = store.getState();
          if (state.browserNotificationsEnabled) {
            showBrowserNotification(data, store);
          }
        }
        
        const newMsg: Message = {
          id: data.id,
          chatId: data.chatId,
          senderId: data.senderId,
          kind: data.kind,
          text: data.text,
          status: 'sent',
          createdAt: data.createdAt,
          seq: data.seq,
          isEcho: data.isEcho,
          replyToId: data.replyToId,
          reactions: {},
        };
        
        // Тихое сообщение не звонит и не подсвечивает чат — весь смысл в том,
        // что человек увидит его сам. Значит указатель обязан подняться сразу,
        // иначе про сообщение узнают только после перезапуска. Список берём с
        // сервера: там у записи есть идентификатор, без которого её потом не
        // отметить ни открытой, ни закрытой.
        if (isEcho && !isFromMe) {
          store.getState().syncEchoes();
        }

        // Чата ещё нет в списке — значит это первое сообщение от нового
        // человека. Без дозагрузки оно оседало в messages, а переписка не
        // появлялась до перезапуска приложения.
        if (!chats.some((c: any) => c.id === data.chatId)) {
          store.getState().syncChats();
        }

        const updatedChats = chats.map((c: any) => {
          if (c.id === data.chatId) {
            const preview = data.isEcho ? `Echo: ${data.text}` : (data.kind === 'text' ? data.text : `[${data.kind}]`);
            const timeLabel = new Date(data.createdAt).toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit',
            });
            return {
              ...c,
              preview,
              timeLabel,
              latestMessageCreatedAt: new Date(data.createdAt).getTime(),
              unread: activeChatId === data.chatId ? 0 : c.unread + 1
            };
          }
          return c;
        });
        
        store.setState({
          messages: [...messages, newMsg],
          chats: updatedChats
        });
        
        if (activeChatId === data.chatId && !isFromMe) {
          fetchApi(`/chats/${data.chatId}/read`, { method: 'POST' }, store.getState().token).catch((e) => {
            console.error('[WS] Failed to mark received message as read:', e);
          });
        }
        
        if (data.senderId !== store.getState().me.id && !store.getState().users[data.senderId]) {
          const newUser = {
            id: data.senderId,
            username: `user_${data.senderId.slice(-6)}`,
            displayName: `Пользователь`,
            bio: '',
            bannerPatternId: 'mint_wave',
          };
          store.setState({
            users: { ...store.getState().users, [data.senderId]: newUser }
          });
        }
      } else if (wsEvent === 'chat.read') {
        const { chats } = store.getState();
        const updatedChats = chats.map((c: any) => {
          if (c.id === data.chatId && data.userId !== store.getState().me.id) {
            return {
              ...c,
              peerLastReadSeq: data.lastReadSeq
            };
          }
          return c;
        });
        store.setState({ chats: updatedChats });
      } else if (wsEvent === 'presence.typing') {
        const { activeChatId } = store.getState();
        if (activeChatId === data.chat_id && data.user_id !== store.getState().me.id) {
          store.setState({ typingChatId: data.chat_id });
          if (typingTimeout) clearTimeout(typingTimeout);
          typingTimeout = window.setTimeout(() => {
            if (store.getState().typingChatId === data.chat_id) {
              store.setState({ typingChatId: null });
            }
          }, 2200);
        }
      } else if (wsEvent === 'session.revoked') {
        store.getState().logout();
      }
    } catch (err) {
      console.error('[WS] Error processing message:', err);
    }
  };
  
  ws.onclose = (event) => {
    console.log('[WS] Connection closed:', event.code, event.reason);
    if (activeSocket === ws) {
      activeSocket = null;
      if (store.getState().token) {
        reconnectCount++;
        // Jittered exponential backoff
        const backoffDelay = Math.min(
          1000 * Math.pow(1.5, reconnectCount) + Math.random() * 1000,
          30000
        );
        console.log(`[WS] Reconnecting in ${Math.round(backoffDelay)}ms (attempt ${reconnectCount})...`);
        window.setTimeout(() => {
          if (store.getState().token) {
            connectWebSocket(store.getState().token, store);
          }
        }, backoffDelay);
      }
    }
  };
  
  ws.onerror = (err) => {
    console.error('[WS] Connection error:', err);
  };
}

// Global listeners for instant reconnect and tab focus syncing
if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      const state = useAppStore.getState();
      if (state.token) {
        console.log('[WS] Tab focused, ensuring connection is active & syncing missed messages...');
        connectWebSocket(state.token, useAppStore);
        // Instant HTTP sync as double insurance
        state.initApi().catch((e: any) => console.error('[WS] Focus sync failed:', e));
      }
    }
  });

  window.addEventListener('online', () => {
    const state = useAppStore.getState();
    if (state.token) {
      console.log('[WS] Network online, reconnecting...');
      connectWebSocket(state.token, useAppStore);
    }
  });
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function formatTime(ts: any) {
  const parsed = typeof ts === 'string' && /^\d+$/.test(ts) ? Number(ts) : ts;
  return new Date(parsed).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

const REACTION_SET = ['👍', '❤️', '🔥', '😂', '😮', '👏'];

interface AppState {
  token: string | null;
  isAuthenticated: boolean;
  authStep: AuthStep;
  draftPhone: string;
  draftName: string;
  me: User;
  users: Record<string, User>;

  mainTab: MainTab;
  isOffline: boolean;
  searchQuery: string;

  chats: Chat[];
  messages: Message[];
  posts: Post[];
  /** Идёт первая загрузка данных. Нужен, чтобы показать скелетоны
   *  вместо пустого экрана, который потом рывком заполняется. */
  booting: boolean;
  /** Есть ли ещё посты за пределами загруженных. */
  feedHasMore: boolean;
  feedLoadingMore: boolean;
  loadMoreFeed: () => Promise<void>;
  shelfItems: ShelfItem[];
  echoes: EchoItem[];
  /** chat ids pinned in SideNav for quick open while scrolling feed */
  navPins: string[];

  activeChatId: string | null;
  activeMediaId: string | null;
  setActiveMediaId: (id: string | null) => void;
  highlightMessageId: string | null;
  /** peer profile overlay (not main tab) */
  viewingUserId: string | null;

  echoMode: boolean;
  echoSheetOpen: boolean;
  attachSheetOpen: boolean;
  circleSheetOpen: boolean;
  voiceRecording: boolean;
  showCircleEffects: boolean;
  reactionPicker: { messageId: string; x: number; y: number } | null;
  contextMenu: { messageId: string; x: number; y: number } | null;
  commentPostId: string | null;
  forwardPostId: string | null;
  shelfOpen: boolean;
  newChatOpen: boolean;
  replyToId: string | null;
  toast: string | null;
  /** wall posts seen timestamp for badge */
  wallSeenAt: number;
  typingChatId: string | null;

  settingsRoute: SettingsRoute;

  reactionEmojis: string[];

  setPhone: (v: string) => void;
  setDraftName: (v: string) => void;
  setDraftUsername: (v: string) => void;
  setDraftPassword: (v: string) => void;
  draftUsername: string;
  draftPassword: string;
  authMode: 'login' | 'register' | 'social_profile';
  setAuthMode: (m: 'login' | 'register' | 'social_profile') => void;
  socialPending: {
    claim: string;
    provider: 'yandex' | 'vk';
    suggestedDisplayName: string;
    suggestedUsername: string;
    avatarRef?: string;
  } | null;
  registerWithPassword: () => Promise<void>;
  loginWithPassword: () => Promise<void>;
  loginWithYandex: (token: string) => Promise<void>;
  loginWithVK: (token: string) => Promise<void>;
  completeSocialProfile: () => Promise<void>;
  cancelSocialProfile: () => void;
  submitPhone: () => Promise<void>;
  submitOtp: (code: string) => Promise<void>;
  bypassOtp: (phone: string) => Promise<void>;
  submitProfile: () => Promise<void>;
  logout: () => Promise<void>;
  updateMe: (patch: Partial<User>) => Promise<void>;
  setBannerPattern: (id: string) => void;
  setChatTheme: (chatId: string, themeId: string) => void;

  initApi: () => Promise<void>;
  sendTypingPresence: () => void;

  setMainTab: (tab: MainTab) => void;
  setActiveChat: (id: string | null) => Promise<void>;
  openUserProfile: (userId: string) => Promise<void>;
  closeUserProfile: () => void;
  startChatWithUser: (userId: string) => Promise<void>;
  createGroupChat: (title: string, memberIds: string[]) => Promise<void>;
  createChannel: (title: string) => Promise<void>;
  joinChat: (chatId: string) => Promise<void>;
  joinByShareSlug: (slug: string) => Promise<void>;
  leaveChat: (chatId: string) => Promise<void>;
  /** View public channel without adding to chat list until subscribe */
  openChannelPreview: (chatId: string) => Promise<void>;
  /** Ephemeral channel card while browsing before subscribe — not in list */
  previewChat: Chat | null;
  privacyPrefs: {
    showLastSeen: boolean;
    showOnline: boolean;
    wallPublic: boolean;
    allowMessagesFrom: 'everyone' | 'contacts';
  };
  setPrivacyPref: <K extends keyof AppState['privacyPrefs']>(
    key: K,
    value: AppState['privacyPrefs'][K]
  ) => void;
  updateChatMeta: (
    chatId: string,
    patch: { title?: string; description?: string; is_public?: boolean; avatar_ref?: string | null }
  ) => Promise<void>;
  setNewChatOpen: (v: boolean) => void;
  chatInfoOpen: boolean;
  setChatInfoOpen: (v: boolean) => void;
  notifications: any[];
  notificationsUnread: number;
  seenNotificationKeys: string[];
  refreshNotifications: () => Promise<void>;
  markNotificationsSeen: () => void;
  clearNotifications: () => void;
  toggleNavPin: (chatId: string) => void;

  setSearchQuery: (q: string) => void;
  sendMessage: (
    text: string,
    opts?: {
      kind?: 'text' | 'media' | 'voice' | 'circle' | 'file';
      media?: { url: string; filename?: string; mime?: string; size?: number; durationSec?: number };
    }
  ) => Promise<void>;
  uploadAttachment: (file: File, kind: 'media' | 'file', caption?: string) => Promise<void>;
  sendVoiceMock: () => void;
  sendCircleMock: () => void;
  retryMessage: (id: string) => void;
  deleteMessage: (id: string) => Promise<void>;
  editMessage: (id: string, text: string) => Promise<void>;
  editingMessageId: string | null;
  setEditingMessage: (id: string | null) => void;
  setReplyTo: (id: string | null) => void;
  toggleReaction: (messageId: string, emoji: string) => Promise<void>;
  setReactionPicker: (v: AppState['reactionPicker']) => void;
  setContextMenu: (v: AppState['contextMenu']) => void;
  pinToShelf: (messageId: string) => Promise<void>;
  removeFromShelf: (shelfId: string) => Promise<void>;
  loadShelf: (chatId: string) => Promise<void>;
  syncChats: () => Promise<void>;
  syncEchoes: () => Promise<void>;
  blockedIds: string[];
  loadBlocks: () => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
  reportUser: (userId: string, reason: string) => Promise<void>;
  setShelfOpen: (v: boolean) => void;

  setEchoMode: (v: boolean) => void;
  openEchoSheet: () => void;
  closeEchoSheet: () => void;
  dismissEchoes: () => void;
  openEchoInChat: () => void;

  setAttachSheetOpen: (v: boolean) => void;
  setCircleSheetOpen: (v: boolean) => void;
  setVoiceRecording: (v: boolean) => void;
  setShowCircleEffects: (v: boolean) => void;
  toggleOffline: () => void;
  showToast: (msg: string) => void;
  clearToast: () => void;
  markWallSeen: () => void;
  simulatePeerTyping: (chatId: string) => void;

  /** Create post. place: wall tab or profile tab */
  createPost: (
    text: string,
    opts: {
      from: 'wall' | 'profile';
      addToWall: boolean;
      withMedia?: boolean;
      photoFile?: File;
      patternText?: string;
      mediaHeight?: number;
      fontSize?: number;
      fontFamily?: string;
    }
  ) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  addComment: (postId: string, text: string, parentId?: string | null) => Promise<void>;
  toggleCommentLike: (postId: string, commentId: string) => Promise<void>;
  repostToProfile: (postId: string) => Promise<void>;
  setCommentPostId: (id: string | null) => void;
  setForwardPostId: (id: string | null) => void;
  forwardPostToChat: (postId: string, chatId: string) => void;
  deletePost: (postId: string) => Promise<void>;

  openSettings: () => void;
  closeSettings: () => void;
  navigateSettings: (route: NonNullable<SettingsRoute>) => void;

  globalChatThemeId: string;
  globalCustomWallpaper: string | null;
  notificationSound: SoundPackId;
  soundVolume: number;
  notifVolume: number;
  sendVolume: number;
  uiTheme: 'dark' | 'light';
  uiFont: 'inter' | 'system' | 'serif' | 'mono';
  browserNotificationsEnabled: boolean;
  defaultReaction: string;
  notifPrefs: {
    messages: boolean;
    comments: boolean;
    likes: boolean;
    posts: boolean;
  };
  setGlobalChatTheme: (themeId: string) => void;
  setGlobalCustomWallpaper: (url: string | null) => void;
  setNotificationSound: (sound: SoundPackId) => void;
  setSoundVolume: (volume: number) => void;
  setNotifVolume: (volume: number) => void;
  setSendVolume: (volume: number) => void;
  setUiTheme: (theme: 'dark' | 'light') => void;
  setUiFont: (font: AppState['uiFont']) => void;
  setBrowserNotificationsEnabled: (enabled: boolean) => Promise<void>;
  setDefaultReaction: (emoji: string) => void;
  setNotifPref: (key: keyof AppState['notifPrefs'], value: boolean) => void;
}

// Пачка сообщений в неизвестный чат не должна вызвать столько же запросов.
let syncingChats = false;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      token: null,
      isAuthenticated: false,
      authStep: 'phone',
      me: { ...ME },
      users: { ...USERS },

      mainTab: 'chats',
      isOffline: false,
      searchQuery: '',

      chats: [],
      messages: [],
      posts: INITIAL_POSTS,
      booting: true,
      feedHasMore: true,
      feedLoadingMore: false,
      shelfItems: [],
      echoes: [],
      blockedIds: [],
      editingMessageId: null,
      navPins: [],

      activeChatId: null,
      activeMediaId: null,
      highlightMessageId: null,
      viewingUserId: null,

      echoMode: false,
      echoSheetOpen: false,
      attachSheetOpen: false,
      circleSheetOpen: false,
      voiceRecording: false,
      showCircleEffects: false,
      reactionPicker: null,
      contextMenu: null,
      commentPostId: null,
      forwardPostId: null,
      shelfOpen: false,
      newChatOpen: false,
      chatInfoOpen: false,
      previewChat: null,
      notifications: [],
      notificationsUnread: 0,
      seenNotificationKeys: [],
      privacyPrefs: {
        showLastSeen: true,
        showOnline: true,
        wallPublic: true,
        allowMessagesFrom: 'everyone',
      },
      replyToId: null,
      toast: null,
      wallSeenAt: Date.now() - 1000 * 60 * 60,
      typingChatId: null,

      settingsRoute: null,
      draftPhone: '',
      draftName: '',
      draftUsername: '',
      draftPassword: '',
      authMode: 'login' as const,
      socialPending: null,

      reactionEmojis: REACTION_SET,

      globalChatThemeId: DEFAULT_CHAT_THEME_ID,
      globalCustomWallpaper: null,
      notificationSound: 'pixel' as SoundPackId,
      soundVolume: 0.85,
      notifVolume: 1,
      sendVolume: 1,
      uiTheme: 'dark' as const,
      uiFont: 'inter' as const,
      browserNotificationsEnabled: false,
      defaultReaction: '👍',
      notifPrefs: {
        messages: true,
        comments: true,
        likes: true,
        posts: true,
      },

      setPhone: (v) => set({ draftPhone: v }),
      setDraftName: (v) => set({ draftName: v }),
      setDraftUsername: (v) => set({ draftUsername: v }),
      setDraftPassword: (v) => set({ draftPassword: v }),
      setAuthMode: (m) =>
        set({
          authMode: m,
          socialPending: m === 'social_profile' ? get().socialPending : null,
        }),

      registerWithPassword: async () => {
        const username = get().draftUsername.trim().toLowerCase();
        const firstName = get().draftName.trim();
        const password = get().draftPassword;
        if (!username || !firstName || !password) {
          get().showToast('Заполните все поля');
          return;
        }
        if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
          get().showToast('Username: 3–30, латиница, цифры, _');
          return;
        }
        if (password.length < 8) {
          get().showToast('Пароль не короче 8 символов');
          return;
        }
        try {
          const res = await fetchApi('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, firstName, password }),
          });
          set({
            token: res.access_token,
            me: res.user,
            authStep: 'done',
            isAuthenticated: true,
            mainTab: 'chats',
            socialPending: null,
            draftPassword: '',
          });
          await get().initApi();
        } catch (err: any) {
          get().showToast(err.message || 'Ошибка регистрации');
          throw err;
        }
      },

      loginWithPassword: async () => {
        const username = get().draftUsername.trim().toLowerCase();
        const password = get().draftPassword;
        if (!username || !password) {
          get().showToast('Введите имя пользователя и пароль');
          return;
        }
        try {
          const res = await fetchApi('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
          });
          set({
            token: res.access_token,
            me: res.user,
            authStep: 'done',
            isAuthenticated: true,
            mainTab: 'chats',
            socialPending: null,
            draftPassword: '',
          });
          await get().initApi();
        } catch (err: any) {
          get().showToast(err.message || 'Неверные данные');
          throw err;
        }
      },

      loginWithYandex: async (socialToken: string) => {
        try {
          const res = await fetchApi('/auth/yandex', {
            method: 'POST',
            body: JSON.stringify({ access_token: socialToken }),
          });
          if (res?.status === 'needs_profile' && res.claim) {
            set({
              authMode: 'social_profile',
              socialPending: {
                claim: res.claim,
                provider: 'yandex',
                suggestedDisplayName: res.suggestedDisplayName || '',
                suggestedUsername: res.suggestedUsername || '',
                avatarRef: res.avatarRef,
              },
              draftName: res.suggestedDisplayName || '',
              draftUsername: res.suggestedUsername || '',
              draftPassword: '',
            });
            get().showToast('Выберите имя и username');
            return;
          }
          if (!res?.access_token || !res?.user) {
            throw new Error('Некорректный ответ сервера');
          }
          set({
            token: res.access_token,
            me: res.user,
            authStep: 'done',
            isAuthenticated: true,
            mainTab: 'chats',
            socialPending: null,
            authMode: 'login',
          });
          await get().initApi();
        } catch (err: any) {
          get().showToast(err.message || 'Ошибка входа через Яндекс');
          throw err;
        }
      },

      loginWithVK: async (socialToken: string) => {
        try {
          const res = await fetchApi('/auth/vk', {
            method: 'POST',
            body: JSON.stringify({ access_token: socialToken }),
          });
          if (res?.status === 'needs_profile' && res.claim) {
            set({
              authMode: 'social_profile',
              socialPending: {
                claim: res.claim,
                provider: 'vk',
                suggestedDisplayName: res.suggestedDisplayName || '',
                suggestedUsername: res.suggestedUsername || '',
                avatarRef: res.avatarRef,
              },
              draftName: res.suggestedDisplayName || '',
              draftUsername: res.suggestedUsername || '',
              draftPassword: '',
            });
            get().showToast('Выберите имя и username');
            return;
          }
          if (!res?.access_token || !res?.user) {
            throw new Error('Некорректный ответ сервера');
          }
          set({
            token: res.access_token,
            me: res.user,
            authStep: 'done',
            isAuthenticated: true,
            mainTab: 'chats',
            socialPending: null,
            authMode: 'login',
          });
          await get().initApi();
        } catch (err: any) {
          get().showToast(err.message || 'Ошибка входа через VK');
          throw err;
        }
      },

      completeSocialProfile: async () => {
        const pending = get().socialPending;
        if (!pending?.claim) {
          get().showToast('Сессия входа не найдена — войдите снова');
          set({ authMode: 'login', socialPending: null });
          return;
        }
        const username = get().draftUsername.trim().toLowerCase();
        const displayName = get().draftName.trim();
        if (!displayName) {
          get().showToast('Укажите, как вас зовут');
          return;
        }
        if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
          get().showToast('Username: 3–30, латиница, цифры, _');
          return;
        }
        try {
          const res = await fetchApi('/auth/social/complete', {
            method: 'POST',
            body: JSON.stringify({
              claim: pending.claim,
              username,
              displayName,
            }),
          });
          set({
            token: res.access_token,
            me: res.user,
            authStep: 'done',
            isAuthenticated: true,
            mainTab: 'chats',
            socialPending: null,
            authMode: 'login',
            draftPassword: '',
          });
          await get().initApi();
        } catch (err: any) {
          get().showToast(err.message || 'Не удалось создать аккаунт');
          throw err;
        }
      },

      cancelSocialProfile: () => {
        set({
          authMode: 'login',
          socialPending: null,
          draftName: '',
          draftUsername: '',
        });
      },

      submitPhone: async () => {
        const phone = get().draftPhone.trim().replace(/[^\d+]/g, '');
        if (phone.length < 6) return;
        try {
          await fetchApi('/auth/otp/request', {
            method: 'POST',
            body: JSON.stringify({ phone }),
          });
          set({ authStep: 'otp', draftPhone: phone });
        } catch (err: any) {
          get().showToast(err.message || 'Ошибка отправки OTP');
        }
      },
      submitOtp: async (code) => {
        const phone = get().draftPhone.trim().replace(/[^\d+]/g, '');
        try {
          const res = await fetchApi('/auth/otp/verify', {
            method: 'POST',
            body: JSON.stringify({ phone, code }),
          });
          set({
            token: res.access_token,
            me: res.user,
            authStep: 'profile',
            draftPhone: phone,
            draftName: res.user.displayName || '',
          });
        } catch (err: any) {
          get().showToast(err.message || 'Неверный код');
        }
      },
      bypassOtp: async (phone) => {
        try {
          await fetchApi('/auth/otp/request', {
            method: 'POST',
            body: JSON.stringify({ phone }),
          });
          const res = await fetchApi('/auth/otp/verify', {
            method: 'POST',
            body: JSON.stringify({ phone, code: '1234' }),
          });
          // Store token immediately so PATCH /me can auth
          set({
            token: res.access_token,
            me: res.user,
            authStep: 'done',
            isAuthenticated: true,
            draftPhone: phone,
            draftName: res.user.displayName || '',
            mainTab: 'chats',
          });
          // Boot the app
          await get().initApi();
        } catch (err: any) {
          get().showToast(err.message || 'Ошибка обхода OTP');
        }
      },
      submitProfile: async () => {
        const name = get().draftName.trim() || 'Пользователь';
        try {
          const res = await fetchApi('/me', {
            method: 'PATCH',
            body: JSON.stringify({ displayName: name }),
          }, get().token);
          
          set({
            isAuthenticated: true,
            authStep: 'done',
            me: res,
            users: { ...get().users, [res.id]: res },
            mainTab: 'chats',
          });
          
          await get().initApi();
        } catch (err: any) {
          get().showToast(err.message || 'Ошибка обновления профиля');
        }
      },
      logout: async () => {
        const token = get().token;
        if (token) {
          try {
            await fetchApi('/auth/logout', { method: 'POST' }, token);
          } catch (e: any) {
            // 401 здесь — норма: выходим как раз потому, что токен уже мёртв,
            // отзывать на сервере нечего. Кричать об этом в консоль значит
            // оставлять ложный след тому, кто будет разбирать настоящий сбой.
            if (e?.status !== 401) console.error('Не удалось выйти на сервере:', e);
          }
        }
        if (activeSocket) {
          activeSocket.close();
          activeSocket = null;
        }
        set({
          token: null,
          isAuthenticated: false,
          authStep: 'phone',
          authMode: 'login',
          socialPending: null,
          draftPhone: '',
          draftName: '',
          draftUsername: '',
          draftPassword: '',
          activeChatId: null,
          mainTab: 'chats',
          settingsRoute: null,
          viewingUserId: null,
          contextMenu: null,
          reactionPicker: null,
          chats: [],
          messages: [],
          posts: INITIAL_POSTS,
          shelfItems: [],
          echoes: [],
        });
      },
      updateMe: async (patch) => {
        const token = get().token;
        try {
          const res = await fetchApi('/me', {
            method: 'PATCH',
            body: JSON.stringify(patch),
          }, token);
          set({
            me: res,
            users: { ...get().users, [res.id]: res }
          });
          get().showToast('Сохранено');
        } catch (err: any) {
          get().showToast(err.message || 'Ошибка сохранения профиля');
          throw err;
        }
      },
  setBannerPattern: (id) => get().updateMe({ bannerPatternId: id }),

  setChatTheme: (chatId, themeId) =>
    set((s) => ({
      chats: s.chats.map((c) =>
        c.id === chatId ? { ...c, themeId } : c
      ),
    })),

  setMainTab: (tab) => {
    set({
      mainTab: tab,
      viewingUserId: null,
      settingsRoute: null,
      newChatOpen: false,
    });
    if (tab === 'wall') get().markWallSeen();
  },
  setActiveMediaId: (id) => set({ activeMediaId: id }),

  setActiveChat: async (id) => {
    set({
      activeMediaId: null,
      activeChatId: id,
      mainTab: 'chats',
      contextMenu: null,
      reactionPicker: null,
      replyToId: null,
      chatInfoOpen: false,
      // leaving a subscribed chat clears ephemeral preview
      previewChat:
        id && get().previewChat?.id === id ? get().previewChat : null,
      chats: get().chats.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
    });
    if (id) {
      try {
        const msgs = await fetchApi(
          `/chats/${id}/messages?limit=100`,
          {},
          get().token
        );
        const list = Array.isArray(msgs) ? msgs : [];
        // Replace only this chat's messages; keep others
        set((s) => ({
          messages: [
            ...s.messages.filter((m) => m.chatId !== id),
            ...list,
          ],
        }));
        await fetchApi(`/chats/${id}/read`, { method: 'POST' }, get().token);
        // Полка живёт на сервере — до этого она была локальной и умирала
        // вместе с устройством.
        get().loadShelf(id);
      } catch (err) {
        console.error('Failed to fetch messages or mark read:', err);
        get().showToast('Не удалось загрузить сообщения');
        // do not wipe existing local messages for this chat
      }
    }
  },

  openUserProfile: async (userId) => {
    set({ viewingUserId: userId, settingsRoute: null });
    const token = get().token;
    try {
      // Prefer full profile (username) over chat-list stub with empty username
      try {
        const profile = await fetchApi(`/users/${userId}`, {}, token);
        set((s) => ({
          users: { ...s.users, [userId]: { ...s.users[userId], ...profile } },
        }));
      } catch {
        /* optional */
      }
      const userPosts = await fetchApi(`/users/${userId}/posts?limit=100`, {}, token);
      set((s) => {
        const otherPosts = s.posts.filter((p) => p.authorId !== userId);
        const combined = [...otherPosts, ...userPosts].sort((a, b) => b.createdAt - a.createdAt);
        return {
          posts: combined,
          users: mergeUsersFromPosts(userPosts, s.users),
        };
      });
    } catch (err) {
      console.error('Failed to fetch user posts:', err);
    }
  },
  closeUserProfile: () => set({ viewingUserId: null }),

  startChatWithUser: async (userId) => {
    if (userId === get().me.id) {
      set({ viewingUserId: null, mainTab: 'profile' });
      return;
    }
    try {
      const res = await fetchApi('/chats/dm', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId }),
      }, get().token);
      
      const existing = get().chats.find((c) => c.id === res.id);
      if (existing) {
        set({
          viewingUserId: null,
          mainTab: 'chats',
          activeChatId: res.id,
        });
        const msgs = await fetchApi(`/chats/${res.id}/messages`, {}, get().token);
        set({ messages: msgs });
        return;
      }
      
      set((s) => ({
        chats: [res, ...s.chats],
        activeChatId: res.id,
        mainTab: 'chats',
        viewingUserId: null,
        messages: [],
      }));
    } catch (err: any) {
      get().showToast(err.message || 'Ошибка создания чата');
    }
  },

  createGroupChat: async (title, memberIds) => {
    if (!title.trim()) {
      get().showToast('Введите название группы');
      throw new Error('Title required');
    }
    if (!memberIds.length) {
      get().showToast('Выберите хотя бы одного участника');
      throw new Error('Members required');
    }
    try {
      const res = await fetchApi(
        '/chats/group',
        {
          method: 'POST',
          body: JSON.stringify({ title: title.trim(), member_ids: memberIds }),
        },
        get().token
      );
      if (!res?.id) {
        throw new Error('Пустой ответ сервера');
      }
      set((s) => ({
        chats: [res, ...s.chats.filter((c) => c.id !== res.id)],
        activeChatId: res.id,
        mainTab: 'chats',
        messages: [],
        newChatOpen: false,
      }));
      get().showToast('Группа создана');
    } catch (err: any) {
      get().showToast(err.message || 'Ошибка создания группы');
      throw err;
    }
  },

  createChannel: async (title) => {
    if (!title.trim()) {
      get().showToast('Введите название канала');
      throw new Error('Title required');
    }
    try {
      const res = await fetchApi(
        '/chats/channel',
        {
          method: 'POST',
          body: JSON.stringify({ title: title.trim() }),
        },
        get().token
      );
      if (!res?.id) throw new Error('Пустой ответ сервера');
      set((s) => ({
        chats: [res, ...s.chats.filter((c) => c.id !== res.id)],
        activeChatId: res.id,
        mainTab: 'chats',
        messages: [],
        newChatOpen: false,
      }));
      get().showToast('Канал создан');
    } catch (err: any) {
      get().showToast(err.message || 'Ошибка создания канала');
      throw err;
    }
  },

  setSearchQuery: (q) => set({ searchQuery: q }),
  setNewChatOpen: (v) => set({ newChatOpen: v }),
  setChatInfoOpen: (v) => set({ chatInfoOpen: v }),
  setReplyTo: (id) => set({ replyToId: id, contextMenu: null }),

  openChannelPreview: async (chatId) => {
    try {
      const preview = await fetchApi(`/chats/${chatId}/preview`, {}, get().token);
      if (preview.joined) {
        set({ previewChat: null });
        if (!get().chats.some((c) => c.id === preview.id)) {
          set((s) => ({ chats: [preview, ...s.chats] }));
        }
        await get().setActiveChat(chatId);
        return;
      }
      const card: Chat = {
        id: preview.id,
        type: preview.type || 'channel',
        title: preview.title || 'Канал',
        description: preview.description,
        isPublic: preview.isPublic,
        memberCount: preview.memberCount,
        avatarRef: preview.avatarRef,
        preview: 'Предпросмотр',
        unread: 0,
        timeLabel: '',
      };
      set({
        mainTab: 'chats',
        activeChatId: chatId,
        previewChat: card,
        chatInfoOpen: false,
      });
      try {
        const msgs = await fetchApi(
          `/chats/${chatId}/messages?limit=100`,
          {},
          get().token
        );
        const list = Array.isArray(msgs) ? msgs : [];
        set((s) => ({
          messages: [
            ...s.messages.filter((m) => m.chatId !== chatId),
            ...list,
          ],
        }));
      } catch {
        /* empty ok */
      }
    } catch (err: any) {
      get().showToast(err.message || 'Не удалось открыть канал');
      throw err;
    }
  },

  joinChat: async (chatId) => {
    try {
      const res = await fetchApi(`/chats/${chatId}/join`, { method: 'POST' }, get().token);
      set((s) => ({
        chats: [res, ...s.chats.filter((c) => c.id !== res.id)],
        activeChatId: res.id,
        mainTab: 'chats',
        previewChat: null,
      }));
      get().showToast('Подписка оформлена');
      await get().setActiveChat(chatId);
    } catch (err: any) {
      get().showToast(err.message || 'Не удалось подписаться');
      throw err;
    }
  },

  joinByShareSlug: async (slug) => {
    try {
      const link = await fetchApi(`/share-links/${slug}`, {}, get().token);
      if (link.kind === 'channel' || link.kind === 'group') {
        await get().openChannelPreview(link.targetId);
        return;
      }
      if (link.kind === 'user') {
        await get().openUserProfile(link.targetId);
        return;
      }
    } catch (err: any) {
      get().showToast(err.message || 'Ссылка недействительна');
      throw err;
    }
  },

  leaveChat: async (chatId) => {
    try {
      await fetchApi(`/chats/${chatId}/leave`, { method: 'POST' }, get().token);
      set((s) => ({
        chats: s.chats.filter((c) => c.id !== chatId),
        previewChat: s.previewChat?.id === chatId ? null : s.previewChat,
        activeChatId: s.activeChatId === chatId ? null : s.activeChatId,
      }));
      get().showToast('Вы отписались');
    } catch (err: any) {
      get().showToast(err.message || 'Ошибка');
      throw err;
    }
  },

  setPrivacyPref: (key, value) =>
    set((s) => ({
      privacyPrefs: { ...s.privacyPrefs, [key]: value },
    })),

  updateChatMeta: async (chatId, patch) => {
    try {
      const res = await fetchApi(
        `/chats/${chatId}`,
        { method: 'PATCH', body: JSON.stringify(patch) },
        get().token
      );
      set((s) => ({
        chats: s.chats.map((c) => (c.id === chatId ? { ...c, ...res } : c)),
      }));
    } catch (err: any) {
      get().showToast(err.message || 'Ошибка сохранения');
      throw err;
    }
  },

  refreshNotifications: async () => {
    const token = get().token;
    if (!token) return;
    try {
      const data = await fetchApi('/notifications', {}, token);
      const prev = get().notifications?.[0]?.createdAt || 0;
      const list = data || [];
      const newest = list[0]?.createdAt || 0;
      const prefs = get().notifPrefs;
      if (newest > prev && prev > 0 && list[0]) {
        const n = list[0];
        const type = n.type;
        if (
          ((type === 'comment' || type === 'comment_reply') && prefs.comments) ||
          ((type === 'like' || type === 'comment_like') && prefs.likes)
        ) {
          get().showToast(
            type === 'like'
              ? `${n.displayName} лайкнул пост`
              : type === 'comment_like'
                ? `${n.displayName} лайкнул комментарий`
                : type === 'comment_reply'
                  ? `${n.displayName} ответил на комментарий`
                  : `${n.displayName} прокомментировал`
          );
          if (get().browserNotificationsEnabled && typeof Notification !== 'undefined') {
            try {
              new Notification('Толк.', {
                body:
                  type === 'like'
                    ? `${n.displayName}: лайк`
                    : `${n.displayName}: ${n.text || 'комментарий'}`,
                tag: `n-${n.postId}`,
              });
            } catch { /* ignore */ }
          }
          set((s) => ({
            notifications: list,
            notificationsUnread: s.notificationsUnread + 1,
          }));
          return;
        }
      }
      set({ notifications: list });
    } catch (err) {
      console.error('notifications', err);
    }
  },

  markNotificationsSeen: () => {
    const keys = (get().notifications || []).map(
      (n: any) => `${n.type}-${n.postId}-${n.userId}-${n.createdAt}`
    );
    set((s) => ({
      notificationsUnread: 0,
      seenNotificationKeys: Array.from(new Set([...s.seenNotificationKeys, ...keys])),
    }));
  },
  clearNotifications: () =>
    set({
      notifications: [],
      notificationsUnread: 0,
    }),

  toggleNavPin: (chatId) => {
    const pins = get().navPins;
    if (pins.includes(chatId)) {
      set({ navPins: pins.filter((id) => id !== chatId) });
      get().showToast('Снято с закрепа');
    } else {
      if (pins.length >= 8) {
        get().showToast('Максимум 8 закрепов');
        return;
      }
      set({ navPins: [...pins, chatId] });
      get().showToast('В боковую панель');
    }
  },

  showToast: (msg) => {
    set({ toast: msg });
    window.setTimeout(() => {
      if (get().toast === msg) set({ toast: null });
    }, 2200);
  },
  clearToast: () => set({ toast: null }),
  markWallSeen: () => set({ wallSeenAt: Date.now() }),

  simulatePeerTyping: (chatId) => {
    set({ typingChatId: chatId });
    window.setTimeout(() => {
      if (get().typingChatId === chatId) set({ typingChatId: null });
    }, 2200);
  },

  sendMessage: async (text, opts) => {
    const t = text.trim();
    const chatId = get().activeChatId;
    const kind = opts?.kind || 'text';
    const media = opts?.media;

    if (!chatId) return;
    // text-only needs body; media/voice/etc. need media or body
    if (kind === 'text' && !t) return;
    if (kind !== 'text' && !media?.url && !t) return;

    const id = uid('m');
    const createdAt = Date.now();
    const isEcho = get().echoMode;
    const offline = get().isOffline;
    const replyToId = get().replyToId;
    const replyMsg = replyToId
      ? get().messages.find((m) => m.id === replyToId)
      : undefined;

    const msg: Message = {
      id,
      chatId,
      senderId: get().me.id,
      kind,
      text: t,
      status: offline ? 'failed' : 'pending',
      createdAt,
      isEcho,
      reactions: {},
      replyToId: replyMsg?.id,
      replyPreview: replyMsg
        ? (() => {
            const author =
              replyMsg.senderId === get().me.id
                ? get().me.displayName
                : get().users[replyMsg.senderId]?.displayName || '…';
            const t = (replyMsg.text || '').trim();
            let body = t ? t.slice(0, 80) : '';
            if (!body) {
              if (replyMsg.kind === 'media') body = 'Фото';
              else if (replyMsg.kind === 'voice') body = 'Голосовое';
              else if (replyMsg.kind === 'circle') body = 'Кружок';
              else if (replyMsg.kind === 'file') body = replyMsg.media?.filename || 'Файл';
              else body = 'Сообщение';
            }
            return `${author}: ${body}`;
          })()
        : undefined,
      media
    };

    set((s) => ({
      messages: [...s.messages, msg],
      replyToId: null,
      chats: s.chats.map((c) =>
        c.id === chatId
          ? { 
              ...c, 
              preview: isEcho ? `Echo: ${t || `[${kind}]`}` : (t || `[${kind}]`), 
              timeLabel: formatTime(createdAt),
              latestMessageCreatedAt: createdAt
            }
          : c
      ),
      echoMode: isEcho ? false : s.echoMode,
    }));

    if (!isEcho) {
      soundEffects.playSent(get().notificationSound);
    }
  
    if (isEcho) {
      set((s) => ({
        echoes: [
          ...s.echoes,
          {
            id: uid('e'),
            fromUserId: get().me.id,
            fromName: get().me.displayName,
            chatId,
            messageId: id,
            text: t || `[${kind}]`,
            status: 'pending',
            createdAt,
          },
        ],
      }));
    }

    if (offline) {
      return;
    }

    try {
      const res = await fetchApi(`/chats/${chatId}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          client_id: id,
          kind,
          text: t,
          reply_to: replyToId || undefined,
          is_echo: isEcho,
          media
        }),
      }, get().token);

      const exists = get().messages.some((m) => m.id === res.id);
      if (exists) {
        set((s) => ({
          messages: s.messages.filter((m) => m.id !== id),
        }));
      } else {
        set((s) => ({
          messages: s.messages.map((m) =>
            m.id === id
              ? {
                  ...m,
                  id: res.id,
                  seq: res.seq,
                  status: 'sent',
                  createdAt: res.createdAt,
                }
              : m
          ),
        }));
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      set((s) => ({
        messages: s.messages.map((m) => (m.id === id ? { ...m, status: 'failed' } : m)),
      }));
      get().showToast('Не удалось отправить сообщение');
    }
  },

  uploadAttachment: async (file, kind, caption?: string) => {
    const token = get().token;
    const chatId = get().activeChatId;
    if (!chatId) return;

    try {
      get().showToast('Загрузка…');
      
      let processedFile = file;
      if (file.type.startsWith('image/') && kind === 'media') {
        const { default: imageCompression } = await import('browser-image-compression');
        processedFile = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: 'image/webp',
          initialQuality: 0.85
        }) as File;
      }
      
      let publicUrl = '';
      try {
        const uploadRes = await fetchApi('/media/uploads', {
          method: 'POST',
          body: JSON.stringify({
            mime: processedFile.type || 'application/octet-stream',
            size: processedFile.size,
            kind: processedFile.type.startsWith('image/')
              ? 'image'
              : processedFile.type.startsWith('audio/')
                ? 'voice'
                : processedFile.type.startsWith('video/')
                  ? 'circle'
                  : 'file',
          })
        }, token);

        const s3Res = await fetch(uploadRes.upload_url, {
          method: 'PUT',
          body: processedFile,
          headers: {
            'Content-Type': processedFile.type || 'application/octet-stream',
            Authorization: `Bearer ${token}`,
          }
        });

        if (!s3Res.ok) {
          throw new Error(`Failed to upload file: ${s3Res.statusText}`);
        }

        await fetchApi(`/media/${uploadRes.media_id}/complete`, {
          method: 'POST',
          body: JSON.stringify({})
        }, token);

        publicUrl = uploadRes.public_url;
      } catch (uploadErr) {
        console.error('Media upload failed:', uploadErr);
        throw uploadErr;
      }

      // Caption optional — never auto-fill filename as message text for images
      const text =
        kind === 'media'
          ? (caption || '').trim()
          : (caption || file.name || '').trim() || file.name;

      await get().sendMessage(text, {
        kind,
        media: {
          url: publicUrl,
          filename: file.name,
          mime: file.type,
          size: file.size
        }
      });

      get().showToast('Отправлено');
    } catch (err: any) {
      console.error('Failed to upload attachment:', err);
      get().showToast(err.message || 'Ошибка загрузки вложения');
    }
  },

  initApi: async () => {
    const token = get().token;
    if (!token) {
      set({ booting: false });
      return;
    }
    set({ booting: true });
    try {
      connectWebSocket(token, useAppStore);
      const mePayload = await fetchApi('/me', {}, token);
      set({ me: mePayload });
      
      const chatsList = await fetchApi('/chats', {}, token);
      
      const usersMap: Record<string, User> = {};
      usersMap[mePayload.id] = mePayload;
      
      chatsList.forEach((c: any) => {
        if (c.peerId) {
          usersMap[c.peerId] = {
            id: c.peerId,
            username: c.peerUsername || '',
            displayName: c.title,
            avatarRef: c.avatarRef,
            online: c.online,
            lastSeenAt: c.lastSeenAt || 0,
            bannerPatternId: 'mint_wave',
          };
        }
      });
      
      let combinedPosts: Post[] = [];
      try {
        // Сервер отдаёт страницами по 30. Просим на один больше предела, чтобы
        // понять, есть ли продолжение, не делая второго запроса.
        const postsList = await fetchApi('/wall/feed?limit=30', {}, token);
        set({ feedHasMore: Array.isArray(postsList) && postsList.length >= 30 });
        const myPostsList = await fetchApi(`/users/${mePayload.id}/posts?limit=100`, {}, token);
        const combinedPostsMap = new Map();
        postsList.forEach((p: Post) => combinedPostsMap.set(p.id, p));
        myPostsList.forEach((p: Post) => combinedPostsMap.set(p.id, p));
        combinedPosts = Array.from(combinedPostsMap.values()).sort((a: any, b: any) => b.createdAt - a.createdAt) as Post[];
        Object.assign(usersMap, mergeUsersFromPosts(combinedPosts, usersMap));
      } catch (err) {
        console.error('Failed to fetch posts in initApi:', err);
      }

      set({
        users: usersMap,
        chats: chatsList,
        posts: combinedPosts,
      });

      try {
        await get().refreshNotifications();
      } catch { /* optional */ }

      await get().syncEchoes();
      await get().loadBlocks();
      
      const activeId = get().activeChatId;
      if (activeId) {
        const msgs = await fetchApi(`/chats/${activeId}/messages`, {}, token);
        set({ messages: msgs });
      }
    } catch (err: any) {
      console.error('API initialization failed:', err);
      get().showToast('Ошибка подключения к серверу');
      // 401 не проходит сам собой: токен просрочен или сессия отозвана.
      // Пока выход не срабатывал, приложение оставалось с чужими данными на
      // экране и бесконечно перезапрашивало /me.
      if (err?.status === 401 || err?.status === 419) {
        get().logout();
      }
    } finally {
      // finally, а не в try: при ошибке скелетоны обязаны погаснуть, иначе
      // экран навсегда останется в состоянии загрузки.
      set({ booting: false });
    }
  },

  loadMoreFeed: async () => {
    const { posts, feedHasMore, feedLoadingMore, token } = get();
    if (!feedHasMore || feedLoadingMore || !token) return;
    const last = posts[posts.length - 1];
    if (!last) return;

    set({ feedLoadingMore: true });
    try {
      // Курсор — идентификатор последнего поста. Время сюда не годится: наружу
      // оно уходит округлённым, и граница страницы повторяется.
      const next = await fetchApi(`/wall/feed?limit=30&before_id=${last.id}`, {}, token);
      const list = Array.isArray(next) ? next : [];
      set((s) => {
        const known = new Set(s.posts.map((p: any) => p.id));
        return {
          posts: [...s.posts, ...list.filter((p: any) => !known.has(p.id))],
          feedHasMore: list.length >= 30,
        };
      });
    } catch (err) {
      console.error('не удалось догрузить ленту', err);
      get().showToast('Не удалось загрузить ещё');
    } finally {
      set({ feedLoadingMore: false });
    }
  },

  sendTypingPresence: () => {
    const chatId = get().activeChatId;
    if (!chatId || !activeSocket || activeSocket.readyState !== 1) return;
    const now = Date.now();
    if (now - lastTypingSent < 1500) return;
    lastTypingSent = now;
    activeSocket.send(JSON.stringify({
      event: 'presence.typing',
      data: { chat_id: chatId }
    }));
  },

  sendVoiceMock: () => {
    const chatId = get().activeChatId;
    if (!chatId) return;
    const createdAt = Date.now();
    const id = uid('m');
    const msg: Message = {
      id,
      chatId,
      senderId: get().me.id,
      kind: 'voice',
      text: 'Голосовое',
      durationSec: 3 + Math.floor(Math.random() * 12),
      status: 'sent',
      createdAt,
      reactions: {},
    };
    set((s) => ({
      messages: [...s.messages, msg],
      voiceRecording: false,
      chats: s.chats.map((c) =>
        c.id === chatId
          ? { ...c, preview: `🎤 0:${String(msg.durationSec).padStart(2, '0')}`, timeLabel: formatTime(createdAt), latestMessageCreatedAt: createdAt }
          : c
      ),
    }));
  },

  sendCircleMock: () => {
    const chatId = get().activeChatId;
    if (!chatId) return;
    const createdAt = Date.now();
    const id = uid('m');
    const msg: Message = {
      id,
      chatId,
      senderId: get().me.id,
      kind: 'circle',
      text: 'Кружок',
      durationSec: 5,
      status: 'sent',
      createdAt,
      reactions: {},
    };
    set((s) => ({
      messages: [...s.messages, msg],
      circleSheetOpen: false,
      showCircleEffects: false,
      chats: s.chats.map((c) =>
        c.id === chatId
          ? { ...c, preview: '⭕ Кружок', timeLabel: formatTime(createdAt), latestMessageCreatedAt: createdAt }
          : c
      ),
    }));
  },

  retryMessage: (id) => {
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, status: 'pending' } : m
      ),
    }));
    window.setTimeout(() => {
      set((s) => ({
        messages: s.messages.map((m) =>
          m.id === id ? { ...m, status: 'sent' } : m
        ),
      }));
    }, 350);
  },

  // Удаление только у себя выглядело как работающее: сообщение исчезало с
  // экрана, оставалось у собеседника и возвращалось после перезагрузки.
  deleteMessage: async (id) => {
    const msg = get().messages.find((m) => m.id === id);
    set({ contextMenu: null, reactionPicker: null });
    if (!msg) return;
    const before = get().messages;
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, deleted: true, text: '', media: undefined } : m
      ),
    }));
    try {
      await fetchApi(`/chats/${msg.chatId}/messages/${id}`, { method: 'DELETE' }, get().token);
    } catch (e) {
      set({ messages: before });
      get().showToast('Не удалось удалить');
    }
  },

  editMessage: async (id, text) => {
    const msg = get().messages.find((m) => m.id === id);
    const next = text.trim();
    set({ contextMenu: null, editingMessageId: null });
    if (!msg || !next || next === msg.text) return;
    const before = get().messages;
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, text: next } : m)),
    }));
    try {
      const res = await fetchApi(
        `/chats/${msg.chatId}/messages/${id}`,
        { method: 'PATCH', body: JSON.stringify({ text: next }) },
        get().token
      );
      if (res?.editedAt) {
        set((s) => ({
          messages: s.messages.map((m) => (m.id === id ? { ...m, editedAt: Number(res.editedAt) } : m)),
        }));
      }
      // Если правили последнее сообщение, строка чата показывала бы прежний
      // текст — расхождение видно сразу, оба места на одном экране.
      set((s) => ({
        chats: s.chats.map((c: any) =>
          c.id === msg.chatId && c.preview === msg.text ? { ...c, preview: next } : c
        ),
      }));
    } catch (e) {
      set({ messages: before });
      get().showToast('Не удалось изменить');
    }
  },

  toggleReaction: async (messageId, emoji) => {
    const me = get().me.id;
    const before = get().messages;

    // Оптимистично: реакция должна появиться мгновенно, а не через круг до сервера.
    set((s) => ({
      reactionPicker: null,
      messages: s.messages.map((m) => {
        if (m.id !== messageId) return m;
        const reactions = { ...m.reactions };
        const list = new Set(reactions[emoji] ?? []);
        if (list.has(me)) list.delete(me);
        else list.add(me);
        if (list.size === 0) delete reactions[emoji];
        else reactions[emoji] = [...list];
        return { ...m, reactions };
      }),
    }));

    try {
      // Сервер возвращает всю карту реакций, а не дельту: счётчики — общее
      // состояние, и сводить их вручную значит однажды разойтись.
      const res = await fetchApi(
        `/messages/${messageId}/reactions`,
        { method: 'POST', body: JSON.stringify({ emoji }) },
        get().token
      );
      set((s) => ({
        messages: s.messages.map((m) =>
          m.id === messageId ? { ...m, reactions: res.reactions ?? {} } : m
        ),
      }));
    } catch (err) {
      console.error('reaction failed', err);
      set({ messages: before });
      get().showToast('Не удалось поставить реакцию');
    }
  },

  setReactionPicker: (v) => set({ reactionPicker: v, contextMenu: null }),
  setContextMenu: (v) => set({ contextMenu: v, reactionPicker: null }),

  pinToShelf: async (messageId) => {
    const msg = get().messages.find((m) => m.id === messageId);
    if (!msg) return;
    set({ contextMenu: null });
    if (get().shelfItems.some((x) => x.messageId === messageId)) {
      get().showToast('Уже на полке');
      return;
    }
    try {
      const item = await fetchApi(
        `/chats/${msg.chatId}/shelf`,
        { method: 'POST', body: JSON.stringify({ message_id: messageId }) },
        get().token
      );
      // Событие от сервера могло опередить ответ на этот же запрос, и тогда
      // запись уже на месте. Проверка внутри set: снаружи между чтением и
      // записью остаётся зазор, в который и попадала вторая копия.
      set((s) =>
        s.shelfItems.some((x: any) => x.messageId === messageId)
          ? s
          : { shelfItems: [shelfFromApi(item), ...s.shelfItems] }
      );
      get().showToast('На полке');
    } catch (err) {
      console.error('pin failed', err);
      get().showToast('Не удалось закрепить');
    }
  },

  removeFromShelf: async (shelfId) => {
    const item = get().shelfItems.find((x) => x.id === shelfId);
    if (!item) return;
    const before = get().shelfItems;
    set((s) => ({ shelfItems: s.shelfItems.filter((x) => x.id !== shelfId) }));
    try {
      await fetchApi(
        `/chats/${item.chatId}/shelf/${item.messageId}`,
        { method: 'DELETE' },
        get().token
      );
    } catch (err) {
      console.error('unpin failed', err);
      set({ shelfItems: before });
      get().showToast('Не удалось открепить');
    }
  },

  // Перезапрашивает список чатов целиком. Нужна там, где пришло событие о
  // чате, которого клиент ещё не знает: первое сообщение от нового человека
  // или добавление в группу. Список приходит одним батчем на сервере, так что
  // это дешевле, чем достраивать чат по кускам из события.
  syncChats: async () => {
    const token = get().token;
    if (!token || syncingChats) return;
    syncingChats = true;
    try {
      const list = await fetchApi('/chats', {}, token);
      if (!Array.isArray(list)) return;
      const users = { ...get().users };
      list.forEach((c: any) => {
        if (c.peerId) {
          users[c.peerId] = {
            ...users[c.peerId],
            id: c.peerId,
            username: c.peerUsername || users[c.peerId]?.username || '',
            displayName: c.title,
            avatarRef: c.avatarRef,
            online: c.online,
            lastSeenAt: c.lastSeenAt || 0,
            bannerPatternId: users[c.peerId]?.bannerPatternId || 'mint_wave',
          };
        }
      });
      set({ chats: list, users });
    } catch (e) {
      console.error('Не удалось обновить список чатов:', e);
    } finally {
      syncingChats = false;
    }
  },

  // Перезапрашивает ожидающие эхо. Зовётся при запуске и когда тихое
  // сообщение пришло в открытое приложение.
  syncEchoes: async () => {
    const token = get().token;
    if (!token) return;
    try {
      const list = await fetchApi('/echoes?status=pending', {}, token);
      if (Array.isArray(list)) set({ echoes: list.map(echoFromApi) });
    } catch (e) {
      console.error('Не удалось обновить эхо:', e);
    }
  },

  // Блокировка и жалобы. Сервер это умел с самого начала, но в интерфейсе
  // не было ни одной кнопки — пожаловаться на человека было нельзя вовсе.
  loadBlocks: async () => {
    const token = get().token;
    if (!token) return;
    try {
      const list = await fetchApi('/blocks', {}, token);
      if (Array.isArray(list)) {
        set({ blockedIds: list.map((b: any) => b.userId || b.id).filter(Boolean) });
      }
    } catch (e) {
      console.error('Не удалось загрузить список блокировок:', e);
    }
  },

  blockUser: async (userId) => {
    const before = get().blockedIds;
    if (before.includes(userId)) return;
    set({ blockedIds: [...before, userId] });
    try {
      await fetchApi('/blocks', { method: 'POST', body: JSON.stringify({ user_id: userId }) }, get().token);
      get().showToast('Заблокирован');
    } catch (e) {
      set({ blockedIds: before });
      get().showToast('Не удалось заблокировать');
    }
  },

  unblockUser: async (userId) => {
    const before = get().blockedIds;
    set({ blockedIds: before.filter((id) => id !== userId) });
    try {
      await fetchApi(`/blocks/${userId}`, { method: 'DELETE' }, get().token);
      get().showToast('Разблокирован');
    } catch (e) {
      set({ blockedIds: before });
      get().showToast('Не удалось разблокировать');
    }
  },

  reportUser: async (userId, reason) => {
    try {
      await fetchApi(
        '/reports',
        { method: 'POST', body: JSON.stringify({ target_type: 'user', target_id: userId, reason }) },
        get().token
      );
      get().showToast('Жалоба отправлена');
    } catch (e) {
      get().showToast('Не удалось отправить жалобу');
    }
  },

  loadShelf: async (chatId) => {
    try {
      const items = await fetchApi(`/chats/${chatId}/shelf`, {}, get().token);
      const list = Array.isArray(items) ? items.map(shelfFromApi) : [];
      set((s) => ({
        shelfItems: [...s.shelfItems.filter((x) => x.chatId !== chatId), ...list],
      }));
    } catch (err) {
      console.error('shelf load failed', err);
    }
  },

  setShelfOpen: (v) => set({ shelfOpen: v }),

  setEchoMode: (v) => set({ echoMode: v }),
  openEchoSheet: () => set({ echoSheetOpen: true }),
  closeEchoSheet: () => set({ echoSheetOpen: false }),
  dismissEchoes: () => {
    const pending = get().echoes.filter((e) => e.status === 'pending');
    set((s) => ({
      echoes: s.echoes.map((e) =>
        e.status === 'pending' ? { ...e, status: 'dismissed' } : e
      ),
      echoSheetOpen: false,
    }));
    // Состояние эха живёт на сервере. Без этого указатель вернётся при
    // следующем запуске — закрыть его было бы невозможно.
    markEchoesSeen(pending, 'dismiss', get);
  },
  openEchoInChat: () => {
    const first = get().echoes.find((e) => e.status === 'pending');
    if (!first) {
      set({ echoSheetOpen: false });
      return;
    }
    const pending = get().echoes.filter((e) => e.status === 'pending');
    set((s) => ({
      echoes: s.echoes.map((e) =>
        e.status === 'pending' ? { ...e, status: 'opened' } : e
      ),
      echoSheetOpen: false,
      mainTab: 'chats',
      activeChatId: first.chatId,
      highlightMessageId: first.messageId,
    }));
    markEchoesSeen(pending, 'open', get);
    window.setTimeout(() => set({ highlightMessageId: null }), 2000);
  },

  setEditingMessage: (id) => set({ editingMessageId: id, contextMenu: null }),
  setAttachSheetOpen: (v) => set({ attachSheetOpen: v }),
  setCircleSheetOpen: (v) => set({ circleSheetOpen: v, showCircleEffects: false }),
  setVoiceRecording: (v) => set({ voiceRecording: v }),
  setShowCircleEffects: (v) => set({ showCircleEffects: v }),
  toggleOffline: () => set((s) => ({ isOffline: !s.isOffline })),

  createPost: async (text, opts) => {
    const token = get().token;
    const t = text.trim();
    if (!t && !opts.photoFile && !opts.withMedia) return;

    let mediaPayload = undefined;

    if (opts.photoFile) {
      try {
        const uploadRes = await fetchApi('/media/uploads', {
          method: 'POST',
          body: JSON.stringify({
            mime: opts.photoFile.type,
            size: opts.photoFile.size,
            kind: 'image'
          })
        }, token);

        const s3Res = await fetch(uploadRes.upload_url, {
          method: 'PUT',
          body: opts.photoFile,
          headers: {
            'Content-Type': opts.photoFile.type,
            Authorization: `Bearer ${token}`,
          }
        });

        if (!s3Res.ok) {
          throw new Error(`Failed to upload file: ${s3Res.statusText}`);
        }

        await fetchApi(`/media/${uploadRes.media_id}/complete`, {
          method: 'POST',
          body: JSON.stringify({})
        }, token);

        mediaPayload = {
          kind: 'image',
          url: uploadRes.public_url,
          media_id: uploadRes.media_id,
          height: opts.mediaHeight
        };
      } catch (err: any) {
        get().showToast(err.message || 'Ошибка загрузки фото');
        return;
      }
    } else if (opts.withMedia) {
      const pText = opts.patternText?.trim() || '✦';
      const items = pText.split(/\s+/).filter(Boolean);
      mediaPayload = {
        kind: 'pattern',
        patternId: 'custom',
        items: items,
        alt: pText,
        height: opts.mediaHeight
      };
    }

    if (mediaPayload) {
      if (opts.fontSize) (mediaPayload as any).fontSize = opts.fontSize;
      if (opts.fontFamily) (mediaPayload as any).fontFamily = opts.fontFamily;
    } else if (opts.fontSize || opts.fontFamily) {
      mediaPayload = {
        kind: 'pattern',
        patternId: 'none',
        fontSize: opts.fontSize,
        fontFamily: opts.fontFamily
      };
    }

    try {
      const clientPostId = uid('p');
      const res = await fetchApi('/posts', {
        method: 'POST',
        body: JSON.stringify({
          client_id: clientPostId,
          text: t,
          origin: opts.from,
          on_wall: opts.from === 'wall' ? true : opts.addToWall,
          media: mediaPayload
        })
      }, token);

      set((s) => ({
        posts: [res, ...s.posts],
        users: mergeUsersFromPosts([res], s.users),
      }));

      get().showToast(
        res.onWall ? 'Опубликовано · в стене' : 'Пост в профиле'
      );
    } catch (err: any) {
      get().showToast(err.message || 'Ошибка создания поста');
    }
  },

  toggleLike: async (postId) => {
    const token = get().token;
    const me = get().me.id;
    try {
      const res = await fetchApi(`/posts/${postId}/like`, { method: 'POST' }, token);
      set((s) => ({
        posts: s.posts.map((p) => {
          if (p.id !== postId) return p;
          return {
            ...p,
            likedBy: res.liked
              ? [...p.likedBy, me]
              : p.likedBy.filter((id) => id !== me)
          };
        })
      }));
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  },

  addComment: async (postId, text, parentId?: string | null) => {
    const token = get().token;
    const t = text.trim();
    if (!t) return;
    try {
      const res = await fetchApi(`/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text: t, parent_id: parentId || undefined })
      }, token);
      set((s) => {
        const comment = { ...res, likedBy: res.likedBy || [] };
        const users = { ...s.users };
        if (comment.userId) {
          users[comment.userId] = {
            ...(users[comment.userId] || {
              id: comment.userId,
              username: '',
              bannerPatternId: 'mint_wave',
            }),
            id: comment.userId,
            displayName:
              comment.displayName || users[comment.userId]?.displayName || get().me.displayName,
            username: comment.username || users[comment.userId]?.username || '',
            avatarRef: comment.avatarRef ?? users[comment.userId]?.avatarRef,
          };
        }
        return {
          users,
          posts: s.posts.map((p) => {
            if (p.id !== postId) return p;
            return { ...p, comments: [...p.comments, comment] };
          }),
        };
      });
    } catch (err: any) {
      console.error('Failed to add comment:', err);
      get().showToast(err.message || 'Ошибка комментария');
    }
  },

  toggleCommentLike: async (postId, commentId) => {
    const token = get().token;
    const me = get().me.id;
    try {
      const res = await fetchApi(
        `/posts/${postId}/comments/${commentId}/like`,
        { method: 'POST' },
        token
      );
      set((s) => ({
        posts: s.posts.map((p) => {
          if (p.id !== postId) return p;
          return {
            ...p,
            comments: p.comments.map((c) => {
              if (c.id !== commentId) return c;
              const likedBy = c.likedBy || [];
              return {
                ...c,
                likedBy: res.liked
                  ? [...likedBy, me]
                  : likedBy.filter((id) => id !== me),
              };
            }),
          };
        }),
      }));
    } catch (err) {
      console.error('Failed to like comment:', err);
    }
  },

  repostToProfile: async (postId) => {
    const token = get().token;
    const src = get().posts.find((p) => p.id === postId);
    if (!src) return;
    try {
      const clientPostId = uid('p');
      const res = await fetchApi('/posts', {
        method: 'POST',
        body: JSON.stringify({
          client_id: clientPostId,
          text: src.text,
          origin: 'profile',
          on_wall: false,
          repost_of_id: src.id,
          media: src.media
        })
      }, token);
      set((s) => ({
        posts: [res, ...s.posts],
        mainTab: 'profile'
      }));
      get().showToast('Репост в профиль');
    } catch (err: any) {
      get().showToast(err.message || 'Ошибка репоста');
    }
  },

  setCommentPostId: (id) => set({ commentPostId: id }),
  setForwardPostId: (id) => set({ forwardPostId: id }),

  forwardPostToChat: (postId, chatId) => {
    const post = get().posts.find((p) => p.id === postId);
    if (!post) return;
    const author = get().users[post.authorId]?.displayName ?? '…';
    const caption = post.text?.trim()
      ? `↪ ${author}: ${post.text}`
      : `↪ ${author}`;
    set({ activeChatId: chatId, mainTab: 'chats', forwardPostId: null });

    if (post.media?.kind === 'image' && post.media.url) {
      void get().sendMessage(caption, {
        kind: 'media',
        media: {
          url: post.media.url,
          filename: 'post.jpg',
          mime: 'image/jpeg',
        },
      });
      return;
    }

    void get().sendMessage(caption);
  },

  deletePost: async (postId) => {
    const token = get().token;
    try {
      await fetchApi(`/posts/${postId}`, { method: 'DELETE' }, token);
      set((s) => ({
        posts: s.posts.filter((p) => p.id !== postId)
      }));
      get().showToast('Пост удален');
    } catch (err: any) {
      get().showToast(err.message || 'Ошибка удаления поста');
    }
  },

  openSettings: () => set({ settingsRoute: 'hub', viewingUserId: null }),
  closeSettings: () => set({ settingsRoute: null }),
  navigateSettings: (route) => set({ settingsRoute: route }),

  setGlobalChatTheme: (themeId) => {
    const pack = THEME_SOUND_PACK[themeId] || get().notificationSound;
    set({
      globalChatThemeId: themeId,
      globalCustomWallpaper: null,
      notificationSound: pack,
    });
    soundEffects.playTheme(pack);
  },
  setGlobalCustomWallpaper: (url) => set({ globalCustomWallpaper: url }),
  setNotificationSound: (sound) => {
    set({ notificationSound: sound });
    soundEffects.playTheme(sound);
  },
  setSoundVolume: (volume) => {
    set({ soundVolume: volume });
    soundEffects.volume = volume;
  },
  setNotifVolume: (volume) => {
    set({ notifVolume: volume });
    soundEffects.notifVolume = volume;
  },
  setSendVolume: (volume) => {
    set({ sendVolume: volume });
    soundEffects.sendVolume = volume;
    soundEffects.previewSend(get().notificationSound);
  },
  setUiTheme: (theme) => {
    set({ uiTheme: theme });
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = theme;
    }
  },
  setUiFont: (font) => {
    set({ uiFont: font });
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.font = font;
    }
  },
  setBrowserNotificationsEnabled: async (enabled) => {
    if (enabled && typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        set({ browserNotificationsEnabled: false });
        get().showToast('Доступ к уведомлениям отклонен');
        return;
      }
    }
    set({ browserNotificationsEnabled: enabled });
  },
  setDefaultReaction: (emoji) => set({ defaultReaction: emoji }),
  setNotifPref: (key, value) =>
    set((s) => ({
      notifPrefs: { ...s.notifPrefs, [key]: value },
    })),
    }),
    {
      name: 'tolk-web-state',
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        authStep: state.authStep,
        me: state.me,
        users: state.users,
        chats: state.chats,
        messages: state.messages,
        posts: state.posts,
        shelfItems: state.shelfItems,
        echoes: state.echoes,
        navPins: state.navPins,
        wallSeenAt: state.wallSeenAt,
        globalChatThemeId: state.globalChatThemeId,
        notificationSound: state.notificationSound,
        soundVolume: state.soundVolume,
        notifVolume: state.notifVolume,
        sendVolume: state.sendVolume,
        uiTheme: state.uiTheme,
        uiFont: state.uiFont,
        browserNotificationsEnabled: state.browserNotificationsEnabled,
        defaultReaction: state.defaultReaction,
        notifPrefs: state.notifPrefs,
        seenNotificationKeys: state.seenNotificationKeys,
        privacyPrefs: state.privacyPrefs,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<typeof current>;
        const chats = Array.isArray(p.chats)
          ? p.chats.map((c) =>
              c?.themeId
                ? { ...c, themeId: resolveChatThemeId(c.themeId) }
                : c
            )
          : current.chats;
        return {
          ...current,
          ...p,
          chats,
          globalChatThemeId: resolveChatThemeId(
            p.globalChatThemeId ?? current.globalChatThemeId
          ),
        };
      },
    }
  )
);

// Sync persisted audio + UI prefs on load
if (typeof window !== 'undefined') {
  const applyUi = (s: AppState) => {
    soundEffects.volume = s.soundVolume ?? 0.85;
    soundEffects.notifVolume = s.notifVolume ?? 1;
    soundEffects.sendVolume = s.sendVolume ?? 1;
    document.documentElement.dataset.theme = s.uiTheme || 'dark';
    document.documentElement.dataset.font = s.uiFont || 'inter';
  };
  applyUi(useAppStore.getState());
  useAppStore.subscribe((state) => applyUi(state));
}

export { BANNER_PATTERNS, CHAT_THEMES, DEFAULT_CHAT_THEME_ID, REACTION_SET };

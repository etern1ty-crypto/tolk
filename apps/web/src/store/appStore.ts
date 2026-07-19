import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import imageCompression from 'browser-image-compression';
import {
  INITIAL_POSTS,
  ME,
  USERS,
} from '../mocks/fixtures';
import { BANNER_PATTERNS, CHAT_THEMES } from '../shared/patterns';
import { soundEffects } from '../shared/soundEffects';
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
    throw new Error(errorObj.error || `HTTP ${res.status}`);
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
  authMode: 'login' | 'register';
  setAuthMode: (m: 'login' | 'register') => void;
  registerWithPassword: () => Promise<void>;
  loginWithPassword: () => Promise<void>;
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
  deleteMessage: (id: string) => void;
  setReplyTo: (id: string | null) => void;
  toggleReaction: (messageId: string, emoji: string) => void;
  setReactionPicker: (v: AppState['reactionPicker']) => void;
  setContextMenu: (v: AppState['contextMenu']) => void;
  pinToShelf: (messageId: string) => void;
  removeFromShelf: (shelfId: string) => void;
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
  notificationSound: 'pixel' | 'bubble' | 'glass' | 'silent';
  soundVolume: number;
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
  setNotificationSound: (sound: 'pixel' | 'bubble' | 'glass' | 'silent') => void;
  setSoundVolume: (volume: number) => void;
  setBrowserNotificationsEnabled: (enabled: boolean) => Promise<void>;
  setDefaultReaction: (emoji: string) => void;
  setNotifPref: (key: keyof AppState['notifPrefs'], value: boolean) => void;
}

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
      shelfItems: [],
      echoes: [],
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
      notifications: [],
      notificationsUnread: 0,
      seenNotificationKeys: [],
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

      reactionEmojis: REACTION_SET,

      globalChatThemeId: 'chat_dots',
      globalCustomWallpaper: null,
      notificationSound: 'pixel',
      soundVolume: 0.8,
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
      setAuthMode: (m) => set({ authMode: m }),
      registerWithPassword: async () => {
        const username = get().draftUsername.trim();
        const firstName = get().draftName.trim();
        const password = get().draftPassword.trim();
        if (!username || !firstName || !password) {
          get().showToast('Заполните все поля');
          return;
        }
        get().showToast('Создаём аккаунт...');
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
          });
          await get().initApi();
        } catch (err: any) {
          get().showToast(err.message || 'Ошибка регистрации');
        }
      },

      loginWithPassword: async () => {
        const username = get().draftUsername.trim();
        const password = get().draftPassword.trim();
        if (!username || !password) {
          get().showToast('Введите имя пользователя и пароль');
          return;
        }
        get().showToast('Входим...');
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
          });
          await get().initApi();
        } catch (err: any) {
          get().showToast(err.message || 'Неверные данные');
        }
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
          } catch (e) {
            console.error('Logout request failed:', e);
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
          draftPhone: '',
          draftName: '',
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
      const userPosts = await fetchApi(`/users/${userId}/posts`, {}, token);
      set((s) => {
        const otherPosts = s.posts.filter((p) => p.authorId !== userId);
        const combined = [...otherPosts, ...userPosts].sort((a, b) => b.createdAt - a.createdAt);
        return { posts: combined };
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

  joinChat: async (chatId) => {
    try {
      const res = await fetchApi(`/chats/${chatId}/join`, { method: 'POST' }, get().token);
      set((s) => ({
        chats: [res, ...s.chats.filter((c) => c.id !== res.id)],
        activeChatId: res.id,
        mainTab: 'chats',
      }));
      get().showToast('Вы вступили');
    } catch (err: any) {
      get().showToast(err.message || 'Не удалось вступить');
      throw err;
    }
  },

  joinByShareSlug: async (slug) => {
    try {
      const res = await fetchApi(`/share-links/${slug}/join`, { method: 'POST' }, get().token);
      if (res.id) {
        const details = await fetchApi(`/chats`, {}, get().token);
        set({ chats: details });
        set({ activeChatId: res.id, mainTab: 'chats' });
        get().showToast('Вы вступили');
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
        activeChatId: s.activeChatId === chatId ? null : s.activeChatId,
      }));
      get().showToast('Вы вышли');
    } catch (err: any) {
      get().showToast(err.message || 'Ошибка выхода');
      throw err;
    }
  },

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
      soundEffects.playSent();
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
            kind: kind === 'media' ? 'image' : 'file'
          })
        }, token);

        const s3Res = await fetch(uploadRes.upload_url, {
          method: 'PUT',
          body: processedFile,
          headers: {
            'Content-Type': processedFile.type || 'application/octet-stream'
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
    if (!token) return;
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
        const postsList = await fetchApi('/wall/feed', {}, token);
        const myPostsList = await fetchApi(`/users/${mePayload.id}/posts`, {}, token);
        const combinedPostsMap = new Map();
        postsList.forEach((p: Post) => combinedPostsMap.set(p.id, p));
        myPostsList.forEach((p: Post) => combinedPostsMap.set(p.id, p));
        combinedPosts = Array.from(combinedPostsMap.values()).sort((a: any, b: any) => b.createdAt - a.createdAt) as Post[];
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
      
      const activeId = get().activeChatId;
      if (activeId) {
        const msgs = await fetchApi(`/chats/${activeId}/messages`, {}, token);
        set({ messages: msgs });
      }
    } catch (err: any) {
      console.error('API initialization failed:', err);
      get().showToast('Ошибка подключения к серверу');
      if (err.message && (err.message.includes('401') || err.message.includes('419') || err.message.includes('expired'))) {
        get().logout();
      }
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

  deleteMessage: (id) =>
    set((s) => ({
      messages: s.messages.filter((m) => m.id !== id),
      contextMenu: null,
      reactionPicker: null,
    })),

  toggleReaction: (messageId, emoji) => {
    const me = get().me.id;
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
  },

  setReactionPicker: (v) => set({ reactionPicker: v, contextMenu: null }),
  setContextMenu: (v) => set({ contextMenu: v, reactionPicker: null }),

  pinToShelf: (messageId) => {
    const msg = get().messages.find((m) => m.id === messageId);
    if (!msg) return;
    if (get().shelfItems.some((x) => x.messageId === messageId)) {
      set({ contextMenu: null });
      return;
    }
    const preview =
      msg.kind === 'media'
        ? msg.text?.trim() || 'Фото'
        : msg.kind === 'voice'
          ? 'Голосовое'
          : msg.kind === 'circle'
            ? 'Кружок'
            : msg.text || 'Сообщение';
    set((s) => ({
      shelfItems: [
        {
          id: uid('sh'),
          chatId: msg.chatId,
          messageId: msg.id,
          pinnedBy: get().me.id,
          pinnedAt: Date.now(),
          text: preview,
          mediaUrl: msg.media?.url,
          kind: msg.kind,
        },
        ...s.shelfItems,
      ],
      contextMenu: null,
      shelfOpen: true,
    }));
  },
  removeFromShelf: (shelfId) =>
    set((s) => ({
      shelfItems: s.shelfItems.filter((x) => x.id !== shelfId),
    })),
  setShelfOpen: (v) => set({ shelfOpen: v }),

  setEchoMode: (v) => set({ echoMode: v }),
  openEchoSheet: () => set({ echoSheetOpen: true }),
  closeEchoSheet: () => set({ echoSheetOpen: false }),
  dismissEchoes: () =>
    set((s) => ({
      echoes: s.echoes.map((e) =>
        e.status === 'pending' ? { ...e, status: 'dismissed' } : e
      ),
      echoSheetOpen: false,
    })),
  openEchoInChat: () => {
    const first = get().echoes.find((e) => e.status === 'pending');
    if (!first) {
      set({ echoSheetOpen: false });
      return;
    }
    set((s) => ({
      echoes: s.echoes.map((e) =>
        e.status === 'pending' ? { ...e, status: 'opened' } : e
      ),
      echoSheetOpen: false,
      mainTab: 'chats',
      activeChatId: first.chatId,
      highlightMessageId: first.messageId,
    }));
    window.setTimeout(() => set({ highlightMessageId: null }), 2000);
  },

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
            'Content-Type': opts.photoFile.type
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
        posts: [res, ...s.posts]
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
      set((s) => ({
        posts: s.posts.map((p) => {
          if (p.id !== postId) return p;
          return {
            ...p,
            comments: [...p.comments, { ...res, likedBy: res.likedBy || [] }]
          };
        })
      }));
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

  setGlobalChatTheme: (themeId) => set({ globalChatThemeId: themeId, globalCustomWallpaper: null }),
  setGlobalCustomWallpaper: (url) => set({ globalCustomWallpaper: url }),
  setNotificationSound: (sound) => {
    set({ notificationSound: sound });
    soundEffects.playTheme(sound);
  },
  setSoundVolume: (volume) => {
    set({ soundVolume: volume });
    soundEffects.volume = volume;
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
        browserNotificationsEnabled: state.browserNotificationsEnabled,
        defaultReaction: state.defaultReaction,
        notifPrefs: state.notifPrefs,
        seenNotificationKeys: state.seenNotificationKeys,
      }),
    }
  )
);

// Sync persisted soundVolume with soundEffects on initialization and changes
if (typeof window !== 'undefined') {
  // Set initial volume from store
  soundEffects.volume = useAppStore.getState().soundVolume;
  // Subscribe to updates
  useAppStore.subscribe((state) => {
    soundEffects.volume = state.soundVolume;
  });
}

export { BANNER_PATTERNS, CHAT_THEMES, REACTION_SET };

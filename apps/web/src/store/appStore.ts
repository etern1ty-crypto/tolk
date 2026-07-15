import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  INITIAL_POSTS,
  MEDIA_PRESETS,
  ME,
  USERS,
} from '../mocks/fixtures';
import { BANNER_PATTERNS, CHAT_THEMES } from '../shared/patterns';
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
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:3000`;
  }
  return 'http://localhost:3000';
};
const API_URL = getApiUrl();

async function fetchApi(path: string, options: RequestInit = {}, token?: string | null) {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
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

function connectWebSocket(token: string, store: any) {
  if (activeSocket) {
    activeSocket.close();
  }
  
  const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${wsProto}//${window.location.hostname}:3000/ws?token=${token}`;
  const ws = new WebSocket(wsUrl);
  activeSocket = ws;
  
  ws.onopen = () => {
    console.log('[WS] Connected');
  };
  
  ws.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data);
      const { event: wsEvent, data } = payload;
      
      if (wsEvent === 'message.created') {
        const { messages, chats, activeChatId } = store.getState();
        if (messages.some((m: any) => m.id === data.id || m.id === data.clientId)) {
          store.setState({
            messages: messages.map((m: any) => 
              (m.id === data.id || m.id === data.clientId) 
                ? { ...m, id: data.id, seq: data.seq, status: 'sent', createdAt: data.createdAt } 
                : m
            )
          });
          return;
        }
        
        const newMsg: Message = {
          id: data.id,
          chatId: data.chatId,
          senderId: data.senderId,
          kind: data.kind,
          text: data.text,
          status: 'sent',
          createdAt: data.createdAt,
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
              unread: activeChatId === data.chatId ? 0 : c.unread + 1
            };
          }
          return c;
        });
        
        store.setState({
          messages: [...messages, newMsg],
          chats: updatedChats
        });
        
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
    activeSocket = null;
    if (store.getState().token) {
      window.setTimeout(() => {
        if (store.getState().token) {
          connectWebSocket(store.getState().token, store);
        }
      }, 5000);
    }
  };
  
  ws.onerror = (err) => {
    console.error('[WS] Connection error:', err);
  };
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString('ru-RU', {
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
  openUserProfile: (userId: string) => void;
  closeUserProfile: () => void;
  startChatWithUser: (userId: string) => Promise<void>;
  setNewChatOpen: (v: boolean) => void;
  toggleNavPin: (chatId: string) => void;

  setSearchQuery: (q: string) => void;
  sendMessage: (text: string) => Promise<void>;
  sendVoiceMock: () => void;
  sendCircleMock: () => void;
  retryMessage: (id: string) => void;
  deleteMessage: (id: string) => void;
  setReplyTo: (id: string | null) => void;
  toggleReaction: (messageId: string, emoji: string) => void;
  setReactionPicker: (v: AppState['reactionPicker']) => void;
  setContextMenu: (v: AppState['contextMenu']) => void;
  pinToShelf: (messageId: string) => void;
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
    }
  ) => void;
  toggleLike: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  repostToProfile: (postId: string) => void;
  setCommentPostId: (id: string | null) => void;
  setForwardPostId: (id: string | null) => void;
  forwardPostToChat: (postId: string, chatId: string) => void;
  deletePost: (postId: string) => void;

  openSettings: () => void;
  closeSettings: () => void;
  navigateSettings: (route: NonNullable<SettingsRoute>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      token: null,
      isAuthenticated: false,
      authStep: 'phone',
      draftPhone: '',
      draftName: '',
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
      replyToId: null,
      toast: null,
      wallSeenAt: Date.now() - 1000 * 60 * 60,
      typingChatId: null,

      settingsRoute: null,
      reactionEmojis: REACTION_SET,

      setPhone: (v) => set({ draftPhone: v }),
      setDraftName: (v) => set({ draftName: v }),
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
          set({
            token: res.access_token,
            me: res.user,
            authStep: 'profile',
            draftPhone: phone,
            draftName: res.user.displayName || '',
          });
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
        } catch (err: any) {
          get().showToast(err.message || 'Ошибка сохранения профиля');
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

  setActiveChat: async (id) => {
    set({
      activeChatId: id,
      mainTab: 'chats',
      contextMenu: null,
      reactionPicker: null,
      replyToId: null,
      chats: get().chats.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
    });
    if (id) {
      try {
        const msgs = await fetchApi(`/chats/${id}/messages`, {}, get().token);
        set({ messages: msgs });
      } catch (err) {
        console.error('Failed to fetch messages:', err);
        get().showToast('Не удалось загрузить сообщения');
      }
    }
  },

  openUserProfile: (userId) => set({ viewingUserId: userId, settingsRoute: null }),
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

  setSearchQuery: (q) => set({ searchQuery: q }),
  setNewChatOpen: (v) => set({ newChatOpen: v }),
  setReplyTo: (id) => set({ replyToId: id, contextMenu: null }),

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

  sendMessage: async (text) => {
    const t = text.trim();
    const chatId = get().activeChatId;
    if (!t || !chatId) return;
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
      kind: 'text',
      text: t,
      status: offline ? 'failed' : 'pending',
      createdAt,
      isEcho,
      reactions: {},
      replyToId: replyMsg?.id,
      replyPreview: replyMsg
        ? replyMsg.text.slice(0, 80)
        : undefined,
    };
    set((s) => ({
      messages: [...s.messages, msg],
      replyToId: null,
      chats: s.chats.map((c) =>
        c.id === chatId
          ? { ...c, preview: isEcho ? `Echo: ${t}` : t, timeLabel: formatTime(createdAt) }
          : c
      ),
      echoMode: isEcho ? false : s.echoMode,
    }));
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
            text: t,
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
          kind: 'text',
          text: t,
          reply_to: replyToId || undefined,
          is_echo: isEcho,
        }),
      }, get().token);
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
    } catch (err) {
      console.error('Failed to send message:', err);
      set((s) => ({
        messages: s.messages.map((m) =>
          m.id === id ? { ...m, status: 'failed' } : m
        ),
      }));
      get().showToast('Не удалось отправить сообщение');
    }
  },

  initApi: async () => {
    const token = get().token;
    if (!token) return;
    try {
      connectWebSocket(token, useAppStore);
      const mePayload = await fetchApi('/me', {}, token);
      set({ me: mePayload });
      
      const usersList = await fetchApi('/users', {}, token);
      const usersMap = usersList.reduce((acc: Record<string, User>, u: User) => {
        acc[u.id] = u;
        return acc;
      }, {});
      usersMap[mePayload.id] = mePayload;
      
      const chatsList = await fetchApi('/chats', {}, token);
      set({
        users: usersMap,
        chats: chatsList,
      });
      
      const activeId = get().activeChatId;
      if (activeId) {
        const msgs = await fetchApi(`/chats/${activeId}/messages`, {}, token);
        set({ messages: msgs });
      }
    } catch (err: any) {
      console.error('API initialization failed:', err);
      get().showToast('Ошибка подключения к серверу');
      if (err.message.includes('401') || err.message.includes('419') || err.message.includes('expired')) {
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
          ? { ...c, preview: `🎤 0:${String(msg.durationSec).padStart(2, '0')}`, timeLabel: formatTime(createdAt) }
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
          ? { ...c, preview: '⭕ Кружок', timeLabel: formatTime(createdAt) }
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
    set((s) => ({
      shelfItems: [
        {
          id: uid('sh'),
          chatId: msg.chatId,
          messageId: msg.id,
          pinnedBy: get().me.id,
          pinnedAt: Date.now(),
          text: msg.text,
        },
        ...s.shelfItems,
      ],
      contextMenu: null,
      shelfOpen: true,
    }));
  },
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

  createPost: (text, opts) => {
    const t = text.trim();
    if (!t && !opts.withMedia) return;
    const post: Post = {
      id: uid('p'),
      authorId: get().me.id,
      text: t || (opts.withMedia ? '' : t),
      createdAt: Date.now(),
      origin: opts.from,
      onWall: opts.from === 'wall' ? true : opts.addToWall,
      likedBy: [],
      comments: [],
      media: opts.withMedia
        ? {
            kind: 'pattern' as const,
            patternId:
              MEDIA_PRESETS[
                Math.floor(Math.random() * MEDIA_PRESETS.length)
              ]!.patternId,
          }
        : undefined,
    };
    set((s) => ({ posts: [post, ...s.posts] }));
    get().showToast(
      post.onWall ? 'Опубликовано · в стене' : 'Пост в профиле'
    );
  },

  toggleLike: (postId) => {
    const me = get().me.id;
    set((s) => ({
      posts: s.posts.map((p) => {
        if (p.id !== postId) return p;
        const has = p.likedBy.includes(me);
        return {
          ...p,
          likedBy: has ? p.likedBy.filter((id) => id !== me) : [...p.likedBy, me],
        };
      }),
    }));
  },

  addComment: (postId, text) => {
    const t = text.trim();
    if (!t) return;
    set((s) => ({
      posts: s.posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [
                ...p.comments,
                {
                  id: uid('cm'),
                  userId: get().me.id,
                  text: t,
                  createdAt: Date.now(),
                },
              ],
            }
          : p
      ),
    }));
  },

  repostToProfile: (postId) => {
    const src = get().posts.find((p) => p.id === postId);
    if (!src) return;
    const post: Post = {
      id: uid('p'),
      authorId: get().me.id,
      text: src.text,
      createdAt: Date.now(),
      origin: 'profile',
      onWall: false,
      repostOfId: src.id,
      likedBy: [],
      comments: [],
      media: src.media,
    };
    set((s) => ({ posts: [post, ...s.posts], mainTab: 'profile' }));
    get().showToast('Репост в профиль');
  },

  setCommentPostId: (id) => set({ commentPostId: id }),
  setForwardPostId: (id) => set({ forwardPostId: id }),

  forwardPostToChat: (postId, chatId) => {
    const post = get().posts.find((p) => p.id === postId);
    if (!post) return;
    const author = get().users[post.authorId]?.displayName ?? '…';
    set({ activeChatId: chatId, mainTab: 'chats', forwardPostId: null });
    get().sendMessage(`↪ ${author}: ${post.text}`);
  },

  deletePost: (postId) =>
    set((s) => ({ posts: s.posts.filter((p) => p.id !== postId) })),

  openSettings: () => set({ settingsRoute: 'hub', viewingUserId: null }),
  closeSettings: () => set({ settingsRoute: null }),
  navigateSettings: (route) => set({ settingsRoute: route }),
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
      }),
    }
  )
);

export { BANNER_PATTERNS, CHAT_THEMES, REACTION_SET };

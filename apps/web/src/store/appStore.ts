import { create } from 'zustand';
import {
  BANNERS,
  INITIAL_CHATS,
  INITIAL_MESSAGES,
  INITIAL_POSTS,
  MEDIA_PRESETS,
  ME,
  USERS,
} from '../mocks/fixtures';
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

const AUTH_KEY = 'tolk_web_auth_v2';

function loadAuth(): boolean {
  try {
    return localStorage.getItem(AUTH_KEY) === '1';
  } catch {
    return false;
  }
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
  submitPhone: () => void;
  submitOtp: () => void;
  submitProfile: () => void;
  logout: () => void;
  updateMe: (patch: Partial<User>) => void;
  setBanner: (banner: string) => void;

  setMainTab: (tab: MainTab) => void;
  setActiveChat: (id: string | null) => void;
  openUserProfile: (userId: string) => void;
  closeUserProfile: () => void;
  startChatWithUser: (userId: string) => void;
  setNewChatOpen: (v: boolean) => void;

  setSearchQuery: (q: string) => void;
  sendMessage: (text: string) => void;
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

export const useAppStore = create<AppState>((set, get) => ({
  isAuthenticated: loadAuth(),
  authStep: loadAuth() ? 'done' : 'phone',
  draftPhone: '',
  draftName: '',
  me: { ...ME },
  users: { ...USERS },

  mainTab: 'chats',
  isOffline: false,
  searchQuery: '',

  chats: INITIAL_CHATS,
  messages: INITIAL_MESSAGES,
  posts: INITIAL_POSTS,
  shelfItems: [],
  echoes: [],

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
  submitPhone: () => {
    if (get().draftPhone.trim().length < 6) return;
    set({ authStep: 'otp' });
  },
  submitOtp: () => set({ authStep: 'profile' }),
  submitProfile: () => {
    const name = get().draftName.trim() || 'Некач';
    try {
      localStorage.setItem(AUTH_KEY, '1');
    } catch {
      /* */
    }
    const me = { ...get().me, displayName: name };
    set({
      isAuthenticated: true,
      authStep: 'done',
      me,
      users: { ...get().users, [me.id]: me },
      mainTab: 'chats',
    });
  },
  logout: () => {
    try {
      localStorage.removeItem(AUTH_KEY);
    } catch {
      /* */
    }
    set({
      isAuthenticated: false,
      authStep: 'phone',
      draftPhone: '',
      draftName: '',
      activeChatId: null,
      mainTab: 'chats',
      settingsRoute: null,
      viewingUserId: null,
      echoes: [],
      contextMenu: null,
      reactionPicker: null,
    });
  },
  updateMe: (patch) => {
    const me = { ...get().me, ...patch };
    set({ me, users: { ...get().users, [me.id]: me } });
  },
  setBanner: (banner) => get().updateMe({ banner }),

  setMainTab: (tab) => {
    set({
      mainTab: tab,
      viewingUserId: null,
      settingsRoute: null,
      newChatOpen: false,
    });
    if (tab === 'wall') get().markWallSeen();
  },

  setActiveChat: (id) =>
    set({
      activeChatId: id,
      mainTab: 'chats',
      contextMenu: null,
      reactionPicker: null,
      replyToId: null,
      chats: get().chats.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
    }),

  openUserProfile: (userId) => set({ viewingUserId: userId, settingsRoute: null }),
  closeUserProfile: () => set({ viewingUserId: null }),

  startChatWithUser: (userId) => {
    if (userId === get().me.id) {
      set({ viewingUserId: null, mainTab: 'profile' });
      return;
    }
    const existing = get().chats.find((c) => c.type === 'dm' && c.peerId === userId);
    if (existing) {
      set({
        viewingUserId: null,
        mainTab: 'chats',
        activeChatId: existing.id,
      });
      return;
    }
    const user = get().users[userId];
    if (!user) return;
    const chat: Chat = {
      id: uid('c'),
      type: 'dm',
      title: user.displayName,
      preview: '',
      unread: 0,
      timeLabel: 'сейчас',
      online: user.online,
      peerId: userId,
    };
    set((s) => ({
      chats: [chat, ...s.chats],
      activeChatId: chat.id,
      mainTab: 'chats',
      viewingUserId: null,
    }));
  },

  setSearchQuery: (q) => set({ searchQuery: q }),
  setNewChatOpen: (v) => set({ newChatOpen: v }),
  setReplyTo: (id) => set({ replyToId: id, contextMenu: null }),

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

  sendMessage: (text) => {
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
    if (!offline) {
      window.setTimeout(() => {
        set((s) => ({
          messages: s.messages.map((m) =>
            m.id === id ? { ...m, status: 'sent' } : m
          ),
        }));
      }, 350);
      // light peer typing mock on send
      if (Math.random() > 0.55) {
        window.setTimeout(() => get().simulatePeerTyping(chatId), 600);
      }
    }
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
        ? MEDIA_PRESETS[Math.floor(Math.random() * MEDIA_PRESETS.length)]
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
}));

export { BANNERS, REACTION_SET };

import type { Chat, Message, Post, User } from '../shared/types';

export const BANNERS = {
  deep: 'linear-gradient(160deg, #000 0%, #1a1a1a 100%)',
  steel: 'linear-gradient(135deg, #0a0a0a 0%, #3a3a3a 100%)',
  fog: 'linear-gradient(135deg, #111 0%, #555 120%)',
  ink: 'linear-gradient(180deg, #000 0%, #2a2a2a 100%)',
};

export const ME: User = {
  id: 'u_me',
  username: 'nekach',
  displayName: 'Некач',
  phone: '+7 900 000-00-00',
  bio: 'Делаю Толк.',
  online: true,
  banner: BANNERS.deep,
};

export const USERS: Record<string, User> = {
  u_me: ME,
  u_2: {
    id: 'u_2',
    username: 'anya',
    displayName: 'Аня',
    bio: 'Дизайн · кофе',
    online: true,
    banner: BANNERS.steel,
  },
  u_3: {
    id: 'u_3',
    username: 'design_team',
    displayName: 'Design Team',
    bio: 'Группа',
    banner: BANNERS.ink,
  },
  u_4: {
    id: 'u_4',
    username: 'misha',
    displayName: 'Миша',
    bio: 'В дороге',
    online: false,
    banner: BANNERS.fog,
  },
  u_5: {
    id: 'u_5',
    username: 'kira',
    displayName: 'Кира',
    bio: 'Фото · путешествия',
    online: true,
    banner: BANNERS.steel,
  },
};

export const INITIAL_CHATS: Chat[] = [
  {
    id: 'c_1',
    type: 'dm',
    title: 'Аня',
    preview: 'Скинь ссылку на макеты',
    unread: 2,
    timeLabel: '10:42',
    online: true,
    peerId: 'u_2',
  },
  {
    id: 'c_2',
    type: 'group',
    title: 'Design Team',
    preview: 'Завтра созвон в 12',
    unread: 0,
    timeLabel: 'Вчера',
    pinned: true,
    peerId: 'u_3',
  },
  {
    id: 'c_3',
    type: 'dm',
    title: 'Миша',
    preview: '🎤 0:12',
    unread: 0,
    timeLabel: 'Пн',
    muted: true,
    peerId: 'u_4',
  },
];

const now = Date.now();

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm_1',
    chatId: 'c_1',
    senderId: 'u_2',
    kind: 'text',
    text: 'Привет! Видел новый макет Толк?',
    status: 'read',
    createdAt: now - 1000 * 60 * 30,
    reactions: { '🔥': ['u_me'] },
  },
  {
    id: 'm_2',
    chatId: 'c_1',
    senderId: 'u_me',
    kind: 'text',
    text: 'Да. Стена · Чаты · Профиль — так понятнее.',
    status: 'sent',
    createdAt: now - 1000 * 60 * 25,
    reactions: {},
  },
  {
    id: 'm_3',
    chatId: 'c_1',
    senderId: 'u_2',
    kind: 'text',
    text: 'Скинь ссылку на макеты',
    status: 'read',
    createdAt: now - 1000 * 60 * 5,
    reactions: {},
  },
  {
    id: 'm_4',
    chatId: 'c_3',
    senderId: 'u_4',
    kind: 'voice',
    text: 'Голосовое',
    durationSec: 12,
    status: 'read',
    createdAt: now - 1000 * 60 * 60 * 50,
    reactions: { '👍': ['u_me'] },
  },
  {
    id: 'm_5',
    chatId: 'c_2',
    senderId: 'u_3',
    kind: 'text',
    text: 'Завтра созвон в 12',
    status: 'read',
    createdAt: now - 1000 * 60 * 60 * 20,
    reactions: {},
  },
];

export const MEDIA_PRESETS = [
  {
    kind: 'color' as const,
    src: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 120%)',
    alt: 'gray',
  },
  {
    kind: 'color' as const,
    src: 'linear-gradient(135deg, #0d0d0d 0%, #2e2e2e 120%)',
    alt: 'ink',
  },
  {
    kind: 'color' as const,
    src: 'linear-gradient(160deg, #222 0%, #666 130%)',
    alt: 'steel',
  },
  {
    kind: 'color' as const,
    src: 'linear-gradient(180deg, #111 0%, #3a3a3a 100%)',
    alt: 'fog',
  },
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'p_1',
    authorId: 'u_2',
    text: 'Скетчу навигацию: стена · чаты · профиль. Без лишнего шума.',
    createdAt: now - 1000 * 60 * 40,
    origin: 'wall',
    onWall: true,
    likedBy: ['u_5'],
    comments: [
      {
        id: 'cm_1',
        userId: 'u_5',
        text: 'Чисто 🔥',
        createdAt: now - 1000 * 60 * 20,
      },
    ],
  },
  {
    id: 'p_2',
    authorId: 'u_5',
    text: 'Фото с поездки — сразу в стену.',
    createdAt: now - 1000 * 60 * 90,
    origin: 'wall',
    onWall: true,
    likedBy: ['u_2', 'u_me'],
    comments: [],
    media: MEDIA_PRESETS[1],
  },
  {
    id: 'p_3',
    authorId: 'u_4',
    text: 'В дороге. Отвечу вечером — лучше кружком, чем простынёй.',
    createdAt: now - 1000 * 60 * 60 * 5,
    origin: 'profile',
    onWall: true,
    likedBy: [],
    comments: [],
  },
  {
    id: 'p_4',
    authorId: 'u_me',
    text: 'Мой первый пост в профиле. Без стены — только здесь.',
    createdAt: now - 1000 * 60 * 60 * 8,
    origin: 'profile',
    onWall: false,
    likedBy: [],
    comments: [],
  },
  {
    id: 'p_5',
    authorId: 'u_2',
    text: 'Личный пост из профиля + «в стену». Так и задумано.',
    createdAt: now - 1000 * 60 * 15,
    origin: 'profile',
    onWall: true,
    likedBy: ['u_me'],
    comments: [],
    media: MEDIA_PRESETS[0],
  },
  {
    id: 'p_6',
    authorId: 'u_5',
    text: 'Закат. Минимум текста — максимум кадра.',
    createdAt: now - 1000 * 60 * 8,
    origin: 'wall',
    onWall: true,
    likedBy: ['u_2'],
    comments: [],
    media: MEDIA_PRESETS[3],
  },
];

/** Decorative patterns — emoji + words (visible, not pure black) */

export type PatternKind = 'emoji' | 'words' | 'mixed';

export interface DecorPattern {
  id: string;
  label: string;
  kind: PatternKind;
  base: string;
  items: string[];
  ink?: string;
  opacity?: number;
  size?: number;
  gap?: number;
  rotate?: number;
}

export const BANNER_PATTERNS: DecorPattern[] = [
  {
    id: 'coffee',
    label: 'Кофе',
    kind: 'emoji',
    base: 'linear-gradient(145deg, #2a1a12 0%, #5c3a22 55%, #c47a3a 130%)',
    items: ['☕', '🫘', '🥐', '✨', '🤎', '·'],
    opacity: 0.65,
    size: 24,
    gap: 12,
  },
  {
    id: 'night',
    label: 'Ночь',
    kind: 'emoji',
    base: 'linear-gradient(160deg, #12182e 0%, #243b6b 55%, #6ea8ff 130%)',
    items: ['🌙', '⭐', '✨', '🌌', '💫', '·'],
    opacity: 0.6,
    size: 22,
    gap: 12,
  },
  {
    id: 'mint_wave',
    label: 'Мята',
    kind: 'emoji',
    base: 'linear-gradient(135deg, #0d2e22 0%, #1a5c40 50%, #3dd68c 140%)',
    items: ['🌿', '🍃', '💚', '✦', '·', '✨'],
    opacity: 0.55,
    size: 22,
    gap: 12,
  },
  {
    id: 'words_tolk',
    label: 'Толк',
    kind: 'words',
    base: 'linear-gradient(160deg, #1a1530 0%, #2d2450 50%, #6b5cff 120%)',
    items: ['толк', 'свой', 'быстро', 'чисто', 'echo', 'стена', 'ok'],
    ink: 'rgba(255,255,255,0.22)',
    opacity: 1,
    size: 14,
    rotate: -12,
    gap: 14,
  },
  {
    id: 'travel',
    label: 'Путь',
    kind: 'emoji',
    base: 'linear-gradient(135deg, #142028 0%, #2a4a66 50%, #5ec8f0 140%)',
    items: ['✈️', '🗺️', '📷', '🌅', '🧳', '·'],
    opacity: 0.6,
    size: 24,
    gap: 12,
  },
  {
    id: 'party',
    label: 'Вайб',
    kind: 'mixed',
    base: 'linear-gradient(145deg, #2a1030 0%, #5a2060 50%, #e879f9 140%)',
    items: ['🎵', 'yo', '🔥', 'lol', '💜', '✦', '·'],
    opacity: 0.58,
    size: 20,
    gap: 12,
  },
  {
    id: 'work',
    label: 'Работа',
    kind: 'words',
    base: 'linear-gradient(160deg, #142018 0%, #1e3a2c 55%, #3d8f6a 120%)',
    items: ['focus', 'ship', 'MVP', 'sync', 'ok', 'build'],
    ink: 'rgba(255,255,255,0.2)',
    size: 13,
    rotate: -8,
    gap: 14,
  },
  {
    id: 'soft_peach',
    label: 'Закат',
    kind: 'emoji',
    base: 'linear-gradient(135deg, #2a1818 0%, #7a3040 45%, #ff9a7a 140%)',
    items: ['🍑', '☀️', '🌸', '·', '✨', '🧡'],
    opacity: 0.55,
    size: 22,
    gap: 12,
  },
];

export const CHAT_THEMES: DecorPattern[] = [
  {
    id: 'chat_dots',
    label: 'Точки',
    kind: 'emoji',
    base: 'linear-gradient(180deg, #14161c 0%, #1a1e28 100%)',
    items: ['·', '✦', '·', '∘', '·', '✧'],
    opacity: 0.35,
    size: 16,
    gap: 14,
  },
  {
    id: 'chat_mint',
    label: 'Мята',
    kind: 'emoji',
    base: 'linear-gradient(180deg, #101a16 0%, #162820 100%)',
    items: ['🌿', '·', '✦', '·', '🍃'],
    opacity: 0.28,
    size: 18,
    gap: 14,
  },
  {
    id: 'chat_hearts',
    label: 'Сердца',
    kind: 'emoji',
    base: 'linear-gradient(180deg, #1a1218 0%, #241820 100%)',
    items: ['♡', '·', '♡', '·', '✦'],
    opacity: 0.28,
    size: 16,
    gap: 14,
  },
  {
    id: 'chat_words',
    label: 'Текст',
    kind: 'words',
    base: 'linear-gradient(180deg, #141418 0%, #1a1a22 100%)',
    items: ['привет', 'ок', 'lol', 'да', 'ща', 'толк'],
    ink: 'rgba(255,255,255,0.1)',
    size: 12,
    rotate: -16,
    gap: 16,
  },
  {
    id: 'chat_stars',
    label: 'Звёзды',
    kind: 'emoji',
    base: 'linear-gradient(180deg, #10121c 0%, #181e32 100%)',
    items: ['✦', '·', '✧', '·', '⋆', '·'],
    opacity: 0.32,
    size: 14,
    gap: 12,
  },
  {
    id: 'chat_none',
    label: 'Чисто',
    kind: 'emoji',
    base: '#12141a',
    items: [],
    opacity: 0,
  },
];

export const MEDIA_PATTERNS: DecorPattern[] = [
  {
    id: 'm1',
    label: 'Фото',
    kind: 'emoji',
    base: 'linear-gradient(145deg, #1a3050 0%, #5eb8f0 120%)',
    items: ['📷', '🌊', '✨', '·'],
    opacity: 0.65,
    size: 30,
    gap: 14,
  },
  {
    id: 'm2',
    label: 'Еда',
    kind: 'emoji',
    base: 'linear-gradient(145deg, #3a2010 0%, #ff9a60 120%)',
    items: ['🍕', '✨', '🔥', '·'],
    opacity: 0.6,
    size: 30,
    gap: 14,
  },
  {
    id: 'm3',
    label: 'Музыка',
    kind: 'emoji',
    base: 'linear-gradient(145deg, #2a1848 0%, #c4a0ff 120%)',
    items: ['🎵', '💜', '✦', '·'],
    opacity: 0.6,
    size: 30,
    gap: 14,
  },
  {
    id: 'm4',
    label: 'Город',
    kind: 'words',
    base: 'linear-gradient(145deg, #1a2430 0%, #6a8494 120%)',
    items: ['city', 'night', 'walk', 'go'],
    ink: 'rgba(255,255,255,0.28)',
    size: 16,
    rotate: -10,
    gap: 16,
  },
];

/** Full-page ambient behind shell */
export const AMBIENT_PATTERN: DecorPattern = {
  id: 'ambient',
  label: 'ambient',
  kind: 'mixed',
  base: 'linear-gradient(165deg, #0e1018 0%, #151a28 40%, #1a2238 100%)',
  items: [
    'толк',
    '✦',
    'свой',
    '·',
    'echo',
    '💬',
    'чисто',
    '·',
    'стена',
    '✨',
    'ok',
    '·',
    'быстро',
    '∘',
  ],
  ink: 'rgba(255,255,255,0.09)',
  opacity: 1,
  size: 15,
  rotate: -12,
  gap: 20,
};

export function patternById(
  list: DecorPattern[],
  id: string | undefined,
  fallback = list[0]!
): DecorPattern {
  return list.find((p) => p.id === id) ?? fallback;
}

export function seedHash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

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

/**
 * Chat wallpapers — dark monochrome only (Visual Language 2026-07-15).
 * No mint / neon / colored gradients.
 */
export const DEFAULT_CHAT_THEME_ID = 'void';

/** Map pre-redesign ids so old localStorage / fixtures still resolve */
const LEGACY_CHAT_THEME: Record<string, string> = {
  chat_dots: 'graphite',
  chat_mint: 'ink',
  chat_hearts: 'ash',
  chat_words: 'tape',
  chat_stars: 'mono',
  chat_none: 'void',
  chat_geo: 'signal',
  chat_outline: 'mono',
  chat_minimalist: 'mesh',
};

export const CHAT_THEMES: DecorPattern[] = [
  {
    id: 'void',
    label: 'Пустота',
    kind: 'emoji',
    base: '#000000',
    items: [],
    opacity: 0,
  },
  {
    id: 'graphite',
    label: 'Графит',
    kind: 'emoji',
    base: 'linear-gradient(180deg, #000000 0%, #0a0a0a 55%, #111111 100%)',
    items: ['·', '·', '∘', '·'],
    ink: 'rgba(255,255,255,0.055)',
    opacity: 0.45,
    size: 11,
    gap: 20,
  },
  {
    id: 'mesh',
    label: 'Сетка',
    kind: 'emoji',
    base: '#050505',
    items: ['·', '·', '·', '·', '·'],
    ink: 'rgba(245,245,245,0.045)',
    opacity: 0.55,
    size: 8,
    gap: 11,
  },
  {
    id: 'ink',
    label: 'Чернила',
    kind: 'words',
    base: 'linear-gradient(165deg, #000000 0%, #0c0c0c 100%)',
    items: ['толк', 'echo', '·', 'чисто', 'ok', '·'],
    ink: 'rgba(245,245,245,0.055)',
    size: 11,
    rotate: -14,
    gap: 18,
  },
  {
    id: 'ash',
    label: 'Пепел',
    kind: 'emoji',
    base: 'linear-gradient(180deg, #0a0a0a 0%, #141414 100%)',
    items: ['·', '—', '·', '·'],
    ink: 'rgba(255,255,255,0.065)',
    opacity: 0.42,
    size: 12,
    gap: 17,
  },
  {
    id: 'signal',
    label: 'Сигнал',
    kind: 'emoji',
    base: '#000000',
    items: ['│', '·', '─', '·', '│', '·'],
    ink: 'rgba(245,245,245,0.065)',
    opacity: 0.48,
    size: 13,
    gap: 22,
  },
  {
    id: 'mono',
    label: 'Моно',
    kind: 'emoji',
    base: 'linear-gradient(160deg, #000000 0%, #111111 100%)',
    items: ['○', '·', '□', '·', '◇'],
    ink: 'rgba(255,255,255,0.07)',
    opacity: 0.42,
    size: 13,
    gap: 16,
  },
  {
    id: 'tape',
    label: 'Лента',
    kind: 'words',
    base: '#080808',
    items: ['написать', '·', 'слушать', '·', 'тихо', '·'],
    ink: 'rgba(163,163,163,0.11)',
    size: 11,
    rotate: -8,
    gap: 20,
  },
  {
    id: 'lift',
    label: 'Лифт',
    kind: 'emoji',
    base: 'linear-gradient(180deg, #111111 0%, #0a0a0a 45%, #000000 100%)',
    items: ['·', '·', '∘'],
    ink: 'rgba(255,255,255,0.04)',
    opacity: 0.35,
    size: 11,
    gap: 24,
  },
  {
    id: 'slash',
    label: 'Штрих',
    kind: 'emoji',
    base: 'linear-gradient(145deg, #000000 0%, #0d0d0d 100%)',
    items: ['/', '·', '/', '·', '·'],
    ink: 'rgba(245,245,245,0.05)',
    opacity: 0.4,
    size: 14,
    rotate: -28,
    gap: 18,
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

/** Full-page ambient behind shell (auth) — monochrome */
export const AMBIENT_PATTERN: DecorPattern = {
  id: 'ambient',
  label: 'ambient',
  kind: 'mixed',
  base: 'linear-gradient(165deg, #000000 0%, #0a0a0a 50%, #111111 100%)',
  items: ['толк', '·', 'echo', '·', 'чисто', '·', 'ok', '∘'],
  ink: 'rgba(245,245,245,0.06)',
  opacity: 1,
  size: 14,
  rotate: -12,
  gap: 22,
};

export function resolveChatThemeId(id: string | undefined): string {
  if (!id) return DEFAULT_CHAT_THEME_ID;
  if (LEGACY_CHAT_THEME[id]) return LEGACY_CHAT_THEME[id]!;
  if (CHAT_THEMES.some((t) => t.id === id)) return id;
  return DEFAULT_CHAT_THEME_ID;
}

export function patternById(
  list: DecorPattern[],
  id: string | undefined,
  fallback = list[0]!
): DecorPattern {
  if (id) {
    const direct = list.find((p) => p.id === id);
    if (direct) return direct;
    const legacy = LEGACY_CHAT_THEME[id];
    if (legacy) {
      const mapped = list.find((p) => p.id === legacy);
      if (mapped) return mapped;
    }
  }
  return fallback;
}

export function seedHash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function generateCustomPattern(inputText: string, seed: string): DecorPattern {
  const words = inputText.trim().split(/\s+/).filter(Boolean);
  const items = words.length > 0 ? words : ['✦'];
  
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  h = Math.abs(h);

  const hue = h % 360;
  const sat = 45 + (h % 30);
  const light = 12 + (h % 12);
  const baseColor = `linear-gradient(135deg, hsl(${hue}, ${sat}%, ${light}%) 0%, hsl(${(hue + 45) % 360}, ${sat}%, ${light + 8}%) 100%)`;
  const inkColor = `hsla(${(hue + 25) % 360}, ${sat}%, 80%, 0.28)`;
  
  const isEmojiPattern = /\p{Emoji}/u.test(inputText) || /[\uD800-\uDFFF]/.test(inputText);

  return {
    id: 'custom',
    label: 'Custom Pattern',
    kind: isEmojiPattern ? 'emoji' : 'words',
    base: baseColor,
    ink: inkColor,
    items: items,
    opacity: isEmojiPattern ? 0.45 : 1.0,
    size: isEmojiPattern ? 28 : 14,
    rotate: isEmojiPattern ? 15 : -10,
    gap: isEmojiPattern ? 14 : 16
  };
}

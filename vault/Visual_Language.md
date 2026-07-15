---
tags: [tolk, design, tokens]
status: ready
updated: 2026-07-15
audience: [design, developer]
---
# Visual Language

Тёмный, плотный, современный. Не госуслуги, не неоновый казино.  
Glass — только на панелях, не на каждом бабле.

## Dark monochrome (2026-07-15)
Минимализм = **чёрно-белая** палитра. Цветные акценты (mint/ice) сняты с UI.

| Token | Value | Role |
|---|---|---|
| `bg` | `#000000` | Фон |
| `bg.elevated` | `#111111` | Поверхности |
| `text.primary` | `#F5F5F5` | Текст / CTA fill |
| `text.secondary` | `#A3A3A3` | Мета |
| `text.tertiary` | `#737373` | Hint |
| `accent` | `#F5F5F5` | Primary action (white) |
| `text.onAccent` | `#0A0A0A` | На белой кнопке |
| `border.subtle` | `rgba(255,255,255,0.1)` | Hairlines |

## Layout
Лента стены/профиля — **hairline dividers**, не карточки (как X).  
Чаты: list rows + bubbles, без цветного chrome.

## Radius
CTA / FAB / inputs — pill.  
Медиа — ~16.  
Bubbles ~18.

## Type
Inter / system. 12 meta · 15 body · 18–22 title.

## Icons
**lucide-react** only.  
Единый stroke `1.75` (`shared/ui/icons.ts` + `svg.lucide` CSS).  
Sizes: 16 / 20 / 22 / 24.

<- [[Design_System]]

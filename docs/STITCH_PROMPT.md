# Google Stitch — промпты на дизайн Tolk

Используй в [Google Stitch](https://stitch.withgoogle.com) (или аналоге).  
Сначала **Master prompt**, потом отдельные **Screen prompts** при необходимости.

---

## Master prompt (вставить целиком)

```
Design a complete mobile UI kit and key screens for "Tolk" — a minimalist messenger for Russian-speaking users (teens to age 40). NOT a Telegram/MAX clone. Clean, fast, modern dark product — not government-app aesthetics, not neon crypto casino.

PRODUCT IN ONE LINE
Fast, clean messenger people choose to use. Real utility ("tolk"), no feature spam, no forced adoption vibes.

CORE UX MODEL (spatial, no bottom tab bar)
Three full-width columns you swipe between:
1) Chat list
2) Open chat
3) Chat Wall (per-conversation media/pins shelf — NOT a global social feed, NOT Stories)

Also: profile as a bottom sheet / push screen, not a fourth tab.

MUST-HAVE SCREENS (generate as a coherent set, same visual language)
A. Auth — phone number entry (+7 default), OTP code, then name + @username setup (avatar optional skip)
B. Chat list — avatars, last message preview, time, quiet unread badges, pin/mute affordances; top: search + compose; settings via avatar/gear (visible, not hidden)
C. Empty chat list state — short CTA to invite / start chat (no recommended channels ads)
D. 1:1 chat — message bubbles, composer with attach + mic + send; subtle mode toggle Ordinary | Echo; long-press message context: Reply, Forward, Pin to Wall, Copy, Delete
E. Group chat — same chrome + group title/avatar
F. Chat Wall — grid/list of pinned photos & posts for THIS chat only; empty state: "Long-press a message → Pin to Wall"; card has "Jump to chat"
G. Echo indicator — compact glowing mint orb/pill on chat edge with ×N stack badge; NOT a loud banner; sheet overlay when opened (PiP-like, doesn't leave current context)
H. Settings hub — grouped list: Account, Devices/Sessions, Notifications, Appearance, Privacy, Data & storage, About, Log out
I. Notifications settings — master toggle, sound, preview text, Echo notifications OFF by default / quiet
J. Profile sheet — avatar, name, @username, Write button, shared media strip
K. New group / invite — member pick + title; share link/QR moment
L. Search — people, chats, messages sections

VISUAL SYSTEM (strict tokens)
- Background deep: #0B0B0C
- Elevated surfaces: #141416
- Glass panels (headers/sheets only): rgba(26,26,30,0.72) with 1px border rgba(255,255,255,0.08); blur ~16–20px, not on every bubble
- Text primary: #F2F2F3
- Text secondary: #8E8E93
- Accent mint: #00E676 (online, active Echo, success)
- Accent ice: #00B0FF (links, jump-to-message highlight)
- Danger: #FF453A
- Radii: messages ~18–20px, cards/sheets 24px, buttons 14px
- Typography: system-like SF/Roboto; 13 meta, 15–16 body, 17–20 titles
- Icons: single outline set, 1.5–2px stroke, no mixed icon styles
- Density: content > chrome; max ~3–4 primary actions on chat list
- Dark theme primary. High contrast. OLED-friendly (not pure #000 only — use #0B0B0C)

INTERACTION CUES TO SHOW IN MOCKS
- No 5-tab bottom bar
- Swipe hints between Chat and Wall (subtle)
- Long-press menus instead of ⋯ everywhere
- Echo = quiet delivery, not Stories rings
- Wall = scrapbook shelf for the conversation, not Instagram grid with likes (NO like counters)

TONE OF UI COPY (Russian)
Short, dry, natural RU: «На стену», «Echo», «Написать», «Выйти», «Очистить кэш», «Нет сети». No corporate fluff, no patriotic slogans, no "we care about your feelings".

DO NOT DESIGN
- Public discover feed / algorithm timeline
- Stories
- Mini-apps marketplace
- Ads inside chats
- Red FOMO badge spam
- Feature-clone Telegram layout with folders + endless icons
- Over-glassmorphism on every surface
- Skeuomorphic ear-whisper gimmicks

OUTPUT
1) Mobile frames (iPhone-class + note Android density) for screens A–L
2) Component sheet: bubbles, list rows, buttons, inputs, sheets, empty states, Echo chip, Wall card
3) Light annotations of gestures (swipe to Wall, long-press)
Make it look shippable and product-serious — impress with clarity and product logic, not decorative fluff.
```

---

## Screen prompts (уточнения)

### 1) Chat list
```
Tolk chat list screen, dark #0B0B0C, minimal. Rows: avatar, title, last message, time, soft unread pill. Pinned section top. Header: Tolk wordmark or empty, search icon, compose. Profile avatar opens settings. No bottom tabs. Russian UI labels. Mint accent sparingly for online dots only.
```

### 2) Chat + composer + Echo
```
Tolk 1:1 chat, dark minimal messenger. Bubbles radius 18–20. Composer: attach, text field, mic, send. Show segmented control or subtle toggle "Обычное | Echo". One message long-press menu overlay: Ответить, Переслать, На стену, Копировать, Удалить. Edge mint Echo waiting chip with badge ×3. No tab bar. Russian copy.
```

### 3) Chat Wall
```
Tolk Chat Wall for a single conversation — not social feed. Dark grid of photo pins and short text pins. Top bar: chat name, back to chat. Card footer button "В чат". Empty state wireframe grid + text: «Долгое нажатие на сообщение → На стену». No likes. Accent ice for links only.
```

### 4) Auth
```
Tolk auth flow three screens: (1) phone +7, (2) OTP 6 digits, (3) name + @username + skip avatar. Dark minimal, large readable fields, one primary mint CTA per screen. No onboarding carousel of values. Russian labels.
```

### 5) Settings
```
Tolk settings hub, inset grouped list on dark elevated cards. Sections: Аккаунт, Уведомления, Оформление, Конфиденциальность, Данные и память, О приложении, Выйти (danger). Clean Material/iOS hybrid but consistent Tolk tokens. No ads, no recommended channels.
```

### 6) Profile sheet
```
Tolk profile bottom sheet: large avatar, name, @username, primary button «Написать», horizontal shared media strip. Dark glass sheet rgba(26,26,30,0.72). Minimal, not Instagram profile.
```

---

## Negative prompt (если Stitch/инструмент поддерживает)

```
telegram clone, max messenger clone, bottom tab bar with 5 tabs, stories rings, like counters, algorithmic feed, ads in chat, neon cyberpunk, government portal UI, skeuomorphism, cluttered icons, light-only theme, lorem ipsum english corporate wellness copy, stock illustration onboarding 8 screens
```

---

## Порядок работы в Stitch
1. Вставить **Master prompt** → получить систему + ключевые экраны  
2. Добить слабые экраны **Screen prompts** 1–6  
3. Просить: *«same design system, export components consistent with previous frames»*  
4. Сверять с `Visual_Language` / `Spatial_UI` из `TOLK_FULL_CONCEPT.md`

---

## Чеклист приёмки дизайна
- [ ] Нет bottom tab bar  
- [ ] Есть связка Chat ↔ Wall  
- [ ] Echo выглядит тихо (не Stories)  
- [ ] Dark tokens совпадают (#0B0B0C, mint, ice)  
- [ ] RU-копирайт короткий  
- [ ] Settings не перегружен  
- [ ] 14–40: читаемо без «секретных» жестов без кнопок-дублей  

# Agent prompt — редизайн Tolk web (mobile + desktop)

Рабочая папка: `C:\Users\nekach\tolk`  
Dev: `npm run dev` · Build: `npm run build`

Скопируй блок **PROMPT** целиком первым сообщением агенту.

---

## PROMPT

```
Задача: полный визуальный + UX редизайн web-мессенджера Tolk.
Сделать единый design system и ДВА layout-а: mobile и desktop (уже есть useIsDesktop / breakpoints).

## Репо
- Root: C:\Users\nekach\tolk
- UI: apps/web/src (React 19, Vite, CSS modules, framer-motion, lucide-react, zustand, react-router-dom)
- Shell: features/shell/MainShell.tsx (+ BottomNav, SideNav, MainShell.module.css)
- Breakpoints: shared/theme/tokens + shared/lib/useMediaQuery.ts (useIsDesktop / useIsMobile)
- Product SoT: vault/ + docs/ (constraints.md, Visual_Language, Spatial, MVP)
- Visual SoT: vault/Visual_Language.md (dark monochrome 2026-07-15) — приоритет над старым mint/ice theme_spec

Не ломай mock store / fixtures без нужды. Redesign = layout, tokens, CSS, компоненты, motion. Flows (auth→list→chat→wall→settings) сохранить.

## Инструменты
1. codebase-memory MCP — index/list project, graph перед крупными правками
2. 21st MCP (server `21st`) — search_tool → use_tool для UI-компонентов
3. CLI `21st` — search / get / add (free: мало get/day; не спамь get)
4. Skills: ui-ux-pro-max, ui-styling, design-system, 21st-cli-use, 21st-ai
5. Obsidian MCP если жив; иначе vault/ и docs/ с диска
6. ssh-mcp — только по явному запросу деплоя (не сейчас)

## Продукт (жёстко)
Tolk — минималистичный RU-мессенджер. Не Telegram / MAX / госуслуги / neon.
- Spatial: List ↔ Chat ↔ Wall. Profile/settings = sheet/overlay, не «ещё вкладка ради вкладки»
- Сейчас MainShell: SideNav + BottomNav + tabs — привести к концепту:
  - MOBILE: без тяжёлого bottom-tab chrome как у TG; list → open chat (fullscreen) → Wall swipe/кнопка; поиск/профиль — header/sheet
  - DESKTOP: SideNav (тонкий) + 2–3 колонки (list | chat | wall optional), keyboard «/» = search
- P0: Chat Wall (полка ЭТОГО чата), Echoes (тихий chip ×N)
- Нет: algorithmic feed, Stories, ads, red FOMO spam
- Copy RU: коротко («На стену», «Echo», «Написать», «Выйти»)

## Visual tokens (применить везде)
bg #000 · elevated #111 · text #F5F5F5 / #A3A3A3 / #737373
accent = white CTA #F5F5F5 · onAccent #0A0A0A · border rgba(255,255,255,0.1)
radius: bubbles ~18 · media ~16 · CTA/inputs pill
type: Inter/system 12 / 15 / 18–22
icons: lucide only, stroke 1.75
glass только headers/sheets; лента wall/profile = hairline dividers, не карточки

## Responsive — ОБЯЗАТЕЛЬНО оба варианта

### Mobile (< tablet breakpoint)
- Safe areas (notch/home indicator)
- Chat list на весь экран; open chat = stack (назад в список)
- Wall: из chat swipe / header entry, не отдельная «вкладка стены» как 4-й tab без контекста
- Bottom chrome: максимум 1 тонкая bar ИЛИ context actions — не 4–5 иконок как TG; лучше header + sheets
- Touch targets ≥44px; sheets bottom-sheet style
- Composer sticky bottom; keyboard-friendly
- Нет SideNav на mobile (или collapse)

### Desktop (≥ tablet)
- SideNav rail + workspace
- chatsLayout: listCol | chatCol (и wall как 3-я колонка / split когда open)
- Hover states, denser rows, keyboard shortcuts (/, Esc close sheets)
- Empty chat column: «Выберите чат» (RU, dry)
- Wide: не растягивать bubbles на всю ширину (max-width ~560–640)

Проверяй оба: resize + useIsDesktop path в MainShell. Не «только mobile CSS».

## Scope (порядок)
1. Audit: MainShell, BottomNav, SideNav, tokens, index.css — что ломает концепт
2. Design tokens → CSS variables + shared tokens; прогнать .module.css
3. Shell redesign mobile + desktop
4. Auth
5. Chat list + empty + search
6. Chat panel: bubbles, composer, echo toggle, context menu
7. Wall + Echo chip/sheet
8. Settings / profile / peer sheets
9. Attach/new-chat/reactions sheets — единый стиль
10. Offline banner, toast, motion (prefers-reduced-motion)
11. npm run build — fix TS/CSS
12. Summary: mobile vs desktop IA + список файлов

## Do NOT
- Клонировать Telegram (folders, endless header icons, 5 tabs)
- Public discover feed / Stories
- Коммитить секреты / API keys
- Переписывать backend
- Делать redesign только под один breakpoint

## Start
1) Прочитай vault/Visual_Language.md + docs/constraints.md + MainShell + tokens
2) codebase-memory map UI
3) План 6–8 шагов (mobile vs desktop явно)
4) Кодь, начиная с tokens + shell
5) После shell — auth/list/chat; 21st для сложных кусков точечно
```

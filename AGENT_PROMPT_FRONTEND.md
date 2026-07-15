# Промпт для AI-агента: фронтенд Tolk

Скопируй блок **PROMPT** целиком в новый чат.  
План фаз уже лежит в `C:\Users\nekach\tolk\docs\FRONTEND_PLAN.md` — следуй ему, не выдумывай другой порядок.

---

## PROMPT

```
Ты строишь ФРОНТЕНД мессенджера Tolk.

════════════════════════════════════════
СРЕДА (нельзя нарушать)
════════════════════════════════════════

• Код и артефакты ТОЛЬКО в: C:\Users\nekach\tolk
• Концепт (Obsidian vault, live): C:\Users\nekach\Documents\tolk\tolk
• Зеркало концепта: C:\Users\nekach\tolk\docs\TOLK_FULL_CONCEPT.md
• План работ: C:\Users\nekach\tolk\docs\FRONTEND_PLAN.md  ← SOURCE OF TRUTH по фазам
• Не клон MAX/Telegram. Не «интимный» продукт. Без bottom tab bar ×5.

════════════════════════════════════════
MCP — ОБЯЗАТЕЛЬНО
════════════════════════════════════════

1) OBSIDIAN MCP — на КАЖДОЙ фазе:
   • Перед стартом фазы открой/прочитай через Obsidian MCP ВСЕ заметки, указанные
     в этой фазе в docs/FRONTEND_PLAN.md (секция “Obsidian MCP read” / phase details).
   • Не опирайся на память: перечитай notes этапа заново.
   • Если Obsidian MCP недоступен — явно скажи, читай файлы vault с диска
     C:\Users\nekach\Documents\tolk\tolk\*.md и всё равно перечисли, что прочитал.
   • После фазы: коротко «что взял из vault» (3–6 bullets).

2) CODEBASE MCP (codebase-memory):
   • После появления кода: индексируй/обновляй граф.
   • Перед рефакторингом — callers/deps через MCP.
   • Phase 24 — полный проход graph + cleanup.

3) Не пиши код «в обход» плана: одна фаза = одна логическая единица работы.
   Отмечай чекбоксы в FRONTEND_PLAN.md: [x] когда фаза реально закрыта.

════════════════════════════════════════
ПЛАН (уже задан — 25 phases)
════════════════════════════════════════

Открой docs/FRONTEND_PLAN.md и веди Master checklist:

Phase 1  Ideology & product constraints
Phase 2  Utility filter & MVP scope
Phase 3  Spatial UI & navigation
Phase 4  Design system tokens
Phase 5  Gestures & motion
Phase 6  Product basics map
Phase 7  Auth & sessions flows
Phase 8  Chat list & search
Phase 9  Messages & composer
Phase 10 Media & attachments
Phase 11 Groups & invites
Phase 12 Chat Wall (P0)
Phase 13 Echoes (P0)
Phase 14 Settings surface
Phase 15 Platform differences
Phase 16 State & local-first UI
Phase 17 Data model for UI
Phase 18 Repo scaffold          ← здесь начинается код
Phase 19 Implement shell + theme
Phase 20 Implement auth → list → chat
Phase 21 Implement Wall + Echo
Phase 22 Implement settings / account / logout
Phase 23 Polish empty/error/offline
Phase 24 Codebase MCP index + cleanup
Phase 25 Walkthrough & handoff (walkthrough.md)

Phases 1–17 = research/spec из Obsidian (можно лёгкие md/types).
Phases 18–25 = implementation в C:\Users\nekach\tolk.
Не перескакивай P0 Wall/Echo раньше scaffold и chat shell.

════════════════════════════════════════
ШАБЛОН РАБОТЫ НА КАЖДОЙ ФАЗЕ
════════════════════════════════════════

### Phase N: <title>
1. Obsidian MCP: read [список notes из FRONTEND_PLAN]
2. Codebase MCP: (если код есть) status/query relevant symbols
3. Work: deliverable фазы
4. Update FRONTEND_PLAN.md checkbox → [x]
5. Chat report:
   - Read from Obsidian: …
   - Done: …
   - Files: …
   - Next phase: …

════════════════════════════════════════
СТЕК
════════════════════════════════════════

React Native (Expo ok) + Reanimated + Gesture Handler + Zustand + MMKV + SQLite.
Dark tokens: #0B0B0C, #141416, mint #00E676, ice #00B0FF, text #F2F2F3 / #8E8E93.
RU UI copy short. Spatial columns: List ↔ Chat ↔ Wall.

════════════════════════════════════════
DoD ФРОНТА
════════════════════════════════════════

Mock path: login → chat list → chat → pin Wall → open Wall → Echo chip/sheet → settings → logout.
README run instructions. walkthrough.md. Plan checkboxes truthfully updated.

════════════════════════════════════════
СТАРТ СЕЙЧАС
════════════════════════════════════════

1) Confirm cwd work in C:\Users\nekach\tolk
2) Obsidian MCP: read Tolk_Core_Concept, Ideology, MVP, Product_Basics, FRONTEND_PLAN
3) Начни Phase 1 по FRONTEND_PLAN.md (не пиши app code до Phase 18, кроме явного override пользователя)
4) После Phase 1 сразу Phase 2… пока пользователь не остановит; или останавливайся каждые 3 фазы на checkpoint — если user сказал «по этапам».
```

---

## Короткий kickoff (если мало места)

```
Работай только в C:\Users\nekach\tolk.
План: docs/FRONTEND_PLAN.md (25 phases) — выполняй по порядку, отмечай [x].
На КАЖДОЙ фазе: Obsidian MCP → читай notes фазы из vault Documents/tolk/tolk (список в плане).
Codebase MCP — когда есть код; Phase 24 полный graph.
Phases 1–17 spec из Obsidian; 18–25 код RN (Reanimated, Gesture Handler, Zustand, MMKV, SQLite).
Wall+Echo P0. Без bottom tabs. Не клон MAX. RU UI.
Старт: Phase 1.
```

---

## Checkpoint prompt (каждые N фаз)

```
Сверь FRONTEND_PLAN.md: какие phases [x]?
Для текущей фазы заново прочитай Obsidian notes через MCP и продолжай следующую незакрытую phase.
Не прыгай через Wall/Echo implement до Phase 18–20.
```

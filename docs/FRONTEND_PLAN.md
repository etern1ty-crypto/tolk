# Tolk Frontend — Execution Plan

**Working dir:** `C:\Users\nekach\tolk`  
**Concept SoT (Obsidian vault):** `C:\Users\nekach\Documents\tolk\tolk`  
**Also mirrored:** `C:\Users\nekach\tolk\docs\TOLK_FULL_CONCEPT.md`

Legend: `[ ]` todo · `[~]` in progress · `[x]` done

---

## Master checklist (20+ phases)

- [x] **Phase 1: Ideology & product constraints** — read Obsidian, freeze non-goals (no MAX clone, no intimacy frame, no bottom tabs)
- [x] **Phase 2: Utility filter & MVP scope** — map Must/Should/Could/Won't → frontend tickets
- [x] **Phase 3: Spatial UI & navigation model** — columns List ↔ Chat ↔ Wall; no tab bar
- [x] **Phase 4: Design system tokens** — colors, type, radius, glass rules
- [x] **Phase 5: Gestures & motion** — swipe thresholds, long-press, reduce motion
- [x] **Phase 6: Product basics map** — auth, settings, list, messages catalog from vault
- [x] **Phase 7: Auth & sessions flows** — phone/OTP/profile, logout, devices
- [x] **Phase 8: Chat list & search UX** — rows, pin/mute, empty states
- [x] **Phase 9: Messages & composer** — reply/forward/delete, typing, fail/retry
- [x] **Phase 10: Media & attachments** — picker, preview, voice, auto-download policy UI
- [x] **Phase 11: Groups & invites** — create group, invite link/QR entry points
- [x] **Phase 12: Chat Wall (P0)** — pin, wall feed, jump-to-message
- [x] **Phase 13: Echoes (P0)** — send mode, chip ×N, quiet sheet
- [x] **Phase 14: Settings surface** — hub + notifications + appearance + privacy + storage
- [x] **Phase 15: Platform differences** — iOS vs Android nav, permissions, notification channels
- [x] **Phase 16: State & local-first UI** — Zustand, MMKV, SQLite boundaries, outbox states
- [x] **Phase 17: Data model for UI** — entities User/Chat/Message/WallItem/Echo fixtures
- [x] **Phase 18: Repo scaffold** — monorepo/app, theme package, entry, gitignore, README
- [x] **Phase 19: Implement shell + theme** — AppShell, tokens, column pager skeleton
- [x] **Phase 20: Implement auth → list → chat** — end-to-end mock happy path
- [x] **Phase 21: Implement Wall + Echo** — P0 differentiators wired
- [x] **Phase 22: Implement settings / account / logout** — product hygiene complete
- [x] **Phase 23: Polish empty/error/offline** — RU copy, a11y, safe areas
- [x] **Phase 24: Codebase MCP index + cleanup** — graph, dead code, structure check
- [x] **Phase 25: Walkthrough & handoff** — update `walkthrough.md`, run instructions, demo script

---

## Phase details (Obsidian MCP required each phase)

### Rule (every phase)
1. **Obsidian MCP:** open/search/read vault notes listed for the phase (prefer live vault `Documents/tolk/tolk`).  
2. Do **not** invent product behavior that contradicts those notes.  
3. After phase work: mark checkbox `[x]`, note files touched, 3–5 line summary.  
4. **Codebase MCP:** when code exists — query graph before refactors; refresh after structural changes.  
5. Code and artifacts only under `C:\Users\nekach\tolk`.

---

### Phase 1: Ideology & product constraints
**Obsidian MCP read:** `Tolk_Core_Concept` · `Ideology` · `Absolute_Minimalism` · `Competition` · `True_Utility`  
**Deliverable:** `docs/constraints.md` (bullet non-goals + tone)  
**Exit:** team agrees “no intimacy / no MAX clone / minimal chrome”

### Phase 2: Utility filter & MVP scope
**Obsidian:** `MVP` · `True_Utility` · `Novel_Mechanics` · `Open_Questions` · `Demo`  
**Deliverable:** ticket table Must UI screens  
**Exit:** screen list frozen for v1 frontend

### Phase 3: Spatial UI & navigation model
**Obsidian:** `Spatial_UI` · `Gesture_Mapping` · `Design_System` · `Chat_List`  
**Deliverable:** nav diagram in plan + route names  
**Exit:** no bottom tabs in architecture

### Phase 4: Design system tokens
**Obsidian:** `Visual_Language` · `Design_System` · `Appearance_Settings` · `Structure_of_a_Post`  
**Deliverable:** `src/theme/tokens.ts` (or packages/ui) spec in plan  
**Exit:** hex/radius/type table copied into code constants in Phase 19

### Phase 5: Gestures & motion
**Obsidian:** `Gesture_Mapping` · `Micro_Animations` · `Spatial_UI`  
**Deliverable:** gesture collision rules doc snippet  
**Exit:** 40% / 800px/s + long-press 300ms documented for impl

### Phase 6: Product basics map
**Obsidian:** `Product_Basics` (+ hub children list) · `Settings` · `Permissions`  
**Deliverable:** IA tree of settings/chat entry points  
**Exit:** every basic flow has a target screen id

### Phase 7: Auth & sessions flows
**Obsidian:** `Registration_and_Auth` · `Sessions_and_Logout` · `Account` · `Privacy`  
**Deliverable:** userflow mermaid phone→OTP→profile; logout wipe rules  
**Exit:** mock auth can be implemented without questions

### Phase 8: Chat list & search
**Obsidian:** `Chat_List` · `Search` · `Absolute_Minimalism` · `Invites_and_Contacts`  
**Deliverable:** list row component spec  
**Exit:** empty state + pin/mute actions defined

### Phase 9: Messages & composer
**Obsidian:** `Messages_Basics` · `Live_Thoughts` · `Sync` (status UX only)  
**Deliverable:** message menu actions + delivery states  
**Exit:** reply/forward/pin/copy/delete in spec

### Phase 10: Media & attachments
**Obsidian:** `Media_Basics` · `Data_and_Storage` · `Permissions` · `Platform_Differences`  
**Deliverable:** attach sheet + auto-download UI policy  
**Exit:** voice + photo path clear

### Phase 11: Groups & invites
**Obsidian:** `Groups_Basics` · `Chat_Settings` · `Invites_and_Contacts` · `User_Engagement`  
**Deliverable:** create group + invite entry UI  
**Exit:** group wall permission assumption logged (`ASSUMPTIONS.md`)

### Phase 12: Chat Wall (P0)
**Obsidian:** `The_Chat_Wall` · `Structure_of_a_Post` · `Data_Graph` · `Messages_Basics`  
**Deliverable:** wall screen + pin flow wire  
**Exit:** jump-to-chat behavior specified

### Phase 13: Echoes (P0)
**Obsidian:** `Echoes` · `Notifications_Settings` · `Privacy` · `Micro_Animations`  
**Deliverable:** Echo toggle + chip + sheet wire  
**Exit:** default quiet push reflected in UI

### Phase 14: Settings surface
**Obsidian:** `Settings` · `Notifications_Settings` · `Appearance_Settings` · `Privacy_Settings` · `Data_and_Storage` · `About_and_Legal`  
**Deliverable:** settings routes list  
**Exit:** hub matches vault structure

### Phase 15: Platform differences
**Obsidian:** `Platform_Differences` · `Permissions` · `Notifications_Settings`  
**Deliverable:** iOS/Android checklist for QA  
**Exit:** back gesture + notification channels noted

### Phase 16: State & local-first UI
**Obsidian:** `Core_Architecture` · `Sync` · `For_Developers`  
**Deliverable:** state layer diagram (Zustand / MMKV / SQLite / mocks)  
**Exit:** outbox UI states named

### Phase 17: Data model for UI
**Obsidian:** `Data_Graph` · `Block_and_Report` · `Sessions_and_Logout`  
**Deliverable:** TypeScript types + mock fixtures outline  
**Exit:** WallItem & Echo types exist in plan/types

### Phase 18: Repo scaffold
**Obsidian:** `For_Developers` · `MVP` · `Core_Architecture`  
**Deliverable:** app boots; folder tree matches plan  
**Codebase MCP:** initial index after scaffold  
**Exit:** `README` install/run works

### Phase 19: Implement shell + theme
**Obsidian:** `Design_System` · `Visual_Language` · `Spatial_UI`  
**Deliverable:** tokens + column pager shell running  
**Exit:** dark bg #0B0B0C visible; 3 columns swipe mock

### Phase 20: Implement auth → list → chat
**Obsidian:** Phase 7–9 notes again via MCP before coding  
**Deliverable:** mock login → chats → send text  
**Exit:** happy path demoable

### Phase 21: Implement Wall + Echo
**Obsidian:** `The_Chat_Wall` · `Echoes` · `Demo`  
**Deliverable:** pin + wall + echo chip/sheet  
**Exit:** matches Demo 2-minute script beats

### Phase 22: Implement settings / account / logout
**Obsidian:** `Settings` · `Account` · `Sessions_and_Logout` · `Block_and_Report`  
**Deliverable:** settings hub + logout returns to auth  
**Exit:** account delete UI stub or full mock

### Phase 23: Polish empty/error/offline
**Obsidian:** `Absolute_Minimalism` · `User_Engagement` · `Sync`  
**Deliverable:** empty/error RU strings, offline banner  
**Exit:** no dead black screens without CTA

### Phase 24: Codebase MCP index + cleanup
**Tools:** codebase-memory MCP full pass  
**Deliverable:** structure report, remove dead stubs  
**Exit:** entrypoints listed; no orphan screens

### Phase 25: Walkthrough & handoff
**Obsidian:** `Demo` · `MVP` · `Tolk_Core_Concept`  
**Deliverable:** `walkthrough.md` + updated plan checkboxes  
**Exit:** outsider can run app and demo Wall+Echo in 2 minutes

---

## Obsidian note → phase index (quick)

| Notes | Phases |
|---|---|
| Tolk_Core_Concept, Ideology, Competition | 1, 25 |
| MVP, True_Utility, Novel_Mechanics, Demo | 2, 21, 25 |
| Spatial_UI, Gesture_Mapping, Micro_Animations | 3, 5, 19 |
| Visual_Language, Design_System | 4, 19 |
| Product_Basics → all basics children | 6–11, 14, 15, 22 |
| The_Chat_Wall, Structure_of_a_Post, Echoes | 12, 13, 21 |
| Core_Architecture, Sync, Data_Graph, For_Developers | 16–18, 24 |
| Privacy*, Notifications*, Platform_Differences | 13–15, 22 |

---

## Stack (locked for plan)

- React Native (Expo preferred unless blocked)
- Reanimated + Gesture Handler
- Zustand + MMKV + SQLite (UI-ready; mocks first)
- RU strings
- Path: **only** `C:\Users\nekach\tolk`

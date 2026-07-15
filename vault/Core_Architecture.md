---
tags: [tolk, architecture]
status: ready
updated: 2026-07-15
audience: [developer]
---
# Core Architecture

Надёжность и скорость важнее clever stack.  
Плохой LTE не должен ломать UX из‑за «красивой» схемы.

## Поверхности

```
[ Список чатов ]
       │
       ▼
[ Чат 1:1 / группа ] ←→ [ Полка ]     [[Chat_Shelf]]
       │
       ├── вложения / войсы / [[Whispers]] P2
       ├── [[Echoes]]
       └── [[Live_Thoughts]] P1

[ Профиль ] + [ Стена ]               [[Living_Profiles]] · [[User_Wall]]
       └── «Написать» → чат / общие медиа
```

Навигация → [[Spatial_UI]].  
Мелочи (auth, settings, list…) → [[Product_Basics]].  
Механики → [[Novel_Mechanics]].  
Онбординг eng → [[For_Developers]].

## Слои

```
┌─────────────────────────────────────┐
│ UI (RN / Reanimated / Gestures)     │
├─────────────────────────────────────┤
│ Client state (in-memory)            │  keyboard, live draft
├─────────────────────────────────────┤
│ Local DB + cache                    │  чаты, сообщения, полка, стена, outbox
├─────────────────────────────────────┤
│ Sync engine                         │  → [[Sync]]
├─────────────────────────────────────┤
│ Transport: HTTPS + WS (+RTC*)       │  *только Live Thoughts
├─────────────────────────────────────┤
│ Server: API, storage, push, media   │
└─────────────────────────────────────┘
```

## Клиент
| Слой | Выбор |
|---|---|
| UI | React Native |
| Motion | Reanimated + Gesture Handler |
| DB | SQLite |
| KV | MMKV (список чатов, session, cursors) |
| UI state | Zustand (не персистить эфемерное) |
| Media | disk cache + CDN |

На телефоне нет graph-DB. «Граф» = модель, физика = SQL → [[Data_Graph]].

## Сервер (MVP)
- API: REST или gRPC-web (один стиль)  
- Realtime: WebSocket  
- Media: object storage + CDN, chunked upload  
- Push: APNs / FCM; Echo — без sound по умолчанию  
- Auth: сессии + refresh; провайдер входа — open question  

## Фолбэки
**Сообщения / стена / echo:** local + outbox → optimistic UI → drain.  
**Live Thoughts:** RTC → TURN → WS → «печатает…».  
**Медиа:** placeholder + retry; progressive quality.

## Принципы
1. Local-first UX  
2. Сервер — арбитр порядка между устройствами  
3. Понятная деградация, не «пустой экран»  
4. P0 не зависит от WebRTC  

Связано: [[Sync]] · [[Data_Graph]] · [[Privacy]] · [[Risks]]

<- [[Tolk_Core_Concept]]

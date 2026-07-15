---
tags: [tolk, engineering, onboarding]
status: ready
updated: 2026-07-15
audience: [developer]
---
# For Developers

Онбординг за один проход. Если что-то не ясно — дыра в концепте, фиксим документ.

## С чего начать (90 минут)
1. [[Tolk_Core_Concept]] — зачем продукт  
2. [[MVP]] — что ship, что нет  
3. [[Product_Basics]] — мелочи (auth, settings, list, messages…) — **обязательно**  
4. [[Core_Architecture]] + [[Sync]] + [[Data_Graph]]  
5. P0: [[User_Wall]] · [[Chat_Shelf]] · [[Living_Profiles]] · [[Echoes]]  
6. UI: [[Spatial_UI]] · [[Gesture_Mapping]] · [[Visual_Language]] · [[Platform_Differences]]  
7. Connection: [[Backend_and_Frontend_Connect]] — интеграция фронтенда и бэкенда  
8. Deployment: [[Deploy_Tutorial]] — деплоймент туториал для продакшна  

Не начинать с Live Thoughts / Whispers / pulse, пока нет auth + send + list.

## Принципы инженерии
1. **Доставка > декорации**  
2. **Local-first UX** — UI не ждёт сеть на send  
3. **Idempotent API** — `client_id` на сообщениях  
4. **P0 без WebRTC**  
5. **Feature flags** — echo/shelf/wall/live можно выключить  
6. **Честный offline** — outbox виден (clock/error), не silent data loss  

Фичи только через [[True_Utility]] + статус в [[MVP]].

## Стек (ориентир, не религия)
| Слой | Выбор |
|---|---|
| Mobile | React Native |
| Motion/gestures | Reanimated + Gesture Handler |
| Local DB | SQLite |
| Fast KV | MMKV |
| Client state | Zustand (эфемерное) |
| API | HTTPS JSON или gRPC-web — один стиль |
| Realtime | WebSocket |
| Media | S3-compatible + CDN |
| Push | FCM + APNs |
| Server | На выбор команды (Go/Rust/Node) — важны контракты, не hype |

Смена стека допустима, если [[Sync]]-семантика сохраняется.

## Предлагаемая структура монорепо
```
/apps
  /web             # Vite React (есть)
  /mobile          # Expo RN (iOS+Android) — см. docs/MOBILE_PREP.md
  /api             # public API + ws gateway — см. docs/BACKEND_AGENT_PROMPT.md
  /worker          # media, push, outbox drain helpers
/packages
  /protocol        # OpenAPI + event types (есть skeleton)
  /ui-tokens       # optional shared tokens
/vault             # product SoT
/docs              # eng notes + agent prompts
```

## Контракты (минимум событий)
```
message.created | message.edited | message.deleted
shelf.pinned | shelf.unpinned
wall_post.created | wall_post.deleted
echo.created | echo.opened | echo.dismissed
receipt.read (optional)
presence.typing (classic)
```

Поля сообщения (логика):  
`client_id`, `server_id`, `chat_id`, `sender_id`, `seq`, `kind`, `payload`, `created_at`.

Полка: `shelf_item` → `message_id` + `sort_key` (не дубль файла).  
Стена: `wall_post` → `author_id` + text/media.  
Echo: отдельная сущность со `status`.

Детали → [[Data_Graph]].

## Порядок реализации (tickets-level)
| Sprint focus | Done means |
|---|---|
| **S0** [[Registration_and_Auth]] + session + 1:1 text + WS + local DB | Два клиента пишут offline-resilient |
| **S1** [[Media_Basics]] + [[Groups_Basics]] + push [[Notifications_Settings]] | Фото в группе, пуш |
| **S2** Outbox + [[Chat_List]] + [[Settings]] skeleton + logout | Дубли, reconnect, [[Sessions_and_Logout]] |
| **S3** Shelf + Profiles + Wall P0 | [[Chat_Shelf]] · [[Living_Profiles]] · [[User_Wall]] |
| **S4** Echo P0 | [[Echoes]] |
| **S5** Spatial UI + [[Platform_Differences]] polish | Колонны list↔chat↔shelf, permissions |
| **S6** Soft launch | [[Block_and_Report]], инвайты, crashlytics |

Критерии MVP → [[MVP]].

## Не agilе-театр
- Нет отдельного микросервиса на каждую сущность в день 1  
- Нет graph DB «потому что в доке слово graph»  
- Нет E2EE в первом релизе без multi-device design  
- Нет pixel-perfect glass на Android Go за счёт 20fps  

## Тестирование (минимум)
- Unit: outbox reducer, seq gap fill  
- Integration: two-device message race  
- E2E smoke: send, pin shelf, open profile wall, echo open  
- Device matrix: 1 mid Android + 1 recent iPhone  

## Где смотреть продуктовые edge-cases
| Тема | Узел |
|---|---|
| Фолбэки сети | [[Core_Architecture]], [[Live_Thoughts]] |
| Жесты vs карусель | [[Gesture_Mapping]] |
| Пуши | [[Echoes]], [[Privacy]] |
| Риски | [[Risks]] |

<- [[Tolk_Core_Concept]] · [[MVP]] · [[Core_Architecture]]

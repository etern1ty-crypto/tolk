---
tags: [tolk, data, model]
status: ready
updated: 2026-07-15
audience: [developer]
---
# Data Graph

MVP: Postgres + SQLite. Фронт сейчас — mock in-memory.

## Сущности
| | |
|---|---|
| `User` | id, username, display_name, avatar, bio, banner/theme |
| `Chat` / `Message` | как раньше + kind voice/circle |
| `Reaction` | message_id, user_id, emoji |
| `Post` | author_id, text, media?, origin wall\|profile, on_wall, created_at |
| `PostLike` | post_id, user_id |
| `PostComment` | post_id, user_id, text |
| `PostRepost` | post_id → new post on profile |
| `ShelfItem` | chat pin (secondary) |
| `Echo` | quiet delivery |

## Связи
```
User ──posts──► Post (on_wall? → Стена feed)
User ──member──► Chat ──messages──► Message ──reactions──► Reaction
```

<- [[Core_Architecture]] · [[User_Wall]] · [[Navigation_IA]]

---
tags: [tolk, architecture, sync]
status: ready
updated: 2026-07-15
audience: [developer]
---
# Sync

Сначала локально, потом сеть. Иначе мессенджер «глючный».

## Outbox
1. Запись в SQLite  
2. Optimistic UI  
3. Строка outbox (type, payload, retries)  
4. Worker шлёт при сети  
5. Ack → clear outbox, проставить seq/status  

Типы min: `send_message`, `edit`, `delete`, `pin_wall`, `unpin_wall`, `send_echo`, `ack_echo`, `read_cursor`.

## Inbox
- WS: `message.*`, `wall.*`, `echo.*`, `read.*`  
- Reconnect: catch-up `since_seq` / global cursor  
- Gap → догрузка диапазона, не «надеемся на WS»

## Multi-device
Один user — много Device.  
Read cursor и wall pins через сервер.  
Outbox per device; сервер идемпотентен по `client_id`.

## Конфликты
| Случай | Стратегия |
|---|---|
| Два порядка стены | LWW (MVP) |
| Edit vs delete | Delete wins |
| Дубль client_id | Idempotent upsert |
| Live draft | Не персистим |

## Медиа
Message `media_pending` → upload resume → `media_ready` → peer тянет thumb/full.  
UI send не ждёт полный upload (progress в пузыре).

## Метрики
Outbox lag p95 · deliver p95 · failed uploads · catch-up duration.

## RU-сеть
HTTPS + WS как база. Не вешать P0 на экзотический транспорт.  
Retry с jitter. Таймауты короткие.

<- [[Core_Architecture]] · [[Data_Graph]]

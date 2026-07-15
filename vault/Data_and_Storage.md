---
tags: [tolk, product, storage, media]
status: ready
updated: 2026-07-15
audience: [product, developer]
---
# Data & Storage

Место на диске и кэш — частая боль 14–40 на телефоне с 64–128 GB.

## Показ
Settings → **Данные и память**  
Строки: кэш медиа, размер БД (optional), «очистить кэш».

## Действия (Must)
| Действие | Поведение |
|---|---|
| Очистить кэш медиа | Удалить thumb/full cache; история, shelf и wall posts metadata остаются; media подтянется снова |
| Автозагрузка медиа | Wi‑Fi only / Wi‑Fi+cellular / never — см. [[Media_Basics]] |
| Экономия трафика | Сжимать upload preview — eng policy |

## Не в «очистить кэш»
Не удалять: сообщения, outbox, ключи сессии, shelf pins metadata, wall posts.  
Для «снести всё локально» — logout или clear app data OS.

## Лимиты (сервер / клиент)
| | MVP orientir |
|---|---|
| Макс. размер файла | зафиксировать (напр. 100–200 MB video later; photo smaller) |
| Voice length | обычный войс vs [[Whispers]] cap |
| Storage warning | если cache > N MB — soft prompt |

Связь cost → [[Business]] · [[Sync]] media pipeline.

## MVP checklist
- [ ] Clear cache  
- [ ] Auto-download policy  
- [ ] Show approximate cache size  

<- [[Settings]] · [[Media_Basics]] · [[Core_Architecture]]

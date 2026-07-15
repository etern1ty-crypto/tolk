---
tags: [tolk, ui, wall, shelf]
status: ready
updated: 2026-07-15
audience: [design, developer]
---
# Structure of a Post

Единица карточки для:
- **[[User_Wall|Стены]]** (пост профиля) — режим `wall`
- **[[Chat_Shelf|Полки]]** (закреп чата) — режим `shelf`

## Карточка
**Header:** аватар 24×24, имя, относительное время  

**Body text:** простой текст; >500 символов → «Ещё»  

**Body media:**  
- 1 — full width  
- 2–4 — сетка  
- 5+ — horizontal scroll; не конфликтует с уходом в чат ([[Gesture_Mapping]])  

**Footer:**  
- Нет лайков и публичных счётчиков  
- **shelf:** **В чат** — jump + подсветка `accent.ice`  
- **wall:** опционально «Написать» / Echo / переслать (без counters)  

## Данные
| Режим | Сущность | Смысл |
|---|---|---|
| shelf | `ShelfItem` → message_id | Ссылка на сообщение чата |
| wall | `WallPost` | Контент автора, не обязан быть message |

Не дублируем файл без нужды ([[Data_Graph]]).

## Визуал
Токены → [[Visual_Language]]. Контент важнее рамок.

<- [[User_Wall]] · [[Chat_Shelf]]

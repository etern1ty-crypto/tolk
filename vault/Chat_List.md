---
tags: [tolk, product, chat-list]
status: ready
updated: 2026-07-15
audience: [product, design, developer]
---
# Chat List

Главный экран. ≤ 4 явных действия ([[Absolute_Minimalism]]).

## Элемент строки
- Аватар, имя/title, last message preview, time  
- Unread badge (спокойный, не blood-FOMO)  
- Mute icon · pin · send fail indicator  
- Typing / online — optional subtle  

## Действия
| Действие | Как |
|---|---|
| Открыть чат | Tap |
| Новый чат | FAB / «+» → search user / create group |
| Поиск | Иконка → [[Search]] |
| Settings | Аватар / ⚙ → [[Settings]] |
| Pin | Long-press или swipe action |
| Mute | Long-press / swipe |
| Delete / hide chat | Long-press + confirm; history policy clear |
| Mark read | Long-press Should |

Swipe actions: платформенно привычные ([[Platform_Differences]]); не более 2–3 actions.

## Сортировка
Pinned сверху (порядок manual or pin-time).  
Остальные — last activity desc.  
Архив — Should/Could (не Must, если режем scope).

## Empty state
«Напишите первым» + кнопка найти / инвайт → [[Invites_and_Contacts]].  
Не реклама каналов.

## Multi-select
Could later. Не Must.

## Данные
Список из SQLite/MMKV fast path ([[Core_Architecture]] · [[Sync]]).

## MVP checklist
- [ ] Rows + unread + open  
- [ ] Pin, mute  
- [ ] New chat / new group entry  
- [ ] Search entry  
- [ ] Settings entry  

<- [[Product_Basics]] · [[Spatial_UI]] · [[MVP]]

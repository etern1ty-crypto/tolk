---
tags: [tolk, product, messages]
status: ready
updated: 2026-07-15
audience: [product, developer]
---
# Messages Basics

Пол вкладки **Чаты** ([[Navigation_IA]]).

## Отправка
| Kind | |
|---|---|
| Text | Enter/send; multiline |
| Media | [[Media_Basics]] |
| **Voice** | Hold mic; cancel swipe; waveform |
| **Circle** (video note) | Круглая запись «сейчас»; switch camera; flash; effects **hidden deep** |
| File | document picker |
| Echo mode | toggle → [[Echoes]] |

Optimistic UI + outbox → [[Sync]].

## Кружки (деталь)
- Легко и быстро начать запись  
- Переключение камер  
- Вспышка  
- Эффекты (blur, fun) — **сильно спрятаны** (не в primary chrome)  
Фронт mock до media pipeline.

## Реакции
Long-press / + → emoji strip.  
Кастомные смайлы — Should ([[Living_Profiles]] / settings).

## На сообщение (меню)
Reply · Copy · Forward · **На полку** ([[Chat_Shelf]]) · Delete · React  

## Статусы
Sending → sent → failed/retry.

## MVP checklist
- [x] Text send (web mock)  
- [ ] Voice UI mock  
- [ ] Circle UI mock  
- [ ] Reactions  
- [ ] Reply, forward, copy  
- [ ] Pin to shelf  
- [ ] Retry failed  

<- [[Product_Basics]] · [[Media_Basics]] · [[Navigation_IA]] · [[MVP]]

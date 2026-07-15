---
tags: [tolk, gestures, ux]
status: ready
updated: 2026-07-15
audience: [design, developer]
---
# Gesture Mapping

Жест = chrome. Если неочевидно — дублируем одной кнопкой.

## Карта MVP
| Жест | Где | Действие |
|---|---|---|
| Horizontal swipe | Колонны | Список ↔ чат ↔ [[Chat_Shelf]] |
| Long-press | Сообщение | Reply, forward, **на полку**, delete… |
| Long-press Send | Композер | Обычное / [[Echoes]] |
| Tap | Echo indicator | Sheet |
| Dismiss swipe | Echo sheet | Закрыть |
| Edge swipe | Stack | Назад (платформа) |

## Пороги колонн
Commit: `> 40%` width **или** velocity `> 800 px/s`.  
Иначе spring back ([[Micro_Animations]]).

## Конфликты
Карусель на полке: горизонталь внутри, на краю — жест родителя (уход в чат).  
Вертикальный скролл полки / стены профиля > диагональный увод.

## Haptic
Long-press ~300ms medium/heavy · snap light · send/pin light.  
Системный off уважаем.

## A11y
Критичные жесты имеют не-жестовый путь. 30–40 лет не обязаны знать «секреты».

<- [[Spatial_UI]] · [[Design_System]]

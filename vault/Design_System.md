---
tags: [tolk, design-system]
status: ready
updated: 2026-07-15
audience: [design, developer]
---
# Design System

Цель: **быстро понял, быстро сделал, не бесит**.  
Подростку не стыдно показать. 35-летнему не нужно учиться.

## Принципы
1. **Контент > хром**  
2. **Жест > меню** ([[Gesture_Mapping]]) — с кнопкой-дублем  
3. **Один акцент** — не радуга  
4. **60 fps или проще** — mid Android в приоритете  
5. **Reduce Motion** уважаем  

Связь: [[Absolute_Minimalism]].

## Узлы
| | |
|---|---|
| [[Spatial_UI]] | Список ↔ чат ↔ стена |
| [[Visual_Language]] | Цвета, тип, glass, радиусы |
| [[Gesture_Mapping]] | Пороги, конфликты, haptic |
| [[Micro_Animations]] | Spring presets, pulse Echo |

## Стек
RN + Reanimated + Gesture Handler.  
Токены — единый source (TS/JSON).

## MVP визуала
Dark primary. Light — Should.  
Кастомные пользовательские темы — Won't v1.

<- [[Tolk_Core_Concept]]

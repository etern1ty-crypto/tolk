---
tags: [tolk, product, appearance]
status: ready
updated: 2026-07-15
audience: [product, design]
---
# Appearance Settings

Как выглядит app. Токены → [[Visual_Language]].  
Не «20 тем из магазина» в MVP.

## Параметры
| Параметр | MVP | Default |
|---|---|---|
| Тема | Must: system / dark; Should: light | **Dark** или follow system |
| Follow system | Must | on optional |
| Размер текста | Should | system / medium; respect Dynamic Type iOS, font scale Android |
| Reduce Motion | Must respect OS | из OS [[Micro_Animations]] |
| Иконка app | Won't v1 | |

## Тема
- Dark — primary brand feel  
- Light — Should после стабильного dark  
- Auto — по OS appearance  

Смена темы: без перезапуска app, токены runtime.

## Чат-специфичные обои
Won't / Could later. Глобальный фон — не нужен для толка.

## Связь
Минимализм UI chrome → [[Absolute_Minimalism]].  
Контраст/a11y — не жертвуем ради glass.

<- [[Settings]] · [[Design_System]] · [[Platform_Differences]]

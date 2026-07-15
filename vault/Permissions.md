---
tags: [tolk, product, permissions]
status: ready
updated: 2026-07-15
audience: [product, developer]
---
# Permissions

Просим **в момент нужды**, не простынёй на первом экране.  
Платформенный UX → [[Platform_Differences]].

## Матрица
| Permission | Когда спрашиваем | Если denied |
|---|---|---|
| Notifications | После первого успешного чата или перед «включи, чтобы не пропустить» | App работает; badge in-list only; soft banner once |
| Camera | Тап «камера» в attach / avatar | Предложить галерею; deep link Settings |
| Microphone | Hold voice / [[Whispers]] | «Нет доступа к микрофону» + Settings |
| Photos / media | Attach / save | Photo picker limited; explain |
| Contacts | Явный «Найти друзей» | Skip; username/invite работают |
| Location | **Не просим** в MVP | — |

## Копирайт pre-prompt (Android rationale / iOS soft screen)
Одна строка зачем, без запугивания:  
«Уведомления — чтобы сообщения доходили, когда приложение закрыто.»

## Не делаем
- Все permission сразу после OTP  
- Повторный spam dialog каждый launch  
- Ложный «без контактов Tolk не работает»  

Связь: [[Registration_and_Auth]] · [[Media_Basics]] · [[Invites_and_Contacts]] · [[Notifications_Settings]]

<- [[Product_Basics]]

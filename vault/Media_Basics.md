---
tags: [tolk, product, media]
status: ready
updated: 2026-07-15
audience: [product, developer]
---
# Media Basics

Фото/видео/файлы — ежедневный use case 14–40.  
Стена — кураторство; здесь — **отправка и просмотр**.

## Attach sheet
Камера · Галерея (multi) · Файл · (позже: location no).  
Платформенные picker'ы → [[Platform_Differences]] · [[Permissions]].

## Перед отправкой
- Preview, compress quality (normal / higher)  
- Caption  
- Опция «и на полку»  
- Режим Echo  

## Автозагрузка ([[Data_and_Storage]])
| Политика | |
|---|---|
| Wi‑Fi only | default sensible |
| Wi‑Fi + cellular | |
| Never (manual tap) | |

Prefers thumb in list; full on open.

## Просмотр
Full-screen gallery, swipe between, share/save.  
Save → system Photos / Downloads + permission.

## Голосовые
Обычный: waveform + duration, playback speed Could (1.5×/2× — Should, ждут).  
[[Whispers]] — отдельный kind/TTL.

## Лимиты
Размер/длительность — server reject с понятной ошибкой.  
Связь cost → [[Business]].

## Связь с полкой
Любое media message pinable → [[Chat_Shelf]].  
Не дублировать blob → [[Data_Graph]].  
Пост медиа на [[User_Wall|стену профиля]] — отдельный flow (свой композер).

## MVP checklist
- [ ] Photo/video/file send  
- [ ] Preview + progress  
- [ ] Auto-download policy  
- [ ] Full viewer + save  
- [ ] Voice message  

<- [[Product_Basics]] · [[Messages_Basics]] · [[Chat_Shelf]]

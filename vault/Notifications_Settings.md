---
tags: [tolk, product, notifications]
status: ready
updated: 2026-07-15
audience: [product, developer]
---
# Notifications Settings

Пуши — главная точка «бесит / не бесит».  
Связь с дифференциатором: [[Echoes]] по умолчанию **не орёт**.

## Уровни
1. **Системное** — permission OS ([[Permissions]], [[Platform_Differences]])  
2. **Глобальное в Tolk** — этот экран  
3. **Per-chat** — [[Chat_Settings]] (mute, exceptions)  

## Глобальные тумблеры (Must)
| Параметр | Default | Смысл |
|---|---|---|
| Показывать уведомления | on (если OS allow) | Master |
| Звук | on | |
| Vibration | on (Android ощутимее; iOS — system) | |
| Превью текста | on | «Имя: текст» vs «Новое сообщение» → [[Privacy]] |
| Уведомления Echo | **off sound**; optional badge | см. [[Echoes]] |
| В группах | on | можно «только mentions» — Should |

## Тихие часы / DND (Should)
Интервал «не беспокоить» в приложении **или** уважение system DND/Focus.  
Не дублировать сложный iOS Focus — лучше integrate ([[Platform_Differences]]).

## In-app индикаторы
Unread badges на иконке:  
- iOS: badge count (если permission)  
- Android: badge/dot зависит от launcher  

Счётчик: непрочитанные **обычные**; Echo pending — отдельно в UI app, не обязательно в icon badge (чтобы не FOMO) → [[User_Engagement]] anti-dark.

## Каналы Android (Must на Android)
Отдельные Notification Channels:
- `messages` — обычные  
- `groups` — группы  
- `echo` — importance low  
- `other` — service/sync rare  

Пользователь глушит канал в system settings — уважаем.

## iOS
Categories: reply action (Could), default alert.  
Provisional push — optional later.

## Когда не пушим
- Пользователь в этом чате активен (foreground + visible chat) — in-app only  
- Mute чата / global off  
- Echo (default)  
- Own messages  

## MVP checklist
- [ ] Global on/off, sound, preview  
- [ ] Echo quiet default  
- [ ] Per-chat mute  
- [ ] Android channels  
- [ ] Deep link from notification → chat  

<- [[Settings]] · [[Echoes]] · [[Privacy]] · [[Platform_Differences]]

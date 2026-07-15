---
tags: [tolk, product, settings, hub]
status: ready
updated: 2026-07-15
audience: [product, design, developer]
---
# Settings

Один хаб. Плоский список секций, **не** дерево из 40 экранов.  
Платформенные отличия — [[Platform_Differences]], не дублируем логику в каждом пункте.

## Точка входа
Список чатов → **⚙** или свой аватар (один паттерн на обе платформы).  
Не прячем в жесте-секрете ([[Absolute_Minimalism]] — жесты для скорости, settings всегда видимы).

## Структура экрана (Must + Should)

```
[ Аватар · Имя · @username ]  →  [[Account]]

Аккаунт
  Профиль, username, телефон, удалить     → [[Account]]
  Устройства / сессии                     → [[Sessions_and_Logout]]

Чаты и сообщения
  [[Appearance_Settings]]                 тема, размер текста
  Медиа и хранилище                       → [[Data_and_Storage]]
  (опц.) Live Thoughts default            → [[Live_Thoughts]]

Уведомления
  → [[Notifications_Settings]]

Конфиденциальность
  → [[Privacy_Settings]]

Друзья и люди
  Контакты, инвайт                        → [[Invites_and_Contacts]]
  Чёрный список                           → [[Block_and_Report]]

Поддержка и о приложении
  → [[About_and_Legal]]

[ Выйти ]                                 → [[Sessions_and_Logout]]
```

## Чего нет в Settings MVP
- Магазин стикеров / мини-аппы / «рекомендации»  
- Тёмные engagement-тюнеры («напоминать писать»)  
- Десяток экспериментальных lab-флагов без feature flag infra  

## Поиск по настройкам
Should: строка поиска по пунктам (как iOS Settings) — помогает 30–40.  
Must: можно без поиска, если секций ≤ 8.

## Настройки vs Chat Settings
Глобальное здесь.  
На одноимённый чат — [[Chat_Settings]] (мьют, wallpaper later, уведомления чата).

## Связь с OS
Часть тумблеров **ведёт в системные Settings** (пуши, доступ к микрофону), если OS так требует → [[Permissions]] · [[Platform_Differences]].

<- [[Product_Basics]] · [[MVP]]

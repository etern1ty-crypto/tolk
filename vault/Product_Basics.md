---
tags: [tolk, product, basics, hub]
status: ready
updated: 2026-07-15
audience: [product, developer, design]
---
# Product Basics

Мелочи, без которых мессенджер **не продукт**, а демо-экран.  
Не дифференциаторы — но без них стена и Echo бессмысленны.

Фильтр тот же: [[True_Utility]] + [[Absolute_Minimalism]].  
Не раздуваем Settings в «ещё один MAX».

## Карта ветки
```
Product_Basics (ты здесь)
├── Registration_and_Auth     вход / регистрация / онбординг
├── Sessions_and_Logout       сессии, выход, «выйти везде»
├── Account                   профиль, username, удаление аккаунта
├── Settings                  хаб настроек
│   ├── Notifications_Settings
│   ├── Appearance_Settings
│   ├── Privacy_Settings
│   ├── Data_and_Storage
│   └── Platform_Differences  iOS ≠ Android (и где одинаково)
├── Permissions               камера, микрофон, контакты, пуши
├── Chat_List                 пины, мьют, unread, свайпы списка
├── Chat_Settings             настройки одного чата
├── Groups_Basics             создание, админ, инвайт в группу
├── Messages_Basics           send/reply/forward/edit/delete/copy
├── Media_Basics              вложения, автозагрузка, сохранение
├── Search                    люди, чаты, сообщения
├── Invites_and_Contacts      ссылки, QR, синк контактов
└── Block_and_Report          блок, жалоба, спам
```

Связь с «вау»-механиками → [[Novel_Mechanics]].  
Срез must/should → [[MVP]].  
Данные/сессии → [[Data_Graph]] · [[Sync]] · [[Privacy]].

## Принцип мелочей
1. Одна очевидная точка входа (не 4 способа «выйти»)  
2. Системные паттерны платформы — не изобретаем колёса там, где OS уже учила пользователя  
3. Опасные действия — confirm (выход везде, удалить аккаунт, очистить чат)  
4. Дефолты здравые; power-user — глубже, не на первом экране  

## Точки входа в UI
| Откуда | Куда |
|---|---|
| Список чатов → аватар / ⚙ | [[Settings]] / [[Account]] |
| Список → long-press чата | mute, pin, delete → [[Chat_List]] |
| Чат → header / ⋮ | [[Chat_Settings]], [[Living_Profiles]] |
| Первый запуск | [[Registration_and_Auth]] |

<- [[Tolk_Core_Concept]] · [[MVP]]

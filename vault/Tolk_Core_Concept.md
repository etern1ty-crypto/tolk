---
tags: [tolk, root, pitch]
status: ready
updated: 2026-07-15
audience: [investor, developer, product]
---
# Tolk

**Минималистичный мессенджер для русскоязычного комьюнити** (14–40).  
Не клон. Не «импортозамещение силой». Продукт, в котором есть **толк**.

> Быстрый, чистый, свой — пишут потому что удобно, а не потому что заставили.

---

## Проблема

| Боль | Как сейчас |
|---|---|
| Комбайн вместо чата | Telegram разросся; UI и шум давят |
| Навязанная альтернатива | MAX = «скопировали и обязали» → отторжение |
| Медиа тонет | 40 фото в истории — через день не найти |
| Пуш орёт всегда | Мем и «я у подъезда» звучат одинаково громко |
| Нечего *выбрать* | Либо привычный TG, либо клон без характера |

Люди не ищут «ещё один мессенджер». Ищут **причину перейти без принуждения**.

---

## Решение

**База — мессенджер.** Главный экран: **Чаты**.  
Навигация: **Стена · Чаты · Профиль** ([[Navigation_IA]]).

**Дифференциаторы / характер:**
1. **[[User_Wall|Стена]]** — лента постов (рекомендации + «расскажите о себе»), лайк/коммент/репост в профиль.  
2. **[[Living_Profiles|Профиль]]** — красивая кастомизация, посты, «добавить в стену», настройки.  
3. **Кружки + войсы + реакции** в чатах (эффекты кружков — глубоко спрятаны).  
4. **[[Echoes]]** / [[Chat_Shelf|полка]] — secondary, не ломают home.

Жёсткий [[Absolute_Minimalism|минимализм]] + нормальная [[Privacy|приватность]].

---

## Для кого

| Сегмент | Зачем |
|---|---|
| 14–20 | Класс, тусовка, скорость, UI не «госуслуги» |
| 20–30 | Работа + друзья, без 50 кнопок |
| 30–40 | Просто писать и находить файлы, без обучения клону |

Гео/язык: RU + соседние. Уже в TG / WA / MAX. Переход — только за продукт.

---

## Чем не являемся

- Не государственный мессенджер  
- Не соцсеть с алгоритмом  
- Не MAX 2.0  
- Не «замена Telegram» в лозунге — конкурируем качеством  

Подробнее: [[Ideology]] · [[Competition]]

---

## Почему может взлететь

1. **Анти-MAX спрос** — усталость от принуждения + запрос на *свой* выбор  
2. **TG-усталость** — часть аудитории хочет проще, не «супер-апп»  
3. **Понятный клин** — стена профиля + полка чата + echo за 15 секунд  
4. **Рост через группы** — класс/команда переезжает пачкой ([[User_Engagement]])  
5. **Честный scope** — [[MVP]] режет vanity-фичи  

Риски — открыто: [[Risks]]. Деньги: [[Business]].

---

## Продукт за 30 секунд

```
Bottom:  [ Стена ]  [ Чаты★ ]  [ Профиль ]
                │
                ├── list → chat (войс, кружки, реакции)
                ├── стена: лента + лайк/репост/коммент
                └── профиль: посты, фон, settings, «в стену»
```

Приоритеты механик → [[Novel_Mechanics]]  
Мелочи продукта (вход, settings, чаты…) → [[Product_Basics]]  
Срез релиза → [[MVP]]

---

## Техника за 30 секунд

Local-first клиент (React Native / Web + SQLite + outbox) → API + WebSocket.  
Стена, Полка и Echo **не** зависят от WebRTC.  
E2EE — фаза после MVP, без вранья в маркетинге.

→ [[Core_Architecture]] · [[Sync]] · [[Data_Graph]] · [[For_Developers]]

---

## Карта документов

| Кому | Читать по порядку |
|---|---|
| **Инвестор** | этот файл → [[Demo]] → [[Competition]] → [[Business]] → [[MVP]] → [[Risks]] → [[User_Engagement]] |
| **Разработчик** | этот файл → [[MVP]] → [[For_Developers]] → [[Product_Basics]] → [[Core_Architecture]] → P0 |
| **Дизайн / продукт** | [[Ideology]] → [[True_Utility]] → [[Product_Basics]] → [[Novel_Mechanics]] → [[Design_System]] |
| **Все** | Открытые решения → [[Open_Questions]] |

### Полное дерево
```
Tolk (ты здесь)
├── Why
│   ├── Ideology · Absolute_Minimalism · True_Utility · Privacy
│   ├── Competition · Business · Risks · Open_Questions
│   └── User_Engagement · MVP · Demo
├── Product
│   ├── Product_Basics                    ← мелочи (пол продукта)
│   │   ├── Registration_and_Auth · Sessions_and_Logout · Account
│   │   ├── Settings → Notifications · Appearance · Privacy_Settings
│   │   │            · Data_and_Storage · Platform_Differences
│   │   ├── Permissions · Chat_List · Chat_Settings · Groups_Basics
│   │   ├── Messages_Basics · Media_Basics · Search
│   │   ├── Invites_and_Contacts · Block_and_Report · About_and_Legal
│   └── Novel_Mechanics                   ← дифференциаторы
│       ├── User_Wall (Стена) + Living_Profiles  P0
│       ├── Chat_Shelf (Полка) + Structure_of_a_Post  P0
│       ├── Echoes                               P0
│       ├── Live_Thoughts                        P1
│       └── Whispers                             P2
├── Design
│   └── Design_System → Spatial_UI · Visual_Language
│                     → Gesture_Mapping · Micro_Animations
└── Engineering
    ├── For_Developers
    └── Core_Architecture → Sync · Data_Graph · Privacy
```

---

## Статус
Концепт готов к показу инвестору и передаче разработке.  
Substance: проблема, клин, scope, eng-план, риски, demo-скрипт.  
Дальше вне vault: прототип P0 или spike синка — не полировка оформления заметок.

*Имя продукта = обещание: в приложении должен быть **толк**.*

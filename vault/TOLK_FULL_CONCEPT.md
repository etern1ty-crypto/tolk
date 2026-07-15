# Tolk — полный концепт-документ

> Единый экспорт vault. Источник: Obsidian `Documents/tolk/tolk`.
> Дата сборки: 2026-07-15
>
> **Changelog 2026-07-15:**  
> **Стена** = лента пользователя ([[User_Wall]]) · **Полка** = закрепы чата ([[Chat_Shelf]]).  
> Старое «Стена чата» = Полка. Live notes в vault — source of truth; этот export может отставать.

---

## Оглавление

1. [Tolk Core Concept](#tolk-core-concept)
2. [Ideology](#ideology)
3. [Absolute Minimalism](#absolute-minimalism)
4. [True Utility](#true-utility)
5. [Privacy](#privacy)
6. [Competition](#competition)
7. [Business](#business)
8. [Risks](#risks)
9. [Open Questions](#open-questions)
10. [User Engagement](#user-engagement)
11. [MVP](#mvp)
12. [Demo](#demo)
13. [Product Basics](#product-basics)
14. [Registration and Auth](#registration-and-auth)
15. [Sessions and Logout](#sessions-and-logout)
16. [Account](#account)
17. [Settings](#settings)
18. [Notifications Settings](#notifications-settings)
19. [Appearance Settings](#appearance-settings)
20. [Privacy Settings](#privacy-settings)
21. [Data and Storage](#data-and-storage)
22. [Platform Differences](#platform-differences)
23. [Permissions](#permissions)
24. [Chat List](#chat-list)
25. [Chat Settings](#chat-settings)
26. [Groups Basics](#groups-basics)
27. [Messages Basics](#messages-basics)
28. [Media Basics](#media-basics)
29. [Search](#search)
30. [Invites and Contacts](#invites-and-contacts)
31. [Block and Report](#block-and-report)
32. [About and Legal](#about-and-legal)
33. [Novel Mechanics](#novel-mechanics)
34. [The Chat Wall](#the-chat-wall)
35. [Structure of a Post](#structure-of-a-post)
36. [Echoes](#echoes)
37. [Living Profiles](#living-profiles)
38. [Live Thoughts](#live-thoughts)
39. [Whispers](#whispers)
40. [Design System](#design-system)
41. [Spatial UI](#spatial-ui)
42. [Visual Language](#visual-language)
43. [Gesture Mapping](#gesture-mapping)
44. [Micro Animations](#micro-animations)
45. [Core Architecture](#core-architecture)
46. [Sync](#sync)
47. [Data Graph](#data-graph)
48. [For Developers](#for-developers)

---


<!-- source: Tolk_Core_Concept.md -->

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

**База мессенджера** (1:1, группы, медиа, войсы, поиск) — надёжно и быстро.  
**Два дифференциатора, которые не клон:**

1. **[[The_Chat_Wall|Стена чата]]** — полка медиа и закрепов *этого* диалога. Не лента, не stories.  
2. **[[Echoes]]** — отправка «глянь потом» без ор-пуша.

Плюс жёсткий [[Absolute_Minimalism|минимализм]] и нормальная [[Privacy|приватность]] без маркетингового пафоса.

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
3. **Понятный клин** — стена + echo объясняются за 15 секунд  
4. **Рост через группы** — класс/команда переезжает пачкой ([[User_Engagement]])  
5. **Честный scope** — [[MVP]] режет vanity-фичи  

Риски — открыто: [[Risks]]. Деньги: [[Business]].

---

## Продукт за 30 секунд

```
Список чатов  ↔  Чат  ↔  Стена этого чата
                   │
                   ├── обычные сообщения / медиа
                   ├── Echo (тихо)
                   └── профиль → сразу «Написать»
```

Приоритеты механик → [[Novel_Mechanics]]  
Мелочи продукта (вход, settings, чаты…) → [[Product_Basics]]  
Срез релиза → [[MVP]]

---

## Техника за 30 секунд

Local-first клиент (React Native + SQLite + outbox) → API + WebSocket.  
Стена и Echo **не** зависят от WebRTC.  
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
│       ├── The_Chat_Wall + Structure_of_a_Post   P0
│       ├── Echoes                               P0
│       ├── Living_Profiles                      P1
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

---


<!-- source: Ideology.md -->

# Ideology

## Миссия
Мессенджер, который **выбирают**.  
Русскоязычному комьюнити — минимум шума, максимум смысла (толка).

## Три принципа (не ломаем)

### 1. Толк > фича
В продукт только через [[True_Utility]].  
«У конкурента есть» — не аргумент. «Решает боль за один жест» — аргумент.

### 2. Минимум > комбайн
Когнитивная нагрузка — враг. [[Absolute_Minimalism]].  
10 сильных вещей лучше 40 полумёртвых кнопок.

### 3. Свой > навязанный
Рост: «перешли, потому что удобно».  
Не блокировки конкурентов, не корпоративный приказ. Урок MAX → [[Competition]].

## Культурный код (RU)
Не квасной патриотизм в UI. Как люди **здесь** пишут:

- Скорость и прямой тон важнее корпоративной вежливости  
- Стикеры, войсы, пересылки, группы — норма  
- Ненависть к тормозам, рекламе в чатах, «обязаловке»  
- Приватность без паранойи в каждом слогане → [[Privacy]]  

Тон бренда: **прямой, сухой, с характером**.

## Награда без помойки
Не красные бейджи и не бесконечный скролл.  
Награда: дошло, ответили, медиа на месте, UI не бесит.  
Рост и метрики → [[User_Engagement]]. Срез → [[MVP]].

## Дочерние узлы
- [[Absolute_Minimalism]]  
- [[True_Utility]]  
- [[Privacy]]  

<- [[Tolk_Core_Concept]]

---


<!-- source: Absolute_Minimalism.md -->

# Absolute Minimalism

Не эстетика для Dribbble.  
**Меньше решений на экране → быстрее действие** (Hick's Law).

## Правило главного экрана
Список чатов — только необходимое:

1. Список (тап → чат) → [[Chat_List]]  
2. Поиск (одна точка) → [[Search]]  
3. Написать  
4. Настройки (⚙ / аватар) → [[Settings]] — видимы, не секретный жест  

Вторичное: long-press, свайп. Каталог мелочей → [[Product_Basics]].

## Выкидываем по умолчанию
| Мусор | Почему |
|---|---|
| Tab-bar ×5 | Колонны и жесты → [[Spatial_UI]] |
| «⋯» везде | Haptic long-press |
| Папки ради папок | Сначала поиск и пины |
| Онбординг ×12 | Вошёл → пишешь |
| Реклама / «рекомендованные каналы» в чатах | Убивают толк |

## Метрика
Считаем явные кликабельные сущности:

| Экран | Цель |
|---|---|
| Список чатов | ≤ 4 |
| Чат | Ввод + вложения + меню чата |
| Медиа | Жесты > панели |

Раздулся экран — сначала режем UI.

## Для аудитории
- 14–20: свежо, не «госуслуги»  
- 30–40: ничего лишнего, просто работает  

Один UI — один принцип.  
Токены → [[Visual_Language]]. Жесты → [[Gesture_Mapping]].

<- [[Ideology]]

---


<!-- source: True_Utility.md -->

# True Utility

**Толк** = боль решена лучше, чем в привычке (TG / WA / MAX), без копипасты ради галочки.

## Фильтр (обязателен)
1. **Боль** — чья, как часто?  
2. **Сейчас** — как страдают в TG/MAX/WA?  
3. **Наше решение** — чем проще/быстрее/чище?  
4. **Анти-клон** — чем *не* «как у них, но хуже»?  
5. **Цена** — UI + support + eng. Стоит ли?  
6. **MVP-статус** — must / should / could / won't → [[MVP]]

Шаг 4 = «ничем» → **не делаем**.

## Карта болей → ответ

| Боль | Ответ |
|---|---|
| Комбайн, 50 кнопок | [[Absolute_Minimalism]] |
| Медиа тонут | [[The_Chat_Wall]] P0 |
| Пуш орёт на мем | [[Echoes]] P0 |
| Войсы-простыни | [[Whispers]] P2 или TTL на войсах |
| Навязали MAX | Позиционирование [[Competition]], не клон |

## Не толк
- «У Telegram есть X»  
- Лента «для вовлечённости»  
- Геймификация прочтения  
- Тяжёлая анимация ценой батареи  

## Шаблон карточки
```
Фича:
Боль:
Как сейчас:
Решение Tolk:
Почему не клон:
MVP: must | should | could | won't
```

<- [[Ideology]] · [[MVP]]

---


<!-- source: Privacy.md -->

# Privacy

Ожидание: переписку не читают, данные не сливают, пуши не спамят.  
Без «военный грейд» в слогане.

## Обещания
1. Чаты — не сырьё для публичной ленты  
2. Минимум данных для аккаунта  
3. Пуши и Echo под контролем пользователя  
4. Понятные дефолты  

## Что храним
| Данные | Зачем | Риск |
|---|---|---|
| Телефон / id | Аккаунт, антиспам | Высокий |
| Профиль | UX | Средний |
| Сообщения, медиа | Сервис | Критичный |
| Push token | Доставка | Средний |
| Контакты | Найти друзей | Высокий — **opt-in** |

Не продаём граф контактов. Не строим рекламный профиль из переписки.  
Реклама в личных чатах — нет ([[Business]]).

## Пуши
| Тип | Default |
|---|---|
| Обычное сообщение | По настройкам чата |
| [[Echoes]] | Без sound; badge/индикатор |
| Превью текста в пуше | Настройка пользователя |

UI-ручки: [[Notifications_Settings]] · [[Privacy_Settings]].  
Блок/репорт: [[Block_and_Report]]. Удаление аккаунта: [[Account]].

## Шифрование по фазам
| Фаза | Что |
|---|---|
| MVP | TLS; OS disk encryption; signed media URLs; access control |
| P1 | E2EE 1:1 (проверенная lib) — после multi-device UX |
| Later | E2EE groups |

До E2EE не пишем «никто не прочитает».  
После E2EE метаданные (кто/когда/размер) сервер всё равно может видеть — честно.

## Эфемерность
Best-effort delete. Скриншот/другое устройство возможны.  
Копирайт без магии.

## Клиент
Local DB на устройстве. Logout everywhere. Биометрия — opt-in.

<- [[Ideology]] · [[Core_Architecture]]

---


<!-- source: Competition.md -->

# Competition

Сравниваем по **реальной причине выбора**, не по таблице «у нас тоже есть стикеры».

## Поле

| Игрок | Сила | Слабость | Отношение Tolk |
|---|---|---|---|
| **Telegram** | Привычка, скорость, экосистема, каналы | Комбайн, шум, перегруз UI для части людей | Не копируем. Забираем тех, кому **проще и спокойнее** |
| **WhatsApp** | Универсальность, семья | Слабее в RU-культуре чатов/стикеров/username | Смежный; не главный бой |
| **MAX** | Дистрибуция, админ-ресурс | Восприятие «навязали + клон», недоверие | **Анти-позиционирование**: Tolk выбирают |
| **VK / OK msg** | Аудитория соцсетей | Усталость бренда, не «современный мессенджер» | Не цель |
| **Signal / Session** | Приватность-бренд | UX/reach, не hub для RU-тусовки | Учимся честности E2EE, не клонируем нишу |

## Матрица отличий

| | TG | MAX | **Tolk** |
|---|---|---|---|
| Как попадает к пользователю | Сам / сарафан | Часто давление среды | Сарафан, инвайт, качество |
| Центр продукта | Чат + каналы + всё | Чат «как TG» | Чат + **стена диалога** + **тихая доставка** |
| UI-философия | Много функций | Повтор TG | Жёсткий минимум |
| Discover / лента | Каналы, поиск | Есть/будет по клону | **Нет в MVP** |
| Тон бренда | Нейтральный tech | «Отечественный» | Прямой, сухой, без пафоса |

## Наш клин (wedge)

Не «мы как Telegram, но российский».

**Клин:**  
> Мессенджер, где переписка чистая, медиа чата не тонет, а «не срочное» не орёт пушом.

Этого достаточно, чтобы:
- объяснить за 15 секунд;
- показать в демо за 2 минуты;
- отличить от клона на скриншоте.

## Почему не умрём как «ещё один мессенджер»

Исторически мессенджеры умирают без **сети** (некого писать).  
Tolk закладывает рост через **группы/круги** ([[User_Engagement]]), а не через публичную ленту.

Защита на ранней стадии — не патент, а:
1. Скорость исполнения и качество доставки  
2. Характер продукта (минимум + 2 механики)  
3. Доверие («нас не навязали»)  

## Чего не делаем в ответ конкурентам
- Не догоняем TG feature-for-feature  
- Не зеркалим MAX ради тендеров  
- Не добавляем stories «потому что у всех есть» без [[True_Utility]]

<- [[Tolk_Core_Concept]] · [[Business]]

---


<!-- source: Business.md -->

# Business

Честно: до product-market fit бизнес-модель **вторична** относительно того, останутся ли люди писать.  
Ниже — рамка, не выдуманный Excel на 10 лет.

## Ценность (value prop)
- **User:** быстрее/спокойнее переписка; медиа на месте; контроль пушей  
- **Group admin (класс, команда):** одна ссылка, стена материалов чата  
- **Не value prop:** «патриотично», «как TG но наш»

## Модель монетизации (фаза после PMF)

Порядок предпочтений — совместим с доверием:

| Фаза | Модель | Почему |
|---|---|---|
| 0 — рост | Бесплатно, invite | Нужна сеть |
| 1 — early revenue | **Tolk Plus** (подписка): мультидевайс pro, большие файлы, кастомные реакции/темы, приоритет sync, longer media retention на стене | Не ломает базовый чат рекламой |
| 2 | Платные **возможности для групп/команд** (admin tools, retention wall, export) | B2B-light без «корпоративного комбайна» |
| ∞ | **Реклама в личных чатах** | **Нет.** Убивает позиционирование |

Не строим бизнес на продаже переписки и графа контактов ([[Privacy]]).

## Unit-экономика (качественно)
Драйверы cost: медиа storage, push, realtime fanout, support.  
Рычаги: сжатие/TTL превью, CDN, лимиты free-tier, outbox-эффективность.  
Пока нет live users — цифры CAC/LTV не выдумываем; после soft launch считаем из [[User_Engagement]].

## Go-to-market
1. Invite-only soft launch в 3–10 живых кругах (школа/универ/команда/чат друзей)  
2. Доказательство: D7 + двусторонние чаты + adoption стены/echo  
3. Публичный релиз + сарафан (клипы UI, «не MAX»)  
4. Не покупаем «установку любой ценой»

См. [[User_Engagement]].

## Что нужно от инвестиций (шаблон ask)
Использовать как структуру питча, цифры — под команду:

| Статья | Зачем |
|---|---|
| Core team 6–12 мес | iOS/Android (RN), backend, design, product |
| Инфра | staging/prod, media, push, мониторинг |
| Soft launch | квоты, модерация спама, support |
| Reserve | store risk, legal, buffer |

**Не ask:** маркетинг на миллион установок до PMF.

## Traction (сейчас)
Концепт и scope зафиксированы в этом vault.  
Код / беты / метрики — следующий этап (отметить факт, когда появятся).

## Почему это инвестибельно (тезисы)
1. Большой рынок messaging в RU + структурный спрос на *не-навязанную* альтернативу  
2. Узкий клин (стена + echo + минимум) — можно собрать MVP без комбайна  
3. Рост через граф общения, не через дорогой performance marketing  
4. Подписка совместима с доверием; реклама в чатах исключена  

Контраргументы → [[Risks]].

<- [[Tolk_Core_Concept]] · [[Competition]] · [[MVP]]

---


<!-- source: Risks.md -->

# Risks

Документ для взрослых. Если риска нет в списке — мы его ещё не продумали, а не «всё ок».

## Продукт и рынок

| Риск | Почему реален | Митигация |
|---|---|---|
| **Network effect TG** | «Там уже все» | Клин через группы; продукт должен быть ок вдвоём; инвайты |
| **«Ещё один мессенджер»** | Усталость рынка | Жёсткий MVP; демо 2 мин; не feature-parity |
| **Сравнение с MAX** | Любой RU-мессенджер = «тот же бред» | Тон, дистрибуция без принуждения, качество UX |
| **Дифференциаторы не зайдут** | Стена/Echo окажутся «ну такое» | Метрики adoption; готовность упростить ([[True_Utility]]) |
| **Scope creep** | Команда начнёт догонять TG | [[MVP]] Won't-list; фильтр фич |

## Техника

| Риск | Митигация |
|---|---|
| Доставка сообщений «почти работает» | P0 = sync/outbox раньше вау-анимаций ([[Sync]]) |
| Медиа жрёт бюджет | Лимиты, compression, CDN, TTL превью |
| Live Thoughts жрёт батарею/сеть | P1, off default, kill switch ([[Live_Thoughts]]) |
| Multi-device + будущий E2EE | Не обещать E2EE в MVP; закладывать client_id/idempotency |
| Store / policy | Соблюдать правила, без серых пушей |

## Регуляторика и доверие

| Риск | Митигация |
|---|---|
| Давление на данные / «бэкдоры» | Юр. рамка, минимизация данных, честный маркетинг ([[Privacy]]) |
| Путаница с гос-мессенджерами | Позиционирование [[Competition]]; никогда не пушить force-install |
| Сливы / инциденты | Базовая security hygiene; phase E2EE; процесс инцидентов |

## Команда и исполнение

| Риск | Митигация |
|---|---|
| Маленькая команда vs мессенджер | Узкий MVP; RN; не писать два нативных клиента с нуля |
| Выгорание на parity | Won't-list; один клин |
| Нет живых тестовых кругов | Soft launch план в [[User_Engagement]] до публичного шума |

## Что убивает проект быстрее всего
1. Враньё в обещаниях (E2EE, «никто не прочитает», «мы как TG только лучше во всём»)  
2. Реклама в личных сообщениях  
3. Полгода полировки glassmorphism при кривой доставке  
4. Попытка вырасти через принуждение  

<- [[Business]] · [[Tolk_Core_Concept]]

---


<!-- source: Open_Questions.md -->

# Open Questions

Решения, которые **ещё не зафиксированы**. Лучше явная дыра, чем тихий вымысел.

## Продукт
| Вопрос | Варианты / коммент | Владелец |
|---|---|---|
| Идентификация: только телефон или + email/username-only? | MVP зафиксирован: телефон+OTP ([[Registration_and_Auth]]); email later | Product |
| Read receipts default on/off? | Склонность: off global / per-chat on ([[Privacy_Settings]]) | Product |
| Logout: wipe local DB всегда? | Сейчас: wipe on logout ([[Sessions_and_Logout]]) — ок для shared phone? | Eng + Product |
| Макс. размер группы в MVP? | 50 / 200 / 1000 — cost & UX | Product + Eng |
| Кто пинит на стене в группе? | Все / admin | Product |
| Имя «Echo» / «Стена» в RU UI? | Нужны короткие нативные строки | Product + Design |
| Стикеры в MVP? | Сильно ждут 14–20; scope risk | Product |

## Техника
| Вопрос | Коммент |
|---|---|
| Язык бэкенда | Go vs Rust vs Node — решить командой, контракты важнее |
| Один регион хостинга на старте? | Latency RU; legal |
| Voice/video calls в roadmap? | Не MVP; место в Won't/Could |
| Бэкап истории | До E2EE проще; после — отдельный ад |

## Бизнес
| Вопрос | Коммент |
|---|---|
| Юрлицо / юрисдикция | До fundraising |
| Цена Plus | После первых денег и cost media |
| Модерация спама | Нужен минимальный toolset к soft launch |

## Как закрываем
- Продуктовые — до начала S3/S4 или A/B в soft launch  
- Технические — spike ≤3 дней, запись в [[For_Developers]] / ADR  
- Не закрытое к питчу — озвучивать в [[Risks]], не прятать  

<- [[Tolk_Core_Concept]] · [[MVP]]

---


<!-- source: User_Engagement.md -->

# Growth & Retention

Удержание = **меньше шума, больше пользы**.  
Не FOMO, не «ты не заходил 3 дня».

## Почему остаются
| Причина | Как |
|---|---|
| Здесь нужные люди | Критическая масса в круге |
| Спокойнее комбайна | [[Absolute_Minimalism]], [[Sync]] |
| Медиа находится | [[The_Chat_Wall]] |
| Не срочное не орёт | [[Echoes]] |
| Не бесит | [[Design_System]] |

Уходят: тормоза, пустые чаты, дырявая доставка, «ещё один обязательный клон».

## Метрики

### Activation
| Метрика | Ориентир |
|---|---|
| Time to first message | < 60s |
| ≥1 ответ от человека | D1 |
| Wall / Echo adoption | смотрим, не блокируем D1 |

### Retention
D1 / D7 / D30 · WAU/MAU · чаты с двусторонними msg / week  

### Quality (анти-dark)
| Метрика | Смысл |
|---|---|
| Noise ratio (push / session) | Не раздувать пуши |
| Mute rate | Орём → мьютят |
| Crash-free, deliver p95 | Доверие |
| Time-in-app | **Не KPI** (диагностика) |

## Рост
**Да:** инвайт/QR, переезд группы, сарафан, клипы UI.  
**Нет:** блокировка конкурентов, force-install, накрутка, feature-parity ради переманивания.

```
Ок писать вдвоём → позвал 2–5 → группа удобнее → следующий круг
```

Продукт должен быть достаточно хорош **без** толпы.

## Онбординг
Вход → имя → «Написать» / «Группа» / «Инвайт».  
Один hint про стену. Без манифеста на 12 экранов.

## Anti-patterns
Красный badge ради тревоги · streaks · публичные лайки · discover-лента · реклама в чатах.

Срез продукта → [[MVP]]. Демо → [[Demo]]. Риски сети → [[Risks]].

<- [[Tolk_Core_Concept]] · [[Business]]

---


<!-- source: MVP.md -->

# MVP

Минимальный продукт, за который **не стыдно** позвать друзей.  
Не «всё как у Telegram». Не «пустой чат с логотипом».

## Готово, когда пользователь может
1. Войти и пригласить людей  
2. Писать 1:1 и в группе (текст, фото, файл, войс)  
3. Закрепить медиа на **стене чата** и вернуться к сообщению  
4. Отправить **Echo** без ор-пуша  
5. Не ловить «не доставлено» на нормальной сети и не тонуть в UI  

Демо → [[Demo]].

---

## Must (ship)

### Аккаунт и доступ → [[Product_Basics]]
- [[Registration_and_Auth]] · [[Sessions_and_Logout]] · [[Account]]  
- [[Invites_and_Contacts]] · [[Block_and_Report]]  

### База чатов
- [[Chat_List]] · [[Messages_Basics]] · [[Media_Basics]] · [[Search]]  
- [[Groups_Basics]] · [[Chat_Settings]]  

### Настройки и платформа
- [[Settings]] · [[Notifications_Settings]] · [[Appearance_Settings]] · [[Privacy_Settings]]  
- [[Data_and_Storage]] · [[Permissions]] · [[Platform_Differences]] · [[About_and_Legal]]  

### Дифференциаторы
- [[The_Chat_Wall]] — pin, лента, jump-to-message  
- [[Echoes]] — режим, ×N, sheet, без sound push  

### UX / Design
- Dark theme [[Visual_Language]]  
- Колонны список ↔ чат ↔ стена [[Spatial_UI]]  
- Long-press + свайпы [[Gesture_Mapping]]  
- Reduce Motion  

### Техника
- Local-first + outbox [[Sync]]  
- SQLite + MMKV [[Data_Graph]]  
- HTTPS + WebSocket  
- Media upload progress/retry  
- TLS, signed URLs [[Privacy]]  

Онбординг: [[For_Developers]] · полный каталог мелочей: [[Product_Basics]].

---

## Should (сразу после must)
- [[Living_Profiles]] — карточка, «Написать», общие медиа  
- Светлая тема  
- Edit / delete  
- Read receipts **выключаемые**  
- Multi-device базово  

---

## Could (не блокер)
- [[Live_Thoughts]] — off default, 1:1  
- [[Whispers]] или проще: TTL на войсах  
- Drag-reorder стены  
- E2EE 1:1  
- Server deep search  

---

## Won't (v1)
| Нет | Почему |
|---|---|
| Алгоритмическая лента / Discover | Не соцсеть |
| Stories | Клон без толка |
| Мини-аппы, клипы, магазин | Комбайн |
| Реклама в чатах | Убивает доверие [[Business]] |
| Tab-bar ×5 | Ломает минимум |
| Сенсорная «магия» записи | Хрупко |
| Force-install / блокировка конкурентов | Путь MAX [[Competition]] |

Новые идеи → фильтр [[True_Utility]].

---

## Порядок сборки
```
S0  Auth + 1:1 text + WS + local DB
S1  Media + groups + push
S2  Outbox / reconnect / chat list
S3  Wall P0
S4  Echo P0
S5  Spatial UI + visual polish
S6  Soft launch (invite) + metrics
```

Параллелить «все вау-фичи» до стабильной доставки — **запрещено**.

---

## Soft launch — Definition of Done
- Crash-free на целевых девайсах приемлемый  
- Доставка 1:1 предсказуема на Wi‑Fi/LTE  
- 10–50 живых кругов сидят неделями  
- Стена **или** Echo используются без ручного обучения от команды  
- Метрики из [[User_Engagement]] пишутся, не «кажется что ок»

## Позиционирование на выходе
**Да:** «Минималистичный мессенджер: быстро, без мусора. Стена чата и тихие Echo.»  
**Нет:** «Замена Telegram», «патриотичный MAX», «мессенджер про эмоции».

<- [[Tolk_Core_Concept]] · [[For_Developers]] · [[User_Engagement]]

---


<!-- source: Demo.md -->

# Demo — 2 минуты

Сценарий, который продаёт **продукт**, не слайды.  
Два телефона (A и B). Один чат.

## Setup
- Оба в Tolk, чат «Демо»  
- В истории уже 15–20 сообщений + пачка фото «как после поездки»  
- Звук пушей на B включён (чтобы контраст с Echo был слышен)

## Скрипт

### 0:00–0:20 — База
A → B: обычное «Ты где?»  
**Показать:** prioritет скорости, чистый UI списка и чата.  
*Фраза:* «Это мессенджер. Без ленты и без tab-bar на пять вкладок.»

### 0:20–0:55 — Стена
A long-press на фото → **На стену**.  
Свайп / кнопка → [[The_Chat_Wall]].  
На стене сетка; тап **В чат** → jump к сообщению.  
*Фраза:* «Медиа чата не тонут в истории. Это полка диалога, не Instagram.»

### 0:55–1:25 — Echo
A отправляет мем в режиме **Echo**.  
На B: **нет** звукового пуша; виден индикатор.  
B в другом чате → тап Echo → sheet поверх, dismiss.  
*Фраза:* «Не срочное не орёт. Обычные сообщения — как обычно.»

### 1:25–1:50 — Минимум
Показать: long-press меню вместо зоопарка иконок; пустой settings без «рекомендованных каналов».  
*Фраза:* «Толк — в каждой фиче. Не клон MAX.»

### 1:50–2:00 — Закрытие
*Фраза:* «MVP = надёжная база + стена + echo. Остальное — после того, как этим пользуются.»  
Указать: [[MVP]] · [[Competition]] · [[For_Developers]]

## Чего не показывать в первой демо
- Live Thoughts  
- Whispers / сенсоры  
- Glassmorphism ради glass  
- Сравнение «у нас 40 фич как в TG»

## Если только слайды (нет билда)
1. Проблема (навязанный клон vs комбайн) — 20с  
2. Клин: стена + echo — 40с  
3. Для кого / рост через группы — 20с  
4. MVP scope + честные риски — 30с  
5. Ask / next step — 10с  

<- [[Tolk_Core_Concept]] · [[MVP]]

---


<!-- source: Product_Basics.md -->

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

---


<!-- source: Registration_and_Auth.md -->

# Registration & Auth

Первый контакт с продуктом. Цель: **< 60s до первого сообщения** ([[User_Engagement]]).  
Без манифеста на 12 экранов ([[Absolute_Minimalism]]).

## Поток MVP (Must)

```
Открыл app
  → Есть валидная сессия? → Список чатов
  → Нет → Экран входа
       → Телефон (+маска страны, default RU +7)
       → Код (SMS / call-flash — что доступно провайдеру)
       → Если новый user → имя + @username (+ опц. аватар)
       → Разрешения: уведомления (мягко), остальное — by need
       → Список чатов / deep-link инвайт
```

Deep-link инвайта: после auth сразу открыть чат/группу → [[Invites_and_Contacts]].

## Регистрация vs вход
Один поток. Сервер решает: новый `User` или существующий.  
Пользователь не выбирает «регистрация / войти» — меньше трения.

## Поля онбординга
| Поле | Must | Правила |
|---|---|---|
| Телефон | Да | E.164; rate-limit OTP |
| OTP | Да | 4–6 цифр; resend с cooldown |
| Имя (display) | Да | 1–64 символа |
| @username | Да | unique, a-z0-9_, длина min; занято → сразу ошибка |
| Аватар | Нет | Можно скип; из галереи / камера ([[Permissions]]) |

Контакты upload — **не** на онбординге обязательно. Opt-in позже → [[Invites_and_Contacts]].

## Ошибки (понятный RU-копирайт)
| Ситуация | UI |
|---|---|
| Неверный код | «Неверный код» + осталось попыток |
| Код истёк | «Запроси новый» |
| Сеть | «Нет сети» + retry; local-first ещё не при чём |
| Номер в бане | «Не удалось войти» + support path |
| Username занят | «Уже занято» + предложения |

## Сессия после входа
Access + refresh (детали eng).  
Device регистрируется → [[Sessions_and_Logout]] · [[Data_Graph]].  
Push token — когда permission granted → [[Notifications_Settings]].

## Повторный вход / reinstall
- Телефон + OTP снова  
- История: с сервера catch-up ([[Sync]]); локальный кэш пуст до синка  
- Multi-device: новый device в списке сессий  

## Что не в MVP
- Вход только по email / Apple/Google как primary (можно later)  
- Username-only без телефона (спам-риск) — [[Open_Questions]]  
- Captcha на каждом шаге (только при abuse signals)  
- Обязательная загрузка всей записной книжки  

## Связь с приватностью
Минимум данных; телефон — идентификатор, не «рекламный профиль».  
Политика / согласие — короткий экран или checkbox по legal need → [[Privacy]] · [[About_and_Legal]].

## MVP checklist
- [ ] OTP login  
- [ ] Create profile (name + username)  
- [ ] Resume session  
- [ ] Deep link after auth  
- [ ] Rate-limit + базовый anti-abuse  

<- [[Product_Basics]] · [[Sessions_and_Logout]] · [[MVP]]

---


<!-- source: Sessions_and_Logout.md -->

# Sessions & Logout

Кто залогинен, откуда, как выйти — без квеста.

## Модель
Один `User` → много `Device` / сессий ([[Data_Graph]]).  
Текущее устройство помечено «это устройство».

## Где в UI
[[Settings]] → **Устройства** / **Сессии**  
Список: название (iPhone / Pixel / «Windows» later), last active, geo rough optional.

## Действия

### Выйти (это устройство)
1. Settings → **Выйти**  
2. Confirm (короткий)  
3. Invalidate local session, wipe sensitive tokens  
4. Local DB: политика MVP — **очистить аккаунтные данные** на устройстве (чаты не торчат следующему, кто возьмёт телефон)  
5. Экран [[Registration_and_Auth]]  

Outbox: несенные сообщения — либо fail с понятным «не отправлено, вы вышли», либо попытка flush перед logout (eng: best-effort, timeout короткий).

### Выйти везде
Settings → Устройства → **Завершить все кроме этого** / **Выйти на всех**  
Confirm жёстче: «Потребуется код на каждом устройстве».  
Сервер: revoke all refresh tokens except current (или all — product choice; default: all others).

### Завершить чужую сессию
Тап по устройству → **Завершить**  
Пуш/silent на то устройство: force logout.

## Авто-logout
| Триггер | Поведение |
|---|---|
| Refresh протух, refresh fail | Soft re-auth (OTP), не обязательно wipe DB сразу |
| Password change | n/a в MVP (нет пароля) |
| Security ban | Force logout + message |

## Биометрия (Should / Could)
Lock app on open (Face ID / fingerprint) — **opt-in** в [[Privacy_Settings]] / [[Appearance_Settings]].  
Не путать с auth аккаунта: биометрия = локальный замок UI.

## Multi-device (Should)
Сообщения синкаются ([[Sync]]).  
Read cursor общий.  
Echo pending — per user, видны на всех device после sync.

## MVP
- [ ] Logout this device + confirm  
- [ ] List sessions + terminate other  
- [ ] Logout all others  
- [ ] Force logout push/ws event  

<- [[Product_Basics]] · [[Registration_and_Auth]] · [[Privacy]] · [[Settings]]

---


<!-- source: Account.md -->

# Account

Управление «кто я в Tolk». Не путать с [[Living_Profiles]] (как меня видят / быстрый чат).

## Вход
[[Settings]] → **Аккаунт** / шапка с аватаром.

## Редактирование профиля (Must)
| Поле | |
|---|---|
| Аватар | Сменить / удалить; crop square |
| Имя | Display name |
| @username | Смена с проверкой unique; cooldown anti-squat optional |
| Телефон | Показать маскированно; смена телефона — Should (OTP на оба) |
| Био | 0–140 символов — Should |

Сохранение: optimistic UI + sync ([[Sync]]).  
Другие видят через [[Living_Profiles]] / header чата.

## Username правила
- Уникальный, case-insensitive store  
- Допустимые символы зафиксировать в protocol  
- Занято / недопустимо — inline error  
- Старые deep-link на old username: redirect window или 404 — [[Open_Questions]]

## Удалить аккаунт (Must для доверия, даже если редко)
Settings → Аккаунт → **Удалить аккаунт**  
Многошаговый confirm (ввод username или OTP).  
Копирайт честный: что удалится, что нет (бэкапы у собеседников — сообщения у них могут остаться).  
Сервер: soft-delete → hard job; сессии revoke; username освобождается с delay (anti-hijack).

Связь: [[Privacy]] · [[Sessions_and_Logout]].

## Экспорт данных (Could / legal)
«Скачать мои данные» — later, если legal requires.

## MVP checklist
- [ ] Edit name, username, avatar  
- [ ] View phone  
- [ ] Delete account flow  
- [ ] Logout link рядом  

<- [[Product_Basics]] · [[Settings]] · [[Living_Profiles]]

---


<!-- source: Settings.md -->

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

---


<!-- source: Notifications_Settings.md -->

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

---


<!-- source: Appearance_Settings.md -->

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

---


<!-- source: Privacy_Settings.md -->

# Privacy Settings

Продуктовые ручки над политикой [[Privacy]].  
Короткий экран, понятные дефолты.

## Must / Should
| Параметр | Default | MVP |
|---|---|---|
| Кто видит @ / профиль по поиску | Все / contacts — TBD | Should |
| Last seen / online | Contacts or nobody | Should |
| Read receipts | **Off** или per-chat | Should ([[Open_Questions]]) |
| Превью в пушах | User choice | Must → link [[Notifications_Settings]] |
| Загрузка контактов | Opt-in | Must |
| Live Thoughts (global) | Off | Could → [[Live_Thoughts]] |
| Замок приложения (биометрия) | Off | Could → [[Sessions_and_Logout]] |
| Заблокированные | Список | Must → [[Block_and_Report]] |

## Чего не обещаем тумблером
«Полный E2EE» пока фазы MVP нет — не рисуем fake lock.  
Когда E2EE появится — отдельный честный блок.

## Копирайт
Короткие объяснения под пунктом (1 строка), не legal wall.  
Полный текст → [[About_and_Legal]].

<- [[Settings]] · [[Privacy]] · [[Account]]

---


<!-- source: Data_and_Storage.md -->

# Data & Storage

Место на диске и кэш — частая боль 14–40 на телефоне с 64–128 GB.

## Показ
Settings → **Данные и память**  
Строки: кэш медиа, размер БД (optional), «очистить кэш».

## Действия (Must)
| Действие | Поведение |
|---|---|
| Очистить кэш медиа | Удалить thumb/full cache; история и wall metadata остаются; media подтянется снова |
| Автозагрузка медиа | Wi‑Fi only / Wi‑Fi+cellular / never — см. [[Media_Basics]] |
| Экономия трафика | Сжимать upload preview — eng policy |

## Не в «очистить кэш»
Не удалять: сообщения, outbox, ключи сессии, wall pins metadata.  
Для «снести всё локально» — logout или clear app data OS.

## Лимиты (сервер / клиент)
| | MVP orientir |
|---|---|
| Макс. размер файла | зафиксировать (напр. 100–200 MB video later; photo smaller) |
| Voice length | обычный войс vs [[Whispers]] cap |
| Storage warning | если cache > N MB — soft prompt |

Связь cost → [[Business]] · [[Sync]] media pipeline.

## MVP checklist
- [ ] Clear cache  
- [ ] Auto-download policy  
- [ ] Show approximate cache size  

<- [[Settings]] · [[Media_Basics]] · [[Core_Architecture]]

---


<!-- source: Platform_Differences.md -->

# Platform Differences

Один продукт, **два привычных мира**.  
Не клонируем iOS на Android и наоборот — берём system patterns.

## Принцип
| Общее (одинаково) | Разное (платформа) |
|---|---|
| Информационная архитектура, копирайт RU, механики Tolk | Навигационные жесты OS, share sheet, notifications plumbing, permissions UX |
| Колонны список↔чат↔стена | Edge-swipe back, status bar/insets, haptics API |
| Echo / Wall логика | Каналы Android vs iOS categories |

## Навигация и chrome
| | iOS | Android |
|---|---|---|
| Назад | Edge swipe + явный chevron где stack | System back / predictive back |
| Settings look | Inset grouped list | Prefer Material list, но **не** ломаем dark-токены Tolk |
| Action sheet | UIAlertController style | Material bottom sheet |
| Share | Share Link / UIActivity | Android Sharesheet |
| Haptics | UIImpactFeedback | PerformanceVibrator / VibrationEffect |

Жесты продукта → [[Gesture_Mapping]] не конфликтуют с system back.

## Permissions UX
| Permission | iOS | Android |
|---|---|---|
| Notifications | Request at meaningful moment; Settings deep link | 13+: runtime; channels always |
| Camera / Mic | Purpose strings (Info.plist) | Runtime + rationale dialog if denied |
| Photos | Limited library / full | Photo picker preferred (Photo Picker API) |
| Contacts | Hard deny recovery via Settings | Same + rationale |
| Bluetooth/nearby | Не просим без нужды | Same |

Единый продуктовый текст «зачем» → [[Permissions]].

## Notifications
- **Android:** channels `messages` / `groups` / `echo` (low) — [[Notifications_Settings]]  
- **iOS:** badge, alert, sound; Focus modes уважаем  
- Reply from notification: Could, API differs  

## Keyboard & input
| | iOS | Android |
|---|---|---|
| IME | IQKeyboard / RN handling | `windowSoftInputMode` / adjustResize |
| Mic button | hold-to-talk same | same; background mic restrictions stricter on modern Android |
| Attach | PHPicker | Photo Picker / SAF for files |

## Background & sync
- iOS: background fetch limited; WS + push primary ([[Sync]])  
- Android: FCM high-priority for messages; избегать вечного foreground service в MVP  

## Store & install
| | App Store | Play |
|---|---|---|
| Review | Privacy nutrition labels, account deletion required | Data safety form |
| Delete account | In-app must ([[Account]]) | Same expectation |
| Push certs | APNs | FCM |

## Visual
Safe area, cutout, gesture bar — insets both.  
Blur glass: iOS ok; Android mid — solid fallback ([[Visual_Language]]).

## Что сознательно едино
- Иконки и смысл кнопок  
- Названия: Стена, Echo, Настройки  
- Порядок секций Settings  
- Пороги свайпа колонн (40% / 800px/s)  

## QA matrix (min)
1 mid Android + 1 recent iPhone на каждый release candidate ([[For_Developers]]).

<- [[Settings]] · [[Product_Basics]] · [[Design_System]]

---


<!-- source: Permissions.md -->

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

---


<!-- source: Chat_List.md -->

# Chat List

Главный экран. ≤ 4 явных действия ([[Absolute_Minimalism]]).

## Элемент строки
- Аватар, имя/title, last message preview, time  
- Unread badge (спокойный, не blood-FOMO)  
- Mute icon · pin · send fail indicator  
- Typing / online — optional subtle  

## Действия
| Действие | Как |
|---|---|
| Открыть чат | Tap |
| Новый чат | FAB / «+» → search user / create group |
| Поиск | Иконка → [[Search]] |
| Settings | Аватар / ⚙ → [[Settings]] |
| Pin | Long-press или swipe action |
| Mute | Long-press / swipe |
| Delete / hide chat | Long-press + confirm; history policy clear |
| Mark read | Long-press Should |

Swipe actions: платформенно привычные ([[Platform_Differences]]); не более 2–3 actions.

## Сортировка
Pinned сверху (порядок manual or pin-time).  
Остальные — last activity desc.  
Архив — Should/Could (не Must, если режем scope).

## Empty state
«Напишите первым» + кнопка найти / инвайт → [[Invites_and_Contacts]].  
Не реклама каналов.

## Multi-select
Could later. Не Must.

## Данные
Список из SQLite/MMKV fast path ([[Core_Architecture]] · [[Sync]]).

## MVP checklist
- [ ] Rows + unread + open  
- [ ] Pin, mute  
- [ ] New chat / new group entry  
- [ ] Search entry  
- [ ] Settings entry  

<- [[Product_Basics]] · [[Spatial_UI]] · [[MVP]]

---


<!-- source: Chat_Settings.md -->

# Chat Settings

Настройки **одного** диалога. Вход: header чата / long-press → «Ещё».

## 1:1
| Пункт | |
|---|---|
| Профиль | → [[Living_Profiles]] |
| Mute | timed: 1h / 8h / forever |
| Notifications exception | sound on even if… Should |
| Search in chat | → [[Search]] scoped |
| Media / files | gallery of chat; link to wall |
| [[The_Chat_Wall]] | открыть стену |
| Clear history | confirm; local+server policy |
| Block | → [[Block_and_Report]] |
| Report | → [[Block_and_Report]] |

## Группа
| Пункт | |
|---|---|
| Название, аватар группы | admin |
| Участники | list, add, remove (roles) |
| Invite link | → [[Invites_and_Contacts]] · [[Groups_Basics]] |
| Mute | same |
| Wall permissions | who can pin — [[Open_Questions]] |
| Leave group | confirm |
| Delete group | admin only, confirm hard |

## Wallpaper / theme per chat
Won't v1.

## Связь уведомлений
Mute здесь перекрывает global on ([[Notifications_Settings]]).  
Echo от людей в mute-чате — тоже тихо.

<- [[Product_Basics]] · [[Groups_Basics]] · [[The_Chat_Wall]]

---


<!-- source: Groups_Basics.md -->

# Groups Basics

Группа = клин роста ([[User_Engagement]]): класс, команда, тусовка.

## Создание (Must)
1. Список → «+» → **Новая группа**  
2. Выбор участников (контакты / username search)  
3. Название (+ опц. аватар)  
4. Создать → открыть чат  

Лимит размера — [[Open_Questions]] (ориентир MVP: сотни, не «супергруппа 200k»).

## Роли MVP
| Роль | Может |
|---|---|
| Member | Писать, media, pin wall (если policy all), leave |
| Admin | Rename, avatar, add/remove, invite link, pin policy, delete group |

Creator = admin.  
Несколько admin — Should.

## Инвайт
Ссылка / QR с expiry optional.  
Join: auth if needed → member → chat.  
См. [[Invites_and_Contacts]] · [[Registration_and_Auth]].

## Стена группы
Одна стена на chat_id ([[The_Chat_Wall]]).  
Права пина: all vs admin — open question; default MVP **all** (проще) или admin for large.

## Уведомления
Mentions-only — Should ([[Notifications_Settings]]).

## MVP checklist
- [ ] Create, add members, leave  
- [ ] Admin rename/remove  
- [ ] Invite link  
- [ ] Group wall  

<- [[Product_Basics]] · [[Chat_Settings]] · [[MVP]]

---


<!-- source: Messages_Basics.md -->

# Messages Basics

Пол чата. Дифференциаторы строятся сверху ([[Novel_Mechanics]]).

## Отправка
| Kind | |
|---|---|
| Text | Enter/send; multiline |
| Media | [[Media_Basics]] |
| Voice | Hold mic; cancel swipe |
| File | SAF / document picker |
| Echo mode | toggle / long-press send → [[Echoes]] |

Optimistic UI + outbox → [[Sync]].  
Fail: icon retry на пузыре.

## На сообщение (long-press menu)
| Action | MVP |
|---|---|
| Reply | Must |
| Copy | Must (text) |
| Forward | Must |
| **На стену** | Must → [[The_Chat_Wall]] |
| Edit | Should (time window) |
| Delete for me | Must |
| Delete for all | Should (time window + policy) |
| Select multiple | Should |
| Save media | Must where applicable |

## Статусы доставки
Sending → sent → delivered (optional) → read (if receipts on).  
Не стыдим публично; read receipts default осторожно → [[Privacy_Settings]].

## Reply / forward
Reply: quote bubble.  
Forward: choose chats; preserve or not author — product: show «Forwarded».

## Typing
Classic «печатает…» Must.  
[[Live_Thoughts]] Could, off default.

## Scroll & history
Pagination up. Jump from wall highlight ([[Structure_of_a_Post]]).  
Date separators.

## MVP checklist
- [ ] Text + media + voice send  
- [ ] Reply, forward, copy  
- [ ] Pin to wall  
- [ ] Delete for me  
- [ ] Retry failed  
- [ ] Typing indicator  

<- [[Product_Basics]] · [[Sync]] · [[MVP]]

---


<!-- source: Media_Basics.md -->

# Media Basics

Фото/видео/файлы — ежедневный use case 14–40.  
Стена — кураторство; здесь — **отправка и просмотр**.

## Attach sheet
Камера · Галерея (multi) · Файл · (позже: location no).  
Платформенные picker'ы → [[Platform_Differences]] · [[Permissions]].

## Перед отправкой
- Preview, compress quality (normal / higher)  
- Caption  
- Опция «и на стену»  
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

## Связь со стеной
Любое media message pinable → [[The_Chat_Wall]].  
Не дублировать blob → [[Data_Graph]].

## MVP checklist
- [ ] Photo/video/file send  
- [ ] Preview + progress  
- [ ] Auto-download policy  
- [ ] Full viewer + save  
- [ ] Voice message  

<- [[Product_Basics]] · [[Messages_Basics]] · [[The_Chat_Wall]]

---


<!-- source: Search.md -->

# Search

Замена «папок ради папок» на старте ([[Absolute_Minimalism]]).

## Точки входа
1. Список чатов → поиск (global)  
2. Чат → поиск по чату ([[Chat_Settings]])  

## Global (Must)
| Вкладка / секции | |
|---|---|
| Люди | username, name; not blocked |
| Чаты | title match, members |
| Сообщения | local FTS first ([[Data_Graph]]); server later |

Пустой query: recent searches / frequent chats — Should.

## In-chat
Jump to message, highlight.  
Фильтры media-only — Should.

## UX
Debounce input.  
Keyboard: search action.  
Cancel clear.

## Privacy
Не логируем поисковые строки на сервер без нужды.  
Контакты-only results if privacy requires → [[Privacy_Settings]].

## MVP checklist
- [ ] Users by username  
- [ ] Chats by title  
- [ ] Local message search  
- [ ] Open result → chat/message  

<- [[Product_Basics]] · [[Chat_List]] · [[MVP]]

---


<!-- source: Invites_and_Contacts.md -->

# Invites & Contacts

Рост без MAX-паттерна: **ссылка и сарафан** ([[User_Engagement]] · [[Competition]]).

## Инвайт-ссылка / QR (Must)
| Тип | |
|---|---|
| Add me (user) | `tolk://u/username` или https fallback |
| Group join | `tolk://g/token` |
| QR | Same payload; share sheet |

Share: system share ([[Platform_Differences]]).  
Revoke / rotate group link — admin ([[Groups_Basics]]).

## Флоу по ссылке
App installed → open target (auth gate if needed) → [[Registration_and_Auth]] if no session → land in chat/profile.  
Not installed → store + deferred deep link (Should; hard on both stores).

## Контакты (Must as opt-in)
Settings / «Найти друзей» → permission → hash upload (privacy-preserving as possible) → match users.  
**Не** блокер онбординга.  
Отключить / удалить загруженные — [[Privacy_Settings]].

## Добавить человека
Search username · contacts match · invite link · QR scan (Could).

## MVP checklist
- [ ] User + group invite links  
- [ ] Share sheet  
- [ ] Join via link after auth  
- [ ] Optional contacts match  

<- [[Product_Basics]] · [[Registration_and_Auth]] · [[Groups_Basics]] · [[User_Engagement]]

---


<!-- source: Block_and_Report.md -->

# Block & Report

Минимальная безопасность soft launch. Без этого группы разъест спам ([[Risks]]).

## Block (Must)
Откуда: профиль, chat settings, long-press.  
Эффект:
- Не пишет вам (server reject)  
- Не видит last seen / online (если были)  
- Чаты: скрыть или read-only empty state «Вы заблокировали»  
- Unblock: Settings → чёрный список / профиль  

Список: [[Privacy_Settings]] / [[Settings]].

## Report (Must)
Причины (короткий список): spam, abuse, other + optional text.  
Отправка report_id на moderation queue.  
Не обещаем «удалим за 5 минут» — честный «разберём».

## Spam heuristics (eng, soft launch)
Rate limit messages / echoes / group invites.  
Связь auth rate-limit → [[Registration_and_Auth]].

## Group moderation MVP
Admin remove member.  
Report group message → same pipeline.  
Anti-raid — later.

## MVP checklist
- [ ] Block / unblock  
- [ ] Report user/message  
- [ ] Blocked list UI  
- [ ] Server enforce block  

<- [[Product_Basics]] · [[Privacy]] · [[Chat_Settings]]

---


<!-- source: About_and_Legal.md -->

# About & Legal

Settings → **О приложении**.

## Содержимое
| Пункт | |
|---|---|
| Версия + build | Must (support) |
| Пользовательское соглашение | Must link |
| Политика конфиденциальности | Must link → [[Privacy]] |
| Лицензии OSS | Should |
| Связаться с поддержкой | email / form Must soft launch |
| Changelog | Could |

## Store requirements
In-app account deletion visible path → [[Account]].  
Privacy labels / Data safety forms — eng + legal.  
[[Platform_Differences]].

## Тон
Без пафоса «мы заботимся». Факты и ссылки.

<- [[Settings]] · [[Product_Basics]]

---


<!-- source: Novel_Mechanics.md -->

# Product Mechanics

Механики с толку. Не новаторство ради вау.  
Фильтр: [[True_Utility]] + [[Absolute_Minimalism]] + статус в [[MVP]].

## База (пол продукта)
Расписана отдельно — без неё дифференциаторы бессмысленны:

→ **[[Product_Basics]]** (регистрация, settings, список, сообщения, группы, медиа, поиск, блок…)

| Кусок | Узел |
|---|---|
| Вход / выход | [[Registration_and_Auth]] · [[Sessions_and_Logout]] |
| Список / сообщения / медиа | [[Chat_List]] · [[Messages_Basics]] · [[Media_Basics]] |
| Группы | [[Groups_Basics]] |
| Настройки | [[Settings]] · [[Platform_Differences]] |

## Дифференциаторы

| Pri | Механика | Одна строка | MVP |
|---|---|---|---|
| **P0** | [[The_Chat_Wall]] | Медиа/закрепы чата не тонут | Must |
| **P0** | [[Echoes]] | Отправить без ор-пуша | Must |
| **P1** | [[Living_Profiles]] | Профиль → сразу в чат | Should |
| **P1** | [[Live_Thoughts]] | Live-набор, off default | Could |
| **P2** | [[Whispers]] | Короткий эфемерный войс | Could |

Карточка стены → [[Structure_of_a_Post]].

## Правило выпила
- Не проходит Utility → нет  
- Ломает минимум → упростить или выкинуть  
- Только «как у TG/MAX» → не наш дифференциатор  

## Связанное
- Экраны → [[Core_Architecture]] · [[Spatial_UI]]  
- Данные → [[Data_Graph]] · [[Sync]]  
- Демо → [[Demo]]  

<- [[Tolk_Core_Concept]] · [[MVP]]

---


<!-- source: The_Chat_Wall.md -->

# The Chat Wall

## Боль
Фото, файлы, «это важно» тонут в истории через день.  
В TG — скролл или «в избранное». Отдельный канал — лишняя сущность.

## Решение
**Стена чата** — полка закрепов и медиа **этого** диалога (1:1 или группа).  
Не глобальная лента. Не stories. Не второй Instagram.

## Как попадает
1. Long-press сообщения/медиа → **На стену**  
2. Опционально при отправке: «и на стену»  
3. В группе: права (все / admin) — см. [[Open_Questions]]

## Что лежит
Фото, видео, файлы, короткие текстовые закрепы, ссылки с превью.  
Карточка → [[Structure_of_a_Post]].

## Навигация
Свайп или кнопка «Стена» ([[Spatial_UI]], [[Gesture_Mapping]]).  
Со стены: **В чат** → jump к исходному сообщению + краткая подсветка.

## Empty state
Одна строка: «Долгое нажатие на сообщение → На стену». Без баннерного ада.

## Порядок
MVP: новые сверху. Drag-reorder — Could.  
Конфликт: LWW по server time.

## Unpin
Открепить ≠ удалить из чата. Рвётся только `WallItem` ([[Data_Graph]]).

## Анти-клон
Нет алгоритма, лайков, публичной стены «для всех».

## MVP
Must: pin, лента, jump-to-chat.  
Could: drag, сложные роли.

Связь с базой: pin из [[Messages_Basics]], вход из [[Chat_Settings]] / колонны [[Spatial_UI]].

<- [[Novel_Mechanics]] · [[Product_Basics]] · [[MVP]]

---


<!-- source: Structure_of_a_Post.md -->

# Structure of a Post

Единица на [[The_Chat_Wall]] (и при необходимости в [[Living_Profiles]]).

## Карточка
**Header:** аватар 24×24, имя, относительное время  

**Body text:** простой текст; >500 символов → «Ещё»  

**Body media:**  
- 1 — full width  
- 2–4 — сетка  
- 5+ — horizontal scroll; не конфликтует с уходом в чат ([[Gesture_Mapping]])  

**Footer:**  
- Нет лайков и публичных счётчиков  
- **В чат** — jump + подсветка `accent.ice`  
- Опционально: переслать / Echo  

## Данные
Пост стены = ссылка на message/media + метаданные пина.  
Не дублируем файл без нужды ([[Data_Graph]]).

## Визуал
Токены → [[Visual_Language]]. Контент важнее рамок.

<- [[The_Chat_Wall]]

---


<!-- source: Echoes.md -->

# Echoes

## Боль
Мем/ссылка/фото «глянь потом» не должны звучать как «СРОЧНО».  
Обычный пуш орёт. «Без звука» в TG — прячут в меню.

## Решение
**Echo** — режим тихой доставки. Контент ждёт, пока откроют.  
Не заменяет обычные сообщения.

## Когда
- Мем, ссылка, несрочная медиа  
- Не для: «я у подъезда», коды, срочный ответ → обычное сообщение  

## UX отправителя
Toggle **Обычное | Echo** или long-press Send. Один жест.

## UX получателя
- Компактный индикатор (аватар / blur preview), не full-screen баннер  
- Много Echo → один индикатор + `×N`  
- Тап → sheet поверх текущего экрана  
- Dismiss / открыть в чате  
- Sound push: **off** по умолчанию  

## Анти-спам
Стек, не рой. Троттлинг с одного отправителя. Мьют чата глушит Echo.

## Таблица
| | Пуш | UI |
|---|---|---|
| Обычное | По настройкам | Чат + список |
| Echo | Нет / badge | Индикатор |

## Анти-клон
Не Stories. Не «тихие уведомления Android» спрятанные в системе.  
Продуктовый жест: «отправь без ора».

## MVP
Must: режим, индикатор, ×N, sheet.  
Could: умный DND, fancy PiP.

Связь с базой: toggle в [[Messages_Basics]], defaults в [[Notifications_Settings]], mute в [[Chat_Settings]].

<- [[Novel_Mechanics]] · [[Product_Basics]] · [[MVP]] · [[Privacy]]

---


<!-- source: Living_Profiles.md -->

# Living Profiles

## Зачем
Профиль часто мёртвый. Толк: минимум шагов от «кто это» до «уже пишу».

## MVP (Should)
| Блок | |
|---|---|
| Аватар, имя, @username | Да |
| Кнопка **Написать** | Да |
| Общие медиа (если чат есть) | Да |
| Био 1–2 строки | Опционально |
| Публичная лента как канал | Нет в MVP |

## Флоу ответа на медиа
Смотришь медиа → фокус ввода → превью контекста над клавиатурой → send → сразу чат.

## Пустой профиль
Поле ввода + «Написать». Без icebreakers-генераторов.

## Приватность
Видимость не-контактам — настройки. Общие медиа — только участникам чата. [[Privacy]]

## Анти-клон
Не Instagram-профиль. Не стена ВК для всех.

Редактирование своего профиля → [[Account]], не этот экран.

<- [[Novel_Mechanics]] · [[Product_Basics]] · [[MVP]]

---


<!-- source: Live_Thoughts.md -->

# Live Thoughts

## Боль
«Печатает…» — чёрный ящик. Иногда полезно видеть набор до Send.  
Не всем и не всегда.

## Решение
Опциональный live-набор символов **до** Send.  
**Выкл по умолчанию.** Could в [[MVP]].

## UX
- Черновик у получателя приглушённым стилем  
- Пауза > ~3с → opacity вниз  
- Send → обычное сообщение; без Send → в историю не попадает  

## Сеть
1. Быстрый канал (если есть)  
2. WebSocket  
3. Фолбэк: «печатает…» — UI не ломается  

Обрыв ~2с → индикатор; ~10с → снять draft. [[Core_Architecture]] · [[Sync]]

## Риски
Батарея, трафик, «не хочу чтобы видели набор», UDP режут.  
Бесит в метриках → kill switch. Фича не священна.

## MVP-срез
Could: 1:1 only. Группы — later/never.

<- [[Novel_Mechanics]]

---


<!-- source: Whispers.md -->

# Whispers

## Боль
Длинные войсы засоряют историю. Нужен короткий войс с понятной судьбой.

## Решение
Короткое голосовое: **hold-to-talk** + кап длины + опциональный TTL после прослушивания.  
Явный жест. Без «угадай позу телефона».

## UX
| | |
|---|---|
| Запись | Hold; release = stop; swipe = cancel |
| Длина | Кап 15–30с (на тестах) |
| Доставка | Обычное сообщение или Echo |
| TTL | Опция: удалить у обоих после полного play |

## Не в v1
Запись только по proximity. Скрытая запись.

## Приоритет
P2 / Could. Сначала база + стена + echo.  
Альтернатива проще: обычный войс + self-destruct timer.

<- [[Novel_Mechanics]] · [[MVP]]

---


<!-- source: Design_System.md -->

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

---


<!-- source: Spatial_UI.md -->

# Spatial UI

## Идея
Не стопка «назад-назад». Горизонтальные колонны `100vw`.

## MVP-колонны
```
[ Список чатов ]  ·  [ Чат ]  ·  [ Стена чата ]
```

| Колонна | |
|---|---|
| Список | [[Chat_List]], пины, [[Search]], вход в [[Settings]] |
| Чат | [[Messages_Basics]], композер, [[Echoes]] |
| Стена | [[The_Chat_Wall]] |

**Профиль** — sheet/push, не четвёртая ось ([[Living_Profiles]]).

## Нет в MVP
- Bottom tab-bar ×5  
- Discover / Nexus  
- Peek-панели на 30% ширины  

## Параллакс
Коэф. ~0.25–0.3. На weak GPU / Reduce Motion — off.

## Реализация
Pager / translateX (Reanimated) на верхнем уровне.  
Внутри чата — обычный stack (галерея, settings).

## Обучение
Один hint «свайп → стена», больше не показывать.

Пороги → [[Gesture_Mapping]].

<- [[Design_System]]

---


<!-- source: Visual_Language.md -->

# Visual Language

Тёмный, плотный, современный. Не госуслуги, не неоновый казино.  
Glass — только на панелях, не на каждом бабле.

## Dark tokens
| Token | Value | Role |
|---|---|---|
| `bg.deep` | `#0B0B0C` | Фон |
| `bg.elevated` | `#141416` | Карточки, input |
| `glass.panel` | `rgba(26,26,30,0.72)` | Header / sheet |
| `text.primary` | `#F2F2F3` | Текст |
| `text.secondary` | `#8E8E93` | Мета |
| `accent.mint` | `#00E676` | Online, Echo active |
| `accent.ice` | `#00B0FF` | Links, jump highlight |
| `danger` | `#FF453A` | Delete / error |
| `border.subtle` | `rgba(255,255,255,0.08)` | Обводки |

Light theme — те же роли, Should.

## Glass
Blur 16–20px. Mid Android: solid `bg.elevated` + border.

## Radius
Пузыри ~18–20 · карточки/sheet 24 · кнопки 14.

## Type
Системные шрифты. 13 meta · 15–16 body · 17–20 title.  
UI-строки короткие: «На стену», «Echo», «Ещё».

## Icons
Один outline-набор. Не мешать стили в одной панели.

<- [[Design_System]]

---


<!-- source: Gesture_Mapping.md -->

# Gesture Mapping

Жест = chrome. Если неочевидно — дублируем одной кнопкой.

## Карта MVP
| Жест | Где | Действие |
|---|---|---|
| Horizontal swipe | Колонны | Список ↔ чат ↔ [[The_Chat_Wall]] |
| Long-press | Сообщение | Reply, forward, **на стену**, delete… |
| Long-press Send | Композер | Обычное / [[Echoes]] |
| Tap | Echo indicator | Sheet |
| Dismiss swipe | Echo sheet | Закрыть |
| Edge swipe | Stack | Назад (платформа) |

## Пороги колонн
Commit: `> 40%` width **или** velocity `> 800 px/s`.  
Иначе spring back ([[Micro_Animations]]).

## Конфликты
Карусель на стене: горизонталь внутри, на краю — жест родителя (уход в чат).  
Вертикальный скролл стены > диагональный увод.

## Haptic
Long-press ~300ms medium/heavy · snap light · send/pin light.  
Системный off уважаем.

## A11y
Критичные жесты имеют не-жестовый путь. 30–40 лет не обязаны знать «секреты».

<- [[Spatial_UI]] · [[Design_System]]

---


<!-- source: Micro_Animations.md -->

# Micro Animations

Движение = feedback, не шоу. Spring preferred. Loop — ease.

## Reduce Motion
Колонны: cut/fade. Echo: static. Параллакс: off.

## Spring presets
**snap** (колонна): mass 1, damping 20, stiffness 250  
**sheet** (профиль, Echo): mass 1, damping 24, stiffness 200  
**press** (optional): scale 0.97, stiffness 400 — не на каждом item списка  

## Echo pulse
Scale 1 → 1.05 → 1, цикл ~3–4s, ease-out, один индикатор на ×N.

## Jump-to-message
Подсветка `accent.ice` ~0.8s fade. Без вечного мигания.

## Live Thoughts
Opacity 1 → 0.35 за ~400ms на паузе. Timing, не spring.

## Не делаем
Lottie на каждый экран · hero 800ms · blur+parallax+spring разом на weak GPU.

<- [[Design_System]]

---


<!-- source: Core_Architecture.md -->

# Core Architecture

Надёжность и скорость важнее clever stack.  
Плохой LTE не должен ломать UX из‑за «красивой» схемы.

## Поверхности

```
[ Список чатов ]
       │
       ▼
[ Чат 1:1 / группа ] ←→ [ Стена ]     [[The_Chat_Wall]]
       │
       ├── вложения / войсы / [[Whispers]] P2
       ├── [[Echoes]]
       └── [[Live_Thoughts]] P1

[ Профиль ] sheet → чат / общие медиа   [[Living_Profiles]]
```

Навигация → [[Spatial_UI]].  
Мелочи (auth, settings, list…) → [[Product_Basics]].  
Механики → [[Novel_Mechanics]].  
Онбординг eng → [[For_Developers]].

## Слои

```
┌─────────────────────────────────────┐
│ UI (RN / Reanimated / Gestures)     │
├─────────────────────────────────────┤
│ Client state (in-memory)            │  keyboard, live draft
├─────────────────────────────────────┤
│ Local DB + cache                    │  чаты, сообщения, стена, outbox
├─────────────────────────────────────┤
│ Sync engine                         │  → [[Sync]]
├─────────────────────────────────────┤
│ Transport: HTTPS + WS (+RTC*)       │  *только Live Thoughts
├─────────────────────────────────────┤
│ Server: API, storage, push, media   │
└─────────────────────────────────────┘
```

## Клиент
| Слой | Выбор |
|---|---|
| UI | React Native |
| Motion | Reanimated + Gesture Handler |
| DB | SQLite |
| KV | MMKV (список чатов, session, cursors) |
| UI state | Zustand (не персистить эфемерное) |
| Media | disk cache + CDN |

На телефоне нет graph-DB. «Граф» = модель, физика = SQL → [[Data_Graph]].

## Сервер (MVP)
- API: REST или gRPC-web (один стиль)  
- Realtime: WebSocket  
- Media: object storage + CDN, chunked upload  
- Push: APNs / FCM; Echo — без sound по умолчанию  
- Auth: сессии + refresh; провайдер входа — open question  

## Фолбэки
**Сообщения / стена / echo:** local + outbox → optimistic UI → drain.  
**Live Thoughts:** RTC → TURN → WS → «печатает…».  
**Медиа:** placeholder + retry; progressive quality.

## Принципы
1. Local-first UX  
2. Сервер — арбитр порядка между устройствами  
3. Понятная деградация, не «пустой экран»  
4. P0 не зависит от WebRTC  

Связано: [[Sync]] · [[Data_Graph]] · [[Privacy]] · [[Risks]]

<- [[Tolk_Core_Concept]]

---


<!-- source: Sync.md -->

# Sync

Сначала локально, потом сеть. Иначе мессенджер «глючный».

## Outbox
1. Запись в SQLite  
2. Optimistic UI  
3. Строка outbox (type, payload, retries)  
4. Worker шлёт при сети  
5. Ack → clear outbox, проставить seq/status  

Типы min: `send_message`, `edit`, `delete`, `pin_wall`, `unpin_wall`, `send_echo`, `ack_echo`, `read_cursor`.

## Inbox
- WS: `message.*`, `wall.*`, `echo.*`, `read.*`  
- Reconnect: catch-up `since_seq` / global cursor  
- Gap → догрузка диапазона, не «надеемся на WS»

## Multi-device
Один user — много Device.  
Read cursor и wall pins через сервер.  
Outbox per device; сервер идемпотентен по `client_id`.

## Конфликты
| Случай | Стратегия |
|---|---|
| Два порядка стены | LWW (MVP) |
| Edit vs delete | Delete wins |
| Дубль client_id | Idempotent upsert |
| Live draft | Не персистим |

## Медиа
Message `media_pending` → upload resume → `media_ready` → peer тянет thumb/full.  
UI send не ждёт полный upload (progress в пузыре).

## Метрики
Outbox lag p95 · deliver p95 · failed uploads · catch-up duration.

## RU-сеть
HTTPS + WS как база. Не вешать P0 на экзотический транспорт.  
Retry с jitter. Таймауты короткие.

<- [[Core_Architecture]] · [[Data_Graph]]

---


<!-- source: Data_Graph.md -->

# Data Graph

«Граф» = модель связей, не обязательный Neo4j.  
MVP: **Postgres (server) + SQLite (client)**. Рёбра = таблицы / FK.

## Сущности
| Сущность | Логика полей |
|---|---|
| `User` | id, username, display_name, avatar_ref, blurhash |
| `Chat` | id, type (dm/group), title?, updated_at |
| `ChatMember` | chat_id, user_id, role, muted, last_read_seq |
| `Message` | id, chat_id, sender_id, seq, kind, text?, media_refs?, reply_to?, deleted_at? |
| `Media` | id, mime, size, storage_key, w/h, duration? |
| `WallItem` | id, chat_id, message_id, pinned_by, pinned_at, sort_key |
| `Echo` | id, from_user, to_user, payload_ref, status (pending/opened/dismissed) |
| `Device` / Session | id, user_id, push_token, platform, last_active, device_name |
| `Block` | blocker_id, blocked_id, created_at |
| `Report` | id, reporter_id, target_type, target_id, reason, created_at |
| `InviteLink` | id, kind (user/group), token, chat_id?, created_by, revoked_at? |

Сессии UI → [[Sessions_and_Logout]]. Блоки → [[Block_and_Report]].  
Глобальной ленты Discover **нет**.

## Ключевые связи
```
User ──member──► Chat
Chat ──contains──► Message
Message ──has──► Media
Message ──pinned_as──► WallItem   // unpin ≠ delete message
User ──echo──► User + payload
```

Стена: UI рендерит message/media по ссылке.  
Echo: `pending` → индикатор; opened/dismissed → убрать. Стек ×N = count pending.

## ID и порядок
- `client_id` (ULID/UUIDv7) на клиенте для optimistic insert  
- `seq` с сервера для сортировки и gap detection  
- После ack — mapping client_id → server_id  

## Кэш клиента
| Что | Где |
|---|---|
| Чаты, сообщения, wall, echoes | SQLite |
| Session, flags, cursors | MMKV |
| Live draft | RAM only |

Поиск MVP: FTS SQLite + server search later.

<- [[Core_Architecture]] · [[Sync]]

---


<!-- source: For_Developers.md -->

# For Developers

Онбординг за один проход. Если что-то не ясно — дыра в концепте, фиксим документ.

## С чего начать (90 минут)
1. [[Tolk_Core_Concept]] — зачем продукт  
2. [[MVP]] — что ship, что нет  
3. [[Product_Basics]] — мелочи (auth, settings, list, messages…) — **обязательно**  
4. [[Core_Architecture]] + [[Sync]] + [[Data_Graph]]  
5. P0: [[The_Chat_Wall]] · [[Echoes]]  
6. UI: [[Spatial_UI]] · [[Gesture_Mapping]] · [[Visual_Language]] · [[Platform_Differences]]  

Не начинать с Live Thoughts / Whispers / pulse, пока нет auth + send + list.

## Принципы инженерии
1. **Доставка > декорации**  
2. **Local-first UX** — UI не ждёт сеть на send  
3. **Idempotent API** — `client_id` на сообщениях  
4. **P0 без WebRTC**  
5. **Feature flags** — echo/wall/live можно выключить  
6. **Честный offline** — outbox виден (clock/error), не silent data loss  

Фичи только через [[True_Utility]] + статус в [[MVP]].

## Стек (ориентир, не религия)
| Слой | Выбор |
|---|---|
| Mobile | React Native |
| Motion/gestures | Reanimated + Gesture Handler |
| Local DB | SQLite |
| Fast KV | MMKV |
| Client state | Zustand (эфемерное) |
| API | HTTPS JSON или gRPC-web — один стиль |
| Realtime | WebSocket |
| Media | S3-compatible + CDN |
| Push | FCM + APNs |
| Server | На выбор команды (Go/Rust/Node) — важны контракты, не hype |

Смена стека допустима, если [[Sync]]-семантика сохраняется.

## Предлагаемая структура монорепо
```
/apps
  /mobile          # RN client
  /api             # public API + ws gateway
  /worker          # media, push, outbox drain helpers
/packages
  /protocol        # OpenAPI / protobuf + event types
  /shared          # ids, validators
/docs              # = этот vault или экспорт
```

## Контракты (минимум событий)
```
message.created | message.edited | message.deleted
wall.pinned | wall.unpinned
echo.created | echo.opened | echo.dismissed
receipt.read (optional)
presence.typing (classic)
```

Поля сообщения (логика):  
`client_id`, `server_id`, `chat_id`, `sender_id`, `seq`, `kind`, `payload`, `created_at`.

Стена: `wall_item` → `message_id` + `sort_key` (не дубль файла).  
Echo: отдельная сущность со `status`.

Детали → [[Data_Graph]].

## Порядок реализации (tickets-level)
| Sprint focus | Done means |
|---|---|
| **S0** [[Registration_and_Auth]] + session + 1:1 text + WS + local DB | Два клиента пишут offline-resilient |
| **S1** [[Media_Basics]] + [[Groups_Basics]] + push [[Notifications_Settings]] | Фото в группе, пуш |
| **S2** Outbox + [[Chat_List]] + [[Settings]] skeleton + logout | Дубли, reconnect, [[Sessions_and_Logout]] |
| **S3** Wall P0 | [[The_Chat_Wall]] |
| **S4** Echo P0 | [[Echoes]] |
| **S5** Spatial UI + [[Platform_Differences]] polish | Колонны, permissions, channels |
| **S6** Soft launch | [[Block_and_Report]], инвайты, crashlytics |

Критерии MVP → [[MVP]].

## Не agilе-театр
- Нет отдельного микросервиса на каждую сущность в день 1  
- Нет graph DB «потому что в доке слово graph»  
- Нет E2EE в первом релизе без multi-device design  
- Нет pixel-perfect glass на Android Go за счёт 20fps  

## Тестирование (минимум)
- Unit: outbox reducer, seq gap fill  
- Integration: two-device message race  
- E2E smoke: send, pin wall, echo open  
- Device matrix: 1 mid Android + 1 recent iPhone  

## Где смотреть продуктовые edge-cases
| Тема | Узел |
|---|---|
| Фолбэки сети | [[Core_Architecture]], [[Live_Thoughts]] |
| Жесты vs карусель | [[Gesture_Mapping]] |
| Пуши | [[Echoes]], [[Privacy]] |
| Риски | [[Risks]] |

<- [[Tolk_Core_Concept]] · [[MVP]] · [[Core_Architecture]]

---


---

# Приложение: Google Stitch

Промпты на дизайн вынесены в отдельный файл рядом: **STITCH_PROMPT.md**
(Master prompt + screen prompts + negative + чеклист приёмки).

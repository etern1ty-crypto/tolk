---
tags: [tolk, product, account]
status: ready
updated: 2026-07-15
audience: [product, developer]
---
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
| Био | 0–140 символов — Must (для живой [[User_Wall|стены]]) |

Сохранение: optimistic UI + sync ([[Sync]]).  
Другие видят через [[Living_Profiles]] / header чата.  
Своя [[User_Wall|стена]] редактируется на экране профиля (посты), не здесь.

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

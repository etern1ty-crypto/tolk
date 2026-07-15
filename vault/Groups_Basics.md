---
tags: [tolk, product, groups]
status: ready
updated: 2026-07-15
audience: [product, developer]
---
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

## Полка группы
Одна [[Chat_Shelf|полка]] на chat_id.  
Права пина: all vs admin — open question; default MVP **all** (проще) или admin for large.  
Профили участников → [[Living_Profiles]] / [[User_Wall]], не полка.

## Уведомления
Mentions-only — Should ([[Notifications_Settings]]).

## MVP checklist
- [ ] Create, add members, leave  
- [ ] Admin rename/remove  
- [ ] Invite link  
- [ ] Group wall  

<- [[Product_Basics]] · [[Chat_Settings]] · [[MVP]]

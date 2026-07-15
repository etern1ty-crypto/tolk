---
tags: [tolk, product, search]
status: ready
updated: 2026-07-15
audience: [product, developer]
---
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

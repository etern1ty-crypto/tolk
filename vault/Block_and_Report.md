---
tags: [tolk, product, safety, trust]
status: ready
updated: 2026-07-15
audience: [product, developer]
---
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

---
tags: [tolk, product, invites, contacts, growth]
status: ready
updated: 2026-07-15
audience: [product, developer]
---
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

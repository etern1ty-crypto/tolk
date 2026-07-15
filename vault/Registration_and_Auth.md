---
tags: [tolk, product, auth, onboarding]
status: ready
updated: 2026-07-15
audience: [product, developer]
---
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

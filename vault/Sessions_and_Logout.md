---
tags: [tolk, product, sessions, security]
status: ready
updated: 2026-07-15
audience: [product, developer]
---
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

---
tags: [tolk, decisions, product]
status: ready
updated: 2026-07-15
audience: [investor, developer, product]
---
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

---
tags: [tolk, mvp, roadmap]
status: ready
updated: 2026-07-15
audience: [investor, developer, product]
---
# MVP

Основа — идея Никиты + минимализм.  
Фронт **без backend** сначала (mock).

## Готово, когда пользователь может
1. Войти (mock)  
2. Жить в **трёх вкладках**: Стена · **Чаты** · Профиль  
3. Писать в чатах; войсы и кружки — хотя бы UI mock  
4. Реакции на сообщения  
5. Лента **Стены**: лайк, коммент, репост в профиль, переслать  
6. В профиле: посты, «добавить в стену», кастом фона, настройки  
7. Не тонуть в UI  

## Must
### Nav
- [[Navigation_IA]] bottom 3 tabs; home = Чаты  

### Чаты
- List + dialog  
- Text · voice mock · circle mock  
- Reactions  
- [[Echoes]] secondary ok  

### Стена
- [[User_Wall]] feed + composer CTA  
- Like · comment · repost-to-profile · forward  

### Профиль
- [[Living_Profiles]] customize + posts + settings entry  
- Checkbox «В стену»  

### База
- Auth mock · [[Settings]] · offline banner  

## Should
- Real getUserMedia for circles/voice  
- Media on wall  
- Custom emoji packs  
- [[Chat_Shelf]] polish  

## Won't v1
Discover algorithm heavy · Stories · ads · tab×5 · force-install  

## Глоссарий
| | |
|---|---|
| **Стена** | Лента рекомендаций постов |
| **Чаты** | Home мессенджера |
| **Профиль** | Я + посты + settings |
| **Полка** | Закрепы *внутри* чата (secondary) |

<- [[Tolk_Core_Concept]] · [[Demo]]

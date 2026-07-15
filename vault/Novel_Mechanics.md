---
tags: [tolk, product, mechanics]
status: ready
updated: 2026-07-15
audience: [product, developer]
aliases: [Product_Mechanics]
---
# Product Mechanics

Механики с толку. Не новаторство ради вау.  
Фильтр: [[True_Utility]] + [[Absolute_Minimalism]] + статус в [[MVP]].

## База (пол продукта)
→ **[[Product_Basics]]**

| Кусок | Узел |
|---|---|
| Вход / выход | [[Registration_and_Auth]] · [[Sessions_and_Logout]] |
| Список / сообщения / медиа | [[Chat_List]] · [[Messages_Basics]] · [[Media_Basics]] |
| Группы | [[Groups_Basics]] |
| Настройки | [[Settings]] · [[Platform_Differences]] |

## Дифференциаторы

| Pri | Механика | Одна строка | MVP |
|---|---|---|---|
| **P0** | [[User_Wall]] | Лента / «новости» пользователя | Must |
| **P0** | [[Living_Profiles]] | Профиль → стена + «Написать» | Must |
| **P0** | [[Chat_Shelf]] | Закрепы/медиа *чата* не тонут | Must |
| **P0** | [[Echoes]] | Отправить без ор-пуша | Must |
| **P1** | [[Live_Thoughts]] | Live-набор, off default | Could |
| **P2** | [[Whispers]] | Короткий эфемерный войс | Could |

Карточка → [[Structure_of_a_Post]].  
Redirect старого имени «chat wall» → [[The_Chat_Wall]].

## Глоссарий
- **Стена** = user feed  
- **Полка** = chat pins  

## Правило выпила
- Не проходит Utility → нет  
- Ломает минимум → упростить или выкинуть  
- Только «как у TG/MAX» → не наш дифференциатор  

## Связанное
- Экраны → [[Core_Architecture]] · [[Spatial_UI]]  
- Данные → [[Data_Graph]] · [[Sync]]  
- Демо → [[Demo]]  

<- [[Tolk_Core_Concept]] · [[MVP]]

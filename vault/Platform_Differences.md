---
tags: [tolk, product, platform, ios, android]
status: ready
updated: 2026-07-15
audience: [product, design, developer]
---
# Platform Differences

Один продукт, **два привычных мира**.  
Не клонируем iOS на Android и наоборот — берём system patterns.

## Принцип
| Общее (одинаково) | Разное (платформа) |
|---|---|
| Информационная архитектура, копирайт RU, механики Tolk | Навигационные жесты OS, share sheet, notifications plumbing, permissions UX |
| Колонны список↔чат↔стена | Edge-swipe back, status bar/insets, haptics API |
| Echo / Wall логика | Каналы Android vs iOS categories |

## Навигация и chrome
| | iOS | Android |
|---|---|---|
| Назад | Edge swipe + явный chevron где stack | System back / predictive back |
| Settings look | Inset grouped list | Prefer Material list, но **не** ломаем dark-токены Tolk |
| Action sheet | UIAlertController style | Material bottom sheet |
| Share | Share Link / UIActivity | Android Sharesheet |
| Haptics | UIImpactFeedback | PerformanceVibrator / VibrationEffect |

Жесты продукта → [[Gesture_Mapping]] не конфликтуют с system back.

## Permissions UX
| Permission | iOS | Android |
|---|---|---|
| Notifications | Request at meaningful moment; Settings deep link | 13+: runtime; channels always |
| Camera / Mic | Purpose strings (Info.plist) | Runtime + rationale dialog if denied |
| Photos | Limited library / full | Photo picker preferred (Photo Picker API) |
| Contacts | Hard deny recovery via Settings | Same + rationale |
| Bluetooth/nearby | Не просим без нужды | Same |

Единый продуктовый текст «зачем» → [[Permissions]].

## Notifications
- **Android:** channels `messages` / `groups` / `echo` (low) — [[Notifications_Settings]]  
- **iOS:** badge, alert, sound; Focus modes уважаем  
- Reply from notification: Could, API differs  

## Keyboard & input
| | iOS | Android |
|---|---|---|
| IME | IQKeyboard / RN handling | `windowSoftInputMode` / adjustResize |
| Mic button | hold-to-talk same | same; background mic restrictions stricter on modern Android |
| Attach | PHPicker | Photo Picker / SAF for files |

## Background & sync
- iOS: background fetch limited; WS + push primary ([[Sync]])  
- Android: FCM high-priority for messages; избегать вечного foreground service в MVP  

## Store & install
| | App Store | Play |
|---|---|---|
| Review | Privacy nutrition labels, account deletion required | Data safety form |
| Delete account | In-app must ([[Account]]) | Same expectation |
| Push certs | APNs | FCM |

## Visual
Safe area, cutout, gesture bar — insets both.  
Blur glass: iOS ok; Android mid — solid fallback ([[Visual_Language]]).

## Что сознательно едино
- Иконки и смысл кнопок  
- Названия: Стена, Echo, Настройки  
- Порядок секций Settings  
- Пороги свайпа колонн (40% / 800px/s)  

## QA matrix (min)
1 mid Android + 1 recent iPhone на каждый release candidate ([[For_Developers]]).

<- [[Settings]] · [[Product_Basics]] · [[Design_System]]

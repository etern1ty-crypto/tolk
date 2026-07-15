---
tags: [tolk, animation]
status: ready
updated: 2026-07-15
audience: [design, developer]
---
# Micro Animations

Движение = feedback, не шоу. Spring preferred. Loop — ease.

## Reduce Motion
Колонны: cut/fade. Echo: static. Параллакс: off.

## Spring presets
**snap** (колонна): mass 1, damping 20, stiffness 250  
**sheet** (профиль, Echo): mass 1, damping 24, stiffness 200  
**press** (optional): scale 0.97, stiffness 400 — не на каждом item списка  

## Echo pulse
Scale 1 → 1.05 → 1, цикл ~3–4s, ease-out, один индикатор на ×N.

## Jump-to-message
Подсветка `accent.ice` ~0.8s fade. Без вечного мигания.

## Live Thoughts
Opacity 1 → 0.35 за ~400ms на паузе. Timing, не spring.

## Не делаем
Lottie на каждый экран · hero 800ms · blur+parallax+spring разом на weak GPU.

<- [[Design_System]]

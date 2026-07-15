# Platform Differences & QA Checklist (Tolk)

## 1. Core Philosophy
Tolk uses a single unified design language (colors, spatial columns, gestures) but respects fundamental platform habits (navigation, system sheets, permissions).

## 2. QA Checklist: Android
- [ ] **Navigation**: System Back button and Predictive Back gesture correctly navigate the pager or close sheets without breaking state.
- [ ] **Permissions**: 
  - Push notifications requested at runtime (Android 13+) only when relevant.
  - Rationale dialog shown if permission was previously denied.
- [ ] **Notification Channels**:
  - `messages` (High/Default importance)
  - `groups` (Default importance)
  - `echo` (Low importance - silent)
- [ ] **Sharing**: Uses Android Sharesheet.
- [ ] **Media Picker**: Uses Android Photo Picker API (or SAF fallback).
- [ ] **Haptics**: Uses `VibrationEffect` / `PerformanceVibrator`.

## 3. QA Checklist: iOS
- [ ] **Navigation**: Edge-swipe back gesture works smoothly. Explicit chevron (`<`) present where stacks are used.
- [ ] **Permissions**: 
  - Purpose strings defined in `Info.plist`.
  - Soft prompt shown before triggering the hard system permission dialog.
- [ ] **Notifications**: 
  - Respects Focus modes.
  - Badges clear correctly on read.
- [ ] **Sharing**: Uses `UIActivityViewController` (Share Link).
- [ ] **Media Picker**: Uses `PHPickerViewController`.
- [ ] **Haptics**: Uses `UIImpactFeedbackGenerator` matching the spring animations.

## 4. Unified Behaviors (Must NOT Differ)
- Chat Wall swipe threshold (40% / 800px/s).
- Echo chip animation (3-4s pulse).
- Theme colors and typography scales (though Android may adjust font scale per system).

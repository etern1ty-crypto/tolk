# Spatial UI & Navigation Model (Tolk Frontend)

## Core Idea
No stacked "back-back" navigation for the main flow. Horizontal columns taking `100vw`.
**Absolutely no bottom tab-bars.**

## MVP Columns (Pager)
```
[ ChatList Column ]  <-- swipe -->  [ Chat Column ]  <-- swipe -->  [ ChatWall Column ]
```

## Route Architecture

### Root Navigator (Stack or Native)
- `AuthStack` (Phone, OTP, ProfileSetup)
- `MainPager` (The 3-column spatial UI)
- `SettingsStack` (SettingsHub, Notifications, Appearance, Privacy, Storage)
- `MediaViewer` (Full screen media overlay)

### MainPager (Horizontal Pager / Swipable views)
1. **`ChatList`**: 
   - Displays all active chats.
   - Entry points: Search, FAB (New Chat), Settings (via Avatar/Icon).
2. **`Chat`**:
   - The active conversation. Messages, composer. 
   - Long-press to pin to Wall, Echo toggle.
3. **`ChatWall`**:
   - Dedicated space for pinned media and messages of the active chat.
   - Tap "jump to chat" to go back to the context.

### Modals & Overlays
- **`EchoSheet`**: Appears on tap of an Echo indicator. Quiet notification overlay.
- **`AttachmentSheet`**: Bottom sheet for sending media/files.

## Gestures
- **Horizontal swipe**: Navigate between ChatList ↔ Chat ↔ ChatWall. (Threshold: >40% width OR >800px/s velocity).
- **Edge swipe**: Standard platform back gesture within Stacks (like Settings).
- **Long-press**: Message actions (Pin to wall, Reply, Delete).
- **Tap**: Open Echo sheet from indicator.
- **Swipe down**: Dismiss Echo sheet.

# Echoes Spec (P0)

## 1. What are Echoes?
"Echo" is a quiet delivery mode for messages that say "Look at this later" (e.g. memes, non-urgent links). It prevents the app from screaming with push notifications for non-urgent content.

## 2. Sender UX (Echo Toggle)
- **Action**: In the composer, the user can toggle the delivery mode to "Echo".
- **Trigger**: Long-press the Send button (or a dedicated toggle next to it) to select "Send as Echo".

## 3. Receiver UX (Chip & Sheet)
- **Push Notification**: DELIVERED WITHOUT SOUND. By default, Echoes do not trigger a noisy push. They may show a silent badge depending on OS settings.
- **In-App Indicator (The Chip)**:
  - If an Echo is received while the user is in the app (or upon opening), a compact indicator (Chip) appears.
  - The Chip displays the sender's avatar or a blurred preview. 
  - If multiple Echoes are received, they stack into a single Chip showing `×N`.
  - **Animation**: The Chip pulses subtly (Scale `1 → 1.05 → 1`, `3-4s` cycle, ease-out) to draw attention without being aggressive.
- **The Sheet**:
  - Tapping the Echo Chip opens a Bottom Sheet overlaying the current screen.
  - The Sheet displays the Echo content.
  - **Actions**: "Dismiss" (swipe down to close) or "Open in Chat" (jumps to the context).

## 4. Anti-Spam & Conflicts
- Echoes from a muted chat remain completely silent (no pulsing chip).
- If the user receives a normal message and an Echo simultaneously, the normal message takes precedence for notifications.

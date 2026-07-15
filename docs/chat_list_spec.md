# Chat List & Search UX Spec (Tolk)

## 1. Chat List Row Component

The Chat List is the primary screen. It adheres to absolute minimalism, showing only necessary information.

### Visual Elements per Row
- **Avatar**: Circular image or initials fallback.
- **Title**: Chat name or Contact name.
- **Preview**: Last message text (1 line truncated).
- **Time**: Relative time of last message (e.g., "10:42", "Yesterday").
- **Unread Badge**: Minimalist dot or counter (subtle color, not high-anxiety red).
- **Indicators**:
  - `Pin Icon`: Pinned to top.
  - `Mute Icon`: Notifications disabled.
  - `Error Icon`: Failed to send message.
  - `Online / Typing`: Subtle indicator (optional/Should).

### Actions & Gestures
- **Tap**: Open `ChatColumn`.
- **Long-Press**: Opens context menu (Pin, Mute, Delete/Hide chat, Mark as Read).
- **Swipe Action (Platform native)**: Quick actions (e.g., swipe right to pin, left to delete/mute). Limited to 2-3 actions.

## 2. Empty States
If the chat list is empty (fresh account):
- **UI**: Clean message "Start your first conversation" (Напишите первым).
- **CTA**: Prominent button to "Find Friends" or "Share Invite Link".
- *Strict Rule*: No recommended channels, no ads, no bot suggestions.

## 3. Global Search UX
Triggered from the top search icon in the Chat List.
- **Tabs / Sections**: 
  1. People (username, name)
  2. Chats (title, members)
  3. Messages (local FTS search via SQLite)
- **Behavior**: Debounced input. Opens target chat or jumps to specific message when tapped.
- **Privacy**: Does not log searches to server unnecessarily.

## 4. Invites & Contacts (Growth)
- **Invite Links**: Primary growth engine. 
  - User: `tolk://u/username`
  - Group: `tolk://g/token`
- **Contacts Sync**: Strictly OPT-IN. Never a blocker during onboarding. Triggered via "Find Friends" action.

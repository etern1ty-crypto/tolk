# Messages & Composer Spec (Tolk)

## 1. Message Bubble Actions (Long-press Menu)

Triggered via a long-press (~300ms) with medium/heavy haptic feedback.

| Action | Priority | Behavior |
|---|---|---|
| **Reply** | Must | Quotes the message above the composer. |
| **Copy** | Must | Copies text payload. |
| **Forward** | Must | Opens chat selector. Optionally strips author info. |
| **Pin to Wall (На стену)** | Must (P0) | Sends message/media to The Chat Wall. |
| **Delete for me** | Must | Local deletion. |
| **Delete for all** | Should | Depends on server time window / policy. |
| **Save Media** | Must | Saves photo/file to device. |
| **Edit** | Should | Time-window limited editing. |

## 2. Composer Inputs

- **Text**: Standard auto-expanding input field.
- **Media / File**: Attachment sheet (saf/camera/gallery).
- **Voice**: Hold-to-record mic icon. Swipe to cancel.
- **Echo Toggle**: A UI toggle or long-press on Send button to switch to "Echo" mode (sends without sound push).

## 3. Delivery States (Sync & Optimistic UI)

Using Local-first + Outbox pattern:

1. **Pending/Sending**: Message appears immediately in the UI (optimistic). Status icon: Clock or subtle loading indicator.
2. **Sent (Ack)**: Reaches server. Status icon: One checkmark.
3. **Failed**: Network issue or timeout. Status icon: Red exclamation/retry icon on the bubble. Tap to retry.
4. **Read**: (Optional/Should based on privacy settings). Status icon: Two checkmarks or avatar pile.

## 4. Typing Indicators
- **Standard**: "typing..." / "печатает..." (Must).
- **Live Thoughts**: (Could / v2). Optional live character streaming before send. Default off. 

## 5. Layout & Scroll
- Paginated upward scroll.
- Date separators between days.
- Highlight animation (0.8s fade) when jumping from Wall to Message.

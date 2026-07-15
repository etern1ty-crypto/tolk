# The Chat Wall Spec (P0)

## 1. What is The Chat Wall?
A dedicated column/shelf for pinned media and important messages of a specific dialog (1:1 or group). It resolves the issue of media getting lost in a long chat history without introducing a complex "gallery" or a separate public feed.

## 2. Pin Flow Wireframe
1. **Trigger**: User long-presses a message or media in the `ChatColumn`.
2. **Action**: Selects "Pin to Wall" (На стену) from the context menu. (Optionally: checkbox during initial send "Pin to Wall").
3. **Execution**: A new `WallItem` is created in the database referencing the original message.
4. **Visibility**: Appears immediately in the `ChatWallColumn` (right swipe from Chat).

## 3. Wall Screen Structure (Structure of a Post)
Each item on the Wall is represented as a Card.

- **Header**: Avatar (24x24), Name, Relative Time.
- **Body Content**:
  - *Text*: Truncated if > 500 characters with a "Show More" (Ещё) button.
  - *Media Layout*:
    - 1 item: Full width.
    - 2-4 items: Grid.
    - 5+ items: Horizontal scroll carousel (designed to not conflict with the parent pager swipe).
- **Footer**:
  - **Jump to Chat (В чат)**: The primary action. No likes, no views counters.

## 4. Jump-to-Chat Behavior
- **Trigger**: User taps "В чат" in the card footer.
- **Action**:
  - The pager swipes back from `ChatWallColumn` to `ChatColumn`.
  - The chat list automatically scrolls to the referenced message.
  - The target message is briefly highlighted with `accent.ice` via an 0.8s fade out.

## 5. Order & Unpinning
- **Order**: Newest items at the top (LWW resolution). Drag-to-reorder is a "Could" priority.
- **Unpin**: Removing an item from the Wall deletes the `WallItem` link, but DOES NOT delete the original message from the chat history.

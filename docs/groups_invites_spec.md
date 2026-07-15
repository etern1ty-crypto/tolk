# Groups & Invites Spec (Tolk)

## 1. Create Group UI
Triggered from the Chat List (`+` / FAB).

1. **Pick Members**: Screen to select users (from local contacts, or by username search).
2. **Setup Details**: 
   - Group Name input.
   - Optional Avatar upload.
3. **Finish**: Tapping "Create" transitions directly into the new Group Chat view.

## 2. Invite Entry UI
Accessible via Settings -> "Invite Friends", or from Chat Settings -> "Invite Link".

- **Personal Invite Link**: `tolk://u/username`
- **Group Invite Link**: `tolk://g/token`
- **Actions**:
  - Copy Link
  - Share (System Share Sheet)
  - Show QR Code

## 3. Group Roles (MVP)
- **Member**: Can send text/media, leave group.
- **Admin** (Creator): Can rename, change avatar, add/remove members, manage invite links, delete group.

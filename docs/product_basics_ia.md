# Product Basics Information Architecture (Tolk)

## 1. Main Navigation Flow (Target Screen IDs)

| User Action | Origin | Target Screen ID | Notes |
|---|---|---|---|
| First Launch | App Start | `AuthPhoneScreen` | Proceed to OTP, then Profile setup. |
| Open App (Auth'd) | App Start | `MainPager` | Default focus is `ChatListColumn`. |
| Tap Settings Icon | `ChatListColumn` | `SettingsHubScreen` | Starts `SettingsStack`. |
| Tap New Chat FAB | `ChatListColumn` | `NewChatSheet` / `SearchScreen` | Pick user or create group. |
| Tap a Chat | `ChatListColumn` | `ChatColumn` | Focus shifts to the chat pager column. |
| Swipe Left | `ChatListColumn` | `ChatColumn` | |
| Swipe Left Again | `ChatColumn` | `ChatWallColumn` | P0 Feature. |

## 2. Settings Hub Tree

**Target Screen ID: `SettingsHubScreen`**

- **Account**
  - Profile & Username ➔ `EditProfileScreen`
  - Devices & Sessions ➔ `SessionsScreen`
- **Chats & Messages**
  - Appearance (Theme, Text size) ➔ `AppearanceSettingsScreen`
  - Data & Storage ➔ `StorageSettingsScreen`
- **Notifications** ➔ `NotificationSettingsScreen`
- **Privacy** ➔ `PrivacySettingsScreen`
- **Friends & People**
  - Invite Friends ➔ `InviteContactsScreen`
  - Blocked Users ➔ `BlockedUsersScreen`
- **Support & About** ➔ `AboutScreen`
- **Logout** ➔ Triggers confirmation modal ➔ Wipes local DB ➔ Navigates to `AuthPhoneScreen`.

## 3. In-Chat Basic Flows

- **Group/Chat Info**: Tap Header in `ChatColumn` ➔ `ChatSettingsScreen` (Mute, media, members).
- **Composer Media**: Tap Attach ➔ `MediaPickerSheet`.
- **Permissions**:
  - *Notifications*: Prompted after first successful chat or via Settings soft prompt.
  - *Microphone/Camera*: Prompted only on first use (Attach, Voice record).
  - *Contacts*: Prompted on "Find Friends" action. No hard blocking if denied.

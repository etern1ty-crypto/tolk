# Settings Surface Spec (Tolk)

## 1. Hub Structure (The Routes List)

The Settings hub is a flat list, avoiding a deep tree of 40 screens. Accessible from the Chat List via the avatar or `⚙` icon.

- **Header**: Avatar, Name, @username (Navigates to `AccountSettings`)
  
- **Section 1: Account**
  - Profile & Username (Edit name, avatar, bio, username)
  - Devices / Sessions (List sessions, Logout all others)

- **Section 2: Chats & Messages**
  - Appearance (Theme: Dark/Light/Auto, Text Size)
  - Data & Storage (Clear cache, Auto-download policy)

- **Section 3: Notifications**
  - Notifications Settings (Global on/off, Sound, Message preview, Echo sound preference, In-group settings)

- **Section 4: Privacy & People**
  - Privacy Settings (Blocked users, Contacts upload toggle, Read receipts, Last seen)
  - Invite Friends / Find Contacts

- **Section 5: Support & Info**
  - About & Legal (App version, EULA, Privacy policy, Support contact)

- **Footer Action**
  - Logout (Logs out this device, triggers confirmation and DB wipe)

## 2. Navigation Architecture
`SettingsHubScreen` is the root of the `SettingsStack`. Each item navigates exactly one level deep (e.g., `SettingsHubScreen -> PrivacySettingsScreen`).
Platform-specific UI differences (iOS grouped lists vs Android Material lists) apply, but the structure remains identical across platforms.

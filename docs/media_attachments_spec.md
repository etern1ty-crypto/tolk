# Media & Attachments Spec (Tolk)

## 1. Attachment Sheet UI
Triggered via the attachment icon in the composer.

- **Options**:
  - Camera
  - Gallery (Multi-select supported)
  - File / Document
- **Platform Specifics**:
  - iOS: Uses PHPicker for photos, UIDocumentPicker.
  - Android: Uses Photo Picker API (or SAF for files).

## 2. Pre-Send Flow
Before confirming sending media:
- Show preview.
- Allow adding a text caption.
- **Tolk Specifics**: 
  - Option: "Pin to Chat Wall" checkbox.
  - Option: Send as "Echo" (quiet send).

## 3. Voice Messages
- **Trigger**: Hold microphone icon.
- **Cancel**: Swipe away.
- **Playback**: Show waveform and duration. Playback speed multiplier (e.g. 1.5x) is a "Should" priority feature.

## 4. Auto-Download Policy (Data & Storage)
Accessible via `Settings -> Data & Storage`.

**Options**:
- Wi-Fi only (Default recommendation)
- Wi-Fi + Cellular
- Never (Manual tap required to download)

**Behavior**:
- The chat list ALWAYS prefers the thumbnail.
- Full resolution media is downloaded according to the policy upon opening the chat or full-screen viewer.

## 5. Media Cache Management
- **Action**: "Clear Media Cache"
- **Behavior**: Deletes local thumbnails and full files. 
- **Preserved**: The Chat Wall metadata, message history, and pins are kept. Media will simply re-download if viewed again according to the auto-download policy.
- **Limits**: Soft prompt if cache exceeds a certain threshold.

## 6. Full-Screen Viewer
- Swipe left/right between media in the same chat.
- Actions: Save to device (requires OS permission), Share, Pin to Wall.

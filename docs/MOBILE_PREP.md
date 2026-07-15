# iOS & Android preparation (Tolk)

Goal: ship **one product** on Web + iOS + Android without rewriting messaging logic three times.

## Recommended approach

| Layer | Choice |
|---|---|
| Mobile app | **Expo (React Native)** in `apps/mobile` |
| Shared domain | `packages/protocol` (OpenAPI types + event names) |
| Shared UI tokens | `packages/ui-tokens` (colors, spacing — web + RN) |
| Local store | Zustand + SQLite (expo-sqlite) + SecureStore |
| Media | expo-av, expo-camera, expo-image-picker |
| Push | expo-notifications → FCM/APNs via backend |
| Navigation | Expo Router or React Navigation — **tabs: Wall · Chats · Profile** |

Why Expo: matches vault (`For_Developers`), reuses TS, one team for web+mobile after API exists.

**Do not** build native-only Swift/Kotlin first unless API is stable and team is split.

## Monorepo target layout

```
apps/
  web/                 # exists
  mobile/              # Expo app (to create)
  api/                 # backend (from backend prompt)
packages/
  protocol/            # OpenAPI + generated TS
  ui-tokens/           # design tokens JSON/TS
vault/                 # product SoT
```

## Product parity matrix (MVP)

| Feature | Web | iOS | Android |
|---|---|---|---|
| Auth phone/OTP | ✅ mock → API | ✅ | ✅ |
| Chats list + text | ✅ | ✅ | ✅ |
| Reply / reactions | ✅ | ✅ | ✅ |
| Voice | UI mock | record + upload | record + upload |
| Circles (video notes) | mock + camera | camera + upload | camera + upload |
| Wall feed | ✅ | ✅ | ✅ |
| Profile + banner patterns | ✅ | ✅ | ✅ |
| Echo | ✅ UI | + silent push | + silent push |
| Shelf | ✅ | ✅ | ✅ |
| Push notifications | — | APNs | FCM |

## Architecture rules (mobile)

1. **Same REST + WS contracts** as web — no private mobile API.
2. **Local-first**: write message to SQLite → outbox → POST; never block UI on network.
3. **Idempotent `client_id`** on every send.
4. **Tabs** match `vault/Navigation_IA.md` (not old 3-column pager as root).
5. **Permissions**: mic/camera/photos only on first use (circles/voice/attach).
6. **Safe areas**: respect notches; hide tab bar inside open chat (as web mobile).
7. **Theming**: Tolk quiet dark + pattern backgrounds; black letter avatars.

## Sprint plan (after API B0–B2)

| Phase | Mobile work |
|---|---|
| M0 | `npx create-expo-app apps/mobile` + Expo Router tabs scaffold |
| M1 | Auth screens → real OTP API |
| M2 | Chats list + conversation + WS |
| M3 | Outbox SQLite + reconnect |
| M4 | Wall + profile posts |
| M5 | Voice + circle upload pipeline |
| M6 | Push + background fetch policy |
| M7 | EAS Build (iOS + Android) + TestFlight / internal testing |

## EAS / store prep (checklist)

### Shared
- [ ] App IDs: `app.tolk.ios` / `app.tolk.android` (pick final)
- [ ] Privacy policy URL + support email
- [ ] Icon 1024 + splash (monochrome logo ok)
- [ ] Deep links: `tolk://` + https app links later

### iOS
- [ ] Apple Developer account
- [ ] Push key (APNs) → backend
- [ ] Camera / Microphone / Photo Library usage strings (RU + EN)
- [ ] TestFlight external testers

### Android
- [ ] Play Console
- [ ] FCM project + service account → backend
- [ ] Foreground service notes if long voice upload
- [ ] 16 KB page size / target SDK as required by Play

## What to do **now** (before backend is done)

1. Freeze OpenAPI in `packages/protocol` as backend is built.  
2. Keep `apps/web` as the UX reference implementation.  
3. Create `apps/mobile` scaffold only when API auth + DM text work.  
4. Do **not** port mock Zustand store 1:1 — introduce repository layer (`apiClient`, `wsClient`, `outbox`).

## Anti-patterns

- Separate “mobile backend”  
- UI-only RN without outbox  
- Building iOS in Swift and Android in Kotlin in parallel for MVP  
- Shipping circles before text reliability  

## Definition of mobile-ready

- [ ] Protocol package versioned; web uses it  
- [ ] Auth + DM + WS documented with examples  
- [ ] Media upload contract signed URLs  
- [ ] Push payload schema (`type: message|echo|system`)  
- [ ] Expo app boots on iOS Simulator + Android emulator against staging API  

## Related

- Backend agent: [`BACKEND_AGENT_PROMPT.md`](./BACKEND_AGENT_PROMPT.md)  
- Product: [`../vault/MVP.md`](../vault/MVP.md), [`../vault/Navigation_IA.md`](../vault/Navigation_IA.md)  
- Frontend: [`../apps/web`](../apps/web)

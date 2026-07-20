<p align="center">
  <img src="docs/assets/logo.svg" width="72" height="72" alt="Tolk" />
</p>

<h1 align="center">Tolk.</h1>

<p align="center">
  A <strong>minimalist messenger</strong> for the Russian-speaking community.<br/>
  Fast · clean · yours — no 5-icon tab bar, no MAX clone.
</p>

<p align="center">
  <a href="README.md">Русский</a> · <strong>English</strong>
</p>

<p align="center">
  <a href="#quick-start"><img src="https://img.shields.io/badge/web-MVP-ffffff?style=flat-square&labelColor=000000" alt="web MVP" /></a>
  <a href="#navigation"><img src="https://img.shields.io/badge/nav-Wall·Chats·Profile-a3a3a3?style=flat-square&labelColor=000000" alt="nav" /></a>
  <a href="https://github.com/etern1ty-crypto/tolk-back"><img src="https://img.shields.io/badge/backend-tolk--back-a3a3a3?style=flat-square&labelColor=000000" alt="backend" /></a>
  <a href="vault/"><img src="https://img.shields.io/badge/docs-Obsidian_vault-a3a3a3?style=flat-square&labelColor=000000" alt="vault" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-a3a3a3?style=flat-square&labelColor=000000" alt="license" /></a>
</p>

---

## The idea

| | |
|---|---|
| **Chats** | The home surface. Text, voice notes, video circles, reactions |
| **Wall** | A post feed (like · comment · repost to profile · forward) |
| **Profile** | Living profile, own posts, "add to wall", settings |

Differentiators, without the noise: the **Wall**, **Echo** (quiet send), the **Shelf** (pins *inside* a chat).
Look and feel: **monochrome**, hairline feed (X-style), **lucide** icons.

Full product concept → [`vault/Tolk_Core_Concept.md`](vault/Tolk_Core_Concept.md) · IA → [`vault/Navigation_IA.md`](vault/Navigation_IA.md)

---

## What this repository is

This is the **client** (web app) and the **product vault**. The server side — the HTTP API and
the WebSocket gateway — lives in a separate repository, [**tolk-back**](https://github.com/etern1ty-crypto/tolk-back).

| Repository | Role |
|---|---|
| **tolk** (this one) | Web client `apps/web` + product vault |
| [**tolk-back**](https://github.com/etern1ty-crypto/tolk-back) | API + WebSocket + Postgres · Redis · S3 |

---

## Repository layout

```text
tolk/
├── apps/
│   └── web/                 # Vite + React + TS · the main client
├── packages/
│   └── protocol/            # Shared WS/REST contracts (mirror of tolk-back)
├── vault/                   # Obsidian source of truth (product)
├── docs/                    # Engineering notes, walkthrough, assets
├── package.json             # root scripts → apps/web
└── README.md
```

> The repo root also holds a legacy Expo scaffold (an early RN experiment).
> **The current UI is `apps/web`.**

---

## Quick start

```bash
# Node 20+
cd apps/web
npm install
npm run dev
```

Open `http://127.0.0.1:5173`

From the repo root:

```bash
npm run dev      # same as apps/web
npm run build
npm run preview
```

### Connecting to the backend

The client talks to the real API from [tolk-back](https://github.com/etern1ty-crypto/tolk-back).
With no environment variables set it defaults to `http://localhost:3000` and the WS endpoint `/ws`
on the same origin — so running `tolk-back` locally is enough. To point it elsewhere, create
`apps/web/.env.local`:

```bash
# apps/web/.env.local
VITE_API_URL=http://localhost:3000        # API base URL
VITE_WS_URL=ws://localhost:3000/ws        # WebSocket gateway
VITE_YANDEX_CLIENT_ID=                    # optional Yandex ID sign-in
VITE_VK_CLIENT_ID=                        # optional VK ID sign-in
```

> Social sign-in buttons appear only when the matching `CLIENT_ID` is set.
> Otherwise, username/password sign-in is available.

### Show a friend (Cloudflare Tunnel)

```bash
# terminal 1
cd apps/web && npm run dev -- --host 127.0.0.1 --port 5173

# terminal 2
cloudflared tunnel --url http://127.0.0.1:5173
```

`vite.config.ts` enables `allowedHosts: true` for `*.trycloudflare.com`.

---

## Navigation

```text
┌──────────┬──────────┬──────────┐
│   Wall   │  Chats ★ │ Profile  │
└──────────┴──────────┴──────────┘
     │           │          │
    feed     list→chat   posts + ⚙
```

**Demo path:** login → chat → reply / reaction / voice / circle → wall → profile → settings.

More detail: [`docs/walkthrough.md`](docs/walkthrough.md)

---

## Stack (web)

| Layer | |
|---|---|
| UI | React 19 · TypeScript · Vite |
| Routing | react-router-dom |
| State | Zustand (+ persist) |
| Media | browser-image-compression |
| Icons | lucide-react (stroke 1.75) |
| Style | CSS Modules · monochrome tokens |
| Realtime | WebSocket → [tolk-back](https://github.com/etern1ty-crypto/tolk-back) |

Auth: username/password plus optional Yandex ID and VK ID sign-in.

---

## Obsidian vault

The [`vault/`](vault/) folder mirrors the live vault (`Documents/tolk/tolk`).

We recommend opening it in Obsidian as a vault:

1. Obsidian → Open folder as vault → `…/tolk/vault`
2. Reading order: `Tolk_Core_Concept` → `MVP` → `Navigation_IA` → `For_Developers`

Key notes:

| Note | About |
|---|---|
| [`Navigation_IA`](vault/Navigation_IA.md) | The 3 tabs — the foundation |
| [`User_Wall`](vault/User_Wall.md) | Wall = feed |
| [`Chat_Shelf`](vault/Chat_Shelf.md) | Chat Shelf ≠ Wall |
| [`Living_Profiles`](vault/Living_Profiles.md) | Profile |
| [`Visual_Language`](vault/Visual_Language.md) | Black & white UI |
| [`MVP`](vault/MVP.md) | Scope |

---

## Design

- **Black background** `#000`, text `#F5F5F5`
- Primary CTA — a white pill button
- Wall/profile: **hairline dividers**, no "cards"
- No colour accents (mint/ice were dropped)

---

## Backend & mobile

| Link | |
|---|---|
| [**tolk-back**](https://github.com/etern1ty-crypto/tolk-back) | Server side: API + WebSocket + Postgres/Redis/S3 |
| [`packages/protocol`](packages/protocol) | Shared WS/REST contracts |
| [`docs/MOBILE_PREP.md`](docs/MOBILE_PREP.md) | iOS / Android (Expo) readiness |

## Roadmap (short)

- [x] Web shell · 3 tabs · happy path
- [x] Wall / profile / chats / Echo / shelf (UI)
- [x] Desktop shell + ambient patterns
- [x] Real API + WebSocket ([tolk-back](https://github.com/etern1ty-crypto/tolk-back))
- [x] Media upload / voice notes & circles
- [ ] Expo client (`apps/mobile`) iOS + Android

---

## License

[MIT](LICENSE) — see the file in the repo root.

---

<p align="center">
  <sub>Tolk. — a messenger that makes sense.</sub>
</p>

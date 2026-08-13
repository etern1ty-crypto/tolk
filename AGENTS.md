# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

---

# Anti-Slop Redesign Rules

When doing ANY UI/design/redesign work, follow these rules strictly. The goal is output that looks like a skilled human designer made it — not AI-generated slop.

## Design Read (do this FIRST)

Before touching code, state a one-line **Design Read**:
> *"Reading this as: <page kind> for <audience>, with a <vibe> language, leaning toward <design system / aesthetic family>."*

Infer from: page kind, vibe words, reference URLs/products, audience, existing brand assets, hard constraints. If genuinely ambiguous, ask ONE question — never a multi-question dump.

Set three intensity dials:
- **DESIGN_VARIANCE** (1 symmetric → 10 asymmetric)
- **MOTION_INTENSITY** (1 static → 10 cinematic)
- **VISUAL_DENSITY** (1 airy → 10 packed)

## The Iron Law: Never Ship the First Version

The first version is a draft. Polish lives in passes 2 and 3.
```
Read brief → Build → Critique with fresh eyes → Refine → Pre-flight → Ship
```
Skipping critique is the failure mode.

## Typography
- Hierarchy through scale + weight contrast (≥1.25 ratio between steps). No flat scales.
- Body line length ≤65–75ch. Body line-height 1.5–1.6; headings tight (1.1–1.2).
- Max 3 font families. Pair on contrast axis or use one family in multiple weights.
- Hero/display clamp() max ≤6rem. Display letter-spacing floor ≥-0.04em.
- `text-wrap: balance` on h1–h3; `text-wrap: pretty` on long prose. No all-caps body.
- **BANNED as defaults**: Inter, Fraunces, Instrument Serif. Serif discouraged as default.

## Color
- Verify contrast: body ≥4.5:1; large text ≥3:1. Placeholder text needs 4.5:1 too.
- One accent color, locked across the whole page. Saturation <~80% by default.
- Prefer OKLCH. Tint neutrals slightly toward brand hue (0.005–0.015 chroma).
- No pure `#000`/`#fff` — use off-black/off-white for depth.
- **BANNED**: "AI purple/blue glow", cream/beige + brass premium-consumer palette as reflex defaults.

## Layout & Spacing
- Consistent spacing scale (4px/8px base). Vary for rhythm; generous whitespace.
- Cards only when elevation communicates real hierarchy. **Nested cards are always wrong.**
- Flexbox for 1D, Grid for 2D. Responsive: `repeat(auto-fit, minmax(280px, 1fr))`.
- One corner-radius system per page; cards top out at 12–16px.
- Semantic z-index scale. Never `999`/`9999`.
- Hero fits viewport: headline ≤2 lines, subtext ≤20 words, CTA visible without scroll.

## Motion
- Every animation needs purpose: feedback, state change, spatial continuity. "Looks cool" = don't.
- UI animations ≤300ms. **ease-out** for enter/exit. Never `ease-in` on UI.
- Animate ONLY `transform` and `opacity`. Never animate width/height/top/left/margin/padding.
- Never animate from `scale(0)` — start at `scale(0.95)` + opacity.
- `prefers-reduced-motion` fallback is MANDATORY.
- **Never animate keyboard-initiated actions.**

## Interaction & Components
- Design ALL EIGHT states: default, hover, focus, active, disabled, loading, error, success.
- Labels above inputs (never placeholder-as-label). Validate on blur. Errors below with `aria-describedby`.
- Prefer native `<dialog>` + `inert`, Popover API, CSS anchor positioning.
- Touch targets ≥44px. Undo beats confirmation dialogs for reversible actions.

## Copy
- Button labels = verb + object ("Save changes", not "OK"). Link text must stand alone.
- **No em dashes (`—`) anywhere** — #1 AI tell. Use commas, colons, periods, parentheses.
- **BANNED words**: streamline, empower, supercharge, seamless, world-class, leverage, unlock, elevate, cutting-edge, robust, intuitive.
- No generic names (John Doe), fake-perfect numbers (99.99%), startup-slop brands (Acme/Nexus).

## Anti-Slop Ban List (HARD BLOCKS)

These patterns are INSTANT REJECT if found in output:
- Side-stripe borders
- Gradient text
- Default glassmorphism (blur + transparency without purpose)
- Hero-metric template (big number + label in a row of 3+)
- Identical card grids (3+ same-size cards with icon + title + description)
- Eyebrow text on every section
- Ghost-card border+shadow combo
- Over-rounded cards (>16px radius)
- Sketchy/hand-drawn SVGs as decoration
- Fake browser/device screenshots
- Purple/blue gradient backgrounds
- Emoji as section icons
- "Trusted by" logos without real data
- Testimonials without real names/photos
- Generic stock-photo hero images

## Category-Reflex Check

If someone could guess the theme + palette from the category alone, RETHINK IT. A fintech doesn't have to be blue. A health app doesn't have to be green. Have a point of view.

## Preserve Concept, Kill Slop

When redesigning:
1. Identify the CORE CONCEPT (what problem does this UI solve? what feeling should it evoke?)
2. KEEP the concept intact
3. STRIP every pattern from the Ban List above
4. Replace stripped elements with intentional, specific design decisions
5. Justify every visual choice in one sentence

## Pre-Flight Before Shipping

Before declaring done, verify:
- [ ] No items from Ban List present
- [ ] Contrast ratios pass (body ≥4.5:1, large ≥3:1)
- [ ] All 8 interaction states designed
- [ ] Reduced motion fallback exists
- [ ] Copy has no banned words or em dashes
- [ ] Typography scale has ≥1.25 ratio between steps
- [ ] No nested cards
- [ ] Z-index uses semantic scale
- [ ] Category-reflex check passed (not predictable from category alone)

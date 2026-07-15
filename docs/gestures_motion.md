# Gestures & Motion Rules (Tolk)

## Gesture Collision Rules

### 1. Horizontal Swipe (Pager) vs Horizontal Scroll (Carousel)
- **Conflict**: A horizontal swipe inside a media carousel on The Chat Wall vs navigating back to the Chat column.
- **Resolution**: Horizontal scroll inside inner components (carousels) takes priority. Only at the edge of the carousel (when `offsetX === 0` or `offsetX === maxScroll`) does the gesture propagate to the parent Pager to trigger column navigation.

### 2. Vertical Scroll vs Diagonal Swipe
- **Conflict**: Scrolling The Chat Wall vertically vs slightly swiping diagonally to return to the Chat.
- **Resolution**: Vertical scroll dominates. A diagonal swipe with a primary vertical vector must lock onto the vertical scroll and cancel the horizontal pager gesture.

## Hardcoded Thresholds for Implementation

- **Column Swipe Commit Thresholds**: 
  - Width: `> 40%` of screen width.
  - OR Velocity: `> 800 px/s`.
  - *If neither is met, spring back to the current column.*
- **Long-Press Threshold**: 
  - `~300ms` for triggering context menus (Message actions: Reply, Pin to Wall, Delete).
  - Triggers a medium/heavy haptic feedback.

## Animation & Motion Presets

- **Snap (Columns)**: `mass: 1, damping: 20, stiffness: 250`
- **Sheet (Echo, Profile)**: `mass: 1, damping: 24, stiffness: 200`
- **Echo Pulse**: Scale `1 → 1.05 → 1`, cycle `~3-4s`, ease-out.
- **Jump-to-Message**: Highlight with `accent.ice` via an `0.8s` fade (no infinite blinking).
- **Reduce Motion**: Respect OS settings. Fallback columns to `fade/cut`. Echo pulse becomes static. Disable parallax.

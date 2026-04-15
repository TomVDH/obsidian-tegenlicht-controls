# Tab Style Exploration — Parked Directions

> **Current decision:** `pill-frost` — frosted glass active pill with accent inset border ring.

All variants remain implemented in `styles.css` and can be re-activated by adding their id to `TAB_STYLES` in `src/settings-tab.ts`.

---

## Pill family

| id | Description |
|---|---|
| `pill` | Solid accent fill, text-on-accent |
| **`pill-frost`** ← **chosen** | Frosted glass + translucent white surface + inset rim |
| `pill-soft` | Background-secondary surface, inset border |
| `pill-ghost` | Transparent, accent colour outline |
| `pill-tint` | Accent colour at 14% opacity bg + accent text |
| `pill-frosttint` | Frost + accent wash combined |
| `pill-mono` | Inverted — text-normal bg, background-primary text |
| `pill-glow` | Accent fill + outward halo glow |
| `pill-gradient` | Gold → lavender gradient |
| `pill-lifted` | Rises 2px on active with deep shadow |
| `pill-dot` | Dot indicator bounces up below active tab |
| `pill-inset` | Pressed/inset inner shadow |
| `pill-neon` | Dark pill + accent text + neon glow |
| `pill-duo` | Pink → blue gradient |
| `pill-flat` | Text only, accent colour, no background |
| `pill-pop` | Scale-up transform on active |
| `pill-shimmer` | Animated rainbow sweep |
| `pill-badge` | Accent fill + offset ring |
| `pill-dark` | Dark matte surface |
| `pill-pulse` | Breathing glow animation |
| `pill-sweep` | Diagonal accent light sweep |

---

## Segment family

| id | Description |
|---|---|
| `seg` | Raised card in secondary-bg wrap |
| `seg-soft` | Surface + inset border, mirrors pill-soft |
| `seg-ghost` | Transparent wrap + accent outline active, mirrors pill-ghost |
| `seg-frost` | Frosted glass active tab |
| `seg-tint` | Accent wash bg + accent text |
| `seg-frosttint` | Frosted wrap + deeper frosted active |
| `seg-mono` | Inverted active tab |
| `seg-accent` | Accent fill active |
| `seg-border` | Outline wrap |
| `seg-pill` | Full pill shape inside segment wrap |
| `seg-glow` | Raised card + glow |
| `seg-grad` | Gradient fill active |
| `seg-inset` | Inset wrap, raised active |
| `seg-flat` | No wrap bg |
| `seg-dot` | Dot indicator inside wrap |
| `seg-neon` | Dark wrap, neon active |
| `seg-minimal` | Ultra-subtle wrap |
| `seg-sharp` | Sharp corners, no radius |
| `seg-outline` | Active gets outline only |
| `seg-gradwrap` | Gradient wrap background |
| `seg-split` | Dividers between tabs |
| `seg-thick` | More padding, chunkier |
| `seg-badge` | Active styled as badge |
| `seg-sweep` | Diagonal accent sweep |

---

## Notes

- The **spacing slider** (`--tc-tab-gap` CSS variable) is implemented but UI is hidden. Re-expose by restoring the `tc-tab-spacing-row` block in `display()` in `settings-tab.ts`.
- The **tab style switcher** UI is also hidden. Restore by bringing back the `TAB_STYLES.forEach` block.
- All 60+ CSS rules remain in `styles.css` — nothing was deleted, just hidden from the UI.

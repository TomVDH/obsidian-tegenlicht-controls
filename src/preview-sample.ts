/**
 * Canonical typography preview content.
 *
 * A single curated sample that exercises every common Markdown element
 * (H1–H4, body paragraphs, bold / italic / underline / link, bullet list
 * with inline code, callout with strong emphasis). Uses classical Lorem
 * Ipsum so the page-under-test is about typography — not about reading a
 * message — and stays visually neutral across any theme / flavour.
 *
 * Intended for re-use. The Typography tab drops this into its
 * mini-Obsidian mock today; future surfaces (Flavour switcher preview,
 * theme comparison cards, onboarding splash) should pull from here too
 * so every "what will my note look like?" pane shows the same canonical
 * sample. Change it once → every preview updates in lockstep.
 */

/** Forty Vlaamse uitdrukkingen used as the mini-Obsidian preview's vault
 *  label (top-right, where the active note title would normally live).
 *  Replaces the placeholder "Lorem ipsum dolor sit amet" so the preview
 *  picks up a fresh saying every render. Subset is informal —
 *  verification pass to follow. */
export const VAULT_LABELS: string[] = [
  "'t Is in de sacoche",
  "Met je gat in de boter vallen",
  "Z'n frank is gevallen",
  "Een pintje pakken",
  "Komaan, Madammeke",
  "Stoefen lijk een Sinjoor",
  "Mijn gedacht",
  "'t Smaakt naar meer",
  "Geen kat te zien",
  "Allez, hé",
  "Een dikke nek hebben",
  "Goesting hebben",
  "Schele zever verkopen",
  "Wat een ambras",
  "De pijp aan Maarten geven",
  "Op een oor liggen",
  "Een blauwe maandag",
  "De kat de bel aanbinden",
  "Geen blad voor de mond nemen",
  "Boontje komt om z'n loontje",
  "Een witte raaf",
  "Een appeltje voor de dorst",
  "Door de mand vallen",
  "Op de pof",
  "Een hart onder de riem",
  "Een vogel voor de kat",
  "Met de noorderzon vertrekken",
  "De koe bij de horens vatten",
  "Een kat in een zak kopen",
  "Daar wringt de schoen",
  "Iemand een poets bakken",
  "Tegen de stroom in zwemmen",
  "Een rare snuiter",
  "Het hart op de tong",
  "Een gat in de dag slapen",
  "'t Zal wel zijn",
  "Het regent pijpenstelen",
  "Iets onder de knie hebben",
  "Niet pluis",
  "Een bekanntte van mij",
];

/** Pick a random vault label. Called per preview render so the title
 *  bar shows a fresh idiom each time the panel rebuilds. */
export function getRandomVaultLabel(): string {
  return VAULT_LABELS[Math.floor(Math.random() * VAULT_LABELS.length)];
}

/** Inner content only — the <main class="mini-main"> body. Use when the
 *  caller already renders its own ribbon + sidebar + tab chrome.
 *
 *  The `.mini-code` block uses classed <span> tokens to simulate
 *  Obsidian's native syntax highlighting (keywords, strings, numbers,
 *  function names, comments) so the Source font's output reads as it
 *  would in a real code block, not as grey mono blob.
 */
export const TYPOGRAPHY_SAMPLE_MAIN_HTML = `
  <h1>Lorem ipsum dolor sit amet</h1>
  <p class="mini-lede">Consectetur adipiscing elit, sed do eiusmod tempor
  incididunt ut labore et dolore magna aliqua — an opening paragraph set
  at the editor's reading size. The H1 above is the heaviest weight in
  the rhythm; every slider you move propagates down through this page.</p>
  <h2>Sed do eiusmod tempor</h2>
  <p>Ut enim ad minim veniam, <strong>quis nostrud exercitation ullamco
  laboris</strong> nisi ut aliquip ex ea commodo consequat. <em>Duis
  aute irure dolor</em> in reprehenderit in voluptate velit esse cillum.
  Words carry <u>underlined weight</u>, curl into italic asides, and
  link back with <a href="#" class="mini-link">a quiet hyperlink</a>.</p>
  <h3>Ut enim ad minim veniam</h3>
  <ul>
    <li>Nisi ut aliquip ex ea commodo consequat</li>
    <li>Duis aute irure dolor in reprehenderit voluptate</li>
    <li>Monospace surfaces inline: <code>const ratio = 1.618;</code></li>
  </ul>
  <h4>Excepteur sint occaecat</h4>
  <p>Cupidatat non proident, sunt in culpa qui officia deserunt mollit
  anim id est laborum. <em>Adipiscing, consectetur, incididunt</em> —
  each phrase finds its own voice in the chosen editor font.</p>
  <pre class="mini-code"><code><span class="mini-syn-cm">// Source font — code blocks use var(--font-monospace)</span>
<span class="mini-syn-kw">const</span> <span class="mini-syn-var">typography</span> = {
  <span class="mini-syn-prop">interface</span>: <span class="mini-syn-str">"var(--font-interface)"</span>,
  <span class="mini-syn-prop">editor</span>:    <span class="mini-syn-str">"var(--tc-font-editor)"</span>,
  <span class="mini-syn-prop">source</span>:    <span class="mini-syn-str">"var(--font-monospace)"</span>,
};

<span class="mini-syn-kw">function</span> <span class="mini-syn-fn">ratio</span>(<span class="mini-syn-param">phi</span> = <span class="mini-syn-num">1.618</span>) {
  <span class="mini-syn-kw">return</span> phi * phi;  <span class="mini-syn-cm">// exercise digits + operators</span>
}</code></pre>
  <div class="callout" data-callout="note">
    <div class="callout-title">
      <div class="callout-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg></div>
      <div class="callout-title-inner">Nota bene</div>
    </div>
    <div class="callout-content">
      <p>This preview reads the same CSS variables the plugin writes to the live Obsidian workspace, so what you see here is what you'll get there. Toggle <strong>Callout style</strong>, <strong>radius</strong>, and <strong>title padding</strong> above and watch this block update in lockstep.</p>
    </div>
  </div>
`;

/** Full mini-Obsidian shell + content, ready to assign to innerHTML on a
 *  `.tc-typo-preview.tc-mini-obsidian` element. Chrome (title bar, ribbon,
 *  sidebar, tabs) is baked in — the caller just picks a container and
 *  lets the CSS vars do the rest. The `__VAULT_LABEL__` token is replaced
 *  per render with a fresh idiom from VAULT_LABELS. */
export const TYPOGRAPHY_SAMPLE_FULL_HTML = `
  <header class="mini-title">
    <span class="mini-dots"><i></i><i></i><i></i></span>
    <span class="mini-name">Obsidian</span>
    <span class="mini-vault">__VAULT_LABEL__</span>
    <button class="tc-mini-mode-toggle" type="button" aria-label="Toggle preview mode"></button>
  </header>
  <aside class="mini-ribbon">
    <i class="mini-rib active"></i>
    <i class="mini-rib"></i>
    <i class="mini-rib"></i>
    <i class="mini-rib"></i>
  </aside>
  <aside class="mini-side">
    <h4>Notes</h4>
    <ul>
      <li>Daily</li>
      <li class="mini-active">Typography study</li>
      <li class="mini-nested">Heading rhythm</li>
      <li class="mini-nested">Body voice</li>
      <li>Archive</li>
    </ul>
  </aside>
  <main class="mini-main">
    <div class="mini-tabs">
      <div class="mini-tab active">Typography study</div>
      <div class="mini-tab">Calibration</div>
    </div>
    ${TYPOGRAPHY_SAMPLE_MAIN_HTML}
  </main>
`;

/** Convenience for render sites that want to build the preview node
 *  themselves rather than injecting HTML. Creates a div with the
 *  standard preview classes and populates it. The vault-label token in
 *  the title bar is swapped for a fresh Vlaamse uitdrukking each call. */
export function buildTypographyPreview(parent: HTMLElement): HTMLElement {
  const preview = parent.createDiv("tc-typo-preview tc-mini-obsidian");
  preview.innerHTML = TYPOGRAPHY_SAMPLE_FULL_HTML.replace("__VAULT_LABEL__", getRandomVaultLabel());
  setupPreviewModeToggle(preview);
  return preview;
}

// ═══════════════════════════════════════════════════════════════════════
// CALLOUT PREVIEW — mini-Obsidian shell whose body is a callout gallery
// ═══════════════════════════════════════════════════════════════════════
//
// Used by the Legacy → Callouts section's PREVIEW expander. Body is just
// a heading and a short lede, then five callouts of different types
// (note, tip, warning, success, quote) with realistic Obsidian DOM —
// `.callout` / `.callout-title` / `.callout-icon` / `.callout-title-inner`
// / `.callout-content`, with `.is-collapsible` + `data-callout-fold` on
// the foldable ones. AnuPpuccin's `anp-callout-*` body classes and the
// CSS vars the plugin writes (`--callout-radius`,
// `--callout-title-padding`, `--callout-content-padding`,
// `--callout-title-opacity`) all paint these as they would real notes.
//
// No code block — keeps the preview short so the callouts dominate.
// Chevron icons in the foldable callouts are minimal Lucide-style SVGs.

const SVG_CALLOUT_NOTE = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>`;
const SVG_CALLOUT_TIP = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`;
const SVG_CALLOUT_WARNING = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`;
const SVG_CALLOUT_SUCCESS = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
const SVG_CALLOUT_QUOTE = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/></svg>`;
const SVG_CHEVRON_DOWN = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;

// Lucide-style sun + moon SVGs for the per-preview light/dark toggle.
// Convention: show the icon of the mode you'd switch TO — moon when
// currently light, sun when currently dark.
const SVG_SUN = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m4.93 19.07 1.41-1.41"/><path d="m17.66 6.34 1.41-1.41"/></svg>`;
const SVG_MOON = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

// ─── Light/dark toggle in the preview chrome ──────────────────────────
// The toggle affects the workspace theme (and every preview reading its
// vars) — NOT a preview-only scope. The earlier "scope to wrapper"
// approach added `theme-dark`/`theme-light` to the preview element,
// which set Obsidian core CSS vars on a closer ancestor than body and
// CLOBBERED the AnuPpuccin flavour vars (Mocha / Latte / etc.) that
// only live on body-scoped selectors. Result: the preview rendered in
// vanilla Obsidian colours instead of the user's selected palette.
//
// The acceptable trade-off (correct palette > scope isolation) means
// the toggle behaves like a workspace theme switcher. After flipping
// body.theme-dark we call the plugin's applier so the matching flavour
// (lightFlavour / darkFlavour) is also written — keeping previews and
// workspace in lockstep with the user's two configured palettes.
//
// Plugin reference is registered once at onload via
// `registerPreviewPluginRef`; previews just dispatch on the module
// state. The custom event fans out to every visible preview's icon.

import { apply as applyPluginSettings } from "./applier";
import type { TegenlichtSettings } from "./settings";

const PREVIEW_MODE_EVENT = "tc-preview-mode-toggle";
let registeredSettings: TegenlichtSettings | null = null;

/** Called once from main.ts onload — gives the preview module a handle
 *  on the live settings so togglePreviewMode can re-run the applier
 *  (which writes the matching flavour class for the new theme). */
export function registerPreviewPluginRef(s: TegenlichtSettings): void {
  registeredSettings = s;
}

function getCurrentMode(): "dark" | "light" {
  return document.body.classList.contains("theme-dark") ? "dark" : "light";
}

function togglePreviewMode(): void {
  const goingDark = getCurrentMode() !== "dark";
  document.body.classList.toggle("theme-dark", goingDark);
  document.body.classList.toggle("theme-light", !goingDark);
  // Re-run the applier so the flavour class on body matches the new
  // theme (lightFlavour for light, darkFlavour for dark). Without this
  // the old flavour's vars would persist and the previews + workspace
  // would render with the wrong palette for the new mode.
  if (registeredSettings) applyPluginSettings(registeredSettings);
  window.dispatchEvent(new Event(PREVIEW_MODE_EVENT));
}

/** Wires the .tc-mini-mode-toggle button inside `preview`. Icon
 *  refreshes via the module event whenever any peer preview toggles.
 *  Self-cleaning listener detaches when the preview leaves the DOM. */
function setupPreviewModeToggle(preview: HTMLElement): void {
  const btn = preview.querySelector<HTMLButtonElement>(".tc-mini-mode-toggle");
  if (!btn) return;

  const refresh = () => {
    const mode = getCurrentMode();
    btn.innerHTML = mode === "dark" ? SVG_SUN : SVG_MOON;
    const label = mode === "dark" ? "Switch to light mode" : "Switch to dark mode";
    btn.setAttribute("aria-label", label);
    btn.setAttribute("title", label);
  };

  refresh();

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    togglePreviewMode();
  });

  const onPeerToggle = () => {
    if (!btn.isConnected) {
      window.removeEventListener(PREVIEW_MODE_EVENT, onPeerToggle);
      return;
    }
    refresh();
  };
  window.addEventListener(PREVIEW_MODE_EVENT, onPeerToggle);
}

// ── Callout preview body — two switchable views ──────────────────────
// Tab 1 ("Lorem sandbox"): a short Markdown sample with prose around
// 1-2 callouts — gives a feel for callouts in context.
// Tab 2 ("Callout gallery"): a richer set of callout TYPES with sparse
// text between, so users can scan variants quickly.

const CALLOUT_SANDBOX_HTML = `
  <h1>Lorem ipsum dolor sit amet</h1>
  <p class="mini-lede">Consectetur adipiscing elit, sed do eiusmod
  tempor incididunt ut labore et dolore magna aliqua.</p>

  <div class="callout" data-callout="note">
    <div class="callout-title">
      <div class="callout-icon">${SVG_CALLOUT_NOTE}</div>
      <div class="callout-title-inner">Note</div>
    </div>
    <div class="callout-content">
      <p>A callout sitting in prose. Reads CSS variables the plugin
      writes — radius, title padding, content padding all live.</p>
    </div>
  </div>

  <p>Ut enim ad minim veniam, <strong>quis nostrud exercitation ullamco
  laboris</strong> nisi ut aliquip ex ea commodo consequat. Duis aute
  irure dolor in reprehenderit in voluptate velit esse cillum.</p>

  <div class="callout is-collapsible" data-callout="tip" data-callout-fold="+">
    <div class="callout-title">
      <div class="callout-icon">${SVG_CALLOUT_TIP}</div>
      <div class="callout-title-inner">Tip</div>
      <div class="callout-fold">${SVG_CHEVRON_DOWN}</div>
    </div>
    <div class="callout-content">
      <p>Foldable + open. Switch <strong>Fold position</strong> in the
      controls above and the chevron jumps sides.</p>
    </div>
  </div>
`;

const CALLOUT_GALLERY_HTML = `
  <h2>Callout gallery</h2>
  <p>Variants below — each <code>data-callout</code> picks up the
  AnuPpuccin palette through CSS variables.</p>

  <div class="callout" data-callout="note">
    <div class="callout-title">
      <div class="callout-icon">${SVG_CALLOUT_NOTE}</div>
      <div class="callout-title-inner">Note</div>
    </div>
    <div class="callout-content">
      <p>Default callout — paragraph rendering on the theme's base
      accent.</p>
    </div>
  </div>

  <div class="callout is-collapsible" data-callout="tip" data-callout-fold="+">
    <div class="callout-title">
      <div class="callout-icon">${SVG_CALLOUT_TIP}</div>
      <div class="callout-title-inner">Tip</div>
      <div class="callout-fold">${SVG_CHEVRON_DOWN}</div>
    </div>
    <div class="callout-content">
      <p>Foldable + open. Try collapsing it.</p>
    </div>
  </div>

  <p class="mini-lede">Foldable callouts respect the <strong>Fold
  position</strong> setting; collapsed ones stay closed by default.</p>

  <div class="callout is-collapsible is-collapsed" data-callout="warning" data-callout-fold="-">
    <div class="callout-title">
      <div class="callout-icon">${SVG_CALLOUT_WARNING}</div>
      <div class="callout-title-inner">Warning</div>
      <div class="callout-fold is-collapsed">${SVG_CHEVRON_DOWN}</div>
    </div>
    <div class="callout-content" style="display: none;">
      <p>Hidden until expanded.</p>
    </div>
  </div>

  <div class="callout" data-callout="success">
    <div class="callout-title">
      <div class="callout-icon">${SVG_CALLOUT_SUCCESS}</div>
      <div class="callout-title-inner">Success</div>
    </div>
    <div class="callout-content">
      <p>Green-tone variant — picks up the success colour token.</p>
    </div>
  </div>

  <p>Quote-flavoured at the bottom — italicised body in most themes.</p>

  <div class="callout" data-callout="quote">
    <div class="callout-title">
      <div class="callout-icon">${SVG_CALLOUT_QUOTE}</div>
      <div class="callout-title-inner">Quote</div>
    </div>
    <div class="callout-content">
      <p><em>Italic body inside a muted-accent block — the classic
      quote treatment.</em></p>
    </div>
  </div>
`;

/** Full mini-Obsidian shell wrapping the callout gallery body. Same
 *  chrome as the typography preview, two functional tabs that swap
 *  between the prose-with-callouts sandbox and the variant gallery. */
export const CALLOUT_SAMPLE_FULL_HTML = `
  <header class="mini-title">
    <span class="mini-dots"><i></i><i></i><i></i></span>
    <span class="mini-name">Obsidian</span>
    <span class="mini-vault">__VAULT_LABEL__</span>
    <button class="tc-mini-mode-toggle" type="button" aria-label="Toggle preview mode"></button>
  </header>
  <aside class="mini-ribbon">
    <i class="mini-rib active"></i>
    <i class="mini-rib"></i>
    <i class="mini-rib"></i>
    <i class="mini-rib"></i>
  </aside>
  <aside class="mini-side">
    <h4>Notes</h4>
    <ul>
      <li>Daily</li>
      <li class="mini-active">Callout sandbox</li>
      <li class="mini-nested">Note</li>
      <li class="mini-nested">Tip</li>
      <li class="mini-nested">Warning</li>
      <li>Archive</li>
    </ul>
  </aside>
  <main class="mini-main">
    <div class="mini-tabs">
      <div class="mini-tab active" data-tab="sandbox">Lorem sandbox</div>
      <div class="mini-tab mini-tab--clickable" data-tab="gallery">Callout gallery</div>
    </div>
    <div class="mini-content mini-content--active" data-tab="sandbox">${CALLOUT_SANDBOX_HTML}</div>
    <div class="mini-content" data-tab="gallery" style="display:none">${CALLOUT_GALLERY_HTML}</div>
  </main>
`;

/** Build the callout preview. Two functional tabs, plus a sun/moon
 *  toggle in the title bar that swaps the workspace theme — picked
 *  up by every visible preview at the same time. */
export function buildCalloutPreview(parent: HTMLElement): HTMLElement {
  const preview = parent.createDiv("tc-typo-preview tc-mini-obsidian tc-callout-mini");
  preview.innerHTML = CALLOUT_SAMPLE_FULL_HTML.replace("__VAULT_LABEL__", getRandomVaultLabel());

  // Wire the two mini-tabs to swap content panels. Both panels live in
  // the DOM at all times — visibility flipped inline so the swap is
  // instant and doesn't trigger a max-height recalc on the wrapping
  // expander (which would make the preview jitter shut).
  const tabs = preview.querySelectorAll<HTMLElement>(".mini-tab");
  const panels = preview.querySelectorAll<HTMLElement>(".mini-content");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      if (tab.classList.contains("active")) return;
      const target = tab.getAttribute("data-tab");
      tabs.forEach(t => t.classList.toggle("active", t === tab));
      panels.forEach(p => {
        const isTarget = p.getAttribute("data-tab") === target;
        p.classList.toggle("mini-content--active", isTarget);
        p.style.display = isTarget ? "" : "none";
      });
    });
  });

  setupPreviewModeToggle(preview);
  return preview;
}

// ═══════════════════════════════════════════════════════════════════════
// EDITING PREVIEW — mini-Obsidian shell with a Properties block at the
// top of the note body
// ═══════════════════════════════════════════════════════════════════════
//
// Mirrors the Typography preview's approach: same title-bar / ribbon /
// sidebar / tabs chrome, but the main content renders a Properties
// panel AT THE TOP OF THE NOTE BODY (above the H1) — exactly where real
// Obsidian places it when a note has frontmatter.
//
// Built programmatically (not a static HTML string) so we can use
// Obsidian's setIcon() to render REAL Lucide SVGs for each property
// type — same icons Obsidian uses in the live Properties panel
// (`lucide-text` for strings, `lucide-tags` for lists, `lucide-calendar-
// days` for dates, `lucide-binary` for numbers, `lucide-check-square`
// for booleans, `lucide-link` for links). Matches what the user sees
// in the real editor, not a text-glyph imitation.

/** Seven representative property rows + their Lucide icon names.
 *  Uses Obsidian's native class names and DOM structure throughout so
 *  the preview is visually indistinguishable from a real Properties
 *  panel — same selectors, same cascade, same result. Obsidian's own
 *  CSS paints the baseline look; the plugin's boxed / tag-style
 *  overrides layer on top exactly as they would in a real note. */
interface PropertyRow {
  /** Obsidian's data-property-type value (matters for its native CSS). */
  type: "text" | "multitext" | "date" | "number" | "checkbox" | "link";
  icon: string;
  key: string;
  build: (valueEl: HTMLElement) => void;
}

const EDITING_PROPERTY_ROWS: PropertyRow[] = [
  {
    type: "text", icon: "text", key: "title",
    build: v => v.setText("Lorem ipsum dolor sit amet"),
  },
  {
    type: "multitext", icon: "tags", key: "tags",
    build: v => {
      // Real-Obsidian multi-select structure: container → pills with
      // `.multi-select-pill-content` + Lucide-X remove button. Using
      // Obsidian's own classes means `body.tc-tags-{style}` paints these
      // pills identically to real note-body tags.
      const container = v.createDiv("multi-select-container");
      ["typography", "flavour", "preview"].forEach(t => {
        const pill = container.createDiv({
          cls: "multi-select-pill",
          attr: { tabindex: "0" },
        });
        const pillContent = pill.createDiv("multi-select-pill-content");
        pillContent.createSpan({ text: t });
        const removeBtn = pill.createDiv("multi-select-pill-remove-button");
        setIcon(removeBtn, "x");
      });
    },
  },
  {
    type: "date", icon: "calendar-days", key: "created",
    build: v => v.setText("2026-04-14"),
  },
  {
    type: "text", icon: "text", key: "status",
    build: v => v.setText("draft"),
  },
  {
    type: "number", icon: "binary", key: "priority",
    build: v => v.setText("3"),
  },
  {
    type: "checkbox", icon: "check-square", key: "done",
    build: v => {
      // Obsidian renders boolean properties as a checkbox <input> — match
      // that so its native styling (and our tc-fm-boxed overrides) reach it.
      const input = v.createEl("input", {
        cls: "metadata-input-checkbox",
        attr: { type: "checkbox" },
      });
      input.checked = false;
    },
  },
  {
    type: "link", icon: "link", key: "banner",
    build: v => v.setText("[[images/mountain]]"),
  },
];

/** Builds the full mini-Obsidian editing preview into `parent`.
 *  Uses Obsidian's setIcon() via dynamic import so the preview-sample
 *  module itself doesn't pull the obsidian types (kept string-based
 *  exports above work without it). */
import { setIcon } from "obsidian";
export function buildEditingPreview(parent: HTMLElement): HTMLElement {
  const preview = parent.createDiv("tc-typo-preview tc-mini-obsidian tc-editing-mini");

  // ── Title bar (mac traffic pips + window title + vault label) ───
  const title = preview.createEl("header", { cls: "mini-title" });
  const dots = title.createSpan({ cls: "mini-dots" });
  dots.createEl("i"); dots.createEl("i"); dots.createEl("i");
  title.createSpan({ cls: "mini-name", text: "Obsidian" });
  title.createSpan({ cls: "mini-vault", text: getRandomVaultLabel() });
  // Mode-toggle button — sun/moon icon populated + wired in
  // setupPreviewModeToggle() at the end of this function.
  title.createEl("button", {
    cls: "tc-mini-mode-toggle",
    attr: { type: "button", "aria-label": "Toggle preview mode" },
  });

  // ── Ribbon (4 vertical icon placeholders, first is active) ──────
  const ribbon = preview.createEl("aside", { cls: "mini-ribbon" });
  for (let i = 0; i < 4; i++) {
    const rib = ribbon.createEl("i", { cls: "mini-rib" });
    if (i === 0) rib.addClass("active");
  }

  // ── Sidebar (note tree fragment, "Style Kitchen Sink" as active) ──
  const side = preview.createEl("aside", { cls: "mini-side" });
  side.createEl("h4", { text: "Notes" });
  const sideUl = side.createEl("ul");
  const sideItems = [
    { text: "Daily",             cls: "" },
    { text: "Style Kitchen Sink", cls: "mini-active" },
    { text: "Frontmatter",        cls: "mini-nested" },
    { text: "Property rules",     cls: "mini-nested" },
    { text: "Archive",            cls: "" },
  ];
  sideItems.forEach(item => sideUl.createEl("li", { text: item.text, cls: item.cls }));

  // ── Main: tabs, Properties panel, H1, body paragraph ────────────
  const main = preview.createEl("main", { cls: "mini-main" });

  const tabs = main.createDiv("mini-tabs");
  tabs.createDiv({ text: "Style Kitchen Sink", cls: "mini-tab active" });
  tabs.createDiv({ text: "Reading list",      cls: "mini-tab" });

  // Properties panel DOM built by the shared helper below — reused by
  // buildFrontmatterPreview so there's one DOM shape maintained.
  buildFrontmatterDom(main);

  // Note body — H1 + a short lede so the panel-to-body transition reads.
  main.createEl("h1", { text: "Lorem ipsum dolor sit amet" });
  main.createEl("p", {
    text: "A short lede paragraph to show where the note body begins. " +
          "The Properties panel above sits exactly where real Obsidian " +
          "places it — between the tab strip and the first heading of " +
          "the note.",
  });

  setupPreviewModeToggle(preview);
  return preview;
}

/** Builds the .metadata-container DOM (AKA the frontmatter / Properties
 *  panel) into `parent`. Uses Obsidian's real class names throughout so
 *  the plugin's `tc-fm-boxed` rules + tag-style rules + Obsidian's own
 *  metadata CSS paint it identically to a live note's Properties panel.
 *
 *  Shared between buildEditingPreview (full mini-Obsidian shell) and
 *  buildFrontmatterPreview (focused, chrome-less). Interactive: clicking
 *  the heading collapses / expands the panel exactly as Obsidian does. */
function buildFrontmatterDom(parent: HTMLElement): HTMLElement {
  const fm = parent.createDiv("metadata-container mini-fm");

  const fmHeader = fm.createDiv("metadata-properties-heading");
  fmHeader.setAttribute("tabindex", "0");
  fmHeader.setAttribute("aria-expanded", "true");
  fmHeader.setAttribute("title", "Click to collapse / expand");
  const chev = fmHeader.createDiv("collapse-indicator collapse-icon");
  setIcon(chev, "right-triangle");
  fmHeader.createDiv({ cls: "metadata-properties-title", text: "Properties" });

  fmHeader.addEventListener("click", () => {
    const collapsed = fm.classList.toggle("is-collapsed");
    fmHeader.classList.toggle("is-collapsed", collapsed);
    fmHeader.setAttribute("aria-expanded", collapsed ? "false" : "true");
  });

  const content = fm.createDiv("metadata-content");
  const props = content.createDiv("metadata-properties");
  EDITING_PROPERTY_ROWS.forEach(row => {
    const propEl = props.createDiv({
      cls: "metadata-property",
      attr: {
        "data-property-key": row.key,
        "data-property-type": row.type,
        tabindex: "0",
      },
    });
    const keyWrap = propEl.createDiv("metadata-property-key");
    const iconSpan = keyWrap.createSpan({ cls: "metadata-property-icon" });
    setIcon(iconSpan, row.icon);
    const keyInput = keyWrap.createEl("input", {
      cls: "metadata-property-key-input",
      attr: { type: "text", value: row.key, spellcheck: "false" },
    });
    keyInput.readOnly = true;

    const valueEl = propEl.createDiv({ cls: "metadata-property-value" });
    row.build(valueEl);
  });

  const addBtn = content.createDiv("metadata-add-button");
  const addIcon = addBtn.createSpan({ cls: "metadata-add-button-icon" });
  setIcon(addIcon, "plus");
  addBtn.createSpan({ text: "Add property" });

  return fm;
}

/** Focused preview of the frontmatter / Properties panel alone — no
 *  mini-Obsidian chrome, no note body, no sidebar. Useful for comparing
 *  the `tc-fm-boxed` boxed treatment vs native flat rendering at a
 *  glance. Sits inside a `.tc-mini-obsidian` wrapper so the plugin's
 *  preview-scope CSS still applies. */
export function buildFrontmatterPreview(parent: HTMLElement): HTMLElement {
  const wrap = parent.createDiv("tc-typo-preview tc-mini-obsidian tc-fm-only-preview");
  buildFrontmatterDom(wrap);
  return wrap;
}

// ═══════════════════════════════════════════════════════════════════════
// EDITOR-VIEW PREVIEW — mini-Obsidian shell with a source-mode editor
// as its main content. Simulates the CodeMirror editor surface with
// real `.cm-line` / `.cm-active` / `.cm-cursor` / selection classes so
// the plugin's active-line fill + caret colour + selection-tint rules
// paint the preview in lockstep with the live editor.
// ═══════════════════════════════════════════════════════════════════════

const EDITOR_SAMPLE_LINES: { text?: string; active?: boolean; html?: string }[] = [
  { text: "## Editor preview" },
  { text: "" },
  { text: "Lines below simulate Obsidian's source / live-preview editor." },
  { text: "The highlighted line carries `.cm-active.cm-line`; flip the" },
  { text: "active-line setting under Appearance → Editor accents." },
  { text: "" },
  {
    active: true,
    html: 'The <strong>active line</strong> with its caret sits here.<span class="cm-cursor"></span>',
  },
  { text: "" },
  { html: '- A bulleted item with a <span class="mini-selection">selected phrase</span> inside.' },
  { text: "- Another item, un-selected." },
  { text: "" },
  { text: "```js" },
  { text: "const ratio = 1.618;    // simulated code fence" },
  { text: "```" },
  { text: "" },
  { text: "Blank lines + prose below so the active-line highlight reads clearly." },
  { text: "" },
];

export const EDITOR_SAMPLE_FULL_HTML = `
  <header class="mini-title">
    <span class="mini-dots"><i></i><i></i><i></i></span>
    <span class="mini-name">Obsidian</span>
    <span class="mini-vault">__VAULT_LABEL__</span>
    <button class="tc-mini-mode-toggle" type="button" aria-label="Toggle preview mode"></button>
  </header>
  <aside class="mini-ribbon">
    <i class="mini-rib active"></i>
    <i class="mini-rib"></i>
    <i class="mini-rib"></i>
    <i class="mini-rib"></i>
  </aside>
  <aside class="mini-side">
    <h4>Notes</h4>
    <ul>
      <li>Daily</li>
      <li class="mini-active">Editor sandbox</li>
      <li class="mini-nested">Active line demo</li>
      <li class="mini-nested">Selection demo</li>
      <li>Archive</li>
    </ul>
  </aside>
  <main class="mini-main tc-editor-main">
    <div class="mini-tabs">
      <div class="mini-tab active">Editor sandbox</div>
      <div class="mini-tab">Scratch</div>
    </div>
    <div class="mini-cm-editor">
      ${EDITOR_SAMPLE_LINES.map(line => {
        const cls = line.active ? "cm-line cm-active" : "cm-line";
        const body = line.html ?? (line.text || "&nbsp;");
        return `<div class="${cls}">${body}</div>`;
      }).join("\n      ")}
    </div>
  </main>
`;

/** Mini-Obsidian preview with a fake editor-view main content. Active
 *  line + caret + selection classes are real Obsidian classes so the
 *  plugin's editor-accent settings paint this preview in lockstep with
 *  a live note's editor surface. */
export function buildEditorViewPreview(parent: HTMLElement): HTMLElement {
  const preview = parent.createDiv("tc-typo-preview tc-mini-obsidian tc-editor-mini");
  preview.innerHTML = EDITOR_SAMPLE_FULL_HTML.replace("__VAULT_LABEL__", getRandomVaultLabel());
  setupPreviewModeToggle(preview);
  return preview;
}

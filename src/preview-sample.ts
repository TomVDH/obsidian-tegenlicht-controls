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
  <div class="mini-callout">
    <strong>Nota bene</strong> — this preview reads the same CSS
    variables the plugin writes to the live Obsidian workspace, so
    what you see here is what you'll get there.
  </div>
`;

/** Full mini-Obsidian shell + content, ready to assign to innerHTML on a
 *  `.tc-typo-preview.tc-mini-obsidian` element. Chrome (title bar, ribbon,
 *  sidebar, tabs) is baked in — the caller just picks a container and
 *  lets the CSS vars do the rest. */
export const TYPOGRAPHY_SAMPLE_FULL_HTML = `
  <header class="mini-title">
    <span class="mini-dots"><i></i><i></i><i></i></span>
    <span class="mini-name">Obsidian</span>
    <span class="mini-vault">Lorem ipsum dolor sit amet</span>
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
 *  standard preview classes and populates it. */
export function buildTypographyPreview(parent: HTMLElement): HTMLElement {
  const preview = parent.createDiv("tc-typo-preview tc-mini-obsidian");
  preview.innerHTML = TYPOGRAPHY_SAMPLE_FULL_HTML;
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
  title.createSpan({ cls: "mini-vault", text: "Lorem ipsum dolor sit amet" });

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

  // Properties panel — uses Obsidian's REAL class names throughout so
  // the preview literally IS a Properties panel as Obsidian would render
  // it. The `.mini-fm` class stays on the outer div for scope-targeted
  // sizing/layout in the settings pane; every inner class is Obsidian's
  // own, which means boxed-Properties CSS, tag-style CSS, and Obsidian's
  // own metadata CSS all paint the preview exactly as they'd paint a
  // note. Change a setting → the preview updates in lockstep with what
  // you'll see in real notes.
  const fm = main.createDiv("metadata-container mini-fm");

  // Heading — `.metadata-properties-heading` with a `.collapse-indicator`
  // containing the chevron (the plugin's boxed CSS hides this in boxed
  // mode and stamps its own via ::after; in non-boxed mode the native
  // chevron shows normally).
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

  // Content wrapper + properties grid — matches Obsidian's real structure.
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
    // Key = icon + readonly input (real Obsidian uses an <input>).
    const keyWrap = propEl.createDiv("metadata-property-key");
    const iconSpan = keyWrap.createSpan({ cls: "metadata-property-icon" });
    setIcon(iconSpan, row.icon);
    const keyInput = keyWrap.createEl("input", {
      cls: "metadata-property-key-input",
      attr: { type: "text", value: row.key, spellcheck: "false" },
    });
    keyInput.readOnly = true;

    // Value — delegated to the row.build(). Real Obsidian nests a
    // typed value wrapper inside `.metadata-property-value`; we give
    // build() the outer div and let it shape the inside.
    const valueEl = propEl.createDiv({ cls: "metadata-property-value" });
    row.build(valueEl);
  });

  // "Add property" button — complete the real-Obsidian shape. Purely
  // visual in the preview; no click handler.
  const addBtn = content.createDiv("metadata-add-button");
  const addIcon = addBtn.createSpan({ cls: "metadata-add-button-icon" });
  setIcon(addIcon, "plus");
  addBtn.createSpan({ text: "Add property" });

  // Note body — H1 + a short lede so the panel-to-body transition reads.
  main.createEl("h1", { text: "Lorem ipsum dolor sit amet" });
  main.createEl("p", {
    text: "A short lede paragraph to show where the note body begins. " +
          "The Properties panel above sits exactly where real Obsidian " +
          "places it — between the tab strip and the first heading of " +
          "the note.",
  });

  return preview;
}

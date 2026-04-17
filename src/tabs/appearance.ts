import { Setting } from "obsidian";
import Pickr from "@simonwep/pickr";
import TegenlichtControlsPlugin from "../main";
import {
  FlavourEntry,
  DARK_BASE, DARK_EXTENDED, DARK_EXTENDED_TC, DARK_EXTENDED_ANP,
  LIGHT_BASE, LIGHT_EXTENDED, LIGHT_EXTENDED_TC, LIGHT_EXTENDED_ANP,
} from "../flavours";
import { buildSegmentSetting, buildCluster } from "./_shared";

// Section-header pattern replaces accordions on Appearance. Every
// section is always visible — the tab reads as a continuous scroll with
// neat header bars delimiting each section. Accordion collapse state is
// no longer tracked because there's nothing to collapse. Typography,
// Editing, and other tabs still use accordions; only Appearance has
// switched to flat sections.

// Flat UI Colors v2 — India palette. See https://flatuicolors.com/palette/in
const ACCENT_PRESETS = [
  { label: "Yriel Yellow",        hex: "#eab543" },
  { label: "Rosy Highlight",      hex: "#fd7272" },
  { label: "Clear Chill",         hex: "#1b9cfc" },
  { label: "Keppel",              hex: "#58b19f" },
  { label: "Circumorbital Ring",  hex: "#82589f" },
];

function shortCode(label: string): string {
  const words = label.split(/[\s\-]+/);
  return words.length > 1
    ? words.map(w => w[0]).join("").slice(0, 3).toUpperCase()
    : label.slice(0, 3);
}

function buildSwatchGrid(
  container: HTMLElement,
  flavours: FlavourEntry[],
  current: string,
  onSelect: (cls: string) => Promise<void>,
): void {
  const grid = container.createDiv("tc-swatch-grid");
  const swEls: HTMLElement[] = [];
  flavours.forEach(f => {
    const item = grid.createDiv("tc-swatch-item");
    item.setAttribute("title", f.label);
    const sw   = item.createDiv("tc-swatch");
    sw.style.background = `linear-gradient(135deg, ${f.base} 60%, ${f.surface} 60%)`;
    // Store the swatch's own accent on a CSS custom property so the
    // active-outline and other per-swatch accent cues can pick it up
    // without hardcoding colours in CSS.
    sw.style.setProperty("--tc-sw-accent", f.accent);
    if (f.cls === current) sw.addClass("tc-swatch--active");
    const dot = sw.createDiv("tc-swatch-dot");
    dot.style.background = f.accent;
    item.createSpan({ text: shortCode(f.label), cls: "tc-swatch-name" });
    swEls.push(sw);
    item.addEventListener("click", () => {
      swEls.forEach(s => s.removeClass("tc-swatch--active"));
      sw.addClass("tc-swatch--active");
      onSelect(f.cls);
    });
  });
}

// ── Shared UI helpers ──────────────────────────────────────────────────────

function buildDivider(container: HTMLElement): void {
  container.createDiv("tc-divider");
}

// buildSegmentSetting now lives in ./_shared so the Editing tab can
// share the same pill-picker helper without duplication.

/** Segment pill-select + an auto / mono colour pair on the same row.
 *  - Auto = empty string = theme default, which for icons and borders
 *    already resolves to the accent colour on every current flavour.
 *  - Mono = 'mono' sentinel = monochrome (rgb(var(--mono-rgb-100))),
 *    rendered in the pip as a solid white circle with a subtle border.
 *  Two binary states — no custom Pickr; the choice is opinionated.
 *
 *  Used for "Icon intensity" and "Border intensity". */
function buildSegmentWithColor(
  container: HTMLElement,
  name: string,
  desc: string,
  options: { label: string; value: string }[],
  currentSegment: string,
  onSegmentChange: (value: string) => Promise<void>,
  colour: {
    getValue: () => string;                // '' | 'mono'
    setValue: (v: string) => void;
    onChange: () => Promise<void>;
  },
): void {
  const setting = new Setting(container).setName(name).setDesc(desc);
  const wrap = setting.controlEl.createDiv("tc-seg-with-color");

  // Pills — identical markup to buildSegmentSetting.
  const group = wrap.createDiv("tc-seg");
  const buttons = new Map<string, HTMLElement>();
  options.forEach(o => {
    const btn = group.createEl("button", { text: o.label, cls: "tc-seg-btn" });
    if (o.value === currentSegment) btn.addClass("tc-seg-btn--active");
    btn.addEventListener("click", async () => {
      if (btn.hasClass("tc-seg-btn--active")) return;
      buttons.forEach(b => b.removeClass("tc-seg-btn--active"));
      btn.addClass("tc-seg-btn--active");
      await onSegmentChange(o.value);
    });
    buttons.set(o.value, btn);
  });

  // Separator between pills and colour dots.
  wrap.createDiv("tc-accent-sep");

  // Auto / Mono pair.
  const autoItem = wrap.createDiv("tc-accent-item tc-accent-item--auto");
  const autoDot = autoItem.createDiv("tc-accent-dot tc-accent-dot--auto");
  autoDot.setAttribute("title", "Auto — subtle accent (40% alpha)");
  autoItem.createSpan({ text: "auto", cls: "tc-accent-caption" });

  const monoItem = wrap.createDiv("tc-accent-item tc-accent-item--mono");
  const monoDot = monoItem.createDiv("tc-accent-dot tc-accent-dot--mono");
  monoDot.setAttribute("title", "Mono — theme's native tint");
  monoItem.createSpan({ text: "mono", cls: "tc-accent-caption" });

  const setActiveDot = (which: 'auto' | 'mono') => {
    [autoDot, monoDot].forEach(d => d.removeClass('tc-accent-dot--active'));
    ({ auto: autoDot, mono: monoDot })[which].addClass('tc-accent-dot--active');
  };

  // Seed active state. Any legacy value that isn't 'mono' (including
  // old 'accent' sentinels or stray hex strings from the Pickr era)
  // collapses to auto so old saves don't leave the UI in limbo.
  setActiveDot(colour.getValue() === 'mono' ? 'mono' : 'auto');

  autoDot.addEventListener('click', async () => {
    colour.setValue('');
    setActiveDot('auto');
    await colour.onChange();
  });
  monoDot.addEventListener('click', async () => {
    colour.setValue('mono');
    setActiveDot('mono');
    await colour.onChange();
  });
}

/** Native Obsidian Setting row with dropdown for multi-option controls. */
function buildDropdownSetting(
  container: HTMLElement,
  name: string,
  desc: string,
  options: { label: string; value: string }[],
  current: string,
  onChange: (value: string) => Promise<void>,
): void {
  const setting = new Setting(container).setName(name).setDesc(desc);
  setting.addDropdown(dd => {
    options.forEach(o => dd.addOption(o.value, o.label));
    dd.setValue(current);
    dd.onChange(async v => await onChange(v));
  });
}

/** Native Obsidian Setting row: Pickr colour picker + native toggle. Returns the Pickr instance for cleanup. */
function buildColorToggleRow(
  container: HTMLElement,
  name: string,
  desc: string,
  colourGetter: () => string,
  colourSetter: (v: string) => void,
  enabledGetter: () => boolean,
  enabledSetter: (v: boolean) => void,
  onChange: () => Promise<void>,
): Pickr {
  const setting = new Setting(container).setName(name).setDesc(desc);

  // Mount Pickr in the control slot, before the toggle
  const pickerEl = setting.controlEl.createDiv("pickr");
  const pickr = Pickr.create({
    el: pickerEl,
    container: container.closest('.modal-content') as HTMLElement ?? document.body,
    theme: 'nano',
    default: colourGetter(),
    // No transparency slider — opacity would've been a transparency
    // control, not a brightness one. Brightness is the 2D palette's
    // vertical axis already; a dedicated linear brightness slider is a
    // bigger refactor tracked separately.
    lockOpacity: true,
    swatches: [colourGetter()],
    position: 'left-middle',
    components: {
      preview: true,
      hue: true,
      opacity: false,
      interaction: { hex: true, input: true, save: true, cancel: true },
    },
  });

  pickr.on('save', (color: Pickr.HSVaColor | null, instance: Pickr) => {
    if (!color) return;
    const hex = color.toHEXA().toString().slice(0, 7);
    colourSetter(hex);
    instance.hide();
    onChange();
  });

  pickr.on('cancel', (instance: Pickr) => instance.hide());

  setting.addToggle(t => t
    .setValue(enabledGetter())
    .onChange(async v => { enabledSetter(v); await onChange(); })
  );

  return pickr;
}

export function build(
  containerEl: HTMLElement,
  plugin: TegenlichtControlsPlugin,
  onChange: () => Promise<void>,
  redisplay?: () => void,
): () => void {
  const s = plugin.settings;
  const pickrs: Pickr[] = [];
  const refresh = async () => {
    await onChange();
    redisplay?.();
  };

  // Colour bar previously rendered here has been promoted to the
  // settings panel header (lives once globally in settings-tab.ts,
  // between the tagline and the footer copy row).

  // ── Theme & Colour section ─────────────────────────────
  containerEl.createEl("div", { cls: "tc-section-header", text: "Theme & Colour" });
  const themeBody = containerEl.createDiv("tc-section-body tc-feat-body tc-setting-card");

  // ── Palette cluster — accent + dark/light flavours ────
  const paletteCluster = buildCluster(themeBody, "Palette");

  // ── Accent Colour — native Setting row, pips in the control slot ──
  const accentSetting = new Setting(paletteCluster)
    .setName("Accent colour")
    .setDesc("Drives the highlight colour across the interface");
  const accentRow = accentSetting.controlEl.createDiv("tc-accent-row");

  ACCENT_PRESETS.forEach(({ label, hex }) => {
    const item = accentRow.createDiv("tc-accent-item");
    const dot  = item.createDiv("tc-accent-dot");
    dot.style.background = hex;
    if (s.accentColour === hex) dot.addClass("tc-accent-dot--active");
    dot.setAttribute("title", label); // tooltip only — no visible caption
    dot.addEventListener("click", async () => {
      s.accentColour = hex;
      await refresh();
    });
  });
  accentRow.createDiv("tc-accent-sep");

  // ── Auto (takes the accent from the selected flavour swatch) ─────
  const autoItem = accentRow.createDiv("tc-accent-item tc-accent-item--auto");
  const autoDot  = autoItem.createDiv("tc-accent-dot tc-accent-dot--auto");
  if (s.accentColour === 'auto') autoDot.addClass("tc-accent-dot--active");
  autoDot.setAttribute("title", "Use flavour's default accent");
  autoDot.addEventListener("click", async () => {
    s.accentColour = 'auto';
    await refresh();
  });
  autoItem.createSpan({ text: "auto", cls: "tc-accent-caption" });

  const customItem = accentRow.createDiv("tc-accent-item tc-accent-item--custom");
  const customDot  = customItem.createDiv("tc-accent-dot tc-accent-dot--custom");
  customItem.createSpan({ text: "cust.", cls: "tc-accent-caption" });
  // When a real custom hex is set, paint the dot. Otherwise leave inline
  // background empty so the CSS conic gradient shows through.
  const isCustom = s.accentColour !== 'auto' &&
                   !ACCENT_PRESETS.some(p => p.hex === s.accentColour);
  if (isCustom) customDot.style.background = s.accentColour;
  if (isCustom) customDot.addClass("tc-accent-dot--active");

  // Floating Pickr anchored on the custom dot. Clear button reverts to auto.
  const pickrSeed = isCustom ? s.accentColour : '#e5b32a';
  const customPickr = Pickr.create({
    el: customDot,
    container: containerEl.closest('.modal-content') as HTMLElement ?? document.body,
    theme: 'nano',
    default: pickrSeed,
    useAsButton: true,
    // Opacity slider disabled — it was transparency, not brightness.
    lockOpacity: true,
    position: 'bottom-start',
    components: {
      preview: true,
      hue: true,
      opacity: false,
      interaction: { hex: true, input: true, clear: true, save: true, cancel: true },
    },
  });
  const clearActiveDots = () => {
    accentRow.querySelectorAll('.tc-accent-dot').forEach(d => d.removeClass('tc-accent-dot--active'));
  };
  const commitCustomHex = (hex: string) => {
    s.accentColour = hex;
    customDot.style.background = hex;
    clearActiveDots();
    customDot.addClass('tc-accent-dot--active');
    onChange(); // live preview — never redisplay mid-interaction
  };
  customPickr.on('change', (color: Pickr.HSVaColor | null) => {
    if (color) commitCustomHex(color.toHEXA().toString().slice(0, 7));
  });
  customPickr.on('save', (color: Pickr.HSVaColor | null, instance: Pickr) => {
    if (color) commitCustomHex(color.toHEXA().toString().slice(0, 7));
    instance.hide();
  });
  customPickr.on('clear', (instance: Pickr) => {
    s.accentColour = 'auto';
    customDot.style.background = ''; // restore CSS conic gradient
    clearActiveDots();
    autoDot.addClass('tc-accent-dot--active');
    onChange();
    instance.hide();
  });
  customPickr.on('cancel', (instance: Pickr) => instance.hide());
  pickrs.push(customPickr);

  /** Appends an outlined "+" swatch at the end of an inline swatch grid.
   *  Clicking it flips the "show extended" state for that row and calls
   *  refresh so the extended grid folds out / in below. When the row is
   *  already open, the + rotates 45° into a × so it reads as "close".
   *  Replaces the old dedicated toggle-row pattern — one interaction,
   *  one less row in the accordion. */
  function appendPlusSwatch(
    inlineWrap: HTMLElement,
    isOpen: boolean,
    onToggle: () => Promise<void>,
  ): void {
    const grid = inlineWrap.querySelector<HTMLElement>(".tc-swatch-grid");
    if (!grid) return;
    const item = grid.createDiv("tc-swatch-item tc-swatch-item--plus");
    item.setAttribute("title", isOpen ? "Hide extended flavours" : "Show extended flavours");
    const sw = item.createDiv("tc-swatch tc-swatch-plus" + (isOpen ? " tc-swatch-plus--active" : ""));
    // Single glyph "+", the icon (not the swatch) rotates 45° when open
    // so it reads as ×. Rotating only the inner span keeps the swatch
    // bounding box flush with its sibling pips — no overflow. No caption
    // — the cross/plus state already tells the whole story.
    sw.createSpan({ text: "+", cls: "tc-swatch-plus-icon" });
    item.addEventListener("click", async () => { await onToggle(); });
  }

  // ── Dark Flavours ──────────────────────────────────────
  // Base flavours + a "+" swatch at the end that folds the extended grid
  // out below. Clicking + opens; clicking × (rotated +) closes. No
  // dedicated toggle row — the interaction lives in the swatch strip.
  // Shared flavour-pick handler — assigns the chosen class AND resets any
  // per-flavour overrides (currently just iconColour) so picking a theme
  // always lands at that theme's defaults. Tom can re-tint after switching.
  const pickFlavour = async (kind: 'dark' | 'light', cls: string) => {
    if (kind === 'dark') s.darkFlavour = cls;
    else                 s.lightFlavour = cls;
    s.iconColour   = '';
    s.borderColour = '';
    await refresh();
  };

  const darkSetting = new Setting(paletteCluster)
    .setName("Dark flavour")
    .setDesc("Applied when Obsidian is in dark mode");
  const darkInlineWrap = darkSetting.controlEl.createDiv("tc-swatch-grid-inline");
  buildSwatchGrid(darkInlineWrap, DARK_BASE, s.darkFlavour, cls => pickFlavour('dark', cls));
  appendPlusSwatch(darkInlineWrap, s.showExtendedDark, async () => {
    s.showExtendedDark = !s.showExtendedDark;
    await refresh();
  });
  if (s.showExtendedDark) {
    const darkExtWrap = paletteCluster.createDiv("tc-swatch-grid-wrap tc-swatch-grouped");
    darkExtWrap.createSpan({ text: "Tegenlicht", cls: "tc-swatch-group-label" });
    buildSwatchGrid(darkExtWrap, DARK_EXTENDED_TC, s.darkFlavour, cls => pickFlavour('dark', cls));
    darkExtWrap.createSpan({ text: "AnuPuccin", cls: "tc-swatch-group-label" });
    buildSwatchGrid(darkExtWrap, DARK_EXTENDED_ANP, s.darkFlavour, cls => pickFlavour('dark', cls));
  }

  // ── Light Flavours ─────────────────────────────────────
  const lightSetting = new Setting(paletteCluster)
    .setName("Light flavour")
    .setDesc("Applied when Obsidian is in light mode");
  const lightInlineWrap = lightSetting.controlEl.createDiv("tc-swatch-grid-inline");
  buildSwatchGrid(lightInlineWrap, LIGHT_BASE, s.lightFlavour, cls => pickFlavour('light', cls));
  appendPlusSwatch(lightInlineWrap, s.showExtendedLight, async () => {
    s.showExtendedLight = !s.showExtendedLight;
    await refresh();
  });
  if (s.showExtendedLight) {
    const lightExtWrap = paletteCluster.createDiv("tc-swatch-grid-wrap tc-swatch-grouped");
    lightExtWrap.createSpan({ text: "Tegenlicht", cls: "tc-swatch-group-label" });
    buildSwatchGrid(lightExtWrap, LIGHT_EXTENDED_TC, s.lightFlavour, cls => pickFlavour('light', cls));
    lightExtWrap.createSpan({ text: "AnuPuccin", cls: "tc-swatch-group-label" });
    buildSwatchGrid(lightExtWrap, LIGHT_EXTENDED_ANP, s.lightFlavour, cls => pickFlavour('light', cls));
  }

  // Background-effect pill and Native-translucency toggle were REMOVED.
  // Neither approach produced reliable results: CSS backdrop-filter in
  // Obsidian samples sibling DOM (not the desktop), alpha-stacking from
  // nested translucent panels crushed colours, and the native
  // `app:toggle-translucent-window` command requires an app restart on
  // some builds to take effect at the Electron window level. Rather
  // than ship half-working UI, we cut the feature entirely. The grain
  // slider below remains as a standalone workspace texture.
  //
  // `backgroundEffect` and `noiseAmount` still exist in settings.ts so
  // previously-saved values don't break on migration. Their UI will
  // return once we have a reliable translucency path.

  // Surface and Accent application clusters live in the Workspace
  // section now — grain is a canvas-texture concern and the colourful
  // window frame is a chrome-level effect, both fit Workspace better
  // than Theme & Colour (which is now strictly palette + shape/weight).

  // ── Shape cluster — how UI elements bend and breathe ──
  // Lives inside Theme & Colour now that the Interface section has been
  // retired; shape knobs read naturally alongside palette + surface.
  const shapeCluster = buildCluster(themeBody, "Shape");

  // Corner radius leads the Shape cluster — the most visually global
  // setting (buttons, cards, inputs, images) so it gets the top slot.
  buildSegmentSetting(shapeCluster,
    "Corner radius", "Roundness of buttons, cards, inputs, and images",
    [
      { label: "Sharp",   value: "sharp" },
      { label: "Subtle",  value: "subtle" },
      { label: "Rounded", value: "rounded" },
    ],
    s.cornerRadius,
    async v => { s.cornerRadius = v; await refresh(); },
  );

  buildSegmentSetting(shapeCluster,
    "UI density", "Spacing across nav, tabs, ribbon, and header",
    [
      { label: "Compact",     value: "compact" },
      { label: "Comfortable", value: "comfortable" },
      { label: "Spacious",    value: "spacious" },
    ],
    s.uiDensity,
    async v => { s.uiDensity = v; await refresh(); },
  );

  // ── Weight cluster — line weight of icons and borders ─
  const weightCluster = buildCluster(themeBody, "Weight");

  // Icon intensity — weight pills + auto/mono tint pair.
  // 'auto' = theme default (accent). 'mono' = monochrome via the
  // mono-rgb scale. Flavour switching resets to '' so each theme starts
  // at its own default.
  buildSegmentWithColor(
    weightCluster,
    "Icon intensity", "Weight + tint of every Lucide icon in the chrome",
    [
      { label: "Thin",    value: "thin" },
      { label: "Regular", value: "regular" },
      { label: "Bold",    value: "bold" },
    ],
    s.iconStroke,
    async v => { s.iconStroke = v; await refresh(); },
    {
      getValue: () => s.iconColour,
      setValue: v  => { s.iconColour = v; },
      onChange: refresh,
    },
  );

  // Border intensity — strength pills + auto/mono tint pair.
  buildSegmentWithColor(
    weightCluster,
    "Border intensity", "Strength + tint of borders across the Obsidian interface",
    [
      { label: "None",         value: "none" },
      { label: "Whisper",      value: "whisper" },
      { label: "Subtle",       value: "subtle" },
      { label: "Ligne claire", value: "ligne-claire" },
    ],
    s.borderIntensity,
    async v => { s.borderIntensity = v; await refresh(); },
    {
      getValue: () => s.borderColour,
      setValue: v  => { s.borderColour = v; },
      onChange: refresh,
    },
  );

  // ── Outliner section — file tree / nav-files pane settings ─────
  // Ports the file-browser knobs from AnuPuccin (rainbow folders, file
  // type icons, collapse arrows, custom vault title) into one home so
  // the "left sidebar look" lives in one section.
  containerEl.createEl("div", { cls: "tc-section-header", text: "Outliner" });
  const outlinerBody = containerEl.createDiv("tc-section-body tc-feat-body tc-setting-card");

  // ── File tree cluster — three toggles for how nav-files pane renders ─
  const fileTreeCluster = buildCluster(outlinerBody, "File tree");

  new Setting(fileTreeCluster)
    .setName("File type icons")
    .setDesc("Show a glyph next to each file in the tree based on its extension")
    .addToggle(t => t
      .setValue(s.fileIcons)
      .onChange(async v => { s.fileIcons = v; await onChange(); })
    );

  new Setting(fileTreeCluster)
    .setName("Collapsed folder arrows")
    .setDesc("Use the theme's compact chevron for collapsed folders (less chrome)")
    .addToggle(t => t
      .setValue(s.collapseFolderIcons)
      .onChange(async v => { s.collapseFolderIcons = v; await onChange(); })
    );

  new Setting(fileTreeCluster)
    .setName("Custom vault title")
    .setDesc("Style the vault root entry — larger and set apart from the file tree")
    .addToggle(t => t
      .setValue(s.customVaultTitle)
      .onChange(async v => { s.customVaultTitle = v; await onChange(); })
    );

  // ── Rainbow folders cluster ───────────────────────────
  // Three modes mirroring AnuPuccin's Style Settings dropdown
  //   Off    — no colouring
  //   Simple — title + indent + file-icon take the hue (no bg fill)
  //   Full   — folder background tinted
  // `rainbowInherit` is the orthogonal "subfolders inherit parent"
  // modifier. Per-mode sub-toggles live under a single foldable
  // "Advanced" disclosure: integrated inline (no card-within-card),
  // collapsed by default, hidden entirely when mode === 'off'. Mode
  // change repopulates the Advanced body in place but preserves the
  // user's open/closed choice.
  const rainbowCluster = buildCluster(outlinerBody, "Rainbow folders");

  const computedMode = (() => {
    if ((s.rainbowStyle ?? 'off') === 'off' && s.rainbowFileBrowser) return 'full';
    const v = s.rainbowStyle ?? 'off';
    if (v === 'dot' || v === 'icon') return 'simple';
    return v;
  })();

  // Forward-declared so the segment's onChange can repopulate the
  // Advanced body when mode changes.
  let populateAdvanced: (mode: string) => void = () => {};

  buildSegmentSetting(rainbowCluster,
    "Coloured folders",
    "Full tints folder backgrounds, Simple tints titles + indents — matches AnuPuccin's Style Settings",
    [
      { label: "Off",    value: "off"    },
      { label: "Simple", value: "simple" },
      { label: "Full",   value: "full"   },
    ],
    computedMode,
    async v => {
      s.rainbowStyle = v;
      // Also clear the legacy boolean so the migration doesn't re-fire
      s.rainbowFileBrowser = v !== 'off' && s.rainbowFileBrowser;
      populateAdvanced(v);
      await onChange();
    },
  );

  new Setting(rainbowCluster)
    .setName("Subfolders inherit colour")
    .setDesc("Child folders pick up their parent's hue instead of rolling through the rainbow themselves")
    .addToggle(t => t
      .setValue(s.rainbowInherit)
      .onChange(async v => { s.rainbowInherit = v; await onChange(); })
    );

  // ── Advanced disclosure (integrated, collapsed by default) ──────
  const advanced = rainbowCluster.createDiv("tc-advanced");
  const advHeader = advanced.createDiv("tc-advanced-header");
  advHeader.createSpan({ cls: "tc-advanced-chevron", text: "▶" });
  advHeader.createSpan({ text: "Advanced" });
  const advBody = advanced.createDiv("tc-advanced-body");
  advHeader.addEventListener("click", () => {
    advanced.toggleClass("tc-advanced--open", !advanced.hasClass("tc-advanced--open"));
  });

  populateAdvanced = (mode: string) => {
    advBody.empty();
    // Hide the whole disclosure when mode is off — no per-mode
    // settings apply to "Off" so there's nothing to reveal.
    advanced.style.display = mode === "off" ? "none" : "";
    if (mode === "simple") {
      new Setting(advBody)
        .setName("Recolour folder titles")
        .setDesc("Folder name text takes the rotating hue")
        .addToggle(t => t
          .setValue(s.rainbowSimpleTitle)
          .onChange(async v => { s.rainbowSimpleTitle = v; await onChange(); })
        );
      new Setting(advBody)
        .setName("Recolour collapse arrows")
        .setDesc("The chevron / disclosure triangle takes the folder's hue")
        .addToggle(t => t
          .setValue(s.rainbowSimpleCollapseIcon)
          .onChange(async v => { s.rainbowSimpleCollapseIcon = v; await onChange(); })
        );
      new Setting(advBody)
        .setName("Recolour indent guides")
        .setDesc("Vertical indent lines under each folder take the hue")
        .addToggle(t => t
          .setValue(s.rainbowSimpleIndent)
          .onChange(async v => { s.rainbowSimpleIndent = v; await onChange(); })
        );
      new Setting(advBody)
        .setName("Show file dot")
        .setDesc("Add a small coloured circle next to each file in a coloured folder")
        .addToggle(t => t
          .setValue(s.rainbowSimpleFileIcon)
          .onChange(async v => { s.rainbowSimpleFileIcon = v; await onChange(); })
        );
    } else if (mode === "full") {
      new Setting(advBody)
        .setName("Recolour files")
        .setDesc("Tint files inside coloured folders to match their parent's hue")
        .addToggle(t => t
          .setValue(s.rainbowFullFileRecolor)
          .onChange(async v => { s.rainbowFullFileRecolor = v; await onChange(); })
        );
      new Setting(advBody)
        .setName("Invert title text — light mode")
        .setDesc("Use the regular text colour for folder titles in light themes (better contrast)")
        .addToggle(t => t
          .setValue(s.rainbowFullInvertLight)
          .onChange(async v => { s.rainbowFullInvertLight = v; await onChange(); })
        );
      new Setting(advBody)
        .setName("Invert title text — dark mode")
        .setDesc("Use the regular text colour for folder titles in dark themes (better contrast)")
        .addToggle(t => t
          .setValue(s.rainbowFullInvertDark)
          .onChange(async v => { s.rainbowFullInvertDark = v; await onChange(); })
        );
      new Setting(advBody)
        .setName("Folder background opacity")
        .setDesc("How much of the folder's hue shows through (0 = transparent, 100 = solid)")
        .addSlider(sl => sl
          .setLimits(0, 100, 1)
          .setValue(s.rainbowFullBgOpacity ?? 70)
          .setDynamicTooltip()
          .onChange(async v => { s.rainbowFullBgOpacity = v; await onChange(); })
        );
    }
  };
  populateAdvanced(computedMode);

  // ── Graph section ─────────────────────────────────────
  containerEl.createEl("div", { cls: "tc-section-header", text: "Graph" });
  const graphBody = containerEl.createDiv("tc-section-body tc-feat-body tc-setting-card");

  // ── Colour cluster ────────────────────────────────────
  const graphColourCluster = buildCluster(graphBody, "Colour");
  buildSegmentSetting(graphColourCluster,
    "Colour mode",
    "How nodes and links take their hue",
    [
      { label: "Mono",    value: "mono"    },
      { label: "Accent",  value: "accent"  },
      { label: "Folders", value: "folders" },
    ],
    s.graphColourMode,
    async v => { s.graphColourMode = v; await refresh(); },
  );

  // ── Style cluster ─────────────────────────────────────
  const graphStyleCluster = buildCluster(graphBody, "Style");

  new Setting(graphStyleCluster)
    .setName("Hover halo")
    .setDesc("Soft accent glow under the node you're hovering")
    .addToggle(t => t
      .setValue(s.graphHalo)
      .onChange(async v => { s.graphHalo = v; await onChange(); })
    );

  new Setting(graphStyleCluster)
    .setName("Node scale")
    .setDesc("Multiplies Obsidian's native node size (0.5× – 2×)")
    .addSlider(sl => sl
      .setLimits(0.5, 2.0, 0.1)
      .setValue(s.graphNodeScale ?? 1.0)
      .setDynamicTooltip()
      .onChange(async v => { s.graphNodeScale = v; await onChange(); })
    );

  new Setting(graphStyleCluster)
    .setName("Link thickness")
    .setDesc("Stroke weight of connection lines (0.5× – 3×)")
    .addSlider(sl => sl
      .setLimits(0.5, 3.0, 0.1)
      .setValue(s.graphLinkThickness ?? 1.0)
      .setDynamicTooltip()
      .onChange(async v => { s.graphLinkThickness = v; await onChange(); })
    );

  // ── Workspace section ─────────────────────────────────
  containerEl.createEl("div", { cls: "tc-section-header", text: "Workspace" });
  const workspaceCard = containerEl.createDiv("tc-section-body tc-feat-body tc-setting-card");

  // ── Sidebar cluster ───────────────────────────────────
  const sidebarCluster = buildCluster(workspaceCard, "Sidebar");
  buildDropdownSetting(sidebarCluster,
    "Sidebar style", "Visual treatment of the left and right sidebars",
    [{ label: "Flat", value: "flat" }, { label: "Bordered", value: "bordered" }, { label: "Cards", value: "cards" }],
    s.sidebarStyle,
    async v => { s.sidebarStyle = v; await refresh(); },
  );

  // ── Canvas cluster — editor surface treatment ─────────
  const canvasCluster = buildCluster(workspaceCard, "Canvas");

  let frostSetting: Setting | null = null;
  buildDropdownSetting(canvasCluster,
    "Background", "Editor and workspace background treatment",
    [{ label: "Solid", value: "solid" }, { label: "Frosted glass", value: "frosted" }, { label: "Gradient", value: "gradient" }],
    s.backgroundStyle,
    async v => {
      s.backgroundStyle = v;
      if (frostSetting) frostSetting.settingEl.style.display = v === "frosted" ? "" : "none";
      await refresh();
    },
  );

  // Frost depth (native Setting, hidden unless frosted)
  frostSetting = new Setting(canvasCluster)
    .setName("Frost depth")
    .setDesc("Intensity of the frosted glass blur effect");
  frostSetting.settingEl.style.display = s.backgroundStyle === "frosted" ? "" : "none";
  frostSetting.addSlider(sl => sl
    .setLimits(0, 100, 1)
    .setValue(s.frostDepth)
    .setDynamicTooltip()
    .onChange(async v => { s.frostDepth = v; await refresh(); })
  );

  // ── Surface cluster — grain texture knobs ─────────────
  const surfaceCluster = buildCluster(workspaceCard, "Surface");

  // Forward-declared so the grain slider's onChange can toggle the
  // sub-dropdown's visibility when grain crosses zero.
  let grainStyleSetting: Setting | null = null;

  new Setting(surfaceCluster)
    .setName("Background Grain")
    .setDesc("Film-grain texture overlaid on the workspace")
    .addSlider(sl => sl
      .setLimits(0, 100, 1)
      .setValue(s.noiseAmount ?? 0)
      .setDynamicTooltip()
      .onChange(async v => {
        s.noiseAmount = v;
        if (grainStyleSetting) {
          grainStyleSetting.settingEl.style.display = v > 0 ? "" : "none";
        }
        await onChange();
      })
    );

  // Grain style sub-dropdown — visible only when noiseAmount > 0.
  grainStyleSetting = new Setting(surfaceCluster)
    .setName("Grain style")
    .setDesc("Texture of the film-grain overlay");
  grainStyleSetting.settingEl.style.display = (s.noiseAmount ?? 0) > 0 ? "" : "none";
  grainStyleSetting.addDropdown(dd => {
    dd.addOption("film",     "Film — fine gaussian");
    dd.addOption("paper",    "Paper — coarse, warm");
    dd.addOption("halftone", "Halftone — dot matrix");
    dd.addOption("static",   "Static — high-contrast");
    dd.setValue(s.grainStyle ?? 'film');
    dd.onChange(async v => { s.grainStyle = v; await onChange(); });
  });

  // ── Accent application cluster — where the accent paints beyond
  //    the palette swatches (currently: window frame). ───────────
  const accentAppCluster = buildCluster(workspaceCard, "Accent application");
  new Setting(accentAppCluster)
    .setName("Colourful window frame")
    .setDesc("Tint Obsidian's window frame with the active flavour's accent")
    .addToggle(t => t
      .setValue(s.colorfulFrame)
      .onChange(async v => { s.colorfulFrame = v; await onChange(); })
    );

  // ── Editor accents cluster — consolidates the old Highlights & Tints
  //    section (Active line / Selection tint / Caret colour) into the
  //    Workspace section. Same three colour-picker-plus-toggle rows, new
  //    home. Pickr instances still registered for cleanup via `pickrs`.
  const editorAccentsCluster = buildCluster(workspaceCard, "Editor accents");

  pickrs.push(buildColorToggleRow(editorAccentsCluster,
    "Active line", "Highlight the current cursor line in the editor",
    () => s.activeLineColour,
    v => { s.activeLineColour = v; },
    () => s.activeLineHighlight,
    v => { s.activeLineHighlight = v; },
    refresh,
  ));

  pickrs.push(buildColorToggleRow(editorAccentsCluster,
    "Selection tint", "Colour overlay applied to selected text",
    () => s.selectionTintColour,
    v => { s.selectionTintColour = v; },
    () => s.selectionTint,
    v => { s.selectionTint = v; },
    refresh,
  ));

  pickrs.push(buildColorToggleRow(editorAccentsCluster,
    "Caret colour", "Colour of the text insertion cursor",
    () => s.caretColour,
    v => { s.caretColour = v; },
    () => s.caretColourEnabled,
    v => { s.caretColourEnabled = v; },
    refresh,
  ));

  return () => pickrs.forEach(p => { try { p.destroyAndRemove(); } catch(_) {} });
}

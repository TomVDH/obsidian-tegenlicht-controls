import { Setting } from "obsidian";
import Pickr from "@simonwep/pickr";
import TegenlichtControlsPlugin from "../main";
import { TegenlichtSettings } from "../settings";
import {
  FlavourEntry,
  DARK_BASE, DARK_EXTENDED, DARK_EXTENDED_TC, DARK_EXTENDED_ANP,
  LIGHT_BASE, LIGHT_EXTENDED, LIGHT_EXTENDED_TC, LIGHT_EXTENDED_ANP,
} from "../flavours";
import {
  buildSegmentSetting, buildColorToggleRow,
  buildLeftRailShell, LeftRailSection,
  buildPrettyAccordion, buildSectionPreview,
} from "./_shared";
import { buildTypographyPreview } from "../preview-sample";

// Left-rail layout (2026-04-17): Appearance's four sections live on
// the rail; each pane stacks the former clusters as foldable pretty
// accordions, matching Typography's pattern. Title + quip sit outside
// the accordion column (Callouts idiom). Theme & Colour gets a
// collapsible PREVIEW strip up top — replaces the bespoke
// tc-palette-expander that used to live inside the Palette cluster.
// Typography,
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

// ─── Rail-section renderers ─────────────────────────────────────────

/** Appends an outlined "+" swatch at the end of an inline swatch grid.
 *  Extracted from the Palette renderer so the closure over state/refresh
 *  is explicit. */
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
  sw.createSpan({ text: "+", cls: "tc-swatch-plus-icon" });
  item.addEventListener("click", async () => { await onToggle(); });
}

function renderTheme(
  pane: HTMLElement,
  s: TegenlichtSettings,
  containerEl: HTMLElement,
  onChange: () => Promise<void>,
  refresh: () => Promise<void>,
  pickrs: Pickr[],
): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Theme & Colour" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Accent pick, light + dark flavour swatches, corner radius, density, icon + border intensity. The PREVIEW below reads every change live." });

  // Section-level PREVIEW strip — replaces the former in-cluster
  // palette expander. Same chevron + dashed connector as Callouts.
  buildSectionPreview(pane, "app-theme-preview", buildTypographyPreview);

  // ── Palette cluster — accent + dark/light flavours ────
  const paletteCluster = buildPrettyAccordion(pane, "app-palette", "Palette");

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

  // appendPlusSwatch — see top-level helper.

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

  // ── Light Flavours (light first now, per user preference) ────
  // "licht" kicker sits directly in the Setting's name slot (not as a
  // separate row) so it's always anchored to the Light flavour heading
  // rather than drifting between settings.
  const lightSetting = new Setting(paletteCluster)
    .setName("Light flavour")
    .setDesc("Applied when Obsidian is in light mode");
  lightSetting.nameEl.prepend(
    createSpan({ cls: "tc-flavour-kicker", text: "licht" }),
  );
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

  // ── Dark Flavours ─────────────────────────────────────────────
  // "tegenlicht" kicker anchored to the Dark flavour name slot — same
  // pattern as the Light flavour kicker above.
  const darkSetting = new Setting(paletteCluster)
    .setName("Dark flavour")
    .setDesc("Applied when Obsidian is in dark mode");
  darkSetting.nameEl.prepend(
    createSpan({ cls: "tc-flavour-kicker", text: "tegenlicht" }),
  );
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

  // Palette preview moved out of the cluster — now a section-level
  // PREVIEW strip rendered at the top of the pane (see buildSectionPreview
  // call at the start of renderTheme). Same buildTypographyPreview
  // content; standardised Callouts-style chevron affordance.

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
  const shapeCluster = buildPrettyAccordion(pane, "app-shape", "Shape");

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
  const weightCluster = buildPrettyAccordion(pane, "app-weight", "Weight");

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

}

function renderOutliner(
  pane: HTMLElement,
  s: TegenlichtSettings,
  onChange: () => Promise<void>,
): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Outliner" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "File tree (nav-files) rendering — type icons, folder glyphs, vault-title styling, plus AnuPuccin-style rainbow folder modes." });

  // ── File tree cluster — three toggles for how nav-files pane renders ─
  const fileTreeCluster = buildPrettyAccordion(pane, "app-filetree", "File tree");

  new Setting(fileTreeCluster)
    .setName("File type icons")
    .setDesc("Show a glyph next to each file in the tree based on its extension")
    .addToggle(t => t
      .setValue(s.fileIcons)
      .onChange(async v => { s.fileIcons = v; await onChange(); })
    );

  // Folder display — segment picker (was a boolean toggle "Collapsed
  // folder arrows"). Two states: Chevrons (collapseFolderIcons: false,
  // Obsidian's native chevrons) or Folders (true, AnuPpuccin's folder
  // icon glyphs via the anp-collapse-folders class). Default is now
  // Chevrons; users opt in to Folders.
  buildSegmentSetting(fileTreeCluster,
    "Folder display",
    "Show chevrons or folder glyphs in the file tree",
    [
      { label: "Chevrons", value: "chevrons" },
      { label: "Folders",  value: "folders"  },
    ],
    s.collapseFolderIcons ? "folders" : "chevrons",
    async v => { s.collapseFolderIcons = (v === "folders"); await onChange(); },
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
  const rainbowCluster = buildPrettyAccordion(pane, "app-rainbow", "Rainbow folders");

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
        .setName("Tint folder names")
        .setDesc("Folder title text picks up the rotating hue. Subtle — reads as a coloured label without painting the whole row.")
        .addToggle(t => t
          .setValue(s.rainbowSimpleTitle)
          .onChange(async v => { s.rainbowSimpleTitle = v; await onChange(); })
        );
      new Setting(advBody)
        .setName("Tint chevrons")
        .setDesc("Obsidian's native chevrons (and AnuPpuccin's folder glyphs when Folder display is set to Folders) take the folder's hue.")
        .addToggle(t => t
          .setValue(s.rainbowSimpleCollapseIcon)
          .onChange(async v => { s.rainbowSimpleCollapseIcon = v; await onChange(); })
        );
      new Setting(advBody)
        .setName("Tint indent guides")
        .setDesc("The thin vertical lines under each folder (shown when children are expanded) inherit the parent's hue.")
        .addToggle(t => t
          .setValue(s.rainbowSimpleIndent)
          .onChange(async v => { s.rainbowSimpleIndent = v; await onChange(); })
        );
      new Setting(advBody)
        .setName("Coloured file marker")
        .setDesc("Paint a small coloured dot next to every file living inside a coloured folder — a trace of the parent's hue on each leaf.")
        .addToggle(t => t
          .setValue(s.rainbowSimpleFileIcon)
          .onChange(async v => { s.rainbowSimpleFileIcon = v; await onChange(); })
        );
    } else if (mode === "full") {
      new Setting(advBody)
        .setName("Tint files inside")
        .setDesc("Files living in a coloured folder pick up the parent's hue on their own row — extends the tint past the folder header.")
        .addToggle(t => t
          .setValue(s.rainbowFullFileRecolor)
          .onChange(async v => { s.rainbowFullFileRecolor = v; await onChange(); })
        );
      new Setting(advBody)
        .setName("Readable titles — light mode")
        .setDesc("Swap folder-name text to the regular text colour (not the folder hue) when the workspace is in a light theme — keeps contrast legible against the pale tint.")
        .addToggle(t => t
          .setValue(s.rainbowFullInvertLight)
          .onChange(async v => { s.rainbowFullInvertLight = v; await onChange(); })
        );
      new Setting(advBody)
        .setName("Readable titles — dark mode")
        .setDesc("Same contrast fix for dark workspaces — folder names paint in the regular text colour rather than the (dim) hue.")
        .addToggle(t => t
          .setValue(s.rainbowFullInvertDark)
          .onChange(async v => { s.rainbowFullInvertDark = v; await onChange(); })
        );
      new Setting(advBody)
        .setName("Tint strength")
        .setDesc("How much of the folder's hue fills its row background. 0 = transparent (no fill), 100 = solid hue at full saturation.")
        .addSlider(sl => sl
          .setLimits(0, 100, 1)
          .setValue(s.rainbowFullBgOpacity ?? 70)
          .setDynamicTooltip()
          .onChange(async v => { s.rainbowFullBgOpacity = v; await onChange(); })
        );
    }
  };
  populateAdvanced(computedMode);

}

function renderGraph(
  pane: HTMLElement,
  s: TegenlichtSettings,
  onChange: () => Promise<void>,
  refresh: () => Promise<void>,
): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Graph" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Graph view — colour mode for nodes and links, plus style tweaks (hover halo, node scale, link thickness)." });

  // ── Colour cluster ────────────────────────────────────
  const graphColourCluster = buildPrettyAccordion(pane, "app-graphcolour", "Colour");
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
  const graphStyleCluster = buildPrettyAccordion(pane, "app-graphstyle", "Style");

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

}

function renderWorkspace(
  pane: HTMLElement,
  s: TegenlichtSettings,
  containerEl: HTMLElement,
  onChange: () => Promise<void>,
  refresh: () => Promise<void>,
  pickrs: Pickr[],
): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Workspace" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Sidebar treatment, canvas background + frost, surface grain, accent application (frame), editor accents (caret, selection, active line), and interface (tab style / spacing / active indicator)." });

  // ── Sidebar cluster ───────────────────────────────────
  const sidebarCluster = buildPrettyAccordion(pane, "app-sidebar", "Sidebar");
  buildDropdownSetting(sidebarCluster,
    "Sidebar style", "Visual treatment of the left and right sidebars",
    [{ label: "Flat", value: "flat" }, { label: "Bordered", value: "bordered" }, { label: "Cards", value: "cards" }],
    s.sidebarStyle,
    async v => { s.sidebarStyle = v; await refresh(); },
  );

  // ── Canvas cluster — editor surface treatment ─────────
  const canvasCluster = buildPrettyAccordion(pane, "app-canvas", "Canvas");

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
  const surfaceCluster = buildPrettyAccordion(pane, "app-surface", "Surface");

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
  const accentAppCluster = buildPrettyAccordion(pane, "app-accentapp", "Accent application");
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
  const editorAccentsCluster = buildPrettyAccordion(pane, "app-editoraccents", "Editor accents");

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

  // ── Interface cluster — surface tab nav style + spacing controls.
  //    tabBarStyle accepts: 'switch' (default, monochrome knob),
  //    'switch-amber' (accent knob), 'underline' (no track), 'ghost'
  //    (1px outline). Retired legacy values migrate to 'switch' in
  //    loadSettings. Until Task 5 ships the matching CSS, the picker
  //    renders but the visual effect on the tab bar only lands with
  //    that later commit.
  const interfaceCluster = buildPrettyAccordion(pane, "app-interface", "Interface");

  buildSegmentSetting(interfaceCluster,
    "Tab style",
    "How the settings tab navigation renders",
    [
      { label: "Switch",    value: "switch"       },
      { label: "Amber",     value: "switch-amber" },
      { label: "Underline", value: "underline"    },
      { label: "Ghost",     value: "ghost"        },
    ],
    s.tabBarStyle,
    async v => { s.tabBarStyle = v; await refresh(); },
  );

  // Active-tab indicator paint — Glow (radial accent gradient only),
  // Glow B (radial glow + persistent currentColor border on every
  // tab, accent ring on active), or Pill (solid accent fill + ring,
  // fully rounded, inactive tabs also framed). Body class flip in
  // applier.ts; CSS branches under .tc-tabs-active-{glow|glow-b|pill}.
  buildSegmentSetting(interfaceCluster,
    "Tab active style",
    "How the active tab indicator paints",
    [
      { label: "Glow",   value: "glow"   },
      { label: "Glow B", value: "glow-b" },
      { label: "Pill",   value: "pill"   },
    ],
    s.tabActiveStyle,
    async v => { s.tabActiveStyle = v; await onChange(); },
  );

  new Setting(interfaceCluster)
    .setName("Tab spacing")
    .setDesc("Gap between tab buttons (0–16px)")
    .addSlider(sl => sl
      .setLimits(0, 16, 1)
      .setValue(s.tabBarSpacing ?? 6)
      .setDynamicTooltip()
      .onChange(async v => { s.tabBarSpacing = v; await refresh(); })
    );
}

/** Main build — wires the left-rail shell with the four section
 *  renderers. Pickr instances are registered into a shared array so
 *  they can be cleaned up on tab teardown. */
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

  const wrap = containerEl.createDiv("tc-appearance-wrap");

  const sections: LeftRailSection[] = [
    { id: "theme",     label: "Theme & Colour", count: 3,
      render: pane => renderTheme(pane, s, containerEl, onChange, refresh, pickrs) },
    { id: "outliner",  label: "Outliner",       count: 2,
      render: pane => renderOutliner(pane, s, onChange) },
    { id: "graph",     label: "Graph",          count: 2,
      render: pane => renderGraph(pane, s, onChange, refresh) },
    { id: "workspace", label: "Workspace",      count: 6,
      render: pane => renderWorkspace(pane, s, containerEl, onChange, refresh, pickrs) },
  ];

  const shellCleanup = buildLeftRailShell(wrap, sections);

  return () => {
    shellCleanup();
    pickrs.forEach(p => { try { p.destroyAndRemove(); } catch(_) {} });
  };
}

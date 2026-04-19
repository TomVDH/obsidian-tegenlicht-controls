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
  buildSegmentSetting, buildColourVarRow,
  buildLeftRailShell, LeftRailSection,
  buildPrettyAccordion, buildSectionPreview,
  swapAccordionVariant,
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

// buildSegmentWithColor (pills + auto/mono dots) retired — Weight
// cluster now uses plain buildSegmentSetting matching Shape's style.
// iconColour / borderColour settings kept for back-compat; default
// 'auto' (empty string = 40% accent tint).

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
 *  Extracted from the Palette renderer so the closure over state is
 *  explicit. Returns the swatch element + its parent item so the
 *  caller can update both imperatively on toggle (active class for
 *  the rotated-x look, title attribute for the accessibility label)
 *  without tearing the whole pane down via redisplay(). */
function appendPlusSwatch(
  inlineWrap: HTMLElement,
  isOpen: boolean,
  onToggle: () => Promise<void>,
): { item: HTMLElement, sw: HTMLElement } | null {
  const grid = inlineWrap.querySelector<HTMLElement>(".tc-swatch-grid");
  if (!grid) return null;
  const item = grid.createDiv("tc-swatch-item tc-swatch-item--plus");
  item.setAttribute("title", isOpen ? "Hide extended flavours" : "Show extended flavours");
  const sw = item.createDiv("tc-swatch tc-swatch-plus" + (isOpen ? " tc-swatch-plus--active" : ""));
  sw.createSpan({ text: "+", cls: "tc-swatch-plus-icon" });
  item.addEventListener("click", async () => { await onToggle(); });
  return { item, sw };
}

export function renderTheme(
  pane: HTMLElement,
  s: TegenlichtSettings,
  containerEl: HTMLElement,
  onChange: () => Promise<void>,
  refresh: () => Promise<void>,
  pickrs: Pickr[],
): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Theme" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Accent pick, light + dark flavour swatches, corner radius, density, icon + border intensity. The PREVIEW below reads every change live." });

  // Section-level PREVIEW strip — replaces the former in-cluster
  // palette expander. Same chevron + dashed connector as Callouts.
  buildSectionPreview(pane, "app-theme-preview", buildTypographyPreview);

  // ── Palette cluster — accent + dark/light flavours ────
  const paletteCluster = buildPrettyAccordion(pane, "app-palette", "Palette", true, s.accordionStyle);

  // ── Accent Colour — native Setting row, pips in the control slot ──
  const accentSetting = new Setting(paletteCluster)
    .setName("Accent colour")
    .setDesc("Drives the highlight colour across the interface");
  const accentRow = accentSetting.controlEl.createDiv("tc-accent-row");

  // Track all accent dots so we can update active state imperatively
  // on click — no redisplay() needed, which means the preview and
  // other open elements in the pane stay put when accent changes.
  const accentDots: HTMLElement[] = [];
  const setActiveAccentDot = (target: HTMLElement) => {
    accentDots.forEach(d => d.removeClass("tc-accent-dot--active"));
    target.addClass("tc-accent-dot--active");
  };

  ACCENT_PRESETS.forEach(({ label, hex }) => {
    const item = accentRow.createDiv("tc-accent-item");
    const dot  = item.createDiv("tc-accent-dot");
    dot.style.background = hex;
    if (s.accentColour === hex) dot.addClass("tc-accent-dot--active");
    dot.setAttribute("title", label); // tooltip only — no visible caption
    accentDots.push(dot);
    dot.addEventListener("click", async () => {
      s.accentColour = hex;
      setActiveAccentDot(dot);
      await onChange();
    });
  });
  accentRow.createDiv("tc-accent-sep");

  // ── Auto (takes the accent from the selected flavour swatch) ─────
  const autoItem = accentRow.createDiv("tc-accent-item tc-accent-item--auto");
  const autoDot  = autoItem.createDiv("tc-accent-dot tc-accent-dot--auto");
  if (s.accentColour === 'auto') autoDot.addClass("tc-accent-dot--active");
  autoDot.setAttribute("title", "Use flavour's default accent");
  accentDots.push(autoDot);
  autoDot.addEventListener("click", async () => {
    s.accentColour = 'auto';
    setActiveAccentDot(autoDot);
    await onChange();
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

  // Light-mode accent control stashed in Legacy → Accents (2026-04-18).
  // The main Appearance row is already busy with dark-accent pips +
  // auto + custom Pickr; a second accent control here doubled up the
  // visual weight. Kept functional; just relocated.

  // appendPlusSwatch — see top-level helper.

  // ── Dark Flavours ──────────────────────────────────────
  // Base flavours + a "+" swatch at the end that folds the extended grid
  // out below. Clicking + opens; clicking × (rotated +) closes. No
  // dedicated toggle row — the interaction lives in the swatch strip.
  // Shared flavour-pick handler — assigns the chosen class AND resets any
  // per-flavour overrides (currently just iconColour) so picking a theme
  // always lands at that theme's defaults. Tom can re-tint after switching.
  // Flavour pick — writes the chosen class + resets per-flavour overrides
  // (iconColour / borderColour currently have no UI surface in this pane,
  // so resetting them doesn't require a redisplay). The swatch grids
  // manage their own active-swatch class imperatively on click, so all
  // we need is applier re-run via onChange().
  const pickFlavour = async (kind: 'dark' | 'light', cls: string) => {
    if (kind === 'dark') s.darkFlavour = cls;
    else                 s.lightFlavour = cls;
    s.iconColour   = '';
    s.borderColour = '';
    await onChange();
  };

  // ── Light Flavours ────────────────────────────────────────────
  const lightSetting = new Setting(paletteCluster)
    .setName("Light flavour")
    .setDesc("Applied when Obsidian is in light mode");
  lightSetting.nameEl.prepend(
    createSpan({ cls: "tc-flavour-kicker", text: "licht" }),
  );
  const lightInlineWrap = lightSetting.controlEl.createDiv("tc-swatch-grid-inline");
  buildSwatchGrid(lightInlineWrap, LIGHT_BASE, s.lightFlavour, cls => pickFlavour('light', cls));
  // Extended light wrap ALWAYS rendered; display toggled imperatively
  // so expanding/collapsing doesn't need a pane rebuild.
  const lightExtWrap = paletteCluster.createDiv("tc-swatch-grid-wrap tc-swatch-grouped");
  lightExtWrap.createSpan({ text: "Tegenlicht", cls: "tc-swatch-group-label" });
  buildSwatchGrid(lightExtWrap, LIGHT_EXTENDED_TC, s.lightFlavour, cls => pickFlavour('light', cls));
  lightExtWrap.createSpan({ text: "AnuPuccin", cls: "tc-swatch-group-label" });
  buildSwatchGrid(lightExtWrap, LIGHT_EXTENDED_ANP, s.lightFlavour, cls => pickFlavour('light', cls));
  lightExtWrap.style.display = s.showExtendedLight ? "" : "none";
  const lightPlus = appendPlusSwatch(lightInlineWrap, s.showExtendedLight, async () => {
    s.showExtendedLight = !s.showExtendedLight;
    lightExtWrap.style.display = s.showExtendedLight ? "" : "none";
    lightPlus?.sw.classList.toggle("tc-swatch-plus--active", s.showExtendedLight);
    lightPlus?.item.setAttribute("title",
      s.showExtendedLight ? "Hide extended flavours" : "Show extended flavours");
    await onChange();
  });

  // ── Dark Flavours ─────────────────────────────────────────────
  const darkSetting = new Setting(paletteCluster)
    .setName("Dark flavour")
    .setDesc("Applied when Obsidian is in dark mode");
  darkSetting.nameEl.prepend(
    createSpan({ cls: "tc-flavour-kicker", text: "tegenlicht" }),
  );
  const darkInlineWrap = darkSetting.controlEl.createDiv("tc-swatch-grid-inline");
  buildSwatchGrid(darkInlineWrap, DARK_BASE, s.darkFlavour, cls => pickFlavour('dark', cls));
  const darkExtWrap = paletteCluster.createDiv("tc-swatch-grid-wrap tc-swatch-grouped");
  darkExtWrap.createSpan({ text: "Tegenlicht", cls: "tc-swatch-group-label" });
  buildSwatchGrid(darkExtWrap, DARK_EXTENDED_TC, s.darkFlavour, cls => pickFlavour('dark', cls));
  darkExtWrap.createSpan({ text: "AnuPuccin", cls: "tc-swatch-group-label" });
  buildSwatchGrid(darkExtWrap, DARK_EXTENDED_ANP, s.darkFlavour, cls => pickFlavour('dark', cls));
  darkExtWrap.style.display = s.showExtendedDark ? "" : "none";
  const darkPlus = appendPlusSwatch(darkInlineWrap, s.showExtendedDark, async () => {
    s.showExtendedDark = !s.showExtendedDark;
    darkExtWrap.style.display = s.showExtendedDark ? "" : "none";
    darkPlus?.sw.classList.toggle("tc-swatch-plus--active", s.showExtendedDark);
    darkPlus?.item.setAttribute("title",
      s.showExtendedDark ? "Hide extended flavours" : "Show extended flavours");
    await onChange();
  });

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
  const shapeCluster = buildPrettyAccordion(pane, "app-shape", "Shape", true, s.accordionStyle);

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
    async v => { s.cornerRadius = v; await onChange(); },
  );

  buildSegmentSetting(shapeCluster,
    "UI density", "Spacing across nav, tabs, ribbon, and header",
    [
      { label: "Compact",     value: "compact" },
      { label: "Comfortable", value: "comfortable" },
      { label: "Spacious",    value: "spacious" },
    ],
    s.uiDensity,
    async v => { s.uiDensity = v; await onChange(); },
  );

  // ── Weight cluster — line weight of icons and borders ─
  // Plain segment pickers matching Shape's pattern exactly (pills
  // only, no auto/mono colour dots). The per-choice icon/border
  // colour (`iconColour` / `borderColour`) stays in settings for
  // future reuse but is no longer UI-exposed here — defaults to
  // 'auto' (empty string = 40% accent tint).
  const weightCluster = buildPrettyAccordion(pane, "app-weight", "Weight", true, s.accordionStyle);

  buildSegmentSetting(weightCluster,
    "Icon intensity", "Stroke weight of every Lucide icon in the chrome",
    [
      { label: "Hair",    value: "hair" },
      { label: "Thin",    value: "thin" },
      { label: "Regular", value: "regular" },
      { label: "Bold",    value: "bold" },
    ],
    s.iconStroke,
    async v => { s.iconStroke = v; await onChange(); },
  );

  buildSegmentSetting(weightCluster,
    "Border intensity", "Strength of borders across the Obsidian interface",
    [
      { label: "None",         value: "none" },
      { label: "Whisper",      value: "whisper" },
      { label: "Subtle",       value: "subtle" },
      { label: "Ligne claire", value: "ligne-claire" },
    ],
    s.borderIntensity,
    async v => { s.borderIntensity = v; await onChange(); },
  );

}

export function renderWorkspace(
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
  const sidebarCluster = buildPrettyAccordion(pane, "app-sidebar", "Sidebar", true, s.accordionStyle);
  buildDropdownSetting(sidebarCluster,
    "Sidebar style", "Visual treatment of the left and right sidebars",
    [{ label: "Flat", value: "flat" }, { label: "Bordered", value: "bordered" }, { label: "Cards", value: "cards" }],
    s.sidebarStyle,
    async v => { s.sidebarStyle = v; await onChange(); },
  );

  // ── Canvas cluster — editor surface treatment ─────────
  const canvasCluster = buildPrettyAccordion(pane, "app-canvas", "Canvas", true, s.accordionStyle);

  let frostSetting: Setting | null = null;
  buildDropdownSetting(canvasCluster,
    "Background", "Editor and workspace background treatment",
    [{ label: "Solid", value: "solid" }, { label: "Frosted glass", value: "frosted" }, { label: "Gradient", value: "gradient" }],
    s.backgroundStyle,
    async v => {
      s.backgroundStyle = v;
      if (frostSetting) frostSetting.settingEl.style.display = v === "frosted" ? "" : "none";
      await onChange();
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
    .onChange(async v => { s.frostDepth = v; await onChange(); })
  );

  // ── Surface cluster — grain texture knobs ─────────────
  const surfaceCluster = buildPrettyAccordion(pane, "app-surface", "Surface", true, s.accordionStyle);

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
  const accentAppCluster = buildPrettyAccordion(pane, "app-accentapp", "Accent application", true, s.accordionStyle);
  new Setting(accentAppCluster)
    .setName("Colourful window frame")
    .setDesc("Tint Obsidian's window frame with the active flavour's accent")
    .addToggle(t => t
      .setValue(s.colorfulFrame)
      .onChange(async v => { s.colorfulFrame = v; await onChange(); })
    );

  // Icon-invert modifiers for the colourful frame — Wave 6.5 ports
  // relocated from the retired Features tab. Only meaningful when
  // Colourful window frame is on; kept visible so users can flip the
  // modes without toggling the parent off and on.
  new Setting(accentAppCluster)
    .setName("Colourful frame · invert icons (light)")
    .setDesc("Invert icon colours on the colourful frame in light mode")
    .addToggle(t => t
      .setValue(s.colorfulFrameInvertLight)
      .onChange(async v => { s.colorfulFrameInvertLight = v; await onChange(); })
    );
  new Setting(accentAppCluster)
    .setName("Colourful frame · invert icons (dark)")
    .setDesc("Invert icon colours on the colourful frame in dark mode")
    .addToggle(t => t
      .setValue(s.colorfulFrameInvertDark)
      .onChange(async v => { s.colorfulFrameInvertDark = v; await onChange(); })
    );

  // Absorbed from Legacy → Frame & accents (Step 4). Light-mode accent
  // override + custom frame colour sit alongside the frame toggles
  // they modify — natural home now that Appearance Palette is already
  // busy with dark-accent pips.
  new Setting(accentAppCluster)
    .setName("Light mode accent")
    .setDesc("Override the accent when Obsidian is in light mode (auto = match the main Appearance pick)")
    .addDropdown(dd => {
      dd.addOption("auto", "Auto (match main accent)");
      ACCENT_PRESETS.forEach(p => dd.addOption(p.hex, p.label));
      dd.setValue(s.lightAccentColour || "auto");
      dd.onChange(async v => { s.lightAccentColour = v; await onChange(); });
    });

  pickrs.push(buildColourVarRow(accentAppCluster,
    "Colourful frame colour",
    "Override the colourful-frame accent colour. Clear = theme default.",
    () => s.colorfulFrameColour,
    v => { s.colorfulFrameColour = v; },
    onChange,
  ));

  // Editor accents (active line / selection tint / caret) moved to the
  // Editor tab → Accents section (Step 3c of settings-reorg-plan.md).

}

/** Interface rail section — plugin-chrome controls (settings-panel
 *  tab-bar style + spacing + active indicator, plus the accordion
 *  paint that cascades across Typography + Appearance). Wrapped in
 *  a single "Tegenlicht UI" accordion so future chrome-level
 *  controls can slot alongside. */
export function renderInterface(
  pane: HTMLElement,
  s: TegenlichtSettings,
  onChange: () => Promise<void>,
): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Interface" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Chrome controls that live on the plugin's own UI — settings-panel tab bar, accordion paint, and spacing. These re-style Tegenlicht itself." });

  const tegenlichtUI = buildPrettyAccordion(pane, "app-tegenlicht-ui", "Tegenlicht UI", true, s.accordionStyle);

  buildSegmentSetting(tegenlichtUI,
    "Tab style",
    "How the settings tab navigation renders",
    [
      { label: "Switch",    value: "switch"       },
      { label: "Amber",     value: "switch-amber" },
      { label: "Underline", value: "underline"    },
      { label: "Ghost",     value: "ghost"        },
    ],
    s.tabBarStyle,
    async v => { s.tabBarStyle = v; await onChange(); },
  );

  // Active-tab indicator paint — Glow (radial accent gradient only),
  // Glow B (radial glow + persistent currentColor border on every
  // tab, accent ring on active), or Pill (solid accent fill + ring,
  // fully rounded, inactive tabs also framed). Body class flip in
  // applier.ts; CSS branches under .tc-tabs-active-{glow|glow-b|pill}.
  buildSegmentSetting(tegenlichtUI,
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

  // Accordion paint — applies to every foldable accordion rendered
  // via `buildPrettyAccordion` (Typography panes + Appearance
  // clusters). Live-swapped via swapAccordionVariant() so the flip
  // shows without a pane rebuild.
  buildDropdownSetting(tegenlichtUI,
    "Accordion style",
    "Paint applied to every foldable cluster across Typography + Appearance",
    [
      { label: "Pretty",    value: "pretty"   },
      { label: "Gutter",    value: "gutter"   },
      { label: "Ghost",     value: "ghost"    },
      { label: "Two-tone",  value: "twotone"  },
      { label: "Halo",      value: "halo"     },
      { label: "Folio",     value: "filed"    },
      { label: "Bloc",      value: "bloc"     },
      { label: "Dashed",    value: "subdued"  },
    ],
    s.accordionStyle,
    async v => {
      s.accordionStyle = v;
      swapAccordionVariant(v);
      await onChange();
    },
  );

  new Setting(tegenlichtUI)
    .setName("Tab spacing")
    .setDesc("Gap between tab buttons (0–16px)")
    .addSlider(sl => sl
      .setLimits(0, 16, 1)
      .setValue(s.tabBarSpacing ?? 6)
      .setDynamicTooltip()
      .onChange(async v => { s.tabBarSpacing = v; await onChange(); })
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
    { id: "theme",     label: "Theme",          count: 3,
      render: pane => renderTheme(pane, s, containerEl, onChange, refresh, pickrs) },
    { id: "workspace", label: "Canvas & Frame", count: 4,
      render: pane => renderWorkspace(pane, s, containerEl, onChange, refresh, pickrs) },
    { id: "interface", label: "Interface",      count: 1,
      render: pane => renderInterface(pane, s, onChange) },
  ];

  const shellCleanup = buildLeftRailShell(wrap, sections, "appearance");

  return () => {
    shellCleanup();
    pickrs.forEach(p => { try { p.destroyAndRemove(); } catch(_) {} });
  };
}

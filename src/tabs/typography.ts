import { Setting, SliderComponent, setIcon } from "obsidian";
import TegenlichtControlsPlugin from "../main";
import { DEFAULT_SETTINGS, TegenlichtSettings } from "../settings";
import { buildFontCombobox } from "../font-combobox";
import { buildTypographyPreview } from "../preview-sample";
import { CATPPUCCIN_COLOURS } from "../applier";
import {
  buildLeftRailShell, LeftRailSection,
  buildPrettyAccordion, buildSectionPreview,
} from "./_shared";

interface SliderCfg {
  key: keyof TegenlichtSettings;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
}

const HEADING_SLIDERS: SliderCfg[] = [
  { key: "h1Size", label: "H1", min: 0.5, max: 3.0, step: 0.05, unit: "em" },
  { key: "h2Size", label: "H2", min: 0.5, max: 3.0, step: 0.05, unit: "em" },
  { key: "h3Size", label: "H3", min: 0.5, max: 3.0, step: 0.05, unit: "em" },
  { key: "h4Size", label: "H4", min: 0.5, max: 3.0, step: 0.05, unit: "em" },
  { key: "h5Size", label: "H5", min: 0.5, max: 3.0, step: 0.05, unit: "em" },
  { key: "h6Size", label: "H6", min: 0.5, max: 3.0, step: 0.05, unit: "em" },
];

const SPACING_SLIDERS: SliderCfg[] = [
  { key: "listIndent",  label: "List indent",  min: 0.5, max: 4.0, step: 0.05,  unit: "em" },
  { key: "listSpacing", label: "List spacing", min: 0,   max: 0.5, step: 0.005, unit: "em" },
];

// ── Font combobox replaces the old preset pills + raw input. See
//    ../font-combobox.ts for the search/filter/keyboard behaviour.
// buildPrettyAccordion + buildSectionPreview live in ./_shared so
// Appearance can share the same rail-pane idiom. Keys below use a
// `typo-` prefix to avoid collisions with other tabs.

/** Font role row — Name/Desc on the left, searchable combobox + system
 *  + reset buttons on the right. Matches Appearance tab's Setting-row
 *  language. `defaultValue` is the DEFAULT_SETTINGS value for this role
 *  (Things-inspired: Inter / Inter / JetBrains Mono). */
function buildFontRoleSetting(
  container: HTMLElement,
  name: string,
  desc: string,
  includeGoogleFonts: boolean,
  currentValue: string,
  defaultValue: string,
  onChange: (val: string) => Promise<void>,
): void {
  const setting = new Setting(container).setName(name).setDesc(desc);
  setting.settingEl.addClass("tc-font-role-setting");

  const row = setting.controlEl.createDiv("tc-font-role-row");

  buildFontCombobox({
    container: row,
    currentValue,
    includeGoogleFonts,
    placeholder: "Search fonts…",
    onChange,
  });

  // Both mini-buttons need `mousedown preventDefault` so the combobox's
  // input doesn't blur before the click lands — the blur handler commits
  // whatever's typed, which would race and clobber the button's action.
  // Both are single-click commit; no double-click arming (that's the
  // reset-ALL button in the tab bar, a different beast).
  const applyValue = async (value: string) => {
    await onChange(value);
    const inp = row.querySelector<HTMLInputElement>(".tc-font-combobox-input");
    if (inp) inp.value = value;
  };

  // System — snap back to OS default font (empty string). Lucide `monitor`.
  const systemBtn = row.createEl("button", { cls: "tc-circle-btn tc-font-role-system" });
  systemBtn.setAttribute("title", "Use system font");
  systemBtn.setAttribute("aria-label", "Use system font");
  setIcon(systemBtn, "monitor");
  systemBtn.addEventListener("mousedown", e => e.preventDefault());
  systemBtn.addEventListener("click", () => applyValue(""));

  // Reset — back to the plugin-provided default (Inter / JetBrains Mono).
  // Lucide `rotate-ccw`, same circular treatment.
  const resetBtn = row.createEl("button", { cls: "tc-circle-btn tc-font-role-reset" });
  resetBtn.setAttribute("title", `Reset to default (${defaultValue || "system"})`);
  resetBtn.setAttribute("aria-label", "Reset to default");
  setIcon(resetBtn, "rotate-ccw");
  resetBtn.addEventListener("mousedown", e => e.preventDefault());
  resetBtn.addEventListener("click", () => applyValue(defaultValue));
}

/** Slider row — label chip, slider, value badge, reset. Compact layout so
 *  six H1-H6 sliders read as a family rather than six separate rows.
 *  Uses Obsidian's native SliderComponent so the knob inherits the
 *  platform's interactive-accent styling (matches the Grain slider in
 *  Appearance and every other native Obsidian slider). No custom
 *  -webkit-slider-* rules needed — we just drop the component into
 *  our custom grid cell and let Obsidian render the slider itself. */
function buildSliderRow(
  container: HTMLElement,
  cfg: SliderCfg,
  currentVal: number,
  onChange: (val: number) => void,
  onReset: () => void,
): void {
  const isHeading = cfg.key.toString().startsWith("h") && cfg.key.toString().endsWith("Size");
  const row = container.createDiv("tc-h-row" + (isHeading ? "" : " tc-h-row--spacing"));

  if (isHeading) {
    row.createSpan({ text: cfg.label, cls: "tc-h-chip" });
  } else {
    row.createSpan({ text: cfg.label, cls: "tc-spacing-label" });
  }

  // Obsidian's native slider component — matches the Grain slider look,
  // gets the accent-coloured knob via --interactive-accent.
  const slider = new SliderComponent(row);
  slider.setLimits(cfg.min, cfg.max, cfg.step).setValue(currentVal).setDynamicTooltip();
  slider.sliderEl.addClass("tc-h-slider");

  const digits = isHeading ? 2 : 3;
  const badge = row.createSpan({ cls: "tc-h-val" });
  badge.setText(`${currentVal.toFixed(digits)}${cfg.unit}`);

  const resetBtn = row.createEl("button", { cls: "tc-reset-btn" });
  resetBtn.setAttribute("title", "Reset to default");
  resetBtn.setAttribute("aria-label", "Reset to default");
  setIcon(resetBtn, "rotate-ccw");

  // SliderComponent.onChange() fires on `change` (mouse release), so the
  // live preview only updated when the user let go of the knob. Listen
  // directly to the `input` event on the underlying <input type="range">
  // — it fires on every frame of the drag, giving real-time visual
  // response in the mini-Obsidian preview and the editor itself.
  slider.sliderEl.addEventListener("input", () => {
    const v = parseFloat(slider.sliderEl.value);
    badge.setText(`${v.toFixed(digits)}${cfg.unit}`);
    onChange(v);
  });
  resetBtn.addEventListener("click", () => {
    const def = DEFAULT_SETTINGS[cfg.key] as number;
    slider.setValue(def);
    badge.setText(`${def.toFixed(digits)}${cfg.unit}`);
    onReset();
  });
}

// ── Rail-section renderers ──────────────────────────────────────────
// Each renderer paints its section's content inside a foldable
// accordion wearing the pretty-cluster accent paint. The rail
// sidebar already labels the section; the accordion header labels
// the content group (often a sub-topic of the rail item).

function renderFonts(
  pane: HTMLElement,
  s: TegenlichtSettings,
  onChange: () => Promise<void>,
  refresh: () => Promise<void>,
): void {
  // Section title + quip sit OUTSIDE the accordion, matching the
  // Callouts pattern in the Legacy tab. The accordion below carries
  // a sub-label styled as a subtitle (regular colour, all-caps, h5-
  // ish) — the accent-painted card is a sub-box, not the section
  // itself.
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Fonts" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Role-based mapping for Interface / Editor / Source. Load optional families from Google Fonts; fall back to system when disabled." });

  // In-section collapsible preview, same pattern as Callouts.
  buildSectionPreview(pane, "typo-fonts-preview", buildTypographyPreview);

  const card = buildPrettyAccordion(pane, "typo-fonts", "Role mapping", true, s.accordionStyle);

  new Setting(card)
    .setName("Load Google Fonts")
    .setDesc(
      s.googleFontsEnabled !== false
        ? "Fetches family files from fonts.google.com on pick"
        : "System fonts only — no network requests"
    )
    .addToggle(t => t
      .setValue(s.googleFontsEnabled !== false)
      .onChange(async v => { s.googleFontsEnabled = v; await refresh(); })
    );

  const gfOn = s.googleFontsEnabled !== false;

  buildFontRoleSetting(card, "Interface",
    "Sidebar, tabs, ribbon — the UI chrome",
    gfOn, s.fontInterface ?? "", DEFAULT_SETTINGS.fontInterface,
    async v => { s.fontInterface = v; await onChange(); });
  buildFontRoleSetting(card, "Editor",
    "Body text and rendered headings in the document",
    gfOn, s.fontEditor ?? "", DEFAULT_SETTINGS.fontEditor,
    async v => { s.fontEditor = v; await onChange(); });
  buildFontRoleSetting(card, "Source",
    "Code blocks and source-mode editor",
    gfOn, s.fontSource ?? "", DEFAULT_SETTINGS.fontSource,
    async v => { s.fontSource = v; await onChange(); });
}

function renderRhythm(
  pane: HTMLElement,
  s: TegenlichtSettings,
  onChange: () => Promise<void>,
): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Rhythm" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Vertical rhythm of the document — heading sizes in ems, plus list indent and item spacing." });

  // In-section collapsible preview, same pattern as Callouts.
  buildSectionPreview(pane, "typo-rhythm-preview", buildTypographyPreview);

  const card = buildPrettyAccordion(pane, "typo-rhythm", "Sliders", true, s.accordionStyle);
  card.addClass("tc-h-accordion-body");

  const headingGroup = card.createDiv("tc-h-group");
  HEADING_SLIDERS.forEach(cfg => {
    buildSliderRow(
      headingGroup, cfg, s[cfg.key] as number,
      async (v) => { (s as unknown as Record<string, unknown>)[cfg.key as string] = v; await onChange(); },
      async () => { (s as unknown as Record<string, unknown>)[cfg.key as string] = DEFAULT_SETTINGS[cfg.key]; await onChange(); },
    );
  });

  card.createDiv("tc-rhythm-divider");

  const spacingGroup = card.createDiv("tc-h-group");
  SPACING_SLIDERS.forEach(cfg => {
    buildSliderRow(
      spacingGroup, cfg, s[cfg.key] as number,
      async (v) => { (s as unknown as Record<string, unknown>)[cfg.key as string] = v; await onChange(); },
      async () => { (s as unknown as Record<string, unknown>)[cfg.key as string] = DEFAULT_SETTINGS[cfg.key]; await onChange(); },
    );
  });
}

/** Wave 3 — per-H colour + divider toggles + master heading toggles +
 *  heading margin value slider. Two accordions: "Master" (enables +
 *  margin slider) and "Per heading" (six colour dropdowns + six
 *  divider toggles). Plus a preview strip at the top so picking a
 *  colour / divider updates the live preview.
 *
 *  Colour dropdowns write one of 14 Catppuccin classes to body via
 *  the applier's `applyColourClassSelect` — "Theme default" clears
 *  all 14 classes for that prefix. Master toggles (anp-header-color-
 *  toggle / margin / divider-color-toggle) gate whether the chosen
 *  colours actually paint. */
function renderHeadings(
  pane: HTMLElement,
  s: TegenlichtSettings,
  onChange: () => Promise<void>,
): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Headings" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Per-heading colour, divider rule, heading margin. Master toggles gate whether picks actually paint — off means theme defaults hold." });

  buildSectionPreview(pane, "typo-headings-preview", buildTypographyPreview);

  // ── Master toggles + margin slider ─────────────────────────────
  const master = buildPrettyAccordion(pane, "typo-headings-master",
    "Master toggles", true, s.accordionStyle);
  master.addClass("tc-h-accordion-body");

  new Setting(master)
    .setName("Custom heading colours")
    .setDesc("Master enable — without this, the per-H dropdowns below don't paint")
    .addToggle(t => t
      .setValue(s.headingColorsEnabled)
      .onChange(async v => { s.headingColorsEnabled = v; await onChange(); }));

  new Setting(master)
    .setName("Custom heading margins")
    .setDesc("Enables the margin slider below for spacing around every H")
    .addToggle(t => t
      .setValue(s.headingMarginsEnabled)
      .onChange(async v => { s.headingMarginsEnabled = v; await onChange(); }));

  new Setting(master)
    .setName("Divider inherits heading colour")
    .setDesc("When on, each H divider borrows its H's colour instead of a neutral line")
    .addToggle(t => t
      .setValue(s.headingDividerInherit)
      .onChange(async v => { s.headingDividerInherit = v; await onChange(); }));

  new Setting(master)
    .setName("Heading margin")
    .setDesc("Space around every heading, 0–30 px (only effective when Custom heading margins is on)")
    .addSlider(sl => sl
      .setLimits(0, 30, 2)
      .setValue(s.headingMargin ?? 15)
      .setDynamicTooltip()
      .onChange(async v => { s.headingMargin = v; await onChange(); }));

  // ── Per-heading colour + divider ───────────────────────────────
  const perH = buildPrettyAccordion(pane, "typo-headings-perh",
    "Per heading", true, s.accordionStyle);
  perH.addClass("tc-h-accordion-body");

  const perHDef = [
    { label: "H1", colKey: "h1Color" as const, divKey: "h1Divider" as const },
    { label: "H2", colKey: "h2Color" as const, divKey: "h2Divider" as const },
    { label: "H3", colKey: "h3Color" as const, divKey: "h3Divider" as const },
    { label: "H4", colKey: "h4Color" as const, divKey: "h4Divider" as const },
    { label: "H5", colKey: "h5Color" as const, divKey: "h5Divider" as const },
    { label: "H6", colKey: "h6Color" as const, divKey: "h6Divider" as const },
  ];
  perHDef.forEach(row => {
    const setting = new Setting(perH).setName(row.label);
    setting.addDropdown(dd => {
      dd.addOption("", "Theme default");
      CATPPUCCIN_COLOURS.forEach(name =>
        dd.addOption(name, name.charAt(0).toUpperCase() + name.slice(1)));
      dd.setValue((s as unknown as Record<string, string>)[row.colKey] ?? "");
      dd.onChange(async v => {
        (s as unknown as Record<string, string>)[row.colKey] = v;
        await onChange();
      });
    });
    setting.addToggle(t => t
      .setTooltip("Divider under heading")
      .setValue((s as unknown as Record<string, boolean>)[row.divKey])
      .onChange(async v => {
        (s as unknown as Record<string, boolean>)[row.divKey] = v;
        await onChange();
      }));
  });
}

/** Wave 3 — bold / italic / highlight decoration colours. Same
 *  class-select shape as the per-H dropdowns; writes the chosen
 *  Catppuccin colour class to body. */
function renderAccents(
  pane: HTMLElement,
  s: TegenlichtSettings,
  onChange: () => Promise<void>,
): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Accents" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Bold / italic / highlight runs take a named Catppuccin colour instead of the theme's default text tone." });

  buildSectionPreview(pane, "typo-accents-preview", buildTypographyPreview);

  const card = buildPrettyAccordion(pane, "typo-accents-card",
    "Decoration accents", true, s.accordionStyle);
  card.addClass("tc-h-accordion-body");

  const rows = [
    { label: "Bold",      key: "boldColor"      as const },
    { label: "Italic",    key: "italicColor"    as const },
    { label: "Highlight", key: "highlightColor" as const },
  ];
  rows.forEach(row => {
    new Setting(card)
      .setName(row.label)
      .setDesc(`Colour for ${row.label.toLowerCase()} runs in the body text`)
      .addDropdown(dd => {
        dd.addOption("", "Theme default");
        CATPPUCCIN_COLOURS.forEach(name =>
          dd.addOption(name, name.charAt(0).toUpperCase() + name.slice(1)));
        dd.setValue((s as unknown as Record<string, string>)[row.key] ?? "");
        dd.onChange(async v => {
          (s as unknown as Record<string, string>)[row.key] = v;
          await onChange();
        });
      });
  });
}

/** Scaffolded section — placeholder until its AnuPpuccin port wave
 *  lands. Section title + quip sit outside, same Callouts pattern;
 *  the accordion inside carries a generic "Not yet wired" subtitle. */
function renderPlaceholder(
  pane: HTMLElement,
  key: string,
  title: string,
  quip: string,
  hint: string,
  accordionStyle: string,
): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: title });
  pane.createEl("p", { cls: "tc-leftrail-secdesc", text: quip });
  const card = buildPrettyAccordion(pane, key, "Not yet wired", true, accordionStyle);
  card.createEl("p", { cls: "tc-empty-hint", text: hint });
}

export function build(
  containerEl: HTMLElement,
  plugin: TegenlichtControlsPlugin,
  onChange: () => Promise<void>,
  redisplay?: () => void,
): () => void {
  const s = plugin.settings;

  /** Change handlers that need the tab re-rendered (to refresh preset
   *  pills, descriptions, show/hide rows) use refresh(); pure value
   *  changes use onChange() directly so sliders don't flash-rebuild. */
  const refresh = async () => {
    await onChange();
    redisplay?.();
  };

  // Left-rail shell wraps the controls; preview lives outside the
  // shell so it stays visible across section switches. The top
  // accent divider bar was retired per user directive — the rail
  // already frames the Typography tab; no extra chrome needed.
  const wrap = containerEl.createDiv("tc-typo-wrap");

  const sections: LeftRailSection[] = [
    { id: "fonts",    label: "Fonts",           count: 4,
      render: pane => renderFonts(pane, s, onChange, refresh) },
    { id: "rhythm",   label: "Rhythm",          count: 8,
      render: pane => renderRhythm(pane, s, onChange) },
    // Placeholder sections — content lands with the AnuPpuccin port
    // waves. Rail structure fixed now so future fills don't reshape
    // the tab.
    { id: "headings", label: "Headings",        count: 16,
      render: pane => renderHeadings(pane, s, onChange) },
    { id: "weight",   label: "Weight & leading", count: 0,
      render: pane => renderPlaceholder(pane, "typo-weight", "Weight & leading",
        "Per-heading font / weight / line-height plus global font weights.",
        "Lands with Wave 4 — per-H font / weight / line-height plus global weight vars.",
        s.accordionStyle) },
    { id: "accents",  label: "Accents",         count: 3,
      render: pane => renderAccents(pane, s, onChange) },
  ];

  const shellCleanup = buildLeftRailShell(wrap, sections, "typography");

  // Dynamic preview now lives INSIDE each rail section (Fonts,
  // Rhythm) via buildSectionPreview — same Callouts-style PREVIEW
  // strip with a chevron toggle. The always-visible preview that
  // used to sit below the rail has been retired since every
  // relevant section now has its own contextual preview.

  return shellCleanup;
}

import { Setting, SliderComponent, setIcon } from "obsidian";
import TegenlichtControlsPlugin from "../main";
import { DEFAULT_SETTINGS, TegenlichtSettings } from "../settings";
import { buildFontCombobox } from "../font-combobox";
import { buildTypographyPreview } from "../preview-sample";

// ── Module-level accordion state — survives redisplay() like Appearance does,
// so flipping a font or dragging a slider doesn't snap sections shut.
// The `rhythm` accordion merges heading sizes and list spacing; they're the
// same visual concept (vertical rhythm) separated by a hairline divider.
// Default: only the top accordion (`fonts`) is open on first load.
const accordionOpen: Record<string, boolean> = {
  fonts: true, rhythm: false,
};

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

/** Build a collapsible accordion matching the Appearance tab's shell. */
function buildAccordion(
  container: HTMLElement,
  key: keyof typeof accordionOpen,
  title: string,
): HTMLElement {
  const accordion = container.createDiv(
    "tc-feat-group" + (accordionOpen[key] ? " tc-feat-group--open" : "")
  );
  const header = accordion.createDiv("tc-feat-header");
  header.createDiv("tc-feat-title").createSpan({ text: title });
  header.createDiv("tc-feat-meta").createSpan({ text: "▶", cls: "tc-feat-chevron" });
  header.addEventListener("click", () => {
    accordionOpen[key] = !accordionOpen[key];
    accordion.toggleClass("tc-feat-group--open", accordionOpen[key]);
  });
  return accordion.createDiv("tc-feat-body tc-setting-card");
}

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

export function build(
  containerEl: HTMLElement,
  plugin: TegenlichtControlsPlugin,
  onChange: () => Promise<void>,
  redisplay?: () => void,
): void {
  const s = plugin.settings;

  /** Change handlers that need the tab re-rendered (to refresh preset
   *  pills, descriptions, show/hide rows) use refresh(); pure value
   *  changes use onChange() directly so sliders don't flash-rebuild. */
  const refresh = async () => {
    await onChange();
    redisplay?.();
  };

  // ── Accent-coloured divider bar (matches Appearance tab's top bar,
  //    but solid accent instead of the rainbow gradient) ──────────────
  containerEl.createDiv("tc-color-bar tc-color-bar--accent");

  const wrap = containerEl.createDiv("tc-typo-wrap");

  // ── Controls (top, as accordion stack) ────────────────────────────
  const controls = wrap.createDiv("tc-typo-controls");

  // ── Fonts accordion ───────────────────────────────────────────────
  // Experiment (2026-04-17 v2): the accordion itself picks up the
  // pretty-cluster paint (linear-gradient accent bg, accent border,
  // soft drop shadow) via the `tc-feat-group--pretty` modifier class.
  // No inner `.tc-cluster` wrap — the accordion container IS the
  // cluster visually. Row layout / spacing inside stays identical.
  const fontsBody = buildAccordion(controls, "fonts", "Fonts");
  fontsBody.parentElement?.addClass("tc-feat-group--pretty");

  // Google Fonts master toggle — native Setting row for consistency.
  // Toggling requires a redisplay so the font-role pills update their
  // preset list (empty list when Google Fonts are disabled).
  new Setting(fontsBody)
    .setName("Load Google Fonts")
    .setDesc(
      s.googleFontsEnabled !== false
        ? "Fetches family files from fonts.google.com on pick"
        : "System fonts only — no network requests"
    )
    .addToggle(t => t
      .setValue(s.googleFontsEnabled !== false)
      .onChange(async v => {
        s.googleFontsEnabled = v;
        await refresh();
      })
    );

  const gfOn = s.googleFontsEnabled !== false;

  buildFontRoleSetting(
    fontsBody,
    "Interface",
    "Sidebar, tabs, ribbon — the UI chrome",
    gfOn,
    s.fontInterface ?? "",
    DEFAULT_SETTINGS.fontInterface,
    async v => { s.fontInterface = v; await onChange(); },
  );
  buildFontRoleSetting(
    fontsBody,
    "Editor",
    "Body text and rendered headings in the document",
    gfOn,
    s.fontEditor ?? "",
    DEFAULT_SETTINGS.fontEditor,
    async v => { s.fontEditor = v; await onChange(); },
  );
  buildFontRoleSetting(
    fontsBody,
    "Source",
    "Code blocks and source-mode editor",
    gfOn,
    s.fontSource ?? "",
    DEFAULT_SETTINGS.fontSource,
    async v => { s.fontSource = v; await onChange(); },
  );

  // ── Rhythm accordion — merged Heading sizes + List spacing ───────
  // Same conceptual family (vertical rhythm of the document), separated
  // by a single hairline so the two groups are still legible at a glance.
  const rhythmBody = buildAccordion(controls, "rhythm", "Rhythm");
  rhythmBody.addClass("tc-h-accordion-body");

  const headingGroup = rhythmBody.createDiv("tc-h-group");
  HEADING_SLIDERS.forEach(cfg => {
    buildSliderRow(
      headingGroup, cfg, s[cfg.key] as number,
      async (v) => { (s as unknown as Record<string, unknown>)[cfg.key as string] = v; await onChange(); },
      async () => { (s as unknown as Record<string, unknown>)[cfg.key as string] = DEFAULT_SETTINGS[cfg.key]; await onChange(); },
    );
  });

  // Hairline divider + subtle section label between headings and spacing
  rhythmBody.createDiv("tc-rhythm-divider");

  const spacingGroup = rhythmBody.createDiv("tc-h-group");
  SPACING_SLIDERS.forEach(cfg => {
    buildSliderRow(
      spacingGroup, cfg, s[cfg.key] as number,
      async (v) => { (s as unknown as Record<string, unknown>)[cfg.key as string] = v; await onChange(); },
      async () => { (s as unknown as Record<string, unknown>)[cfg.key as string] = DEFAULT_SETTINGS[cfg.key]; await onChange(); },
    );
  });

  // ── Dynamic Preview header + preview (bottom, full width) ────────
  // Canonical Lorem-Ipsum preview lives in preview-sample.ts so other
  // surfaces of the plugin (Flavour switcher, onboarding, theme compare)
  // can reuse the same content without drift.
  const previewHeader = wrap.createDiv("tc-typo-preview-header");
  previewHeader.createSpan({ text: "Dynamic Preview", cls: "tc-typo-preview-title" });
  previewHeader.createSpan({ text: "Live Obsidian mock — reads your sliders as you drag", cls: "tc-typo-preview-desc" });

  buildTypographyPreview(wrap);
}

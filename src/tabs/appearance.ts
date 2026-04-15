import { Setting } from "obsidian";
import Pickr from "@simonwep/pickr";
import TegenlichtControlsPlugin from "../main";
import {
  FlavourEntry,
  DARK_BASE, DARK_EXTENDED, DARK_EXTENDED_TC, DARK_EXTENDED_ANP,
  LIGHT_BASE, LIGHT_EXTENDED, LIGHT_EXTENDED_TC, LIGHT_EXTENDED_ANP,
} from "../flavours";
import { buildSegmentSetting } from "./_shared";

// Session-scoped accordion state — survives redisplay() rebuilds so the
// user's open/closed choice isn't lost every time a setting is changed.
// Default: only the top accordion (`theme`) is open. Tom can expand the
// rest as needed; we don't want a wall of expanded sections on first load.
const accordionOpen: Record<string, boolean> = {
  theme: true, interface: false, sidebarOutliner: false, graph: false,
  workspace: false, highlights: false,
};

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

/** Segment pill-select + a three-dot auto/accent/custom colour trio on
 *  the same row. Mirrors the Accent-colour row's semantic:
 *    - "auto"   → empty string (theme's own default paints the element)
 *    - "accent" → track --color-accent live
 *    - custom   → free-form hex via Pickr
 *
 *  Used for "Icon intensity" and "Border intensity" so both gain the
 *  same picker without duplicated boilerplate. */
function buildSegmentWithColor(
  container: HTMLElement,
  name: string,
  desc: string,
  options: { label: string; value: string }[],
  currentSegment: string,
  onSegmentChange: (value: string) => Promise<void>,
  colour: {
    getValue: () => string;                // '' | 'accent' | '#rrggbb'
    setValue: (v: string) => void;
    onChange: () => Promise<void>;
  },
): Pickr {
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

  // Three-dot trio — auto / accent / custom. Same classes as the Accent
  // row so the dot styling (conic gradient for auto, etc.) reuses.
  const autoItem = wrap.createDiv("tc-accent-item tc-accent-item--auto");
  const autoDot = autoItem.createDiv("tc-accent-dot tc-accent-dot--auto");
  autoDot.setAttribute("title", "Auto — use theme default");
  autoItem.createSpan({ text: "auto", cls: "tc-accent-caption" });

  const accentItem = wrap.createDiv("tc-accent-item tc-accent-item--accent");
  const accentDot = accentItem.createDiv("tc-accent-dot tc-accent-dot--accent-track");
  accentDot.style.background = "var(--color-accent)";
  accentDot.setAttribute("title", "Accent — track the active accent colour");
  accentItem.createSpan({ text: "accent", cls: "tc-accent-caption" });

  const customItem = wrap.createDiv("tc-accent-item tc-accent-item--custom");
  const customDot = customItem.createDiv("tc-accent-dot tc-accent-dot--custom");
  customItem.createSpan({ text: "cust.", cls: "tc-accent-caption" });

  const setActiveDot = (which: 'auto' | 'accent' | 'custom') => {
    [autoDot, accentDot, customDot].forEach(d => d.removeClass('tc-accent-dot--active'));
    ({ auto: autoDot, accent: accentDot, custom: customDot })[which]
      .addClass('tc-accent-dot--active');
  };

  // Seed active state based on current stored value.
  const initial = colour.getValue();
  const isHex = initial && initial !== 'accent' && /^#[0-9a-fA-F]{6}$/.test(initial);
  if (!initial)              setActiveDot('auto');
  else if (initial === 'accent') setActiveDot('accent');
  else if (isHex) {
    customDot.style.background = initial;
    setActiveDot('custom');
  }

  autoDot.addEventListener('click', async () => {
    colour.setValue('');
    customDot.style.background = '';
    setActiveDot('auto');
    await colour.onChange();
  });
  accentDot.addEventListener('click', async () => {
    colour.setValue('accent');
    customDot.style.background = '';
    setActiveDot('accent');
    await colour.onChange();
  });

  // Pickr — anchored on the custom dot, opens only when that dot is
  // clicked. Clearing from within Pickr flips back to 'auto'.
  const pickr = Pickr.create({
    el: customDot,
    container: container.closest('.modal-content') as HTMLElement ?? document.body,
    theme: 'nano',
    default: isHex ? initial : '#e5b32a',
    useAsButton: true,
    lockOpacity: true,
    position: 'bottom-start',
    components: {
      preview: true,
      hue: true,
      opacity: false,
      interaction: { hex: true, input: true, clear: true, save: true, cancel: true },
    },
  });
  const commitHex = (hex: string) => {
    colour.setValue(hex);
    customDot.style.background = hex;
    setActiveDot('custom');
    colour.onChange();
  };
  pickr.on('change', (c: Pickr.HSVaColor | null) => {
    if (c) commitHex(c.toHEXA().toString().slice(0, 7));
  });
  pickr.on('save', (c: Pickr.HSVaColor | null, instance: Pickr) => {
    if (c) commitHex(c.toHEXA().toString().slice(0, 7));
    instance.hide();
  });
  pickr.on('clear', (instance: Pickr) => {
    colour.setValue('');
    customDot.style.background = '';
    setActiveDot('auto');
    colour.onChange();
    instance.hide();
  });
  pickr.on('cancel', (instance: Pickr) => instance.hide());
  return pickr;
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

  // ── Colour bar ─────────────────────────────────────────
  containerEl.createDiv("tc-color-bar");

  // ── Theme & Colour accordion ───────────────────────────
  const themeAccordion = containerEl.createDiv(
    "tc-feat-group" + (accordionOpen.theme ? " tc-feat-group--open" : "")
  );
  const themeHeader = themeAccordion.createDiv("tc-feat-header");
  const themeTitle  = themeHeader.createDiv("tc-feat-title");
  themeTitle.createSpan({ text: "Theme & Colour" });
  const themeMeta = themeHeader.createDiv("tc-feat-meta");
  themeMeta.createSpan({ text: "▶", cls: "tc-feat-chevron" });
  themeHeader.addEventListener("click", () => {
    accordionOpen.theme = !accordionOpen.theme;
    themeAccordion.toggleClass("tc-feat-group--open", accordionOpen.theme);
  });
  const themeBody = themeAccordion.createDiv("tc-feat-body tc-setting-card tc-theme-body");

  // ── Accent Colour — native Setting row, pips in the control slot ──
  const accentSetting = new Setting(themeBody)
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

  const darkSetting = new Setting(themeBody)
    .setName("Dark flavour")
    .setDesc("Applied when Obsidian is in dark mode");
  const darkInlineWrap = darkSetting.controlEl.createDiv("tc-swatch-grid-inline");
  buildSwatchGrid(darkInlineWrap, DARK_BASE, s.darkFlavour, cls => pickFlavour('dark', cls));
  appendPlusSwatch(darkInlineWrap, s.showExtendedDark, async () => {
    s.showExtendedDark = !s.showExtendedDark;
    await refresh();
  });
  if (s.showExtendedDark) {
    const darkExtWrap = themeBody.createDiv("tc-swatch-grid-wrap tc-swatch-grouped");
    darkExtWrap.createSpan({ text: "Tegenlicht", cls: "tc-swatch-group-label" });
    buildSwatchGrid(darkExtWrap, DARK_EXTENDED_TC, s.darkFlavour, cls => pickFlavour('dark', cls));
    darkExtWrap.createSpan({ text: "AnuPuccin", cls: "tc-swatch-group-label" });
    buildSwatchGrid(darkExtWrap, DARK_EXTENDED_ANP, s.darkFlavour, cls => pickFlavour('dark', cls));
  }

  // ── Light Flavours ─────────────────────────────────────
  const lightSetting = new Setting(themeBody)
    .setName("Light flavour")
    .setDesc("Applied when Obsidian is in light mode");
  const lightInlineWrap = lightSetting.controlEl.createDiv("tc-swatch-grid-inline");
  buildSwatchGrid(lightInlineWrap, LIGHT_BASE, s.lightFlavour, cls => pickFlavour('light', cls));
  appendPlusSwatch(lightInlineWrap, s.showExtendedLight, async () => {
    s.showExtendedLight = !s.showExtendedLight;
    await refresh();
  });
  if (s.showExtendedLight) {
    const lightExtWrap = themeBody.createDiv("tc-swatch-grid-wrap tc-swatch-grouped");
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

  new Setting(themeBody)
    .setName("Background Grain")
    .setDesc("Film-grain texture overlaid on the workspace")
    .addSlider(sl => sl
      .setLimits(0, 100, 1)
      .setValue(s.noiseAmount ?? 0)
      .setDynamicTooltip()
      .onChange(async v => { s.noiseAmount = v; await onChange(); })
    );

  // ── Interface accordion ────────────────────────────────
  const ifaceAccordion = containerEl.createDiv(
    "tc-feat-group" + (accordionOpen.interface ? " tc-feat-group--open" : "")
  );
  const ifaceHeader = ifaceAccordion.createDiv("tc-feat-header");
  const ifaceTitle  = ifaceHeader.createDiv("tc-feat-title");
  ifaceTitle.createSpan({ text: "Interface" });
  const ifaceMeta = ifaceHeader.createDiv("tc-feat-meta");
  ifaceMeta.createSpan({ text: "▶", cls: "tc-feat-chevron" });
  ifaceHeader.addEventListener("click", () => {
    accordionOpen.interface = !accordionOpen.interface;
    ifaceAccordion.toggleClass("tc-feat-group--open", accordionOpen.interface);
  });
  const interfaceCard = ifaceAccordion.createDiv("tc-feat-body tc-setting-card");

  buildSegmentSetting(interfaceCard,
    "UI density", "Spacing across nav, tabs, ribbon, and header",
    [
      { label: "Compact",     value: "compact" },
      { label: "Comfortable", value: "comfortable" },
      { label: "Spacious",    value: "spacious" },
    ],
    s.uiDensity,
    async v => { s.uiDensity = v; await refresh(); },
  );

  // Icon intensity — pill weight + auto/accent/custom tint trio.
  // Colour writes to `iconColour`, applier turns it into `--tc-icon-color`.
  // Flavour switching resets iconColour to '' (auto) so each theme starts
  // at its natural Lucide colour.
  pickrs.push(buildSegmentWithColor(
    interfaceCard,
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
  ));

  buildSegmentSetting(interfaceCard,
    "Corner radius", "Roundness of buttons, cards, and inputs",
    [
      { label: "Sharp",   value: "sharp" },
      { label: "Subtle",  value: "subtle" },
      { label: "Rounded", value: "rounded" },
    ],
    s.cornerRadius,
    async v => { s.cornerRadius = v; await refresh(); },
  );

  // Border intensity — strength pills + auto/accent/custom tint trio.
  // Colour writes to `borderColour`, applier turns it into `--tc-border-color`.
  // Same theme-reset semantic as iconColour — picking a flavour restores
  // that flavour's native border colour.
  pickrs.push(buildSegmentWithColor(
    interfaceCard,
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
  ));

  // ── Outliner accordion — file tree / nav-files pane settings ─────
  // Ports the file-browser knobs from AnuPuccin (rainbow folders, file
  // type icons, collapse arrows, custom vault title) into one home so
  // the "left sidebar look" lives in one accordion.
  const outlinerAccordion = containerEl.createDiv(
    "tc-feat-group" + (accordionOpen.sidebarOutliner ? " tc-feat-group--open" : "")
  );
  const outlinerHeader = outlinerAccordion.createDiv("tc-feat-header");
  const outlinerTitle  = outlinerHeader.createDiv("tc-feat-title");
  outlinerTitle.createSpan({ text: "Outliner" });
  const outlinerMeta = outlinerHeader.createDiv("tc-feat-meta");
  outlinerMeta.createSpan({ text: "▶", cls: "tc-feat-chevron" });
  outlinerHeader.addEventListener("click", () => {
    accordionOpen.sidebarOutliner = !accordionOpen.sidebarOutliner;
    outlinerAccordion.toggleClass("tc-feat-group--open", accordionOpen.sidebarOutliner);
  });
  const outlinerBody = outlinerAccordion.createDiv("tc-feat-body tc-setting-card");

  // Rainbow folders — three modes mirroring AnuPuccin's Style Settings
  // dropdown (and its `anp-alt-rainbow-style` class-select):
  //   Off    — no colouring (native Obsidian look)
  //   Full   — folder background tinted with its rotating hue
  //   Simple — title + indent + file-icon take the hue (no bg fill)
  // Each maps to one of AnuPuccin's rainbow-color-toggle body classes.
  // `rainbowInherit` below is the orthogonal "subfolders inherit parent"
  // modifier — applies on top of either Full or Simple.
  // Sub-toggle blocks (`fullDetails`, `simpleDetails`) are built up-front
  // and shown/hidden based on the current mode — captured in closure so
  // the segment's onChange can flip their display without a redisplay.
  let fullDetails: HTMLElement;
  let simpleDetails: HTMLElement;
  const computedMode = (() => {
    if ((s.rainbowStyle ?? 'off') === 'off' && s.rainbowFileBrowser) return 'full';
    const v = s.rainbowStyle ?? 'off';
    if (v === 'dot' || v === 'icon') return 'simple';
    return v;
  })();

  buildSegmentSetting(outlinerBody,
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
      fullDetails.style.display   = v === 'full'   ? '' : 'none';
      simpleDetails.style.display = v === 'simple' ? '' : 'none';
      await onChange();
    },
  );

  new Setting(outlinerBody)
    .setName("Subfolders inherit colour")
    .setDesc("Child folders pick up their parent's hue instead of rolling through the rainbow themselves")
    .addToggle(t => t
      .setValue(s.rainbowInherit)
      .onChange(async v => { s.rainbowInherit = v; await onChange(); })
    );

  // ── Simple mode details ───────────────────────────────
  simpleDetails = outlinerBody.createDiv("tc-rainbow-mode-details");
  simpleDetails.style.display = computedMode === 'simple' ? '' : 'none';
  buildDivider(simpleDetails);
  simpleDetails.createEl("div", { cls: "tc-theme-label", text: "Simple mode" });

  new Setting(simpleDetails)
    .setName("Recolour folder titles")
    .setDesc("Folder name text takes the rotating hue")
    .addToggle(t => t
      .setValue(s.rainbowSimpleTitle)
      .onChange(async v => { s.rainbowSimpleTitle = v; await onChange(); })
    );

  new Setting(simpleDetails)
    .setName("Recolour collapse arrows")
    .setDesc("The chevron / disclosure triangle takes the folder's hue")
    .addToggle(t => t
      .setValue(s.rainbowSimpleCollapseIcon)
      .onChange(async v => { s.rainbowSimpleCollapseIcon = v; await onChange(); })
    );

  new Setting(simpleDetails)
    .setName("Recolour indent guides")
    .setDesc("Vertical indent lines under each folder take the hue")
    .addToggle(t => t
      .setValue(s.rainbowSimpleIndent)
      .onChange(async v => { s.rainbowSimpleIndent = v; await onChange(); })
    );

  new Setting(simpleDetails)
    .setName("Show file dot")
    .setDesc("Add a small coloured circle next to each file in a coloured folder")
    .addToggle(t => t
      .setValue(s.rainbowSimpleFileIcon)
      .onChange(async v => { s.rainbowSimpleFileIcon = v; await onChange(); })
    );

  // ── Full mode details ─────────────────────────────────
  fullDetails = outlinerBody.createDiv("tc-rainbow-mode-details");
  fullDetails.style.display = computedMode === 'full' ? '' : 'none';
  buildDivider(fullDetails);
  fullDetails.createEl("div", { cls: "tc-theme-label", text: "Full mode" });

  new Setting(fullDetails)
    .setName("Recolour files")
    .setDesc("Tint files inside coloured folders to match their parent's hue")
    .addToggle(t => t
      .setValue(s.rainbowFullFileRecolor)
      .onChange(async v => { s.rainbowFullFileRecolor = v; await onChange(); })
    );

  new Setting(fullDetails)
    .setName("Invert title text — light mode")
    .setDesc("Use the regular text colour for folder titles in light themes (better contrast)")
    .addToggle(t => t
      .setValue(s.rainbowFullInvertLight)
      .onChange(async v => { s.rainbowFullInvertLight = v; await onChange(); })
    );

  new Setting(fullDetails)
    .setName("Invert title text — dark mode")
    .setDesc("Use the regular text colour for folder titles in dark themes (better contrast)")
    .addToggle(t => t
      .setValue(s.rainbowFullInvertDark)
      .onChange(async v => { s.rainbowFullInvertDark = v; await onChange(); })
    );

  new Setting(fullDetails)
    .setName("Folder background opacity")
    .setDesc("How much of the folder's hue shows through (0 = transparent, 100 = solid)")
    .addSlider(sl => sl
      .setLimits(0, 100, 1)
      .setValue(s.rainbowFullBgOpacity ?? 70)
      .setDynamicTooltip()
      .onChange(async v => { s.rainbowFullBgOpacity = v; await onChange(); })
    );

  new Setting(outlinerBody)
    .setName("File type icons")
    .setDesc("Show a glyph next to each file in the tree based on its extension")
    .addToggle(t => t
      .setValue(s.fileIcons)
      .onChange(async v => { s.fileIcons = v; await onChange(); })
    );

  new Setting(outlinerBody)
    .setName("Collapsed folder arrows")
    .setDesc("Use the theme's compact chevron for collapsed folders (less chrome)")
    .addToggle(t => t
      .setValue(s.collapseFolderIcons)
      .onChange(async v => { s.collapseFolderIcons = v; await onChange(); })
    );

  new Setting(outlinerBody)
    .setName("Custom vault title")
    .setDesc("Style the vault root entry — larger and set apart from the file tree")
    .addToggle(t => t
      .setValue(s.customVaultTitle)
      .onChange(async v => { s.customVaultTitle = v; await onChange(); })
    );

  new Setting(outlinerBody)
    .setName("Colourful window frame")
    .setDesc("Tint Obsidian's window frame with the active flavour's accent")
    .addToggle(t => t
      .setValue(s.colorfulFrame)
      .onChange(async v => { s.colorfulFrame = v; await onChange(); })
    );

  // ── Graph accordion (placeholder shell) ────────────────
  const graphAccordion = containerEl.createDiv(
    "tc-feat-group" + (accordionOpen.graph ? " tc-feat-group--open" : "")
  );
  const graphHeader = graphAccordion.createDiv("tc-feat-header");
  const graphTitle  = graphHeader.createDiv("tc-feat-title");
  graphTitle.createSpan({ text: "Graph" });
  const graphMeta = graphHeader.createDiv("tc-feat-meta");
  graphMeta.createSpan({ text: "▶", cls: "tc-feat-chevron" });
  graphHeader.addEventListener("click", () => {
    accordionOpen.graph = !accordionOpen.graph;
    graphAccordion.toggleClass("tc-feat-group--open", accordionOpen.graph);
  });
  const graphBody = graphAccordion.createDiv("tc-feat-body tc-setting-card");
  graphBody.createEl("p", { cls: "tc-empty-hint",
    text: "Graph-view controls arrive here — node size, link thickness, hover halo, cluster tinting." });

  // ── Workspace accordion ────────────────────────────────
  const wsAccordion = containerEl.createDiv(
    "tc-feat-group" + (accordionOpen.workspace ? " tc-feat-group--open" : "")
  );
  const wsHeader = wsAccordion.createDiv("tc-feat-header");
  const wsTitle  = wsHeader.createDiv("tc-feat-title");
  wsTitle.createSpan({ text: "Workspace" });
  const wsMeta = wsHeader.createDiv("tc-feat-meta");
  wsMeta.createSpan({ text: "▶", cls: "tc-feat-chevron" });
  wsHeader.addEventListener("click", () => {
    accordionOpen.workspace = !accordionOpen.workspace;
    wsAccordion.toggleClass("tc-feat-group--open", accordionOpen.workspace);
  });
  const workspaceCard = wsAccordion.createDiv("tc-feat-body tc-setting-card");

  buildDropdownSetting(workspaceCard,
    "Sidebar style", "Visual treatment of the left and right sidebars",
    [{ label: "Flat", value: "flat" }, { label: "Bordered", value: "bordered" }, { label: "Cards", value: "cards" }],
    s.sidebarStyle,
    async v => { s.sidebarStyle = v; await refresh(); },
  );

  let frostSetting: Setting | null = null;
  buildDropdownSetting(workspaceCard,
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
  frostSetting = new Setting(workspaceCard)
    .setName("Frost depth")
    .setDesc("Intensity of the frosted glass blur effect");
  frostSetting.settingEl.style.display = s.backgroundStyle === "frosted" ? "" : "none";
  frostSetting.addSlider(sl => sl
    .setLimits(0, 100, 1)
    .setValue(s.frostDepth)
    .setDynamicTooltip()
    .onChange(async v => { s.frostDepth = v; await refresh(); })
  );

  // ── Highlights & Tints accordion ──────────────────────
  const hlAccordion = containerEl.createDiv(
    "tc-feat-group" + (accordionOpen.highlights ? " tc-feat-group--open" : "")
  );
  const hlHeader = hlAccordion.createDiv("tc-feat-header");
  const hlTitle  = hlHeader.createDiv("tc-feat-title");
  hlTitle.createSpan({ text: "Highlights & Tints" });
  const hlMeta = hlHeader.createDiv("tc-feat-meta");
  hlMeta.createSpan({ text: "▶", cls: "tc-feat-chevron" });
  hlHeader.addEventListener("click", () => {
    accordionOpen.highlights = !accordionOpen.highlights;
    hlAccordion.toggleClass("tc-feat-group--open", accordionOpen.highlights);
  });
  const highlightsCard = hlAccordion.createDiv("tc-feat-body tc-setting-card");

  pickrs.push(buildColorToggleRow(highlightsCard,
    "Active line", "Highlight the current cursor line in the editor",
    () => s.activeLineColour,
    v => { s.activeLineColour = v; },
    () => s.activeLineHighlight,
    v => { s.activeLineHighlight = v; },
    refresh,
  ));

  pickrs.push(buildColorToggleRow(highlightsCard,
    "Selection tint", "Colour overlay applied to selected text",
    () => s.selectionTintColour,
    v => { s.selectionTintColour = v; },
    () => s.selectionTint,
    v => { s.selectionTint = v; },
    refresh,
  ));

  pickrs.push(buildColorToggleRow(highlightsCard,
    "Caret colour", "Colour of the text insertion cursor",
    () => s.caretColour,
    v => { s.caretColour = v; },
    () => s.caretColourEnabled,
    v => { s.caretColourEnabled = v; },
    refresh,
  ));

  return () => pickrs.forEach(p => { try { p.destroyAndRemove(); } catch(_) {} });
}

import TegenlichtControlsPlugin from "../main";
import { TegenlichtSettings } from "../settings";

interface LayoutCfg {
  key: keyof TegenlichtSettings;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  defaultVal: number;
}

const READING_VIEW: LayoutCfg[] = [
  { key: "fileLineWidth",   label: "Line width",    min: 400, max: 1200, step: 10, unit: "px", defaultVal: 700 },
  { key: "fileMargins",     label: "Margins",       min: 0,   max: 120,  step: 1,  unit: "px", defaultVal: 40  },
  { key: "previewWidthPct", label: "Preview width", min: 40,  max: 100,  step: 1,  unit: "%",  defaultVal: 88  },
  // AnuPpuccin's --embed-max-height: caps the height of embedded
  // notes / transclusions so long embeds don't blow up the layout.
  { key: "embedMaxHeight",  label: "Embed max height", min: 120, max: 1200, step: 10, unit: "px", defaultVal: 200 },
];

const CARDS_BORDERS: LayoutCfg[] = [
  { key: "cardRadius",    label: "Card radius",    min: 0, max: 24, step: 1, unit: "px", defaultVal: 8 },
  { key: "borderRadius",  label: "Border radius",  min: 0, max: 20, step: 1, unit: "px", defaultVal: 6 },
  { key: "borderPadding", label: "Border padding", min: 0, max: 20, step: 1, unit: "px", defaultVal: 4 },
  // Wave 6 — colorful frame opacity. Unit is the fractional 0–1 range
  // AnuPpuccin's var expects; slider uses the same range.
  { key: "colorfulFrameOpacity", label: "Colorful frame opacity", min: 0, max: 1, step: 0.05, unit: "", defaultVal: 1.0 },
  // Wave 6.5 — card layout + stacked tab micros. Only effective when
  // the relevant sidebarStyle / tab setting is active.
  { key: "cardLayoutPadding",     label: "Card padding",         min: 0, max: 32, step: 1,    unit: "px", defaultVal: 10 },
  { key: "cardHeaderLeftPadding", label: "Card header padding",  min: 0, max: 40, step: 1,    unit: "px", defaultVal: 20 },
  { key: "stackedHeaderWidth",    label: "Stacked tab header",   min: 20, max: 120, step: 1,  unit: "px", defaultVal: 40 },
  { key: "tabStackedPaneWidth",   label: "Stacked pane multiplier", min: 0.5, max: 3, step: 0.1, unit: "×",  defaultVal: 1 },
];

const TABLES: LayoutCfg[] = [
  { key: "tableWidthPct", label: "Table width", min: 40, max: 100, step: 1, unit: "%", defaultVal: 100 },
];

function buildGroup(
  container: HTMLElement,
  title: string,
  sliders: LayoutCfg[],
  plugin: TegenlichtControlsPlugin,
  onChange: () => Promise<void>,
): void {
  const group = container.createDiv("tc-layout-group");
  group.createEl("h3", { text: title, cls: "tc-section-title" });

  sliders.forEach(cfg => {
    const row = group.createDiv("tc-slider-row");
    row.createSpan({ text: cfg.label, cls: "tc-slider-label" });

    const slider = row.createEl("input", { type: "range" });
    slider.min   = String(cfg.min);
    slider.max   = String(cfg.max);
    slider.step  = String(cfg.step);
    slider.value = String(plugin.settings[cfg.key] as number);

    const badge = row.createSpan({ cls: "tc-slider-value tc-slider-badge" });
    badge.setText(`${plugin.settings[cfg.key]}${cfg.unit}`);

    slider.addEventListener("input", async () => {
      const v = parseFloat(slider.value);
      (plugin.settings as unknown as Record<string, unknown>)[cfg.key as string] = v;
      badge.setText(`${v}${cfg.unit}`);
      await onChange();
    });

    const resetBtn = row.createEl("button", { text: "↺", cls: "tc-reset-btn" });
    resetBtn.addEventListener("click", async () => {
      (plugin.settings as unknown as Record<string, unknown>)[cfg.key as string] = cfg.defaultVal;
      slider.value = String(cfg.defaultVal);
      badge.setText(`${cfg.defaultVal}${cfg.unit}`);
      await onChange();
    });
  });
}

export function build(
  containerEl: HTMLElement,
  plugin: TegenlichtControlsPlugin,
  onChange: () => Promise<void>,
): void {
  buildGroup(containerEl, "Reading View",    READING_VIEW,  plugin, onChange);
  buildGroup(containerEl, "Cards & Borders", CARDS_BORDERS, plugin, onChange);
  buildGroup(containerEl, "Tables",          TABLES,        plugin, onChange);
}

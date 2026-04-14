import TegenlichtControlsPlugin from "../main";
import { DEFAULT_SETTINGS, TegenlichtSettings } from "../settings";

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

function buildSliderRow(
  container: HTMLElement,
  cfg: SliderCfg,
  currentVal: number,
  onChange: (val: number) => void,
  onReset: () => void,
): void {
  const row = container.createDiv("tc-slider-row");
  row.createSpan({ text: cfg.label, cls: "tc-slider-label" });

  const slider = row.createEl("input", { type: "range" });
  slider.min   = String(cfg.min);
  slider.max   = String(cfg.max);
  slider.step  = String(cfg.step);
  slider.value = String(currentVal);

  const badge = row.createSpan({ cls: "tc-slider-value" });
  badge.setText(`${currentVal}${cfg.unit}`);

  slider.addEventListener("input", () => {
    const v = parseFloat(slider.value);
    badge.setText(`${v}${cfg.unit}`);
    onChange(v);
  });

  const resetBtn = row.createEl("button", { text: "↺", cls: "tc-reset-btn" });
  resetBtn.setAttribute("title", "Reset to default");
  resetBtn.addEventListener("click", () => {
    const def = DEFAULT_SETTINGS[cfg.key] as number;
    slider.value = String(def);
    badge.setText(`${def}${cfg.unit}`);
    onReset();
  });
}

export function build(
  containerEl: HTMLElement,
  plugin: TegenlichtControlsPlugin,
  onChange: () => Promise<void>,
): void {
  const s = plugin.settings;
  const wrap = containerEl.createDiv("tc-typo-wrap");
  const controls = wrap.createDiv("tc-typo-controls");

  // Preview panel (right column)
  const preview = wrap.createDiv("tc-typo-preview");
  preview.innerHTML = `
    <h1>Heading 1</h1>
    <h2>Heading 2</h2>
    <h3>Heading 3</h3>
    <h4>Heading 4</h4>
    <h5>Heading 5</h5>
    <h6>Heading 6</h6>
    <p>Body text — the quick brown fox jumps over the lazy dog.</p>
    <ul><li>First item</li><li>Second item</li><li>Third item</li></ul>
    <p class="tc-preview-hint">Updates as you drag sliders</p>
  `;

  // Heading sliders
  controls.createEl("h3", { text: "Headings", cls: "tc-section-title" });
  HEADING_SLIDERS.forEach(cfg => {
    buildSliderRow(
      controls, cfg, s[cfg.key] as number,
      async (v) => { (s as unknown as Record<string, unknown>)[cfg.key as string] = v; await onChange(); },
      async () => { (s as unknown as Record<string, unknown>)[cfg.key as string] = DEFAULT_SETTINGS[cfg.key]; await onChange(); },
    );
  });

  // Spacing sliders
  controls.createEl("h3", { text: "Spacing", cls: "tc-section-title" });
  SPACING_SLIDERS.forEach(cfg => {
    buildSliderRow(
      controls, cfg, s[cfg.key] as number,
      async (v) => { (s as unknown as Record<string, unknown>)[cfg.key as string] = v; await onChange(); },
      async () => { (s as unknown as Record<string, unknown>)[cfg.key as string] = DEFAULT_SETTINGS[cfg.key]; await onChange(); },
    );
  });
}

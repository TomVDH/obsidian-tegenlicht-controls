import { Setting } from "obsidian";

/**
 * Segmented pill picker: label + desc on the left, pill group on the right.
 *
 * Preferred over dropdowns for small option sets (<=4) — visually clearer
 * and matches the plugin's pill/tab language. Shared between tabs so the
 * Appearance tab's swatch-group pills and the Editing tab's tag-style
 * picker render identically.
 */
export function buildSegmentSetting(
  container: HTMLElement,
  name: string,
  desc: string,
  options: { label: string; value: string }[],
  current: string,
  onChange: (value: string) => Promise<void>,
): void {
  const setting = new Setting(container).setName(name).setDesc(desc);
  const group = setting.controlEl.createDiv("tc-seg");
  const buttons = new Map<string, HTMLElement>();
  options.forEach(o => {
    const btn = group.createEl("button", { text: o.label, cls: "tc-seg-btn" });
    if (o.value === current) btn.addClass("tc-seg-btn--active");
    btn.addEventListener("click", async () => {
      if (btn.hasClass("tc-seg-btn--active")) return;
      buttons.forEach(b => b.removeClass("tc-seg-btn--active"));
      btn.addClass("tc-seg-btn--active");
      await onChange(o.value);
    });
    buttons.set(o.value, btn);
  });
}

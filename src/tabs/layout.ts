// src/tabs/layout.ts
import TegenlichtControlsPlugin from "../main";
export function build(
  containerEl: HTMLElement,
  plugin: TegenlichtControlsPlugin,
  onChange: () => Promise<void>
): void {
  containerEl.createEl("p", { text: "Layout — coming soon" });
}

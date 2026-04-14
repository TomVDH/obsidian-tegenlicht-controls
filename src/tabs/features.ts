// src/tabs/features.ts
import TegenlichtControlsPlugin from "../main";
export function build(
  containerEl: HTMLElement,
  plugin: TegenlichtControlsPlugin,
  onChange: () => Promise<void>
): void {
  containerEl.createEl("p", { text: "Features — coming soon" });
}

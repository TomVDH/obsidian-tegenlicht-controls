// src/tabs/typography.ts
import TegenlichtControlsPlugin from "../main";
export function build(
  containerEl: HTMLElement,
  plugin: TegenlichtControlsPlugin,
  onChange: () => Promise<void>
): void {
  containerEl.createEl("p", { text: "Typography — coming soon" });
}

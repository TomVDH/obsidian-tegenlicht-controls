import { Plugin } from "obsidian";
import { TegenlichtSettings, DEFAULT_SETTINGS } from "./settings";
import { apply, remove } from "./applier";
import { TegenlichtSettingsTab } from "./settings-tab";

export default class TegenlichtControlsPlugin extends Plugin {
  settings: TegenlichtSettings = { ...DEFAULT_SETTINGS };

  async onload(): Promise<void> {
    await this.loadSettings();
    apply(this.settings);
    this.addSettingTab(new TegenlichtSettingsTab(this.app, this));

    // Re-apply when Obsidian switches dark/light mode so the correct flavour class is active
    this.registerEvent(
      this.app.workspace.on('css-change', () => apply(this.settings))
    );
  }

  onunload(): void {
    remove();
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
    apply(this.settings);
  }
}

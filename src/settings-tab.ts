import { App, PluginSettingTab } from "obsidian";
import TegenlichtControlsPlugin from "./main";
import { build as buildAppearance } from "./tabs/appearance";
import { build as buildTypography } from "./tabs/typography";
import { build as buildLayout }     from "./tabs/layout";
import { build as buildFeatures }   from "./tabs/features";

type Tab = "appearance" | "typography" | "layout" | "features";

const TABS: { id: Tab; label: string }[] = [
  { id: "appearance", label: "Appearance" },
  { id: "typography", label: "Typography" },
  { id: "layout",     label: "Layout"     },
  { id: "features",   label: "Features"   },
];

export class TegenlichtSettingsTab extends PluginSettingTab {
  private activeTab: Tab = "appearance";

  constructor(app: App, public plugin: TegenlichtControlsPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass("tc-settings");

    // Tab bar
    const tabBar = containerEl.createDiv("tc-tab-bar");
    TABS.forEach(({ id, label }) => {
      const btn = tabBar.createEl("button", { text: label, cls: "tc-tab" });
      if (id === this.activeTab) btn.addClass("tc-tab--active");
      btn.addEventListener("click", () => {
        this.activeTab = id;
        this.display();
      });
    });

    // Tab content
    const content = containerEl.createDiv("tc-tab-content");
    const onChange = () => this.plugin.saveSettings();

    switch (this.activeTab) {
      case "appearance": buildAppearance(content, this.plugin, onChange); break;
      case "typography": buildTypography(content, this.plugin, onChange); break;
      case "layout":     buildLayout(content, this.plugin, onChange);     break;
      case "features":   buildFeatures(content, this.plugin, onChange);   break;
    }
  }
}

import { Setting } from "obsidian";
import TegenlichtControlsPlugin from "../main";
import { TegenlichtSettings } from "../settings";
import { buildLeftRailShell, LeftRailSection, buildSegmentSetting } from "./_shared";

/** Elements tab — named features and integrations. Left-rail layout
 *  matching Appearance / Typography / Legacy. One toggle does one
 *  thing per row. Each rail section holds a single topic.
 *
 *  Populated via Step 2 of docs/settings-reorg-plan.md. Content-complete
 *  (no further incoming migrations planned). */

function renderCards(pane: HTMLElement, s: TegenlichtSettings, onChange: () => Promise<void>): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Cards" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Card-style rendering for notes, actions, and the file browser. Requires the Cards sidebar / layout on the relevant surface." });

  new Setting(pane)
    .setName("Cards (minimal)")
    .setDesc("Card-style note previews")
    .addToggle(t => t.setValue(s.cardsMinimal).onChange(async v => { s.cardsMinimal = v; await onChange(); }));

  new Setting(pane)
    .setName("Card shadows")
    .setDesc("Drop shadow on card tiles (requires Cards layout)")
    .addToggle(t => t.setValue(s.cardShadows).onChange(async v => { s.cardShadows = v; await onChange(); }));

  new Setting(pane)
    .setName("Card format · actions")
    .setDesc("Render action rows as cards (requires Cards layout)")
    .addToggle(t => t.setValue(s.cardLayoutActions).onChange(async v => { s.cardLayoutActions = v; await onChange(); }));

  new Setting(pane)
    .setName("Card format · file browser")
    .setDesc("Render the file browser as cards (requires Cards layout)")
    .addToggle(t => t.setValue(s.cardLayoutFilebrowser).onChange(async v => { s.cardLayoutFilebrowser = v; await onChange(); }));
}

function renderTags(pane: HTMLElement, s: TegenlichtSettings, onChange: () => Promise<void>): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Tags" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Tag pill appearance across notes and the tag pane. Tag shape and border live in Editor → Properties; colour lives here." });

  new Setting(pane)
    .setName("Rainbow tags")
    .setDesc("Colour-cycle tag pills so each tag reads as a distinct hue")
    .addToggle(t => t.setValue(s.rainbowTags).onChange(async v => { s.rainbowTags = v; await onChange(); }));
}

function renderMisc(pane: HTMLElement, s: TegenlichtSettings, onChange: () => Promise<void>): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Misc" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "One-off rendering toggles that don't fit a larger grouping. Lives here until a more specific section earns its keep." });

  new Setting(pane)
    .setName("Speech bubbles")
    .setDesc("Render task-list items as bubble-styled blocks")
    .addToggle(t => t.setValue(s.speechBubbles).onChange(async v => { s.speechBubbles = v; await onChange(); }));
}

function renderBackdrop(pane: HTMLElement, s: TegenlichtSettings, onChange: () => Promise<void>): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Backdrop fixes" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Targeted fixes for workspace backdrop issues — canvas contrast, repaint glitches on translucent chrome, internal pane frames." });

  new Setting(pane)
    .setName("Darker canvas backdrop")
    .setDesc("Use a darker background for Obsidian canvases")
    .addToggle(t => t.setValue(s.canvasDarkBg).onChange(async v => { s.canvasDarkBg = v; await onChange(); }));

  new Setting(pane)
    .setName("Workspace bg fix")
    .setDesc("Repaint fix for translucent / colourful backdrops")
    .addToggle(t => t.setValue(s.bgFix).onChange(async v => { s.bgFix = v; await onChange(); }));

  new Setting(pane)
    .setName("Hide pane borders")
    .setDesc("Remove Obsidian's internal pane-frame borders")
    .addToggle(t => t.setValue(s.hideBorders).onChange(async v => { s.hideBorders = v; await onChange(); }));
}

function renderShowHide(pane: HTMLElement, s: TegenlichtSettings, onChange: () => Promise<void>): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Show / Hide" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Show or hide chrome-level Obsidian surfaces — ribbon, scrollbars, status bar, vault name, titlebar, pointer, metadata panel, tooltips." });

  new Setting(pane)
    .setName("Ribbon")
    .setDesc("Show Obsidian's left-edge ribbon")
    .addToggle(t => t.setValue(s.showRibbon).onChange(async v => { s.showRibbon = v; await onChange(); }));

  new Setting(pane)
    .setName("Scrollbars")
    .setDesc("Show scrollbars in the workspace")
    .addToggle(t => t.setValue(s.showScrollbars).onChange(async v => { s.showScrollbars = v; await onChange(); }));

  new Setting(pane)
    .setName("Status bar")
    .setDesc("Show Obsidian's status bar at the bottom")
    .addToggle(t => t.setValue(s.showStatusBar).onChange(async v => { s.showStatusBar = v; await onChange(); }));

  new Setting(pane)
    .setName("Vault name")
    .setDesc("Show the vault name in the sidebar header")
    .addToggle(t => t.setValue(s.showVaultName).onChange(async v => { s.showVaultName = v; await onChange(); }));

  new Setting(pane)
    .setName("Status bar style")
    .setDesc("Styling applied when the status bar is visible")
    .addDropdown(dd => {
      dd.addOption("none",                    "Default");
      dd.addOption("anp-floating-status-bar", "Floating");
      dd.addOption("anp-fixed-status-bar",    "Fixed");
      dd.setValue(s.statusBarStyle as string);
      dd.onChange(async v => {
        (s as unknown as Record<string, unknown>).statusBarStyle = v;
        await onChange();
      });
    });

  // Absorbed from Legacy → Show / Hide (Step 4 of settings-reorg-plan.md).
  new Setting(pane)
    .setName("Autohide titlebar")
    .setDesc("Collapse the title bar until you hover near it")
    .addToggle(t => t.setValue(s.hideTitlebarAuto).onChange(async v => { s.hideTitlebarAuto = v; await onChange(); }));

  buildSegmentSetting(pane,
    "Cursor style",
    "Use a pointer cursor over interactive chrome",
    [{ label: "Normal", value: "initial" }, { label: "Pointer", value: "pointer" }],
    s.uiPointerCursor,
    async v => { s.uiPointerCursor = v; await onChange(); },
  );

  new Setting(pane)
    .setName("Hide metadata panel")
    .setDesc("Hide the Properties panel wrapper entirely")
    .addToggle(t => t.setValue(s.hideMetadata).onChange(async v => { s.hideMetadata = v; await onChange(); }));

  new Setting(pane)
    .setName("Hide tooltips")
    .setDesc("Suppress Obsidian's native tooltip popups")
    .addToggle(t => t.setValue(s.hideTooltips).onChange(async v => { s.hideTooltips = v; await onChange(); }));
}

function renderPluginSupport(pane: HTMLElement, s: TegenlichtSettings, onChange: () => Promise<void>): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Plugin support" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Integrations with community plugins — each toggle applies Tegenlicht styling to that plugin's UI." });

  new Setting(pane)
    .setName("ITS Theme callouts")
    .setDesc("Enable ITS-style callout presets")
    .addToggle(t => t.setValue(s.itsCallouts).onChange(async v => { s.itsCallouts = v; await onChange(); }));

  new Setting(pane)
    .setName("Kanban")
    .setDesc("Apply Tegenlicht styling to the Kanban plugin")
    .addToggle(t => t.setValue(s.kanban).onChange(async v => { s.kanban = v; await onChange(); }));

  new Setting(pane)
    .setName("Calendar")
    .setDesc("Apply Tegenlicht styling to the Calendar plugin")
    .addToggle(t => t.setValue(s.calendar).onChange(async v => { s.calendar = v; await onChange(); }));
}

export function build(
  containerEl: HTMLElement,
  plugin: TegenlichtControlsPlugin,
  onChange: () => Promise<void>,
): void {
  const s = plugin.settings;
  const wrap = containerEl.createDiv("tc-elements-wrap");

  const sections: LeftRailSection[] = [
    { id: "cards",     label: "Cards",          count: 4, render: pane => renderCards(pane, s, onChange) },
    { id: "tags",      label: "Tags",           count: 1, render: pane => renderTags(pane, s, onChange) },
    { id: "misc",      label: "Misc",           count: 1, render: pane => renderMisc(pane, s, onChange) },
    { id: "backdrop",  label: "Backdrop",       count: 3, render: pane => renderBackdrop(pane, s, onChange) },
    { id: "showhide",  label: "Show / Hide",    count: 9, render: pane => renderShowHide(pane, s, onChange) },
    { id: "plugins",   label: "Plugin support", count: 3, render: pane => renderPluginSupport(pane, s, onChange) },
  ];

  buildLeftRailShell(wrap, sections, "elements");
}

import { Setting } from "obsidian";
import Pickr from "@simonwep/pickr";
import TegenlichtControlsPlugin from "../main";
import { TegenlichtSettings } from "../settings";
import {
  buildLeftRailShell, LeftRailSection, buildSegmentSetting,
  buildColorToggleRow, buildColourVarRow,
} from "./_shared";

/** Editor tab — input-side surfaces.
 *
 *  Left-rail layout with 5 sections:
 *    - Accents    (active line / selection tint / caret — moved from
 *                  Appearance → Workspace → Editor accents)
 *    - Titles     (inlineTitle, floatingTitle — moved from Editing)
 *    - Properties (propertiesBoxed, tag pill style + border + radius,
 *                  metadataButton, metadataMods)
 *    - Lists      (customCheckboxes, listToggle, orderedListStyle,
 *                  customPreviewMargins, listMarkerColour)
 *    - Tabs (pane) (tabStyle + Legacy's Tabs-deep 9 tuning controls) */

function renderAccents(
  pane: HTMLElement,
  s: TegenlichtSettings,
  refresh: () => Promise<void>,
  pickrs: Pickr[],
): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Accents" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Colour surfaces that respond to the caret and selection — active line, selection tint, and the caret itself. Each row pairs a colour picker with an on/off toggle." });

  pickrs.push(buildColorToggleRow(pane,
    "Active line", "Highlight the current cursor line in the editor",
    () => s.activeLineColour, v => { s.activeLineColour = v; },
    () => s.activeLineHighlight, v => { s.activeLineHighlight = v; },
    refresh,
  ));

  pickrs.push(buildColorToggleRow(pane,
    "Selection tint", "Colour overlay applied to selected text",
    () => s.selectionTintColour, v => { s.selectionTintColour = v; },
    () => s.selectionTint, v => { s.selectionTint = v; },
    refresh,
  ));

  pickrs.push(buildColorToggleRow(pane,
    "Caret colour", "Colour of the text insertion cursor",
    () => s.caretColour, v => { s.caretColour = v; },
    () => s.caretColourEnabled, v => { s.caretColourEnabled = v; },
    refresh,
  ));
}

function renderTitles(
  pane: HTMLElement,
  s: TegenlichtSettings,
  onChange: () => Promise<void>,
): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Titles" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "How the note's filename renders at the top of a pane — inline as an H1, or floating over the scroll." });

  new Setting(pane)
    .setName("Inline title")
    .setDesc("Show the filename as an H1 above the note")
    .addToggle(t => t.setValue(s.inlineTitle).onChange(async v => { s.inlineTitle = v; await onChange(); }));

  new Setting(pane)
    .setName("Floating title")
    .setDesc("Title floats over the note on scroll")
    .addToggle(t => t.setValue(s.floatingTitle).onChange(async v => { s.floatingTitle = v; await onChange(); }));
}

function renderProperties(
  pane: HTMLElement,
  s: TegenlichtSettings,
  onChange: () => Promise<void>,
): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Properties" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "The metadata / frontmatter panel and every tag pill Obsidian draws. Panel chrome, tag pill shape, and native integration buttons." });

  new Setting(pane)
    .setName("Boxed Properties panel")
    .setDesc("Accent-tinted card around the Properties panel")
    .addToggle(t => t.setValue(s.propertiesBoxed).onChange(async v => { s.propertiesBoxed = v; await onChange(); }));

  buildSegmentSetting(pane,
    "Tag pill style",
    "Applies to every pill Obsidian draws (Properties, autocomplete, search chips, inline body tags)",
    [
      { label: "Classic", value: "classic" },
      { label: "Ghost",   value: "ghost"   },
      { label: "Solid",   value: "solid"   },
    ],
    s.tagStyle || "classic",
    async v => { s.tagStyle = v; await onChange(); },
  );

  new Setting(pane)
    .setName("Tag border width")
    .setDesc("Outline thickness on every tag pill, 0–4 px")
    .addSlider(sl => sl.setLimits(0, 4, 1).setValue(s.tagBorderWidth ?? 0).setDynamicTooltip()
      .onChange(async v => { s.tagBorderWidth = v; await onChange(); }));

  new Setting(pane)
    .setName("Tag radius")
    .setDesc("Corner rounding on every tag pill, 0–2 em")
    .addSlider(sl => sl.setLimits(0, 2, 0.1).setValue(s.tagRadius ?? 2).setDynamicTooltip()
      .onChange(async v => { s.tagRadius = v; await onChange(); }));

  new Setting(pane)
    .setName("Metadata button")
    .setDesc("Add a native button to open the metadata / frontmatter panel")
    .addToggle(t => t.setValue(s.metadataButton).onChange(async v => { s.metadataButton = v; await onChange(); }));

  new Setting(pane)
    .setName("Metadata mods")
    .setDesc("Frontmatter display tweaks")
    .addToggle(t => t.setValue(s.metadataMods).onChange(async v => { s.metadataMods = v; await onChange(); }));
}

function renderLists(
  pane: HTMLElement,
  s: TegenlichtSettings,
  onChange: () => Promise<void>,
  pickrs: Pickr[],
): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Lists" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "List + checkbox rendering — nested bullet glyphs, ordered list numbering style, bullet colour, task checkboxes, and reading-view margins." });

  new Setting(pane)
    .setName("Custom checkboxes")
    .setDesc("Themed checkbox set for task lists")
    .addToggle(t => t.setValue(s.customCheckboxes).onChange(async v => { s.customCheckboxes = v; await onChange(); }));

  new Setting(pane)
    .setName("List styling")
    .setDesc("Differentiate nested bullets with per-depth glyphs")
    .addToggle(t => t.setValue(s.listToggle).onChange(async v => { s.listToggle = v; await onChange(); }));

  new Setting(pane)
    .setName("Ordered list style")
    .setDesc("Numbering glyph for ordered lists — writes --list-numbered-style")
    .addDropdown(dd => dd
      .addOption("decimal",              "Decimal (1, 2, 3…)")
      .addOption("decimal-leading-zero", "Decimal, zero-padded")
      .addOption("lower-alpha",          "Lowercase alphabetical")
      .addOption("upper-alpha",          "Uppercase alphabetical")
      .addOption("lower-roman",          "Lowercase Roman")
      .addOption("upper-roman",          "Uppercase Roman")
      .addOption("lower-latin",          "Lowercase Latin")
      .addOption("upper-latin",          "Uppercase Latin")
      .addOption("lower-greek",          "Lowercase Greek")
      .addOption("upper-greek",          "Uppercase Greek")
      .addOption("hiragana",             "Hiragana")
      .addOption("hiragana-iroha",       "Hiragana Iroha")
      .addOption("katakana-iroha",       "Katakana Iroha")
      .addOption("armenian",             "Armenian")
      .addOption("cjk-ideographic",      "CJK Ideographic")
      .addOption("hebrew",               "Hebrew")
      .setValue(s.orderedListStyle || "decimal")
      .onChange(async v => { s.orderedListStyle = v; await onChange(); })
    );

  new Setting(pane)
    .setName("Custom preview margins")
    .setDesc("Apply AnuPpuccin's reading-view margin scheme to preview mode")
    .addToggle(t => t.setValue(s.customPreviewMargins).onChange(async v => { s.customPreviewMargins = v; await onChange(); }));

  pickrs.push(buildColourVarRow(pane,
    "List bullet colour",
    "Colour for unordered list bullets (clear = theme default)",
    () => s.listMarkerColour, v => { s.listMarkerColour = v; },
    onChange,
  ));
}

function renderTabsPane(
  pane: HTMLElement,
  s: TegenlichtSettings,
  onChange: () => Promise<void>,
): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Tabs (pane)" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Obsidian's pane tabs — top-level style pick plus per-style tuning for Depth and Safari variants. Settings-panel tab bar styling lives in Appearance → Interface." });

  buildSegmentSetting(pane,
    "Tab style",
    "How Obsidian's pane tabs render",
    [
      { label: "Default",  value: "anp-default-tab"         },
      { label: "Depth",    value: "anp-depth-tab-toggle"    },
      { label: "Minimal",  value: "anp-mini-tab-toggle"     },
      { label: "Safari",   value: "anp-alternate-tab-toggle" },
      { label: "Vanilla",  value: "anp-safari-tab-toggle"   },
    ],
    s.tabStyle || "anp-default-tab",
    async v => { s.tabStyle = v; await onChange(); },
  );

  new Setting(pane).setName("Custom tab height").setDesc("Tab bar height in pixels (20–48)")
    .addSlider(sl => sl.setLimits(20, 48, 1).setValue(s.tabCustomHeight ?? 32).setDynamicTooltip()
      .onChange(async v => { s.tabCustomHeight = v; await onChange(); }));

  new Setting(pane).setName("Disable new-tab right-align").setDesc("Keep the new-tab button inline with the tabs instead of right-aligned")
    .addToggle(t => t.setValue(s.tabDisableNewTabAlign).onChange(async v => { s.tabDisableNewTabAlign = v; await onChange(); }));

  new Setting(pane).setName("Depth — invert tab text colour").setDesc("Only affects Depth tab style")
    .addToggle(t => t.setValue(s.tabDepthTextInvert).onChange(async v => { s.tabDepthTextInvert = v; await onChange(); }));

  new Setting(pane).setName("Depth — tab opacity").setDesc("Opacity of inactive Depth tabs, 0–100")
    .addSlider(sl => sl.setLimits(0, 100, 1).setValue(s.tabDepthOpacity ?? 100).setDynamicTooltip()
      .onChange(async v => { s.tabDepthOpacity = v; await onChange(); }));

  new Setting(pane).setName("Depth — tab gap").setDesc("Gap between Depth tabs, 0–16px")
    .addSlider(sl => sl.setLimits(0, 16, 1).setValue(s.tabDepthGap ?? 4).setDynamicTooltip()
      .onChange(async v => { s.tabDepthGap = v; await onChange(); }));

  new Setting(pane).setName("Safari — tab radius").setDesc("Corner radius on Safari tabs, 0–16px")
    .addSlider(sl => sl.setLimits(0, 16, 1).setValue(s.tabSafariRadius ?? 8).setDynamicTooltip()
      .onChange(async v => { s.tabSafariRadius = v; await onChange(); }));

  new Setting(pane).setName("Safari — tab gap").setDesc("Gap between Safari tabs, 0–16px")
    .addSlider(sl => sl.setLimits(0, 16, 1).setValue(s.tabSafariGap ?? 4).setDynamicTooltip()
      .onChange(async v => { s.tabSafariGap = v; await onChange(); }));

  new Setting(pane).setName("Safari — border width").setDesc("Border thickness on Safari tabs, 0–4px")
    .addSlider(sl => sl.setLimits(0, 4, 1).setValue(s.tabSafariBorderWidth ?? 1).setDynamicTooltip()
      .onChange(async v => { s.tabSafariBorderWidth = v; await onChange(); }));

  new Setting(pane).setName("Safari — animated variant (WIP)").setDesc("Enable the animated-safari tab class (theme's WIP)")
    .addToggle(t => t.setValue(s.tabSafariAnimated).onChange(async v => { s.tabSafariAnimated = v; await onChange(); }));
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
  const wrap = containerEl.createDiv("tc-editor-wrap");

  const sections: LeftRailSection[] = [
    { id: "accents",     label: "Accents",     count: 3, render: pane => renderAccents(pane, s, refresh, pickrs) },
    { id: "titles",      label: "Titles",      count: 2, render: pane => renderTitles(pane, s, onChange) },
    { id: "properties",  label: "Properties",  count: 6, render: pane => renderProperties(pane, s, onChange) },
    { id: "lists",       label: "Lists",       count: 5, render: pane => renderLists(pane, s, onChange, pickrs) },
    { id: "tabs-pane",   label: "Tabs (pane)", count: 10, render: pane => renderTabsPane(pane, s, onChange) },
  ];

  const shellCleanup = buildLeftRailShell(wrap, sections, "editor");

  return () => {
    shellCleanup();
    pickrs.forEach(p => { try { p.destroyAndRemove(); } catch(_) {} });
  };
}

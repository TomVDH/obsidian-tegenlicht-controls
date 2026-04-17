import { Setting } from "obsidian";
import TegenlichtControlsPlugin from "../main";
import { buildLeftRailShell, LeftRailSection, buildSegmentSetting } from "./_shared";

/**
 * Legacy tab — surfaces AnuPpuccin theme controls that don't have a
 * natural home elsewhere in the plugin. Uses a left-rail navigation
 * shell so the 40+ controls don't overwhelm a single scroll.
 *
 * Ship-push 1: Callouts (7) + Tables (9) + Codeblocks (5) + Show/Hide (4) + Tabs-deep (9)
 * Ship-push 2 (future): Headings + Lists & Tags + Workspace details
 * Skipped: Palette overrides, Integrations (Kanban / MAKE.md / Minimal Cards)
 */
export function build(
  containerEl: HTMLElement,
  plugin: TegenlichtControlsPlugin,
  onChange: () => Promise<void>,
  redisplay?: () => void,
): () => void {
  const s = plugin.settings;
  const refresh = async () => {
    await onChange();
    redisplay?.();
  };

  const sections: LeftRailSection[] = [
    {
      id: "callouts",
      label: "Callouts",
      count: 7,
      render: (pane) => renderCallouts(pane, s, onChange, refresh),
    },
    {
      id: "tables",
      label: "Tables",
      count: 9,
      render: (pane) => renderTables(pane, s, onChange, refresh),
    },
    {
      id: "codeblocks",
      label: "Codeblocks",
      count: 5,
      render: (pane) => renderCodeblocks(pane, s, onChange, refresh),
    },
    {
      id: "show-hide",
      label: "Show / Hide",
      count: 4,
      render: (pane) => renderShowHide(pane, s, onChange, refresh),
    },
    {
      id: "tabs-deep",
      label: "Tabs (deep)",
      count: 9,
      render: (pane) => renderTabsDeep(pane, s, onChange, refresh),
    },
  ];

  return buildLeftRailShell(containerEl, sections);
}

// Section renderers — each is called when its rail item becomes active.
// Implementations land in Tasks 7 (Callouts + Tables) and 8 (Codeblocks + Show/Hide + Tabs-deep).

function renderCallouts(
  pane: HTMLElement,
  s: import("../settings").TegenlichtSettings,
  onChange: () => Promise<void>,
  refresh: () => Promise<void>,
): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Callouts" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Callout box styling — shape, colour, radius, fold position. Plugin toggles body classes and writes CSS vars; the theme paints." });

  buildSegmentSetting(pane,
    "Callout style",
    "Overall shape and shadow language for every callout",
    [
      { label: "Default",       value: "default"        },
      { label: "Sleek",         value: "sleek"          },
      { label: "Block",         value: "block"          },
      { label: "Vanilla",       value: "vanilla-normal" },
      { label: "Vanilla+",      value: "vanilla-plus"   },
    ],
    s.calloutStyle,
    async v => { s.calloutStyle = v; await refresh(); },
  );

  new Setting(pane)
    .setName("Enable custom callout colours")
    .setDesc("Override the theme's per-type tint with AnuPpuccin's palette")
    .addToggle(t => t
      .setValue(s.calloutCustomColors)
      .onChange(async v => { s.calloutCustomColors = v; await onChange(); })
    );

  new Setting(pane)
    .setName("Callout radius")
    .setDesc("Corner rounding, 0–24px")
    .addSlider(sl => sl
      .setLimits(0, 24, 1)
      .setValue(s.calloutRadius ?? 8)
      .setDynamicTooltip()
      .onChange(async v => { s.calloutRadius = v; await onChange(); })
    );

  new Setting(pane)
    .setName("Title padding")
    .setDesc("Horizontal padding on the callout title strip")
    .addSlider(sl => sl
      .setLimits(0, 32, 1)
      .setValue(s.calloutTitlePaddingX ?? 12)
      .setDynamicTooltip()
      .onChange(async v => { s.calloutTitlePaddingX = v; await onChange(); })
    );

  new Setting(pane)
    .setName("Title background opacity")
    .setDesc("Alpha of the title strip, 0–100")
    .addSlider(sl => sl
      .setLimits(0, 100, 1)
      .setValue(s.calloutTitleOpacity ?? 60)
      .setDynamicTooltip()
      .onChange(async v => { s.calloutTitleOpacity = v; await onChange(); })
    );

  new Setting(pane)
    .setName("Content padding")
    .setDesc("Padding on the body below the title")
    .addSlider(sl => sl
      .setLimits(0, 40, 1)
      .setValue(s.calloutContentPadding ?? 16)
      .setDynamicTooltip()
      .onChange(async v => { s.calloutContentPadding = v; await onChange(); })
    );

  buildSegmentSetting(pane,
    "Fold position",
    "Which side the collapse chevron sits",
    [
      { label: "Left",  value: "left"  },
      { label: "Right", value: "right" },
    ],
    s.calloutFoldPosition,
    async v => { s.calloutFoldPosition = v; await onChange(); },
  );
}

function renderTables(
  pane: HTMLElement,
  s: import("../settings").TegenlichtSettings,
  onChange: () => Promise<void>,
  refresh: () => Promise<void>,
): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Tables" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Table styling — header highlight, row/column alternation, border weight, alignment. Table width lives in the Layout tab." });

  new Setting(pane).setName("Enable table styling").setDesc("Master toggle for AnuPpuccin's table treatment")
    .addToggle(t => t.setValue(s.tableStyling).onChange(async v => { s.tableStyling = v; await onChange(); }));

  new Setting(pane).setName("Custom table width").setDesc("Enable the custom table-width rule")
    .addToggle(t => t.setValue(s.tableCustomWidth).onChange(async v => { s.tableCustomWidth = v; await onChange(); }));

  new Setting(pane).setName("Center tables").setDesc("Horizontally centre tables in the viewport")
    .addToggle(t => t.setValue(s.tableCentered).onChange(async v => { s.tableCentered = v; await onChange(); }));

  new Setting(pane).setName("Header row highlight").setDesc("Emphasise the <th> row")
    .addToggle(t => t.setValue(s.tableThHighlight).onChange(async v => { s.tableThHighlight = v; await onChange(); }));

  buildSegmentSetting(pane,
    "Row / column highlight",
    "Alternating or checkered fill across rows or columns",
    [
      { label: "None",       value: "none"      },
      { label: "Rows",       value: "row-alt"   },
      { label: "Columns",    value: "col-alt"   },
      { label: "Checkered",  value: "checkered" },
      { label: "Full",       value: "full"      },
    ],
    s.tableRowHighlight,
    async v => { s.tableRowHighlight = v; await refresh(); },
  );

  new Setting(pane).setName("Highlight opacity").setDesc("Alpha of row/column highlight, 0–100")
    .addSlider(sl => sl.setLimits(0, 100, 1).setValue(s.tableHighlightOpacity ?? 10).setDynamicTooltip()
      .onChange(async v => { s.tableHighlightOpacity = v; await onChange(); }));

  buildSegmentSetting(pane,
    "<th> text align",
    "Header cell text alignment",
    [
      { label: "Left",   value: "left"   },
      { label: "Center", value: "center" },
      { label: "Right",  value: "right"  },
    ],
    s.tableAlignTh,
    async v => { s.tableAlignTh = v; await onChange(); },
  );

  buildSegmentSetting(pane,
    "<td> text align",
    "Body cell text alignment",
    [
      { label: "Left",   value: "left"   },
      { label: "Center", value: "center" },
      { label: "Right",  value: "right"  },
    ],
    s.tableAlignTd,
    async v => { s.tableAlignTd = v; await onChange(); },
  );

  new Setting(pane).setName("Border width").setDesc("Table grid line thickness, 0–4px")
    .addSlider(sl => sl.setLimits(0, 4, 1).setValue(s.tableBorderWidth ?? 1).setDynamicTooltip()
      .onChange(async v => { s.tableBorderWidth = v; await onChange(); }));
}

function renderCodeblocks(
  pane: HTMLElement,
  s: import("../settings").TegenlichtSettings,
  onChange: () => Promise<void>,
  refresh: () => Promise<void>,
): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Codeblocks" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Line wrap behaviour in Edit and Preview modes, plus background/text colour overrides." });
  pane.createEl("p", { cls: "tc-empty-hint", text: "Controls incoming — Task 8." });
}

function renderShowHide(
  pane: HTMLElement,
  s: import("../settings").TegenlichtSettings,
  onChange: () => Promise<void>,
  refresh: () => Promise<void>,
): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Show / Hide" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Autohide titlebar, pointer cursor mode, metadata panel visibility, tooltip suppression. Scrollbars and status bar live in the Features tab." });
  pane.createEl("p", { cls: "tc-empty-hint", text: "Controls incoming — Task 8." });
}

function renderTabsDeep(
  pane: HTMLElement,
  s: import("../settings").TegenlichtSettings,
  onChange: () => Promise<void>,
  refresh: () => Promise<void>,
): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Tabs (deep)" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Per-tab-style tuning — depth tab gap/opacity/text invert, safari-style tab height/radius/border." });
  pane.createEl("p", { cls: "tc-empty-hint", text: "Controls incoming — Task 8." });
}

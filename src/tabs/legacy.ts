import { Setting, setIcon } from "obsidian";
import Pickr from "@simonwep/pickr";
import TegenlichtControlsPlugin from "../main";
import {
  buildLeftRailShell, LeftRailSection, buildSegmentSetting,
  buildCluster, buildColourVarRow,
} from "./_shared";
import { buildTypographyPreview, buildCalloutPreview } from "../preview-sample";

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
  const pickrs: Pickr[] = [];

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
      render: (pane) => renderCodeblocks(pane, s, onChange, refresh, pickrs),
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
    // Temporary mock — verifies the rail label marquee on hover.
    // Label is intentionally longer than the 116px rail can fit, so
    // the .tc-leftrail-label-text translateX animation has something
    // to reveal. Remove once the marquee is approved.
    {
      id: "mock-marquee-test",
      label: "A Deliberately Overlong Label For Marquee Verification",
      count: 0,
      render: (pane) => {
        pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Marquee test" });
        pane.createEl("p", { cls: "tc-leftrail-secdesc",
          text: "Temporary — hover the label of this rail item in the sidebar to verify the text rolls left to reveal the full string, then back. Container-query driven (100cqw − 100% in min(0px, …)), so it only animates when the text actually overflows the rail width." });
      },
    },
  ];

  const shellCleanup = buildLeftRailShell(containerEl, sections, "legacy");

  return () => {
    shellCleanup();
    pickrs.forEach(p => { try { p.destroyAndRemove(); } catch (_) { /* no-op */ } });
  };
}

// Section renderers — each is called when its rail item becomes active.
// Implementations land in Tasks 7 (Callouts + Tables) and 8 (Codeblocks + Show/Hide + Tabs-deep).

function renderCallouts(
  pane: HTMLElement,
  s: import("../settings").TegenlichtSettings,
  onChange: () => Promise<void>,
  refresh: () => Promise<void>,
): void {
  // Header (title + description) sits flush at the top — the same
  // shape every Legacy section uses.
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Callouts" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Callout box styling — shape, colour, radius, fold position. Plugin toggles body classes and writes CSS vars; the theme paints." });

  // Preview affordance row: PREVIEW label · dashed connector · foldout
  // button. Same dashed-line vocabulary used between the top tabs and
  // the reset button — connects label to its toggle visually.
  const previewBar = pane.createDiv("tc-section-preview-bar");
  previewBar.createSpan({ cls: "tc-section-preview-label", text: "PREVIEW" });
  previewBar.createDiv("tc-section-preview-dash");
  const previewBtn = previewBar.createEl("button", {
    cls: "tc-circle-btn tc-section-preview-btn",
    attr: { "aria-label": "Toggle preview", title: "Toggle preview" },
  });
  setIcon(previewBtn, "chevron-down");

  const previewWrap = pane.createDiv("tc-section-preview-wrap");
  buildCalloutPreview(previewWrap);
  let previewOpen = false;
  previewBtn.addEventListener("click", () => {
    previewOpen = !previewOpen;
    if (previewOpen) {
      previewWrap.style.maxHeight = previewWrap.scrollHeight + "px";
      previewBtn.addClass("tc-section-preview-btn--open");
    } else {
      previewWrap.style.maxHeight = "0px";
      previewBtn.removeClass("tc-section-preview-btn--open");
    }
  });

  // Dropdown rather than segment pills — the option set will grow well
  // past the 4-or-so we can fit horizontally, so the control type is
  // sized for the future. Same `await onChange()` (not refresh()) so
  // changing the style doesn't tear the open preview down.
  new Setting(pane)
    .setName("Callout style")
    .setDesc("Overall shape and shadow language for every callout")
    .addDropdown(dd => dd
      .addOption("default",        "Default")
      .addOption("sleek",          "Sleek")
      .addOption("block",          "Block")
      .addOption("vanilla-normal", "Vanilla")
      .addOption("vanilla-plus",   "Vanilla +")
      .setValue(s.calloutStyle)
      .onChange(async v => { s.calloutStyle = v; await onChange(); })
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
  pickrs: Pickr[],
): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Codeblocks" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Line wrap behaviour across editor modes + optional background/text colour overrides." });

  buildSegmentSetting(pane,
    "Wrap (edit mode)",
    "Line wrap inside code blocks when editing",
    [ { label: "Wrap", value: "wrap" }, { label: "No wrap", value: "nowrap" } ],
    s.codeblockWrapEdit,
    async v => { s.codeblockWrapEdit = v; await onChange(); },
  );

  buildSegmentSetting(pane,
    "Wrap (preview mode)",
    "Line wrap in Reading view",
    [ { label: "Wrap", value: "wrap" }, { label: "No wrap", value: "nowrap" } ],
    s.codeblockWrapPreview,
    async v => { s.codeblockWrapPreview = v; await onChange(); },
  );

  buildSegmentSetting(pane,
    "Wrap (highlighted preview)",
    "Line wrap for syntax-highlighted blocks in Reading view",
    [ { label: "Wrap", value: "wrap" }, { label: "No wrap", value: "nowrap" } ],
    s.codeblockWrapHlPreview,
    async v => { s.codeblockWrapHlPreview = v; await onChange(); },
  );

  pickrs.push(buildColourVarRow(pane,
    "Background colour",
    "Override the code block background. Clear = theme default.",
    () => s.codeblockBgColor,
    v => { s.codeblockBgColor = v; },
    onChange,
  ));

  pickrs.push(buildColourVarRow(pane,
    "Text colour",
    "Override the code block text colour. Clear = theme default.",
    () => s.codeblockTextColor,
    v => { s.codeblockTextColor = v; },
    onChange,
  ));

  // LaTeX colour — sibling to the codeblock text/bg overrides; both are
  // "override an AnuPpuccin CSS var with a hex" controls. Kept here
  // rather than spun up into a dedicated Math section for one setting.
  pickrs.push(buildColourVarRow(pane,
    "LaTeX colour",
    "Text colour for LaTeX blocks. Clear = theme default.",
    () => s.latexColour,
    v => { s.latexColour = v; },
    onChange,
  ));
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

  // Experimental: wrap the four controls in the same accent-gradient
  // inset cluster used in Appearance. Lets us judge whether the cluster
  // visual reads well inside the rail's narrower content pane, or whether
  // flat rows hold up better at this density. Other Legacy sections stay
  // flat for now — A/B by eye.
  const visibilityCluster = buildCluster(pane, "Visibility");

  new Setting(visibilityCluster).setName("Autohide titlebar").setDesc("Collapse the title bar until you hover near it")
    .addToggle(t => t.setValue(s.hideTitlebarAuto).onChange(async v => { s.hideTitlebarAuto = v; await onChange(); }));

  buildSegmentSetting(visibilityCluster,
    "Cursor style",
    "Use a pointer cursor over interactive chrome",
    [ { label: "Normal",  value: "initial" }, { label: "Pointer", value: "pointer" } ],
    s.uiPointerCursor,
    async v => { s.uiPointerCursor = v; await onChange(); },
  );

  new Setting(visibilityCluster).setName("Hide metadata panel").setDesc("Hide the Properties panel wrapper entirely")
    .addToggle(t => t.setValue(s.hideMetadata).onChange(async v => { s.hideMetadata = v; await onChange(); }));

  new Setting(visibilityCluster).setName("Hide tooltips").setDesc("Suppress Obsidian's native tooltip popups")
    .addToggle(t => t.setValue(s.hideTooltips).onChange(async v => { s.hideTooltips = v; await onChange(); }));

  // Test: drop the Typography tab's live preview underneath the
  // Visibility cluster. Lets us see how an in-section preview reads
  // inside the rail's content pane — and how the Show/Hide toggles
  // actually affect Obsidian-rendered Markdown in real time.
  const previewWrap = pane.createDiv("tc-leftrail-preview");
  previewWrap.createEl("h4", { cls: "tc-leftrail-preview-head", text: "Live preview" });
  buildTypographyPreview(previewWrap);
}

function renderTabsDeep(
  pane: HTMLElement,
  s: import("../settings").TegenlichtSettings,
  onChange: () => Promise<void>,
  refresh: () => Promise<void>,
): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Tabs (deep)" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Per-style tuning for Depth and Safari tab variants. Top-level tab style lives in the Features tab." });

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

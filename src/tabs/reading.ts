import { Setting, setIcon } from "obsidian";
import Pickr from "@simonwep/pickr";
import TegenlichtControlsPlugin from "../main";
import { TegenlichtSettings } from "../settings";
import {
  buildLeftRailShell, LeftRailSection, buildSegmentSetting,
  buildColourVarRow, buildSectionPreview,
} from "./_shared";
import { buildCalloutPreview } from "../preview-sample";

/** Reading tab — how a note looks while being read.
 *
 *  Left-rail layout with 5 sections:
 *    - Typography (pointer to the dedicated Typography tab)
 *    - Callouts   (absorbed from Legacy)
 *    - Tables     (Legacy + tableWidthPct from Layout)
 *    - Codeblocks (Legacy + codeblockLineNumbers from Editing + latexColour)
 *    - Embeds & PDF (Features set + embedMaxHeight from Layout) */

function renderTypography(pane: HTMLElement): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Typography" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Fonts, rhythm, heading scale, weight, and decoration currently live in the Legacy tab — Fonts / Rhythm / Headings / Weight & leading / Decoration rail sections. They'll graduate into Reading in a later pass; for now the staging area keeps them one click away." });

  const pointer = pane.createDiv("tc-reading-pointer");
  pointer.createEl("strong", { text: "Typography settings: " });
  pointer.createSpan({ text: "top-level ", cls: "tc-reading-pointer-prefix" });
  pointer.createEl("code", { text: "Legacy" });
  pointer.createSpan({ text: " tab, first five rail sections — role mapping, rhythm, per-heading colour/weight/size, decoration accents. All ~50 controls." });
}

function renderCallouts(
  pane: HTMLElement,
  s: TegenlichtSettings,
  onChange: () => Promise<void>,
): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Callouts" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Callout box styling — shape, colour, radius, fold position. Plugin toggles body classes and writes CSS vars; the theme paints." });

  buildSectionPreview(pane, "rd-callouts-preview", buildCalloutPreview);

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
    .addSlider(sl => sl.setLimits(0, 24, 1).setValue(s.calloutRadius ?? 8).setDynamicTooltip()
      .onChange(async v => { s.calloutRadius = v; await onChange(); }));

  new Setting(pane)
    .setName("Title padding")
    .setDesc("Horizontal padding on the callout title strip")
    .addSlider(sl => sl.setLimits(0, 32, 1).setValue(s.calloutTitlePaddingX ?? 12).setDynamicTooltip()
      .onChange(async v => { s.calloutTitlePaddingX = v; await onChange(); }));

  new Setting(pane)
    .setName("Title background opacity")
    .setDesc("Alpha of the title strip, 0–100")
    .addSlider(sl => sl.setLimits(0, 100, 1).setValue(s.calloutTitleOpacity ?? 60).setDynamicTooltip()
      .onChange(async v => { s.calloutTitleOpacity = v; await onChange(); }));

  new Setting(pane)
    .setName("Content padding")
    .setDesc("Padding on the body below the title")
    .addSlider(sl => sl.setLimits(0, 40, 1).setValue(s.calloutContentPadding ?? 16).setDynamicTooltip()
      .onChange(async v => { s.calloutContentPadding = v; await onChange(); }));

  buildSegmentSetting(pane,
    "Fold position",
    "Which side the collapse chevron sits",
    [{ label: "Left", value: "left" }, { label: "Right", value: "right" }],
    s.calloutFoldPosition,
    async v => { s.calloutFoldPosition = v; await onChange(); },
  );
}

function renderTables(
  pane: HTMLElement,
  s: TegenlichtSettings,
  onChange: () => Promise<void>,
): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Tables" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Table width, header highlight, row/column alternation, border weight, alignment." });

  new Setting(pane).setName("Enable table styling").setDesc("Master toggle for AnuPpuccin's table treatment")
    .addToggle(t => t.setValue(s.tableStyling).onChange(async v => { s.tableStyling = v; await onChange(); }));

  new Setting(pane).setName("Custom table width").setDesc("Enable the custom table-width rule")
    .addToggle(t => t.setValue(s.tableCustomWidth).onChange(async v => { s.tableCustomWidth = v; await onChange(); }));

  new Setting(pane)
    .setName("Table width")
    .setDesc("Table width as a percentage of the note column (40–100%)")
    .addSlider(sl => sl.setLimits(40, 100, 1).setValue(s.tableWidthPct ?? 100).setDynamicTooltip()
      .onChange(async v => { s.tableWidthPct = v; await onChange(); }));

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
    async v => { s.tableRowHighlight = v; await onChange(); },
  );

  new Setting(pane).setName("Highlight opacity").setDesc("Alpha of row/column highlight, 0–100")
    .addSlider(sl => sl.setLimits(0, 100, 1).setValue(s.tableHighlightOpacity ?? 10).setDynamicTooltip()
      .onChange(async v => { s.tableHighlightOpacity = v; await onChange(); }));

  buildSegmentSetting(pane,
    "<th> text align",
    "Header cell text alignment",
    [{ label: "Left", value: "left" }, { label: "Center", value: "center" }, { label: "Right", value: "right" }],
    s.tableAlignTh,
    async v => { s.tableAlignTh = v; await onChange(); },
  );

  buildSegmentSetting(pane,
    "<td> text align",
    "Body cell text alignment",
    [{ label: "Left", value: "left" }, { label: "Center", value: "center" }, { label: "Right", value: "right" }],
    s.tableAlignTd,
    async v => { s.tableAlignTd = v; await onChange(); },
  );

  new Setting(pane).setName("Border width").setDesc("Table grid line thickness, 0–4px")
    .addSlider(sl => sl.setLimits(0, 4, 1).setValue(s.tableBorderWidth ?? 1).setDynamicTooltip()
      .onChange(async v => { s.tableBorderWidth = v; await onChange(); }));
}

function renderCodeblocks(
  pane: HTMLElement,
  s: TegenlichtSettings,
  onChange: () => Promise<void>,
  pickrs: Pickr[],
): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Codeblocks" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Line numbers, wrap behaviour across editor modes, background/text colour overrides, LaTeX colour." });

  new Setting(pane)
    .setName("Codeblock line numbers")
    .setDesc("Line numbers in fenced code blocks")
    .addToggle(t => t.setValue(s.codeblockLineNumbers).onChange(async v => { s.codeblockLineNumbers = v; await onChange(); }));

  buildSegmentSetting(pane,
    "Wrap (edit mode)", "Line wrap inside code blocks when editing",
    [{ label: "Wrap", value: "wrap" }, { label: "No wrap", value: "nowrap" }],
    s.codeblockWrapEdit,
    async v => { s.codeblockWrapEdit = v; await onChange(); },
  );

  buildSegmentSetting(pane,
    "Wrap (preview mode)", "Line wrap in Reading view",
    [{ label: "Wrap", value: "wrap" }, { label: "No wrap", value: "nowrap" }],
    s.codeblockWrapPreview,
    async v => { s.codeblockWrapPreview = v; await onChange(); },
  );

  buildSegmentSetting(pane,
    "Wrap (highlighted preview)", "Line wrap for syntax-highlighted blocks in Reading view",
    [{ label: "Wrap", value: "wrap" }, { label: "No wrap", value: "nowrap" }],
    s.codeblockWrapHlPreview,
    async v => { s.codeblockWrapHlPreview = v; await onChange(); },
  );

  pickrs.push(buildColourVarRow(pane,
    "Background colour", "Override the code block background. Clear = theme default.",
    () => s.codeblockBgColor, v => { s.codeblockBgColor = v; },
    onChange,
  ));

  pickrs.push(buildColourVarRow(pane,
    "Text colour", "Override the code block text colour. Clear = theme default.",
    () => s.codeblockTextColor, v => { s.codeblockTextColor = v; },
    onChange,
  ));

  pickrs.push(buildColourVarRow(pane,
    "LaTeX colour", "Text colour for LaTeX blocks. Clear = theme default.",
    () => s.latexColour, v => { s.latexColour = v; },
    onChange,
  ));

  void setIcon; // imported for future preview affordance, lint silencer
}

function renderEmbedsPdf(
  pane: HTMLElement,
  s: TegenlichtSettings,
  onChange: () => Promise<void>,
): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Embeds & PDF" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Embedded note ceiling, PDF viewer blend, print / export formatting." });

  new Setting(pane)
    .setName("Embed max height")
    .setDesc("Caps the height of embedded notes and transclusions (120–1200px)")
    .addSlider(sl => sl.setLimits(120, 1200, 10).setValue(s.embedMaxHeight ?? 200).setDynamicTooltip()
      .onChange(async v => { s.embedMaxHeight = v; await onChange(); }));

  new Setting(pane)
    .setName("Print styling")
    .setDesc("Apply dedicated formatting for print / export")
    .addToggle(t => t.setValue(s.printStyling).onChange(async v => { s.printStyling = v; await onChange(); }));

  new Setting(pane)
    .setName("PDF blend (light)")
    .setDesc("Blend PDF viewer background with the editor in light mode")
    .addToggle(t => t.setValue(s.pdfBlendLight).onChange(async v => { s.pdfBlendLight = v; await onChange(); }));

  new Setting(pane)
    .setName("PDF blend (dark)")
    .setDesc("Blend PDF viewer background with the editor in dark mode")
    .addToggle(t => t.setValue(s.pdfBlendDark).onChange(async v => { s.pdfBlendDark = v; await onChange(); }));
}

export function build(
  containerEl: HTMLElement,
  plugin: TegenlichtControlsPlugin,
  onChange: () => Promise<void>,
): () => void {
  const s = plugin.settings;
  const pickrs: Pickr[] = [];
  const wrap = containerEl.createDiv("tc-reading-wrap");

  const sections: LeftRailSection[] = [
    { id: "typography", label: "Typography",   count: 0, render: pane => renderTypography(pane) },
    { id: "callouts",   label: "Callouts",     count: 7, render: pane => renderCallouts(pane, s, onChange) },
    { id: "tables",     label: "Tables",       count: 10, render: pane => renderTables(pane, s, onChange) },
    { id: "codeblocks", label: "Codeblocks",   count: 7, render: pane => renderCodeblocks(pane, s, onChange, pickrs) },
    { id: "embeds",     label: "Embeds & PDF", count: 4, render: pane => renderEmbedsPdf(pane, s, onChange) },
  ];

  const shellCleanup = buildLeftRailShell(wrap, sections, "reading");

  return () => {
    shellCleanup();
    pickrs.forEach(p => { try { p.destroyAndRemove(); } catch(_) {} });
  };
}

import { Setting } from "obsidian";
import TegenlichtControlsPlugin from "../main";
import { TegenlichtSettings } from "../settings";
import { buildLeftRailShell, LeftRailSection, buildSegmentSetting } from "./_shared";

/** Workspace tab — navigation, file tree, graph, pane layout.
 *
 *  Left-rail layout with 4 sections:
 *    - File tree  (fileIcons, folder display, vault title,
 *                  fileLabelAlign)
 *    - Rainbow folders (3 modes + inherit + per-mode Advanced
 *                  disclosure)
 *    - Graph       (colour mode + halo + scale + link thickness)
 *    - Pane layout (all former Layout-tab sliders: reading view,
 *                  cards, borders, stacked tabs) */

function renderFileTree(
  pane: HTMLElement,
  s: TegenlichtSettings,
  onChange: () => Promise<void>,
): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "File tree" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Nav-files pane rendering — type icons, folder glyphs, vault-title treatment, and label alignment." });

  new Setting(pane)
    .setName("File type icons")
    .setDesc("Show a glyph next to each file in the tree based on its extension")
    .addToggle(t => t.setValue(s.fileIcons).onChange(async v => { s.fileIcons = v; await onChange(); }));

  buildSegmentSetting(pane,
    "Folder display",
    "Show chevrons or folder glyphs in the file tree",
    [
      { label: "Chevrons", value: "chevrons" },
      { label: "Folders",  value: "folders"  },
    ],
    s.collapseFolderIcons ? "folders" : "chevrons",
    async v => { s.collapseFolderIcons = (v === "folders"); await onChange(); },
  );

  new Setting(pane)
    .setName("Custom vault title")
    .setDesc("Style the vault root entry — larger and set apart from the file tree")
    .addToggle(t => t.setValue(s.customVaultTitle).onChange(async v => { s.customVaultTitle = v; await onChange(); }));

  new Setting(pane)
    .setName("File label alignment")
    .setDesc("Alignment of file names in the file tree")
    .addDropdown(dd => {
      dd.addOption("0", "Left");
      dd.addOption("1", "Right");
      dd.setValue(s.fileLabelAlign as string);
      dd.onChange(async v => {
        (s as unknown as Record<string, unknown>).fileLabelAlign = v;
        await onChange();
      });
    });
}

function renderRainbow(
  pane: HTMLElement,
  s: TegenlichtSettings,
  onChange: () => Promise<void>,
): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Rainbow folders" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "AnuPuccin-style per-folder colour cycling. Three modes mirror the theme's Style Settings — Off / Simple (tints titles + indents) / Full (tints the row background). Advanced disclosure carries per-mode fine-tuning." });

  const computedMode = (() => {
    if ((s.rainbowStyle ?? 'off') === 'off' && s.rainbowFileBrowser) return 'full';
    const v = s.rainbowStyle ?? 'off';
    if (v === 'dot' || v === 'icon') return 'simple';
    return v;
  })();

  // Forward-declared so the mode segment can repopulate Advanced on
  // mode change while keeping the user's open/closed choice.
  let populateAdvanced: (mode: string) => void = () => {};

  buildSegmentSetting(pane,
    "Coloured folders",
    "Full tints folder backgrounds, Simple tints titles + indents — matches AnuPuccin's Style Settings",
    [
      { label: "Off",    value: "off"    },
      { label: "Simple", value: "simple" },
      { label: "Full",   value: "full"   },
    ],
    computedMode,
    async v => {
      s.rainbowStyle = v;
      s.rainbowFileBrowser = v !== 'off' && s.rainbowFileBrowser;
      populateAdvanced(v);
      await onChange();
    },
  );

  new Setting(pane)
    .setName("Subfolders inherit colour")
    .setDesc("Child folders pick up their parent's hue instead of rolling through the rainbow themselves")
    .addToggle(t => t.setValue(s.rainbowInherit).onChange(async v => { s.rainbowInherit = v; await onChange(); }));

  const advanced = pane.createDiv("tc-advanced");
  const advHeader = advanced.createDiv("tc-advanced-header");
  advHeader.createSpan({ cls: "tc-advanced-chevron", text: "▶" });
  advHeader.createSpan({ text: "Advanced" });
  const advBody = advanced.createDiv("tc-advanced-body");
  advHeader.addEventListener("click", () => {
    advanced.toggleClass("tc-advanced--open", !advanced.hasClass("tc-advanced--open"));
  });

  populateAdvanced = (mode: string) => {
    advBody.empty();
    advanced.style.display = mode === "off" ? "none" : "";
    if (mode === "simple") {
      new Setting(advBody).setName("Tint folder names")
        .setDesc("Folder title text picks up the rotating hue. Subtle — reads as a coloured label without painting the whole row.")
        .addToggle(t => t.setValue(s.rainbowSimpleTitle).onChange(async v => { s.rainbowSimpleTitle = v; await onChange(); }));
      new Setting(advBody).setName("Tint chevrons")
        .setDesc("Obsidian's native chevrons (and AnuPpuccin's folder glyphs when Folder display is set to Folders) take the folder's hue.")
        .addToggle(t => t.setValue(s.rainbowSimpleCollapseIcon).onChange(async v => { s.rainbowSimpleCollapseIcon = v; await onChange(); }));
      new Setting(advBody).setName("Tint indent guides")
        .setDesc("The thin vertical lines under each folder (shown when children are expanded) inherit the parent's hue.")
        .addToggle(t => t.setValue(s.rainbowSimpleIndent).onChange(async v => { s.rainbowSimpleIndent = v; await onChange(); }));
      new Setting(advBody).setName("Coloured file marker")
        .setDesc("Paint a small coloured dot next to every file living inside a coloured folder — a trace of the parent's hue on each leaf.")
        .addToggle(t => t.setValue(s.rainbowSimpleFileIcon).onChange(async v => { s.rainbowSimpleFileIcon = v; await onChange(); }));
    } else if (mode === "full") {
      new Setting(advBody).setName("Tint files inside")
        .setDesc("Files living in a coloured folder pick up the parent's hue on their own row — extends the tint past the folder header.")
        .addToggle(t => t.setValue(s.rainbowFullFileRecolor).onChange(async v => { s.rainbowFullFileRecolor = v; await onChange(); }));
      new Setting(advBody).setName("Readable titles — light mode")
        .setDesc("Swap folder-name text to the regular text colour (not the folder hue) when the workspace is in a light theme — keeps contrast legible against the pale tint.")
        .addToggle(t => t.setValue(s.rainbowFullInvertLight).onChange(async v => { s.rainbowFullInvertLight = v; await onChange(); }));
      new Setting(advBody).setName("Readable titles — dark mode")
        .setDesc("Same contrast fix for dark workspaces — folder names paint in the regular text colour rather than the (dim) hue.")
        .addToggle(t => t.setValue(s.rainbowFullInvertDark).onChange(async v => { s.rainbowFullInvertDark = v; await onChange(); }));
      new Setting(advBody).setName("Tint strength")
        .setDesc("How much of the folder's hue fills its row background. 0 = transparent (no fill), 100 = solid hue at full saturation.")
        .addSlider(sl => sl.setLimits(0, 100, 1).setValue(s.rainbowFullBgOpacity ?? 70).setDynamicTooltip()
          .onChange(async v => { s.rainbowFullBgOpacity = v; await onChange(); }));
    }
  };
  populateAdvanced(computedMode);
}

function renderGraph(
  pane: HTMLElement,
  s: TegenlichtSettings,
  onChange: () => Promise<void>,
): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Graph" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Graph view — colour mode for nodes and links, hover halo, node size, link thickness." });

  buildSegmentSetting(pane,
    "Colour mode",
    "How nodes and links take their hue",
    [
      { label: "Mono",    value: "mono"    },
      { label: "Accent",  value: "accent"  },
      { label: "Folders", value: "folders" },
    ],
    s.graphColourMode,
    async v => { s.graphColourMode = v; await onChange(); },
  );

  new Setting(pane)
    .setName("Hover halo")
    .setDesc("Soft accent glow under the node you're hovering")
    .addToggle(t => t.setValue(s.graphHalo).onChange(async v => { s.graphHalo = v; await onChange(); }));

  new Setting(pane)
    .setName("Node scale")
    .setDesc("Multiplies Obsidian's native node size (0.5× – 2×)")
    .addSlider(sl => sl.setLimits(0.5, 2.0, 0.1).setValue(s.graphNodeScale ?? 1.0).setDynamicTooltip()
      .onChange(async v => { s.graphNodeScale = v; await onChange(); }));

  new Setting(pane)
    .setName("Link thickness")
    .setDesc("Stroke weight of connection lines (0.5× – 3×)")
    .addSlider(sl => sl.setLimits(0.5, 3.0, 0.1).setValue(s.graphLinkThickness ?? 1.0).setDynamicTooltip()
      .onChange(async v => { s.graphLinkThickness = v; await onChange(); }));
}

function renderPaneLayout(
  pane: HTMLElement,
  s: TegenlichtSettings,
  onChange: () => Promise<void>,
): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Pane layout" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Reading view width + margins, card + border scalars, colourful frame opacity, stacked-tab tuning. Every slider writes a CSS var the theme consumes." });

  // ── Reading view ──
  new Setting(pane)
    .setName("Line width")
    .setDesc("Width of the note column in reading view (400–1200px)")
    .addSlider(sl => sl.setLimits(400, 1200, 10).setValue(s.fileLineWidth ?? 700).setDynamicTooltip()
      .onChange(async v => { s.fileLineWidth = v; await onChange(); }));

  new Setting(pane)
    .setName("Margins")
    .setDesc("Horizontal margins around the note column (0–120px)")
    .addSlider(sl => sl.setLimits(0, 120, 1).setValue(s.fileMargins ?? 40).setDynamicTooltip()
      .onChange(async v => { s.fileMargins = v; await onChange(); }));

  new Setting(pane)
    .setName("Preview width")
    .setDesc("Preview pane width as % of reading view (40–100%)")
    .addSlider(sl => sl.setLimits(40, 100, 1).setValue(s.previewWidthPct ?? 88).setDynamicTooltip()
      .onChange(async v => { s.previewWidthPct = v; await onChange(); }));

  // ── Cards & borders ──
  new Setting(pane)
    .setName("Card radius")
    .setDesc("Corner radius on card-style tiles (0–24px)")
    .addSlider(sl => sl.setLimits(0, 24, 1).setValue(s.cardRadius ?? 8).setDynamicTooltip()
      .onChange(async v => { s.cardRadius = v; await onChange(); }));

  new Setting(pane)
    .setName("Border radius")
    .setDesc("Corner radius on framed containers (0–20px)")
    .addSlider(sl => sl.setLimits(0, 20, 1).setValue(s.borderRadius ?? 6).setDynamicTooltip()
      .onChange(async v => { s.borderRadius = v; await onChange(); }));

  new Setting(pane)
    .setName("Border padding")
    .setDesc("Padding inside framed containers (0–20px)")
    .addSlider(sl => sl.setLimits(0, 20, 1).setValue(s.borderPadding ?? 4).setDynamicTooltip()
      .onChange(async v => { s.borderPadding = v; await onChange(); }));

  new Setting(pane)
    .setName("Colorful frame opacity")
    .setDesc("Opacity of the colourful window-frame accent (0–1, only effective when the frame is on)")
    .addSlider(sl => sl.setLimits(0, 1, 0.05).setValue(s.colorfulFrameOpacity ?? 1).setDynamicTooltip()
      .onChange(async v => { s.colorfulFrameOpacity = v; await onChange(); }));

  new Setting(pane)
    .setName("Card padding")
    .setDesc("Padding inside each card tile (0–32px — Cards layout only)")
    .addSlider(sl => sl.setLimits(0, 32, 1).setValue(s.cardLayoutPadding ?? 10).setDynamicTooltip()
      .onChange(async v => { s.cardLayoutPadding = v; await onChange(); }));

  new Setting(pane)
    .setName("Card header padding")
    .setDesc("Left padding on card headers (0–40px — Cards layout only)")
    .addSlider(sl => sl.setLimits(0, 40, 1).setValue(s.cardHeaderLeftPadding ?? 20).setDynamicTooltip()
      .onChange(async v => { s.cardHeaderLeftPadding = v; await onChange(); }));

  // ── Stacked tabs ──
  new Setting(pane)
    .setName("Stacked tab header")
    .setDesc("Header width for stacked tabs (20–120px)")
    .addSlider(sl => sl.setLimits(20, 120, 1).setValue(s.stackedHeaderWidth ?? 40).setDynamicTooltip()
      .onChange(async v => { s.stackedHeaderWidth = v; await onChange(); }));

  new Setting(pane)
    .setName("Stacked pane multiplier")
    .setDesc("Stacked pane width multiplier (0.5× – 3×)")
    .addSlider(sl => sl.setLimits(0.5, 3, 0.1).setValue(s.tabStackedPaneWidth ?? 1).setDynamicTooltip()
      .onChange(async v => { s.tabStackedPaneWidth = v; await onChange(); }));
}

export function build(
  containerEl: HTMLElement,
  plugin: TegenlichtControlsPlugin,
  onChange: () => Promise<void>,
): () => void {
  const s = plugin.settings;
  const wrap = containerEl.createDiv("tc-workspace-wrap");

  const sections: LeftRailSection[] = [
    { id: "filetree",   label: "File tree",       count: 4,  render: pane => renderFileTree(pane, s, onChange) },
    { id: "rainbow",    label: "Rainbow folders", count: 10, render: pane => renderRainbow(pane, s, onChange) },
    { id: "graph",      label: "Graph",           count: 4,  render: pane => renderGraph(pane, s, onChange) },
    { id: "panelayout", label: "Pane layout",     count: 11, render: pane => renderPaneLayout(pane, s, onChange) },
  ];

  const shellCleanup = buildLeftRailShell(wrap, sections, "workspace");
  return () => shellCleanup();
}

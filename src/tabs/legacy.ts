import TegenlichtControlsPlugin from "../main";
import { buildLeftRailShell, LeftRailSection } from "./_shared";

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
  pane.createEl("p", { cls: "tc-empty-hint", text: "Controls incoming — Task 7." });
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
  pane.createEl("p", { cls: "tc-empty-hint", text: "Controls incoming — Task 7." });
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

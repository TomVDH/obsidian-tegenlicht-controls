import TegenlichtControlsPlugin from "../main";
import { TegenlichtSettings } from "../settings";

type BoolKey = {
  [K in keyof TegenlichtSettings]: TegenlichtSettings[K] extends boolean ? K : never
}[keyof TegenlichtSettings];

interface ToggleItem {
  key: BoolKey;
  label: string;
  desc?: string;
  previewId?: string;
  previewUrls?: { on: string; off: string }; // direct-URL preview variant
}

interface SelectItem {
  kind: "select";
  key: keyof TegenlichtSettings;
  label: string;
  options: { label: string; value: string }[];
}

type GroupItem = ToggleItem | SelectItem;

interface FeatureGroup {
  icon: string;
  label: string;
  items: GroupItem[];
}

const GROUPS: FeatureGroup[] = [
  {
    icon: "🗂", label: "Workspace",
    items: [
      // Note: rainbow folders moved to Appearance tab (rainbowStyle picker).
      // The legacy `rainbowFileBrowser` boolean is migrated automatically.
      // previewId references are stripped until PNGs ship — otherwise each
      // settings-pane open sprays 404s in the console.
      { key: "fileIcons",          label: "File icons",           desc: "Icons per file type" },
      { key: "collapseFolderIcons",label: "Collapse folder icons",desc: "Custom icons for collapsed folders" },
      { key: "colorfulFrame",      label: "Colorful frame",       desc: "Accent-coloured window frame" },
      { key: "customVaultTitle",   label: "Custom vault title" },
    ],
  },
  {
    icon: "🧩", label: "Elements",
    items: [
      { key: "customCheckboxes", label: "Custom checkboxes" },
      { key: "cardsMinimal",     label: "Cards (minimal)",   desc: "Card-style note previews" },
      { key: "rainbowTags",      label: "Rainbow tags" },
      { key: "metadataButton",   label: "Metadata button" },
      { key: "metadataMods",     label: "Metadata mods",     desc: "Frontmatter display tweaks" },
      { key: "speechBubbles",    label: "Speech bubbles",    desc: "Render task-list items as bubble-styled blocks" },
      { key: "printStyling",     label: "Print styling",     desc: "Apply dedicated formatting for print / export" },
      { key: "pdfBlendLight",    label: "PDF blend (light)", desc: "Blend PDF viewer background with the editor in light mode" },
      { key: "pdfBlendDark",     label: "PDF blend (dark)",  desc: "Blend PDF viewer background with the editor in dark mode" },
      // Wave 6 — workspace toggles.
      { key: "canvasDarkBg",     label: "Darker canvas backdrop", desc: "Use a darker background for Obsidian canvases" },
      { key: "bgFix",            label: "Workspace bg fix",  desc: "Repaint fix for translucent / colourful backdrops" },
      { key: "hideBorders",      label: "Hide pane borders", desc: "Remove Obsidian's internal pane-frame borders" },
      { key: "cardShadows",      label: "Card shadows",      desc: "Drop shadow on card tiles (requires Cards layout)" },
    ],
  },
  {
    icon: "✏️", label: "Editor",
    items: [
      { key: "inlineTitle",         label: "Inline title",          desc: "Show note title inline at the top" },
      { key: "activeLineHighlight", label: "Active line highlight",  desc: "Highlight the current cursor line" },
      { key: "codeblockLineNumbers",label: "Codeblock line numbers", desc: "Line numbers inside code blocks" },
      { key: "floatingTitle",       label: "Floating title",         desc: "Float the vault title in the nav" },
      {
        kind: "select" as const,
        key: "tabStyle" as keyof TegenlichtSettings,
        label: "Tab style",
        options: [
          { label: "Default",           value: "anp-default-tab" },
          { label: "Depth",             value: "anp-depth-tab-toggle" },
          { label: "Minimalistic",      value: "anp-mini-tab-toggle" },
          { label: "Safari (Animated)", value: "anp-alternate-tab-toggle" },
          { label: "Safari (Vanilla)",  value: "anp-safari-tab-toggle" },
        ],
      },
    ],
  },
  {
    icon: "👁", label: "Show / Hide",
    items: [
      { key: "showRibbon",     label: "Ribbon" },
      { key: "showScrollbars", label: "Scrollbars" },
      { key: "showStatusBar",  label: "Status bar" },
      { key: "showVaultName",  label: "Vault name" },
    ],
  },
  {
    icon: "🔌", label: "Plugin support",
    items: [
      { key: "itsCallouts", label: "ITS Theme callouts" },
      { key: "kanban",      label: "Kanban" },
      { key: "calendar",    label: "Calendar" },
    ],
  },
];

function buildToggleRow(
  container: HTMLElement,
  item: ToggleItem,
  plugin: TegenlichtControlsPlugin,
  onChange: () => Promise<void>,
): void {
  const row = container.createDiv("tc-feat-row");
  const info = row.createDiv("tc-feat-info");
  info.createSpan({ text: item.label, cls: "tc-feat-name" });
  if (item.desc) info.createDiv({ text: item.desc, cls: "tc-feat-desc" });

  const toggle = row.createDiv("tc-toggle");
  if (plugin.settings[item.key]) toggle.addClass("tc-toggle--on");

  // Optional URL-based preview — created once, swapped on toggle
  let urlPreview: HTMLImageElement | null = null;
  if (item.previewUrls) {
    const wrap = container.createDiv("tc-feat-preview tc-feat-preview--demo");
    urlPreview = wrap.createEl("img", { cls: "tc-feat-preview-img" });
    const on = plugin.settings[item.key] as boolean;
    urlPreview.src = on ? item.previewUrls.on : item.previewUrls.off;
    urlPreview.alt = `${item.label} preview`;
    urlPreview.style.opacity = on ? "1" : "0.35";
  }

  toggle.addEventListener("click", async () => {
    (plugin.settings[item.key] as boolean) = !(plugin.settings[item.key] as boolean);
    const on = plugin.settings[item.key] as boolean;
    toggle.toggleClass("tc-toggle--on", on);
    await onChange();
    if (item.previewId) {
      const img = container.querySelector<HTMLImageElement>(
        `[data-preview-id="${item.previewId}"]`,
      );
      if (img) {
        img.src = `app://obsidian.md/plugins/tegenlicht-controls/assets/previews/${item.previewId}-${on ? "on" : "off"}.png`;
      }
    }
    if (urlPreview && item.previewUrls) {
      urlPreview.src = on ? item.previewUrls.on : item.previewUrls.off;
      urlPreview.style.opacity = on ? "1" : "0.35";
    }
  });

  if (item.previewId) {
    const previewWrap = container.createDiv("tc-feat-preview");
    const img = previewWrap.createEl("img", { cls: "tc-feat-preview-img" });
    img.setAttribute("data-preview-id", item.previewId);
    const state = plugin.settings[item.key] ? "on" : "off";
    img.src = `app://obsidian.md/plugins/tegenlicht-controls/assets/previews/${item.previewId}-${state}.png`;
    img.alt = `${item.label} (${state})`;
    // Many previewIds reference PNGs we haven't shipped yet. Hide the
    // wrapper entirely on load-error so we don't paint a broken-image
    // icon OR spam the console with 404s whenever the settings pane opens.
    img.addEventListener("error", () => previewWrap.remove(), { once: true });
  }
}

function buildSelectRow(
  container: HTMLElement,
  item: SelectItem,
  plugin: TegenlichtControlsPlugin,
  onChange: () => Promise<void>,
): void {
  const row = container.createDiv("tc-feat-row");
  row.createSpan({ text: item.label, cls: "tc-feat-name" });
  const select = row.createEl("select", { cls: "tc-feat-select" });
  item.options.forEach(opt => {
    const o = select.createEl("option", { text: opt.label, value: opt.value });
    if ((plugin.settings[item.key] as string) === opt.value) o.selected = true;
  });
  select.addEventListener("change", async () => {
    (plugin.settings as unknown as Record<string, unknown>)[item.key as string] = select.value;
    await onChange();
  });
}

// Session-scoped accordion state — keyed by group label so the user's
// open/close choice survives a redisplay() rebuild. Default: only the
// FIRST group is open on first load (consistent with other tabs).
const accordionOpen: Record<string, boolean> = {};

export function build(
  containerEl: HTMLElement,
  plugin: TegenlichtControlsPlugin,
  onChange: () => Promise<void>,
): void {
  GROUPS.forEach((group, idx) => {
    // First time this group is built in this session, default it to open
    // only if it's the top one. Subsequent rebuilds preserve user choice.
    if (!(group.label in accordionOpen)) {
      accordionOpen[group.label] = idx === 0;
    }
    const isOpen = accordionOpen[group.label];
    const groupEl = containerEl.createDiv(
      "tc-feat-group" + (isOpen ? " tc-feat-group--open" : ""),
    );

    const header = groupEl.createDiv("tc-feat-header");
    const title  = header.createDiv("tc-feat-title");
    title.createSpan({ text: group.icon, cls: "tc-feat-icon" });
    title.createSpan({ text: ` ${group.label}` });
    const meta = header.createDiv("tc-feat-meta");
    meta.createSpan({ text: String(group.items.length), cls: "tc-feat-badge" });
    meta.createSpan({ text: "▶", cls: "tc-feat-chevron" });
    header.addEventListener("click", () => {
      accordionOpen[group.label] = !accordionOpen[group.label];
      groupEl.toggleClass("tc-feat-group--open", accordionOpen[group.label]);
    });

    const body = groupEl.createDiv("tc-feat-body");
    group.items.forEach(item => {
      if ("kind" in item && item.kind === "select") {
        buildSelectRow(body, item, plugin, onChange);
      } else {
        buildToggleRow(body, item as ToggleItem, plugin, onChange);
      }
    });
  });
}

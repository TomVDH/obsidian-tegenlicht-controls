import { Modal, setIcon } from "obsidian";
import TegenlichtControlsPlugin from "./main";
import { build as buildAppearance } from "./tabs/appearance";
import { build as buildTypography } from "./tabs/typography";
import { build as buildEditing }    from "./tabs/editing";
import { build as buildLayout }     from "./tabs/layout";
import { build as buildFeatures }   from "./tabs/features";
import { build as buildLegacy }     from "./tabs/legacy";
import { build as buildLab }        from "./tabs/lab";

type Tab = "appearance" | "typography" | "editing" | "layout" | "features" | "legacy" | "lab";

const TABS: { id: Tab; label: string }[] = [
  { id: "appearance", label: "Appearance" },
  { id: "typography", label: "Typography" },
  { id: "editing",    label: "Editing"    },
  { id: "layout",     label: "Layout"     },
  { id: "features",   label: "Features"   },
  { id: "legacy",     label: "Legacy"     },
  { id: "lab",        label: "Lab"        },
];

/**
 * A non-blocking, draggable floating panel with the same settings UI as
 * the main Settings tab. Opens from the ribbon icon so the user can tweak
 * values while continuing to read/write in Obsidian.
 *
 * Implementation notes:
 *  - Extends Obsidian's Modal for lifecycle + escape-key-to-close, but
 *    strips the backdrop so clicks pass through to Obsidian behind it.
 *  - Drag handle = the panel's title bar. Plain mouse events; no libs.
 *  - Re-uses the existing per-tab build() functions so the two entry
 *    points (full Settings tab, floating panel) stay in perfect sync.
 */
export class TegenlichtQuickPanel extends Modal {
  private plugin: TegenlichtControlsPlugin;
  private activeTab: Tab = "appearance";
  private cleanup:   (() => void) | null = null;
  private contentArea: HTMLElement | null = null;
  private tabBtns: Map<Tab, HTMLElement> = new Map();

  constructor(plugin: TegenlichtControlsPlugin) {
    super(plugin.app);
    this.plugin = plugin;
  }

  onOpen(): void {
    // Strip Obsidian's default modal chrome — we want a floating card,
    // not a blocking dialog. The backdrop is made transparent and
    // click-through so Obsidian remains interactive behind the panel.
    this.containerEl.addClass("tc-quick-container");
    this.modalEl.addClass("tc-quick-modal", "tc-settings");

    // Signal to the global stylesheet to blur + dim the workspace so
    // the panel reads as the current focal point. CSS handles the fade.
    document.body.addClass("tc-quick-panel-open");

    const { contentEl, modalEl } = this;
    contentEl.empty();

    // ── Title bar (drag handle) ───────────────────────────────────
    // Create first, then reinsert before the content so it's the first
    // flex child of the modal (flex-direction: column, so it's on top).
    const titleBar = modalEl.createDiv("tc-quick-titlebar");
    modalEl.insertBefore(titleBar, modalEl.firstChild);

    titleBar.createSpan({ cls: "tc-quick-icon", text: "◈" });
    titleBar.createSpan({ cls: "tc-quick-title", text: "Tegenlicht Controls" });
    titleBar.createSpan({ cls: "tc-quick-spacer" });

    // Blur toggle — round, same visual language as the close button.
    // Water-drop icon (Lucide `droplet`) toggles the body class that
    // blurs + dims the workspace behind the panel. Active state = accent
    // outline, so users can tell at a glance whether the focal dim is on.
    const blurBtn = titleBar.createEl("button", { cls: "tc-quick-blur-toggle" });
    blurBtn.setAttribute("aria-label", "Toggle workspace blur");
    setIcon(blurBtn, "droplet");
    const syncBlurBtn = () => {
      const on = document.body.hasClass("tc-quick-panel-open");
      blurBtn.toggleClass("tc-quick-blur-toggle--on", on);
      blurBtn.setAttribute("title", on ? "Disable workspace blur" : "Enable workspace blur");
    };
    syncBlurBtn();
    blurBtn.addEventListener("click", () => {
      document.body.toggleClass("tc-quick-panel-open", !document.body.hasClass("tc-quick-panel-open"));
      syncBlurBtn();
    });

    // Gear → opens Obsidian's full Settings modal and navigates directly
    // to this plugin's tab. Closes the QuickPanel first so the user ends
    // up in the big settings screen rather than stacked dialogs.
    const settingsBtn = titleBar.createEl("button", { cls: "tc-quick-blur-toggle" });
    settingsBtn.setAttribute("aria-label", "Open full settings");
    settingsBtn.setAttribute("title", "Open full settings");
    setIcon(settingsBtn, "settings");
    settingsBtn.addEventListener("click", () => {
      this.close();
      // `app.setting` is internal — typed as any. Guard both calls in
      // case Obsidian's API shape changes on future releases.
      const setting = (this.plugin.app as any).setting;
      try {
        setting?.open?.();
        setting?.openTabById?.(this.plugin.manifest.id);
      } catch (err) {
        console.warn("[tegenlicht-controls] could not open full settings", err);
      }
    });

    // Close button with Lucide-style SVG X so it matches Obsidian's icon
    // language rather than sitting as a raw unicode glyph.
    const closeBtn = titleBar.createEl("button", { cls: "tc-quick-close" });
    closeBtn.setAttribute("aria-label", "Close panel");
    closeBtn.setAttribute("title", "Close");
    closeBtn.innerHTML = `<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
      <path d="M3 3 L13 13 M13 3 L3 13"/>
    </svg>`;
    closeBtn.addEventListener("click", () => this.close());

    this.installDragHandler(titleBar, modalEl);

    // ── Tab bar ───────────────────────────────────────────────────
    const tabBar = contentEl.createDiv("tc-quick-tabs");
    this.tabBtns.clear();
    TABS.forEach(({ id, label }) => {
      const btn = tabBar.createEl("button", { text: label, cls: "tc-quick-tab" });
      if (id === this.activeTab) btn.addClass("tc-quick-tab--active");
      this.tabBtns.set(id, btn);
      btn.addEventListener("click", () => {
        if (id === this.activeTab) return;
        this.tabBtns.forEach(b => b.removeClass("tc-quick-tab--active"));
        btn.addClass("tc-quick-tab--active");
        this.activeTab = id;
        this.renderContent();
      });
    });

    // ── Content area ──────────────────────────────────────────────
    this.contentArea = contentEl.createDiv("tc-quick-body");
    this.renderContent();
  }

  onClose(): void {
    this.cleanup?.();
    this.cleanup = null;
    this.dragCleanup?.();
    this.dragCleanup = null;
    this.contentEl.empty();
    document.body.removeClass("tc-quick-panel-open");
  }

  /** Swap the content area for the active tab — reuses the same
   *  build functions as the full Settings screen so the two UIs stay
   *  in step without duplication. */
  private renderContent(): void {
    this.cleanup?.();
    this.cleanup = null;
    if (!this.contentArea) return;

    this.contentArea.empty();
    const onChange  = () => this.plugin.saveSettings();
    const redisplay = () => this.renderContent();

    switch (this.activeTab) {
      case "appearance":
        this.cleanup = buildAppearance(this.contentArea, this.plugin, onChange, redisplay);
        break;
      case "typography": buildTypography(this.contentArea, this.plugin, onChange, redisplay); break;
      case "editing":    buildEditing(this.contentArea, this.plugin, onChange);    break;
      case "layout":     buildLayout(this.contentArea, this.plugin, onChange);     break;
      case "features":   buildFeatures(this.contentArea, this.plugin, onChange);   break;
      case "legacy":     this.cleanup = buildLegacy(this.contentArea, this.plugin, onChange, redisplay); break;
      case "lab":        this.cleanup = buildLab(this.contentArea, this.plugin, onChange, redisplay); break;
    }
  }

  /** Simple mouse-drag handler on the title bar. Tracks offset from
   *  the initial click point so the panel doesn't jump to cursor. */
  private dragCleanup: (() => void) | null = null;

  private installDragHandler(handle: HTMLElement, target: HTMLElement): void {
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let dragging = false;

    const onMouseDown = (e: MouseEvent) => {
      // Don't start dragging when clicking the close button
      if ((e.target as HTMLElement).closest(".tc-quick-close")) return;
      dragging = true;
      const rect = target.getBoundingClientRect();
      dragOffsetX = e.clientX - rect.left;
      dragOffsetY = e.clientY - rect.top;
      handle.addClass("tc-quick-dragging");
      e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      const x = e.clientX - dragOffsetX;
      const y = e.clientY - dragOffsetY;
      target.style.left = `${Math.max(0, x)}px`;
      target.style.top  = `${Math.max(0, y)}px`;
      target.style.right = "auto";
      target.style.margin = "0";
    };

    const onMouseUp = () => {
      if (!dragging) return;
      dragging = false;
      handle.removeClass("tc-quick-dragging");
    };

    handle.addEventListener("mousedown", onMouseDown);
    // Listen on window so drag continues even if cursor leaves the handle
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup",   onMouseUp);

    // Store cleanup for onClose()
    this.dragCleanup = () => {
      handle.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup",   onMouseUp);
    };
  }
}

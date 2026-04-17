import { App, PluginSettingTab, Notice, setIcon } from "obsidian";
import TegenlichtControlsPlugin from "./main";
import { DEFAULT_SETTINGS } from "./settings";
import { build as buildAppearance } from "./tabs/appearance";
import { build as buildTypography } from "./tabs/typography";
import { build as buildEditing }    from "./tabs/editing";
import { build as buildLayout }     from "./tabs/layout";
import { build as buildFeatures }   from "./tabs/features";

type Tab = "appearance" | "typography" | "editing" | "layout" | "features";

const TABS: { id: Tab; label: string }[] = [
  { id: "appearance", label: "Appearance" },
  { id: "typography", label: "Typography" },
  { id: "editing",    label: "Editing"    },
  { id: "layout",     label: "Layout"     },
  { id: "features",   label: "Features"   },
];

const TAB_STYLES: { id: string; label: string }[] = [
  { id: "switch",        label: "Switch"    },
  { id: "switch-amber",  label: "Amber"     },
  { id: "underline",     label: "Underline" },
  { id: "ghost",         label: "Ghost"     },
];

export class TegenlichtSettingsTab extends PluginSettingTab {
  private activeTab: Tab = "appearance";
  private cleanup:   (() => void) | null = null;
  private contentEl: HTMLElement | null  = null;
  private tabBtns:   Map<Tab, HTMLElement> = new Map();
  /** Cleanup callbacks registered by per-render helpers (e.g. reset-all
   *  button's document-level listeners). Drained on every display() rebuild
   *  and on hide(). */
  private disposers: (() => void)[] = [];

  constructor(app: App, public plugin: TegenlichtControlsPlugin) {
    super(app, plugin);
  }

  /** Full shell rebuild — called once on open and on explicit reloads. */
  display(): void {
    this.cleanup?.();
    this.cleanup = null;
    // Drain any per-display disposers (reset-all listeners, etc.) before
    // we rebuild and register fresh ones.
    this.disposers.splice(0).forEach(fn => { try { fn(); } catch(_) {} });

    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass("tc-settings");
    this.applyTabStyle(containerEl);
    this.applyTabSpacing(containerEl);

    // ── Header ────────────────────────────────────────────
    const header = containerEl.createDiv("tc-header");
    const top = header.createDiv("tc-header-top");
    const wm   = top.createDiv("tc-header-wordmark");
    const icon = wm.createSpan({ cls: "tc-header-icon", text: "◈" });
    const nameBrand = wm.createSpan({ cls: "tc-header-name-brand", text: "Tegenlicht" });
    // Subtitle — tracked spaced small-caps reading "Settings Companion",
    // sits beside the wordmark so the header tells you what this is without
    // needing a second line.
    wm.createSpan({ cls: "tc-header-subtitle", text: "Settings Companion" });

    // ── Easter egg: double-click ◈ for accent-colour shimmer
    icon.addEventListener("dblclick", () => {
      if (nameBrand.hasClass("tc-name-shimmer")) return;
      nameBrand.addClass("tc-name-shimmer");
      nameBrand.addEventListener("animationend",
        () => nameBrand.removeClass("tc-name-shimmer"),
        { once: true });
    });

    // Spacer pushes the version badge to the far right of the top row
    top.createSpan({ cls: "tc-header-top-spacer" });
    top.createSpan({ cls: "tc-header-badge", text: "v0.7.4" });

    const tagline = header.createDiv("tc-header-tagline");
    tagline.createSpan({ text: "A bespoke collection of Obsidian quality of life and appearance settings. Inspired by and forked from " });
    const link = tagline.createEl("a", { text: "AnuPuccin's theme", href: "https://github.com/AnubisNekhet/AnuPuccin" });
    link.setAttr("target", "_blank");
    link.setAttr("rel", "noopener");
    tagline.createSpan({ text: "." });
    tagline.createSpan({ cls: "tc-header-copy-sep tc-header-tagline-sep", text: "·" });
    tagline.createSpan({ cls: "tc-header-tagline-sig", text: "Spun up by Onnozelaer" });

    // Rainbow colour bar — 25%-width Catppuccin gradient. Lives once in
    // the header between the tagline and the footer copy row (promoted
    // from a per-tab element so the visual divider reads as a panel-level
    // flourish, not a tab-level one).
    header.createDiv("tc-color-bar tc-color-bar--header");

    // Footer row — GitHub · License · Acknowledgements
    const copy = header.createDiv("tc-header-copy");

    // GitHub icon-link
    const ghLink = copy.createEl("a", {
      cls: "tc-header-gh",
      href: "https://github.com/tomlinson/obsidian-tegenlicht-controls",
    });
    ghLink.setAttr("target", "_blank");
    ghLink.setAttr("rel", "noopener");
    ghLink.setAttr("aria-label", "View on GitHub");
    ghLink.setAttr("title", "View on GitHub");
    ghLink.innerHTML = `<svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
    </svg>`;

    // Pip separator between GitHub logo and licence (TODO: confirm licence —
    // label reflects current placeholder; will resolve to GPL-3 or MIT later)
    copy.createSpan({ cls: "tc-header-copy-sep", text: "·" });

    const licenceLink = copy.createEl("a", {
      text: "GPL-3 / MIT",
      href: "https://github.com/tomlinson/obsidian-tegenlicht-controls/blob/main/LICENSE",
    });
    licenceLink.setAttr("target", "_blank");
    licenceLink.setAttr("rel", "noopener");
    licenceLink.setAttr("title", "Licence — final choice TBD");
    copy.createSpan({ cls: "tc-header-copy-sep", text: "·" });

    const ackLink = copy.createEl("a", {
      text: "Acknowledgements",
      href: "https://github.com/tomlinson/obsidian-tegenlicht-controls#acknowledgements",
    });
    ackLink.setAttr("target", "_blank");
    ackLink.setAttr("rel", "noopener");

    // ── Tab bar ───────────────────────────────────────────
    this.tabBtns.clear();
    const tabBar = containerEl.createDiv("tc-tab-bar");

    // Segmented style wraps buttons in an inner div
    const btnParent = containerEl.hasClass("tc-tabs-segment")
      ? tabBar.createDiv("tc-tab-inner-wrap")
      : tabBar;

    TABS.forEach(({ id, label }) => {
      const btn = btnParent.createEl("button", { text: label, cls: "tc-tab" });
      if (id === this.activeTab) btn.addClass("tc-tab--active");
      this.tabBtns.set(id, btn);
      btn.addEventListener("click", () => {
        if (id === this.activeTab) return;
        this.tabBtns.forEach(b => b.removeClass("tc-tab--active"));
        btn.addClass("tc-tab--active");
        this.activeTab = id;
        this.renderContent();
      });
    });

    // ── Right-aligned reset-all button ────────────────────
    // Double-click model: first click "arms" the button (accent outline,
    // tooltip changes). Second click while armed resets every setting
    // to DEFAULT_SETTINGS. Auto-disarms after 4 seconds or on outside click.
    this.installResetAllButton(tabBar);

    // ── Content area (never rebuilt on tab switch) ────────
    this.contentEl = containerEl.createDiv("tc-tab-content");
    this.renderContent();
  }

  /** Swap only the content area — no header/tab bar teardown, no flicker. */
  private renderContent(): void {
    this.cleanup?.();
    this.cleanup = null;
    if (!this.contentEl) return;

    // Preserve scroll position across the rebuild so flipping a switch
    // doesn't jerk the view back to the top of the tab.
    const scroller = this.contentEl.closest('.vertical-tab-content, .modal-content') as HTMLElement | null;
    const savedScrollTop = scroller?.scrollTop ?? 0;

    this.contentEl.empty();
    const onChange  = () => this.plugin.saveSettings();
    const redisplay = () => this.renderContent();

    switch (this.activeTab) {
      case "appearance":
        this.cleanup = buildAppearance(this.contentEl, this.plugin, onChange, redisplay);
        break;
      case "typography": buildTypography(this.contentEl, this.plugin, onChange, redisplay); break;
      case "editing":    buildEditing(this.contentEl, this.plugin, onChange);    break;
      case "layout":     buildLayout(this.contentEl, this.plugin, onChange);     break;
      case "features":   buildFeatures(this.contentEl, this.plugin, onChange);   break;
    }

    // Restore scroll after the new DOM has laid out
    if (scroller && savedScrollTop > 0) {
      requestAnimationFrame(() => { scroller.scrollTop = savedScrollTop; });
    }
  }

  /** Right-aligned "reset all settings" button in the tab bar.
   *  Requires two clicks — one to arm (outline appears, hint fades in),
   *  one to commit. Auto-disarms after 4 seconds idle or on any outside
   *  click/escape. */
  private installResetAllButton(tabBar: HTMLElement): void {
    const spacer = tabBar.createDiv("tc-tab-bar-spacer");
    spacer.style.flex = "1";

    // Hint — fades in to the LEFT of the button when armed, so the user
    // knows the second click is the committing one. Always in the DOM;
    // CSS opacity + transform gate the transition.
    const hint = tabBar.createSpan({
      cls: "tc-reset-all-hint",
      text: "Click again to reset all settings.",
    });

    const resetBtn = tabBar.createEl("button", { cls: "tc-circle-btn tc-reset-all-btn" });
    resetBtn.setAttribute("title", "Reset all settings to defaults");
    resetBtn.setAttribute("aria-label", "Reset all settings to defaults");
    // Lucide `rotate-ccw` — same icon as every other reset in the plugin.
    setIcon(resetBtn, "rotate-ccw");

    let armed = false;
    let disarmTimer: number | null = null;

    const disarm = () => {
      armed = false;
      resetBtn.removeClass("tc-reset-all-btn--armed");
      hint.removeClass("tc-reset-all-hint--visible");
      resetBtn.setAttribute("title", "Reset all settings to defaults");
      if (disarmTimer !== null) {
        window.clearTimeout(disarmTimer);
        disarmTimer = null;
      }
    };

    const arm = () => {
      armed = true;
      resetBtn.addClass("tc-reset-all-btn--armed");
      hint.addClass("tc-reset-all-hint--visible");
      resetBtn.setAttribute("title", "Click again to confirm reset");
      // Auto-disarm so the armed state doesn't sit forever
      disarmTimer = window.setTimeout(disarm, 4000);
    };

    const performReset = async () => {
      Object.assign(this.plugin.settings, DEFAULT_SETTINGS);
      await this.plugin.saveSettings();
      new Notice("Tegenlicht Controls — all settings reset to defaults");
      this.display(); // full rebuild so the UI reflects defaults
    };

    resetBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (armed) {
        disarm();
        performReset();
      } else {
        arm();
      }
    });

    // Any click outside the button (while armed) disarms
    const outsideHandler = (e: MouseEvent) => {
      if (!armed) return;
      if (e.target instanceof Node && !resetBtn.contains(e.target)) disarm();
    };
    document.addEventListener("click", outsideHandler);

    // Escape key disarms
    const escHandler = (e: KeyboardEvent) => {
      if (armed && e.key === "Escape") disarm();
    };
    document.addEventListener("keydown", escHandler);

    // Clean up listeners on next display() or on hide()
    this.disposers.push(() => {
      document.removeEventListener("click", outsideHandler);
      document.removeEventListener("keydown", escHandler);
      if (disarmTimer !== null) window.clearTimeout(disarmTimer);
    });
  }

  /** Write --tc-tab-gap CSS variable so pill + segment tabs pick it up live. */
  private applyTabSpacing(el: HTMLElement): void {
    el.style.setProperty("--tc-tab-gap", `${this.plugin.settings.tabBarSpacing ?? 6}px`);
  }

  /** Apply the correct CSS class for the chosen tab style. */
  private applyTabStyle(el: HTMLElement): void {
    // Remap any legacy or retired style to switch
    const active = TAB_STYLES.map(s => s.id);
    if (!active.includes(this.plugin.settings.tabBarStyle ?? '')) {
      this.plugin.settings.tabBarStyle = 'switch';
      this.plugin.saveSettings();
    }
    el.removeClass(
      // New set
      "tc-tabs-switch", "tc-tabs-switch-amber",
      "tc-tabs-underline", "tc-tabs-ghost",
      // Retired pill variants
      "tc-tabs-pill", "tc-tabs-pill-soft", "tc-tabs-pill-ghost",
      "tc-tabs-pill-frost", "tc-tabs-pill-tint", "tc-tabs-pill-frosttint",
      "tc-tabs-pill-mono",
      "tc-tabs-pill-glow", "tc-tabs-pill-sweep", "tc-tabs-pill-gradient",
      "tc-tabs-pill-lifted", "tc-tabs-pill-dot", "tc-tabs-pill-inset",
      "tc-tabs-pill-neon", "tc-tabs-pill-duo", "tc-tabs-pill-flat",
      "tc-tabs-pill-pop", "tc-tabs-pill-shimmer", "tc-tabs-pill-badge",
      "tc-tabs-pill-dark", "tc-tabs-pill-pulse", "tc-tabs-pill-lineunder",
      // Retired line variants
      "tc-tabs-line", "tc-tabs-line-thick", "tc-tabs-line-fat",
      "tc-tabs-line-glow", "tc-tabs-line-grad", "tc-tabs-line-top",
      "tc-tabs-line-fill", "tc-tabs-line-cap", "tc-tabs-line-grow",
      "tc-tabs-line-dots", "tc-tabs-line-sweep", "tc-tabs-line-highlight",
      "tc-tabs-line-side", "tc-tabs-line-over", "tc-tabs-line-pill",
      "tc-tabs-line-neon", "tc-tabs-line-double", "tc-tabs-line-bracket",
      "tc-tabs-line-bold", "tc-tabs-line-float", "tc-tabs-line-frosttint",
      "tc-tabs-underline-thick",
      // Retired segment variants
      "tc-tabs-seg", "tc-tabs-seg-soft", "tc-tabs-seg-ghost",
      "tc-tabs-seg-frost", "tc-tabs-seg-tint", "tc-tabs-seg-frosttint",
      "tc-tabs-seg-mono",
      "tc-tabs-seg-accent", "tc-tabs-seg-border", "tc-tabs-seg-sweep",
      "tc-tabs-seg-pill", "tc-tabs-seg-glow", "tc-tabs-seg-grad",
      "tc-tabs-seg-inset", "tc-tabs-seg-flat", "tc-tabs-seg-dot",
      "tc-tabs-seg-neon", "tc-tabs-seg-minimal", "tc-tabs-seg-sharp",
      "tc-tabs-seg-outline", "tc-tabs-seg-gradwrap", "tc-tabs-seg-split",
      "tc-tabs-seg-thick", "tc-tabs-seg-badge",
    );
    el.addClass(`tc-tabs-${this.plugin.settings.tabBarStyle ?? 'switch'}`);
  }

  hide(): void {
    this.cleanup?.();
    this.cleanup = null;
    this.disposers.splice(0).forEach(fn => { try { fn(); } catch(_) {} });
  }
}

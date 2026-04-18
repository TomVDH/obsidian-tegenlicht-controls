import { Plugin } from "obsidian";
import { TegenlichtSettings, DEFAULT_SETTINGS } from "./settings";
import { apply, remove } from "./applier";
import { TegenlichtSettingsTab } from "./settings-tab";
// QuickPanel disabled (2026-04-17) — floating panel needs graceful mobile
// handling before it re-ships. Kept in the codebase for a dedicated refine
// branch. Import left commented so grep still finds the call site.
// import { TegenlichtQuickPanel } from "./quick-panel";
import { ALL_FLAVOURS } from "./flavours";
import { registerPreviewPluginRef } from "./preview-sample";

// v0.1 → v0.2 used wrong class names for extended flavours.
// Map any stale saved class to its current equivalent.
const FLAVOUR_MIGRATIONS: Record<string, string> = {
  'ctp-rose-pine':      'ctp-rosepine-dark',
  'ctp-rose-pine-dawn': 'ctp-rosepine-light',
  'ctp-amoled':         'ctp-amoled-dark',
  'ctp-atom':           'ctp-atom-dark',
  'ctp-biscuit':        'ctp-biscuit-dark',
  'ctp-coffee':         'ctp-coffee-dark',
  'ctp-everforest':     'ctp-everforest-dark',
  'ctp-flexoki':        'ctp-flexoki-dark',
  'ctp-generic':        'ctp-generic-dark',
  'ctp-gruvbox':        'ctp-gruvbox-dark',
  'ctp-kanagawa':       'ctp-kanagawa-dark',
  'ctp-material-mint':  'ctp-material-mint-dark',
  'ctp-nord':           'ctp-nord-dark',
  'ctp-notion':         'ctp-notion-dark',
  'ctp-solarized':      'ctp-solarized-dark',
  'ctp-luminescence':   'ctp-luminescence-light',
  'ctp-sandy-beaches':  'ctp-sandy-beaches-light',
};

function migrateFlavour(cls: string, fallback: string): string {
  if (FLAVOUR_MIGRATIONS[cls]) return FLAVOUR_MIGRATIONS[cls];
  if (ALL_FLAVOURS.some(f => f.cls === cls)) return cls;
  return fallback;
}

export default class TegenlichtControlsPlugin extends Plugin {
  settings: TegenlichtSettings = { ...DEFAULT_SETTINGS };

  async onload(): Promise<void> {
    await this.loadSettings();
    apply(this.settings);
    // Hand the preview module a live settings reference so its
    // light/dark mode toggle can re-run the applier (which writes the
    // matching flavour class on body for the new theme).
    registerPreviewPluginRef(this.settings);
    this.addSettingTab(new TegenlichtSettingsTab(this.app, this));

    // Ribbon icon + QuickPanel disabled (2026-04-17). The floating
    // panel's mobile layout needs work before it re-ships. Restore
    // by uncommenting the import at the top of this file and the
    // addRibbonIcon block below in the mobile-refine branch.
    // this.addRibbonIcon('diamond', 'Tegenlicht Controls', () => {
    //   new TegenlichtQuickPanel(this).open();
    // });

    // Re-apply when Obsidian switches dark/light mode so the correct flavour class is active
    this.registerEvent(
      this.app.workspace.on('css-change', () => apply(this.settings))
    );
  }

  onunload(): void {
    remove();
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    // Heal any stale/legacy flavour class names from older plugin versions
    this.settings.darkFlavour  = migrateFlavour(this.settings.darkFlavour,  'ctp-mocha');
    this.settings.lightFlavour = migrateFlavour(this.settings.lightFlavour, 'ctp-latte');
    // tabBarStyle migration — any value outside the supported set
    // collapses to 'text' (the new default).
    const VALID_TAB_STYLES = new Set(['text', 'switch', 'switch-amber', 'underline', 'ghost']);
    if (!VALID_TAB_STYLES.has(this.settings.tabBarStyle)) {
      this.settings.tabBarStyle = 'text';
    }
    // One-shot migration to promote existing 'glow' saves to the new
    // 'glow-b' default so users inherit the upgraded treatment without
    // having to flip the picker manually. Only runs once, then respects
    // any subsequent explicit pick (including switching back to 'glow').
    if (!this.settings.tabActiveStyleMigratedV1) {
      if (this.settings.tabActiveStyle === 'glow') {
        this.settings.tabActiveStyle = 'glow-b';
      }
      this.settings.tabActiveStyleMigratedV1 = true;
      await this.saveData(this.settings);
    }
  }

  async saveSettings(): Promise<void> {
    // Apply FIRST so UI updates are instant; persist SECOND so the
    // iCloud-backed vault's slow disk write doesn't stall the visible
    // feedback. Every caller that writes a setting + calls this
    // expects the visual to update live (accent preset dots, custom
    // Pickr drags, flavour swaps, slider drags, etc.). The await on
    // saveData stays so callers that chain on the promise still know
    // when the disk write finished.
    apply(this.settings);
    await this.saveData(this.settings);
  }
}

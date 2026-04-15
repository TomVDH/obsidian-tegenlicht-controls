import { Plugin } from "obsidian";
import { TegenlichtSettings, DEFAULT_SETTINGS } from "./settings";
import { apply, remove } from "./applier";
import { TegenlichtSettingsTab } from "./settings-tab";
import { TegenlichtQuickPanel } from "./quick-panel";
import { ALL_FLAVOURS } from "./flavours";

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
    this.addSettingTab(new TegenlichtSettingsTab(this.app, this));

    // Ribbon icon — diamond (Lucide). Click opens a floating, draggable
    // QuickPanel so the user can tweak settings while staying inside
    // their workspace (the full Settings screen blocks Obsidian, which
    // defeats the purpose of quick iteration).
    this.addRibbonIcon('diamond', 'Tegenlicht Controls', () => {
      new TegenlichtQuickPanel(this).open();
    });

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
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
    apply(this.settings);
  }
}

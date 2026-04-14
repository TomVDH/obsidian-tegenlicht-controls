import TegenlichtControlsPlugin from "../main";

interface FlavourEntry {
  label: string;
  cls: string;
  base: string;    // hex for gradient left
  surface: string; // hex for gradient right
  accent: string;  // hex for accent dot
}

const DARK_BASE: FlavourEntry[] = [
  { label: "Mocha",     cls: "ctp-mocha",     base: "#1e1e2e", surface: "#313244", accent: "#e5b32a" },
  { label: "Mocha Old", cls: "ctp-mocha-old",  base: "#1e1e2e", surface: "#45475a", accent: "#cba6f7" },
  { label: "Macchiato", cls: "ctp-macchiato",  base: "#24273a", surface: "#363a4f", accent: "#f5a97f" },
  { label: "Frappé",    cls: "ctp-frappe",     base: "#303446", surface: "#414559", accent: "#ca9ee6" },
  { label: "Rosé Pine", cls: "ctp-rose-pine",  base: "#191724", surface: "#403d52", accent: "#f6c177" },
];

const DARK_EXTENDED: FlavourEntry[] = [
  { label: "AMOLED",        cls: "ctp-amoled",        base: "#000000", surface: "#1a1a1a", accent: "#cba6f7" },
  { label: "Atom",          cls: "ctp-atom",           base: "#282c34", surface: "#353b45", accent: "#e5c07b" },
  { label: "Biscuit",       cls: "ctp-biscuit",        base: "#1c1917", surface: "#292524", accent: "#d4a96a" },
  { label: "Coffee",        cls: "ctp-coffee",         base: "#221a0f", surface: "#2e2015", accent: "#c8945a" },
  { label: "Dracula",       cls: "ctp-dracula",        base: "#282a36", surface: "#44475a", accent: "#ff79c6" },
  { label: "Everforest",    cls: "ctp-everforest",     base: "#2d353b", surface: "#343f44", accent: "#a7c080" },
  { label: "Flexoki",       cls: "ctp-flexoki",        base: "#1c1b1a", surface: "#282726", accent: "#d0a215" },
  { label: "Generic",       cls: "ctp-generic",        base: "#1a1a2e", surface: "#16213e", accent: "#0f3460" },
  { label: "Gruvbox",       cls: "ctp-gruvbox",        base: "#282828", surface: "#3c3836", accent: "#d79921" },
  { label: "Kanagawa",      cls: "ctp-kanagawa",       base: "#1f1f28", surface: "#2a2a37", accent: "#957fb8" },
  { label: "Material Mint", cls: "ctp-material-mint",  base: "#263238", surface: "#314549", accent: "#80cbc4" },
  { label: "Nord",          cls: "ctp-nord",           base: "#2e3440", surface: "#3b4252", accent: "#88c0d0" },
  { label: "Nord Darker",   cls: "ctp-nord-darker",    base: "#242831", surface: "#2e3440", accent: "#5e81ac" },
  { label: "Notion",        cls: "ctp-notion",         base: "#191919", surface: "#202020", accent: "#e5b32a" },
  { label: "Rosebox",       cls: "ctp-rosebox",        base: "#1a1626", surface: "#241e33", accent: "#e4a0bc" },
  { label: "Royal Velvet",  cls: "ctp-royal-velvet",   base: "#1a0a2e", surface: "#2a1040", accent: "#c084fc" },
  { label: "Solarized",     cls: "ctp-solarized",      base: "#002b36", surface: "#073642", accent: "#268bd2" },
  { label: "Thorns",        cls: "ctp-thorns",         base: "#1a1a1a", surface: "#242424", accent: "#b5e853" },
];

const LIGHT_BASE: FlavourEntry[] = [
  { label: "Latte",       cls: "ctp-latte",          base: "#eff1f5", surface: "#ccd0da", accent: "#e5b32a" },
  { label: "Rosé Pine",   cls: "ctp-rose-pine-dawn", base: "#faf4ed", surface: "#f2e9e1", accent: "#ea9d34" },
];

const LIGHT_EXTENDED: FlavourEntry[] = [
  { label: "Atom",          cls: "ctp-atom-light",          base: "#f8f8f8", surface: "#e8e8e8", accent: "#e5c07b" },
  { label: "Everforest",    cls: "ctp-everforest-light",    base: "#fdf6e3", surface: "#efecd7", accent: "#8da101" },
  { label: "Gruvbox",       cls: "ctp-gruvbox-light",       base: "#fbf1c7", surface: "#ebdbb2", accent: "#b57614" },
  { label: "Luminescence",  cls: "ctp-luminescence",        base: "#f5f5f5", surface: "#e0e0e0", accent: "#4a90e2" },
  { label: "Material Mint", cls: "ctp-material-mint-light", base: "#eceff1", surface: "#cfd8dc", accent: "#80cbc4" },
  { label: "Nord",          cls: "ctp-nord-light",          base: "#eceff4", surface: "#e5e9f0", accent: "#5e81ac" },
  { label: "Notion",        cls: "ctp-notion-light",        base: "#ffffff", surface: "#f7f6f3", accent: "#e5b32a" },
  { label: "Sandy Beaches", cls: "ctp-sandy-beaches",       base: "#fdf6e3", surface: "#f0e6c8", accent: "#c47a0e" },
  { label: "Solarized",     cls: "ctp-solarized-light",     base: "#fdf6e3", surface: "#eee8d5", accent: "#268bd2" },
];

const ACCENT_PRESETS = [
  { label: "Yellow", hex: "#e5b32a" },
  { label: "Mauve",  hex: "#cba6f7" },
  { label: "Blue",   hex: "#89b4fa" },
  { label: "Green",  hex: "#a6e3a1" },
  { label: "Red",    hex: "#f38ba8" },
];

function buildSwatchGrid(
  container: HTMLElement,
  flavours: FlavourEntry[],
  current: string,
  onSelect: (cls: string) => Promise<void>,
): void {
  const grid = container.createDiv("tc-swatch-grid");
  flavours.forEach(f => {
    const sw = grid.createDiv("tc-swatch");
    sw.style.background = `linear-gradient(135deg, ${f.base} 60%, ${f.surface} 60%)`;
    if (f.cls === current) sw.addClass("tc-swatch--active");
    sw.setAttribute("title", f.label);
    const dot = sw.createDiv("tc-swatch-dot");
    dot.style.background = f.accent;
    sw.addEventListener("click", () => onSelect(f.cls));
  });
}

export function build(
  containerEl: HTMLElement,
  plugin: TegenlichtControlsPlugin,
  onChange: () => Promise<void>,
  redisplay?: () => void,
): void {
  const s = plugin.settings;
  const refresh = async () => {
    await onChange();
    // Re-render to update active swatch and extended grid state
    redisplay?.();
  };

  // ── Dark Flavours ──────────────────────────────────────
  containerEl.createEl("h3", { text: "Dark Flavour", cls: "tc-section-title" });
  buildSwatchGrid(containerEl, DARK_BASE, s.darkFlavour, async cls => {
    s.darkFlavour = cls;
    await refresh();
  });

  const extDarkRow = containerEl.createDiv("tc-extend-row");
  extDarkRow.createSpan({ text: "Show extended dark flavours" });
  const extDarkTog = extDarkRow.createEl("input", { type: "checkbox" });
  extDarkTog.checked = s.showExtendedDark;
  extDarkTog.addEventListener("change", async () => {
    s.showExtendedDark = extDarkTog.checked;
    await refresh();
  });

  if (s.showExtendedDark) {
    buildSwatchGrid(containerEl, DARK_EXTENDED, s.darkFlavour, async cls => {
      s.darkFlavour = cls;
      await refresh();
    });
  }

  // ── Light Flavours ─────────────────────────────────────
  containerEl.createEl("h3", { text: "Light Flavour", cls: "tc-section-title" });
  buildSwatchGrid(containerEl, LIGHT_BASE, s.lightFlavour, async cls => {
    s.lightFlavour = cls;
    await refresh();
  });

  const extLightRow = containerEl.createDiv("tc-extend-row");
  extLightRow.createSpan({ text: "Show extended light flavours" });
  const extLightTog = extLightRow.createEl("input", { type: "checkbox" });
  extLightTog.checked = s.showExtendedLight;
  extLightTog.addEventListener("change", async () => {
    s.showExtendedLight = extLightTog.checked;
    await refresh();
  });

  if (s.showExtendedLight) {
    buildSwatchGrid(containerEl, LIGHT_EXTENDED, s.lightFlavour, async cls => {
      s.lightFlavour = cls;
      await refresh();
    });
  }

  // ── Accent Colour ──────────────────────────────────────
  containerEl.createEl("h3", { text: "Accent Colour", cls: "tc-section-title" });
  const accentRow = containerEl.createDiv("tc-accent-row");

  ACCENT_PRESETS.forEach(({ label, hex }) => {
    const dot = accentRow.createDiv("tc-accent-dot");
    dot.style.background = hex;
    if (s.accentColour === hex) dot.addClass("tc-accent-dot--active");
    dot.setAttribute("title", label);
    dot.addEventListener("click", async () => {
      s.accentColour = hex;
      await refresh();
    });
  });

  // Custom colour picker
  const customDot = accentRow.createDiv("tc-accent-dot tc-accent-dot--custom");
  customDot.style.background = s.accentColour;
  const colorInput = accentRow.createEl("input", { type: "color" });
  colorInput.value = s.accentColour;
  colorInput.style.display = "none";
  colorInput.addEventListener("input", async () => {
    s.accentColour = colorInput.value;
    customDot.style.background = colorInput.value;
    await onChange();
  });
  customDot.addEventListener("click", () => colorInput.click());
}

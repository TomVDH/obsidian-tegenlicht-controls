export interface FlavourEntry {
  label: string;
  cls: string;
  base: string;    // hex — main background and swatch gradient left
  surface: string; // hex — raised surface and swatch gradient right
  accent: string;  // hex — default accent for this flavour
  isExtended?: boolean; // needs anp-theme-ext-dark/light companion class
}

// Aspirational swatch values — the applier injects these as --ctp-custom-*
// overrides so picking a swatch forces the theme to look like the swatch
// promised, even where the upstream SCSS palette differs.

// ─────────────────────────────────────────────────────────────────────────
// BASE lineup — the Low Countries tour. Mechelen + Maneblusser sit at the
// apex, Brussels is the premium pair, then one Flemish flavour per colour
// family to round out the spectrum. Catppuccin's original set moves to
// EXTENDED (it still works identically via the custom-var injection).
// ─────────────────────────────────────────────────────────────────────────

export const DARK_BASE: FlavourEntry[] = [
  { label: "Bonheiden",        cls: "tc-bonheiden",        base: "#0f0d13", surface: "#1b1924", accent: "#d4a84c" }, // ★★★ apex dark — evening over the Dijle valley
  { label: "Maneblusser",      cls: "tc-maneblusser",      base: "#12141a", surface: "#1e2128", accent: "#e8eaf0" }, // ★★
  { label: "Brussels · Nacht", cls: "tc-brussels-nacht",   base: "#0e0c1a", surface: "#1a1630", accent: "#e5b32a" }, // ★
  { label: "Antwerpen",        cls: "tc-antwerpen",        base: "#0f1728", surface: "#16213a", accent: "#6494d8" },
  { label: "Leuven",           cls: "tc-leuven",           base: "#1a2420", surface: "#243129", accent: "#7ec89d" },
  { label: "Hasselt",          cls: "tc-hasselt",          base: "#221a0f", surface: "#322213", accent: "#d48a3a" },
];

export const LIGHT_BASE: FlavourEntry[] = [
  { label: "Lange Veldstraat", cls: "tc-lange-veldstraat", base: "#f2edd8", surface: "#e3d8be", accent: "#3a6b46" }, // ★★★ apex light — sun on the long fields of Bonheiden
  { label: "Mechelen",         cls: "tc-mechelen",         base: "#f6f1e6", surface: "#e5dcc2", accent: "#ce1126" }, // ★★ — heraldic gules (Berthout red, Pantone 186)
  { label: "Brussels",         cls: "tc-brussels",         base: "#f2ede2", surface: "#ddd0b5", accent: "#d4a017" }, // ★
  { label: "Brugge",           cls: "tc-brugge",           base: "#faf6ec", surface: "#eee5c9", accent: "#c4912a" },
  { label: "Knokke",           cls: "tc-knokke",           base: "#eff5ee", surface: "#dde6d9", accent: "#5a9478" },
  { label: "Delft",            cls: "tc-delft",            base: "#eff3f7", surface: "#dae3ed", accent: "#5578a8" },
];

// ─────────────────────────────────────────────────────────────────────────
// EXTENDED lineup — original Catppuccin + AnuPuccin palettes kept here
// for anyone who wants them. Also holds the Low Countries alternates
// (Gent, Aalst, Oostende, Ronse, Diest, Liège, Namur, Charleroi, Kortrijk,
// Lier, Tournai, Dinant, Haarlem, Maastricht, Utrecht, Amsterdam) so the
// full tour is still reachable from the picker.
// ─────────────────────────────────────────────────────────────────────────

export const DARK_EXTENDED: FlavourEntry[] = [
  // ── Low Countries alternates (dark) ───────────────────────────────────
  { label: "Gent",          cls: "tc-gent",                isExtended: true, base: "#181818", surface: "#242424", accent: "#d4a96a" },
  { label: "Aalst",         cls: "tc-aalst",               isExtended: true, base: "#1a1028", surface: "#26163a", accent: "#c47ad8" },
  { label: "Oostende",      cls: "tc-oostende",            isExtended: true, base: "#1f1a15", surface: "#2c251c", accent: "#d4a97a" },
  { label: "Ronse",         cls: "tc-ronse",               isExtended: true, base: "#1d0f12", surface: "#2b1519", accent: "#c9526d" },
  { label: "Diest",         cls: "tc-diest",               isExtended: true, base: "#1c232c", surface: "#2a323d", accent: "#7aa5c4" },
  { label: "Liège",         cls: "tc-liege",               isExtended: true, base: "#1a1c1e", surface: "#272a2d", accent: "#d65a2c" },
  { label: "Namur",         cls: "tc-namur",               isExtended: true, base: "#20232a", surface: "#2b2f38", accent: "#a39268" },
  { label: "Charleroi",     cls: "tc-charleroi",           isExtended: true, base: "#121212", surface: "#1e1e1e", accent: "#c97f2e" },
  { label: "Amsterdam",     cls: "tc-amsterdam",           isExtended: true, base: "#1a1e24", surface: "#242932", accent: "#d4882c" },
  // ── Catppuccin dark base (now extended) ───────────────────────────────
  { label: "Mocha",         cls: "ctp-mocha",              isExtended: true, base: "#1e1e2e", surface: "#313244", accent: "#e5b32a" },
  { label: "Mocha Old",     cls: "ctp-mocha-old",          isExtended: true, base: "#1e1e2e", surface: "#45475a", accent: "#cba6f7" },
  { label: "Macchiato",     cls: "ctp-macchiato",          isExtended: true, base: "#24273a", surface: "#363a4f", accent: "#f5a97f" },
  { label: "Frappé",        cls: "ctp-frappe",             isExtended: true, base: "#303446", surface: "#414559", accent: "#ca9ee6" },
  // ── Original extended palettes ────────────────────────────────────────
  { label: "Rosé Pine",     cls: "ctp-rosepine-dark",      isExtended: true, base: "#191724", surface: "#403d52", accent: "#f6c177" },
  { label: "AMOLED",        cls: "ctp-amoled-dark",        isExtended: true, base: "#000000", surface: "#1a1a1a", accent: "#cba6f7" },
  { label: "Atom",          cls: "ctp-atom-dark",          isExtended: true, base: "#282c34", surface: "#353b45", accent: "#e5c07b" },
  { label: "Biscuit",       cls: "ctp-biscuit-dark",       isExtended: true, base: "#1c1917", surface: "#292524", accent: "#d4a96a" },
  { label: "Coffee",        cls: "ctp-coffee-dark",        isExtended: true, base: "#221a0f", surface: "#2e2015", accent: "#c8945a" },
  { label: "Dracula",       cls: "ctp-dracula",            isExtended: true, base: "#282a36", surface: "#44475a", accent: "#ff79c6" },
  { label: "Everforest",    cls: "ctp-everforest-dark",    isExtended: true, base: "#2d353b", surface: "#343f44", accent: "#a7c080" },
  { label: "Flexoki",       cls: "ctp-flexoki-dark",       isExtended: true, base: "#1c1b1a", surface: "#282726", accent: "#d0a215" },
  { label: "Generic",       cls: "ctp-generic-dark",       isExtended: true, base: "#1a1a2e", surface: "#16213e", accent: "#0f3460" },
  { label: "Gruvbox",       cls: "ctp-gruvbox-dark",       isExtended: true, base: "#282828", surface: "#3c3836", accent: "#d79921" },
  { label: "Kanagawa",      cls: "ctp-kanagawa-dark",      isExtended: true, base: "#1f1f28", surface: "#2a2a37", accent: "#957fb8" },
  { label: "Material Mint", cls: "ctp-material-mint-dark", isExtended: true, base: "#263238", surface: "#314549", accent: "#80cbc4" },
  { label: "Nord",          cls: "ctp-nord-dark",          isExtended: true, base: "#2e3440", surface: "#3b4252", accent: "#88c0d0" },
  { label: "Nord Darker",   cls: "ctp-nord-darker",        isExtended: true, base: "#242831", surface: "#2e3440", accent: "#5e81ac" },
  { label: "Notion",        cls: "ctp-notion-dark",        isExtended: true, base: "#191919", surface: "#202020", accent: "#e5b32a" },
  { label: "Rosebox",       cls: "ctp-rosebox",            isExtended: true, base: "#1a1626", surface: "#241e33", accent: "#e4a0bc" },
  { label: "Royal Velvet",  cls: "ctp-royal-velvet",       isExtended: true, base: "#1a0a2e", surface: "#2a1040", accent: "#c084fc" },
  { label: "Solarized",     cls: "ctp-solarized-dark",     isExtended: true, base: "#002b36", surface: "#073642", accent: "#268bd2" },
  { label: "An Other Ship", cls: "ctp-thorns",             isExtended: true, base: "#1a1a1a", surface: "#242424", accent: "#b5e853" },
];

export const LIGHT_EXTENDED: FlavourEntry[] = [
  // ── Low Countries alternates (light) ──────────────────────────────────
  { label: "Kortrijk",      cls: "tc-kortrijk",             isExtended: true, base: "#f3ede2", surface: "#e6dcc4", accent: "#a87d5a" },
  { label: "Lier",          cls: "tc-lier",                 isExtended: true, base: "#f8f1e3", surface: "#e8d9b8", accent: "#b8894a" },
  { label: "Tournai",       cls: "tc-tournai",              isExtended: true, base: "#f0e9d8", surface: "#ddd1ab", accent: "#8f6b36" },
  { label: "Dinant",        cls: "tc-dinant",               isExtended: true, base: "#f4f1e6", surface: "#e3d9ba", accent: "#c49134" },
  { label: "Maastricht",    cls: "tc-maastricht",           isExtended: true, base: "#f5f0f8", surface: "#e3d9ea", accent: "#8b6db8" },
  { label: "Haarlem",       cls: "tc-haarlem",              isExtended: true, base: "#fbf2f2", surface: "#ead2d2", accent: "#c47086" },
  { label: "Utrecht",       cls: "tc-utrecht",              isExtended: true, base: "#f8f3e9", surface: "#e9deba", accent: "#c28a1e" },
  // ── Catppuccin light base (now extended) ──────────────────────────────
  { label: "Latte",         cls: "ctp-latte",               isExtended: true, base: "#eff1f5", surface: "#ccd0da", accent: "#e5b32a" },
  { label: "Rosé Pine",     cls: "ctp-rosepine-light",      isExtended: true, base: "#faf4ed", surface: "#f2e9e1", accent: "#ea9d34" },
  // ── Original extended palettes ────────────────────────────────────────
  { label: "Atom",          cls: "ctp-atom-light",          isExtended: true, base: "#f8f8f8", surface: "#e8e8e8", accent: "#e5c07b" },
  { label: "Everforest",    cls: "ctp-everforest-light",    isExtended: true, base: "#fdf6e3", surface: "#efecd7", accent: "#8da101" },
  { label: "Gruvbox",       cls: "ctp-gruvbox-light",       isExtended: true, base: "#fbf1c7", surface: "#ebdbb2", accent: "#b57614" },
  { label: "Luminescence",  cls: "ctp-luminescence-light",  isExtended: true, base: "#f5f5f5", surface: "#e0e0e0", accent: "#4a90e2" },
  { label: "Material Mint", cls: "ctp-material-mint-light", isExtended: true, base: "#eceff1", surface: "#cfd8dc", accent: "#80cbc4" },
  { label: "Nord",          cls: "ctp-nord-light",          isExtended: true, base: "#eceff4", surface: "#e5e9f0", accent: "#5e81ac" },
  { label: "Notion",        cls: "ctp-notion-light",        isExtended: true, base: "#ffffff", surface: "#f7f6f3", accent: "#e5b32a" },
  { label: "Sandy Beaches", cls: "ctp-sandy-beaches-light", isExtended: true, base: "#fdf6e3", surface: "#f0e6c8", accent: "#c47a0e" },
  { label: "Solarized",     cls: "ctp-solarized-light",     isExtended: true, base: "#fdf6e3", surface: "#eee8d5", accent: "#268bd2" },
];

// Sub-groups for the extended grids — split by prefix so appearance.ts can
// render them in two labelled sections without changing the source arrays.
export const DARK_EXTENDED_TC  = DARK_EXTENDED.filter(f => f.cls.startsWith('tc-'));
export const DARK_EXTENDED_ANP = DARK_EXTENDED.filter(f => !f.cls.startsWith('tc-'));
export const LIGHT_EXTENDED_TC  = LIGHT_EXTENDED.filter(f => f.cls.startsWith('tc-'));
export const LIGHT_EXTENDED_ANP = LIGHT_EXTENDED.filter(f => !f.cls.startsWith('tc-'));

export const ALL_FLAVOURS: FlavourEntry[] = [
  ...DARK_BASE, ...DARK_EXTENDED, ...LIGHT_BASE, ...LIGHT_EXTENDED,
];

export const LEGACY_FLAVOUR_CLASSES = [
  'ctp-rose-pine', 'ctp-rose-pine-dawn',
  'ctp-amoled', 'ctp-atom', 'ctp-biscuit', 'ctp-coffee',
  'ctp-everforest', 'ctp-flexoki', 'ctp-generic',
  'ctp-gruvbox', 'ctp-kanagawa', 'ctp-material-mint',
  'ctp-nord', 'ctp-notion', 'ctp-solarized',
  'ctp-luminescence', 'ctp-sandy-beaches',
];

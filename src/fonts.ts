// Google Fonts — curated pairings + full-library loader.
// The plugin injects a <link rel="stylesheet"> pointing at the Google Fonts
// API whenever any non-empty font is active. Custom pairing lets the user
// type any Google Font family name and it loads on the fly.

export interface FontPairing {
  label: string;
  interface: string; // '' means keep system default
  heading:   string;
  mono:      string;
}

export const FONT_PAIRINGS: Record<string, FontPairing> = {
  "system": {
    label: "System",
    interface: "",
    heading: "",
    mono: "",
  },
  "modern-editorial": {
    label: "Modern Editorial",
    interface: "Inter",
    heading:   "Inter",
    mono:      "JetBrains Mono",
  },
  "serif-essay": {
    label: "Serif Essay",
    interface: "Inter",
    heading:   "Playfair Display",
    mono:      "JetBrains Mono",
  },
  "humanist": {
    label: "Humanist",
    interface: "Source Sans 3",
    heading:   "Source Serif 4",
    mono:      "Source Code Pro",
  },
  "swiss-modern": {
    label: "Swiss Modern",
    interface: "Inter",
    heading:   "Space Grotesk",
    mono:      "IBM Plex Mono",
  },
  "notebook": {
    label: "Notebook",
    interface: "Inter",
    heading:   "Fraunces",
    mono:      "Fira Code",
  },
  "plex": {
    label: "IBM Plex",
    interface: "IBM Plex Sans",
    heading:   "IBM Plex Serif",
    mono:      "IBM Plex Mono",
  },
  "warm-book": {
    label: "Warm Book",
    interface: "Merriweather Sans",
    heading:   "Merriweather",
    mono:      "Fira Code",
  },
  "custom": {
    label: "Custom",
    interface: "",
    heading: "",
    mono: "",
  },
};

const LINK_ID = "tegenlicht-google-fonts";

/** Remove the Google Fonts <link> from <head> if present. */
function removeLink(): void {
  document.getElementById(LINK_ID)?.remove();
}

/** Ensure a <link> in <head> points at the given Google Fonts URL. */
function ensureLink(href: string): void {
  let link = document.getElementById(LINK_ID) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.id = LINK_ID;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  if (link.href !== href) link.href = href;
}

/** Turn "Inter" / "Playfair Display" into Google Fonts URL component. */
function fontFamilyParam(name: string): string {
  // Each family requests 400 + 600 + 700 weights, both styles
  const familyPlus = name.trim().replace(/\s+/g, "+");
  return `family=${familyPlus}:ital,wght@0,400;0,600;0,700;1,400`;
}

/** Resolve the active (interface/heading/mono) triple from the pairing preset. */
export function resolveFonts(s: {
  fontPairing: string;
  fontCustomInterface: string;
  fontCustomHeading: string;
  fontCustomMono: string;
}): FontPairing {
  const pairing = FONT_PAIRINGS[s.fontPairing] ?? FONT_PAIRINGS.system;
  if (s.fontPairing === "custom") {
    return {
      label: "Custom",
      interface: (s.fontCustomInterface ?? "").trim(),
      heading:   (s.fontCustomHeading ?? "").trim(),
      mono:      (s.fontCustomMono ?? "").trim(),
    };
  }
  return pairing;
}

/** Load the active fonts (if any) and return CSS stack strings.
 *  Individual role fields (fontInterface / fontEditor / fontSource) take
 *  precedence over the pairing preset when non-empty.  */
export function applyFonts(s: {
  fontPairing: string;
  fontCustomInterface: string;
  fontCustomHeading: string;
  fontCustomMono: string;
  // Individual role overrides — optional for back-compat with callers
  fontInterface?: string;
  fontEditor?: string;
  fontSource?: string;
  googleFontsEnabled?: boolean;
}): { interfaceStack: string; headingStack: string; monoStack: string } {
  const pairing = resolveFonts(s);

  // Individual role fields take priority when explicitly set
  const ifc     = (s.fontInterface ?? "").trim() || pairing.interface;
  const heading = (s.fontEditor    ?? "").trim() || pairing.heading;
  const mono    = (s.fontSource    ?? "").trim() || pairing.mono;

  // Respect the Google Fonts master toggle — skip the <link> injection when off
  const gfEnabled = s.googleFontsEnabled !== false;
  const families = gfEnabled
    ? [ifc, heading, mono].filter(f => f && f.length > 0)
    : [];
  const unique = Array.from(new Set(families));

  if (unique.length === 0) {
    removeLink();
  } else {
    const href =
      "https://fonts.googleapis.com/css2?" +
      unique.map(fontFamilyParam).join("&") +
      "&display=swap";
    ensureLink(href);
  }

  return {
    interfaceStack: ifc     ? `"${ifc}", var(--font-interface-theme, sans-serif)` : "",
    headingStack:   heading ? `"${heading}", var(--font-text-theme, serif)`       : "",
    monoStack:      mono    ? `"${mono}", var(--font-monospace-theme, monospace)` : "",
  };
}

/** Tear it all down. */
export function removeFonts(): void {
  removeLink();
  const ds = document.documentElement.style;
  ds.removeProperty("--font-interface");
  ds.removeProperty("--tc-font-heading");
  ds.removeProperty("--tc-font-editor");
  ds.removeProperty("--font-monospace");
}

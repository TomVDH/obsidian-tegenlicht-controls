// Searchable font combobox. One input + one dropdown per role (Interface /
// Editor / Source). Sources:
//
//   1. "System default"           — always first option (empty string value).
//   2. Installed system fonts     — queryLocalFonts() on supported Chromium
//                                   builds; falls back to a curated list of
//                                   common cross-platform families.
//   3. Google Fonts catalog       — a curated 120-family subset covering
//                                   Sans, Serif, Mono, and Display. Only
//                                   shown when googleFontsEnabled is true.
//
// Typing in the input filters the combined list (case-insensitive substring).
// The current value can be anything the user types — pressing Enter or
// blurring commits whatever's in the input, even if not in the list. That's
// how advanced users paste obscure family names.
//
// The dropdown is scoped to the element, not body, so it doesn't stick
// around when the parent tab is re-rendered.

/** A curated slice of the Google Fonts catalog — popular + distinctive
 *  families across the four major classifications. Enough variety that
 *  users can search for real type rather than being stuck with presets,
 *  without pulling in all 1,500+ families. */
const GOOGLE_FONTS: string[] = [
  // ── Sans ────────────────────────────────────────────────────────
  "Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Source Sans 3",
  "Poppins", "Raleway", "Oswald", "PT Sans", "Noto Sans", "Ubuntu",
  "Work Sans", "Nunito", "Mulish", "DM Sans", "Figtree", "Outfit",
  "Plus Jakarta Sans", "Space Grotesk", "Manrope", "Lexend", "Onest",
  "Hanken Grotesk", "IBM Plex Sans", "Fira Sans", "Rubik", "Karla",
  "Barlow", "Cabin", "Quicksand", "Heebo", "Josefin Sans", "Titillium Web",
  "Exo 2", "Archivo", "Red Hat Display", "Chivo", "Bricolage Grotesque",
  "Geist", "Geist Sans", "Albert Sans", "Commissioner", "Public Sans",
  "Merriweather Sans",

  // ── Serif ───────────────────────────────────────────────────────
  "Playfair Display", "Merriweather", "Lora", "Crimson Text",
  "EB Garamond", "Cormorant Garamond", "Libre Baskerville", "PT Serif",
  "Source Serif 4", "Noto Serif", "Bitter", "Cardo", "Crimson Pro",
  "Frank Ruhl Libre", "Alegreya", "Zilla Slab", "Tinos", "Fraunces",
  "Spectral", "DM Serif Display", "Instrument Serif", "Newsreader",
  "IBM Plex Serif", "Libre Caslon Text", "Cormorant", "Prata",
  "Gentium Book Plus", "Lusitana",

  // ── Mono ────────────────────────────────────────────────────────
  "JetBrains Mono", "Fira Code", "Source Code Pro", "IBM Plex Mono",
  "Roboto Mono", "Inconsolata", "Space Mono", "Courier Prime",
  "Anonymous Pro", "Ubuntu Mono", "PT Mono", "Cousine", "Cutive Mono",
  "Overpass Mono", "Share Tech Mono", "DM Mono", "Geist Mono",
  "Commit Mono",

  // ── Display / Handwriting ───────────────────────────────────────
  "Bebas Neue", "Abril Fatface", "Pacifico", "Caveat", "Dancing Script",
  "Permanent Marker", "Shadows Into Light", "Satisfy", "Lobster",
  "Righteous", "Bungee", "Monoton", "Alfa Slab One", "Kalam",
  "Courgette", "Great Vibes", "Homemade Apple",
];

/** Fallback list for when queryLocalFonts() is unavailable (older
 *  Chromium, non-Electron). Covers the common suspects across macOS,
 *  Windows, and Linux. */
const FALLBACK_SYSTEM_FONTS: string[] = [
  "Arial", "Helvetica", "Helvetica Neue", "Times New Roman", "Times",
  "Georgia", "Verdana", "Trebuchet MS", "Palatino", "Garamond",
  "Courier New", "Courier", "Consolas", "Menlo", "Monaco", "Menlo Regular",
  "San Francisco", "SF Pro", "SF Mono", "-apple-system",
  "Segoe UI", "Segoe UI Variable", "system-ui",
  "Gill Sans", "Optima", "Hoefler Text", "Baskerville", "Didot",
  "Tahoma", "Geneva", "Lucida Grande", "Copperplate",
];

/** Cached system-font list; populated once per session. Re-queried if
 *  the first load was empty (e.g. permission was denied at that moment). */
let _systemFontsCache: string[] | null = null;
let _systemFontsLoading = false;

async function loadSystemFonts(win: Window): Promise<string[]> {
  if (_systemFontsCache && _systemFontsCache.length) return _systemFontsCache;
  if (_systemFontsLoading) return _systemFontsCache ?? FALLBACK_SYSTEM_FONTS;
  _systemFontsLoading = true;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const q = (win as any).queryLocalFonts;
    if (typeof q === "function") {
      const fonts: { family: string }[] = await q();
      const seen = new Set<string>();
      const names: string[] = [];
      fonts.forEach(f => {
        if (!seen.has(f.family)) { seen.add(f.family); names.push(f.family); }
      });
      _systemFontsCache = names.sort((a, b) => a.localeCompare(b));
    }
  } catch {
    // Permission denied, unsupported, etc. — fall back silently.
  }

  if (!_systemFontsCache || _systemFontsCache.length === 0) {
    _systemFontsCache = [...FALLBACK_SYSTEM_FONTS].sort((a, b) => a.localeCompare(b));
  }
  _systemFontsLoading = false;
  return _systemFontsCache;
}

export interface FontComboboxOptions {
  container: HTMLElement;
  currentValue: string;
  includeGoogleFonts: boolean;
  placeholder?: string;
  onChange: (value: string) => Promise<void>;
}

/** Build a searchable font combobox inside `container`. Returns the wrapper
 *  element for any external styling hooks. */
export function buildFontCombobox(opts: FontComboboxOptions): HTMLElement {
  const { container, currentValue, includeGoogleFonts, placeholder, onChange } = opts;
  const win = container.ownerDocument.defaultView ?? window;

  const wrap = container.createDiv("tc-font-combobox");
  const input = wrap.createEl("input", { type: "text", cls: "tc-font-combobox-input" });
  // Single, neutral placeholder — no "+ Google fonts" noise. The catalog
  // scope is implied by the toggle above and the group labels in the list.
  input.placeholder = placeholder ?? "Search fonts…";
  input.value = currentValue;
  input.setAttribute("autocomplete", "off");
  input.setAttribute("spellcheck", "false");

  // Dropdown lives on <body> rather than inside the wrap, because the
  // Rhythm/Fonts accordion has `overflow: hidden` for rounded-corner
  // clipping — keeping the dropdown inside would clip it to the accordion
  // bounds. As a body-level fixed-position overlay it escapes every
  // overflow container cleanly. Coordinates are recomputed on each open
  // and on scroll so the dropdown tracks the input.
  // Because it's no longer inside the wrap, visibility can't be driven
  // by a descendant selector (.tc-font-combobox--open .tc-...-dropdown).
  // Toggle a class directly on the dropdown element instead.
  const doc = container.ownerDocument;
  const dropdown = doc.body.createDiv("tc-font-combobox-dropdown");
  dropdown.setAttribute("role", "listbox");

  let currentVal = currentValue;   // tracked separately from input.value so
                                   // the "selected" highlight survives typing
  let filter = "";
  let highlightedIdx = -1;
  let currentOptions: { label: string; value: string; group: string }[] = [];

  // Build the pool once per render; system fonts may still be loading.
  let systemFonts: string[] = FALLBACK_SYSTEM_FONTS;
  loadSystemFonts(win).then(names => {
    systemFonts = names;
    if (isOpen()) render();
  });

  const isOpen = () => wrap.hasClass("tc-font-combobox--open");

  /** Position the body-level dropdown flush under the input. Recomputed
   *  on open, scroll, and resize so the dropdown doesn't drift. */
  const positionDropdown = () => {
    const rect = input.getBoundingClientRect();
    dropdown.style.top    = `${rect.bottom + 4}px`;
    dropdown.style.left   = `${rect.left}px`;
    dropdown.style.width  = `${rect.width}px`;
  };

  const open = () => {
    // Close any other combobox dropdowns that might be open on the page
    // so only one ever shows at a time.
    doc.body.querySelectorAll(".tc-font-combobox-dropdown--open")
      .forEach(el => { if (el !== dropdown) el.removeClass("tc-font-combobox-dropdown--open"); });
    wrap.addClass("tc-font-combobox--open");
    dropdown.addClass("tc-font-combobox-dropdown--open");
    positionDropdown();
    render();
  };

  const close = () => {
    wrap.removeClass("tc-font-combobox--open");
    dropdown.removeClass("tc-font-combobox-dropdown--open");
    highlightedIdx = -1;
  };

  const commit = async (value: string) => {
    currentVal = value;
    input.value = value;
    filter = "";
    close();
    await onChange(value);
  };

  const buildOptions = (): typeof currentOptions => {
    const q = filter.trim().toLowerCase();
    const match = (name: string) => !q || name.toLowerCase().includes(q);

    const result: typeof currentOptions = [];
    if (!q || "system default".includes(q)) {
      result.push({ label: "System default", value: "", group: "System" });
    }
    systemFonts.filter(match).forEach(n =>
      result.push({ label: n, value: n, group: "Installed" }));
    if (includeGoogleFonts) {
      GOOGLE_FONTS.filter(match).forEach(n =>
        result.push({ label: n, value: n, group: "Google" }));
    }
    return result;
  };

  const render = () => {
    dropdown.empty();
    currentOptions = buildOptions().slice(0, 200);
    if (currentOptions.length === 0) {
      dropdown.createDiv({
        cls: "tc-font-combobox-empty",
        text: "No matches — press Enter to use as a custom name",
      });
      return;
    }

    let lastGroup = "";
    currentOptions.forEach((opt, idx) => {
      if (opt.group !== lastGroup) {
        dropdown.createDiv({ cls: "tc-font-combobox-group", text: opt.group });
        lastGroup = opt.group;
      }
      const row = dropdown.createDiv({ cls: "tc-font-combobox-option", text: opt.label });
      row.setAttribute("role", "option");
      row.setAttribute("data-idx", String(idx));
      if (opt.value === currentVal) row.addClass("tc-font-combobox-option--selected");
      if (idx === highlightedIdx) row.addClass("tc-font-combobox-option--highlighted");
      // Render each option in its own typeface so you SEE what you're picking
      if (opt.value) row.style.fontFamily = `"${opt.value}", var(--font-interface)`;
      row.addEventListener("mousedown", (e) => {
        e.preventDefault(); // prevent blur before click fires
        commit(opt.value);
      });
      row.addEventListener("mouseenter", () => {
        highlightedIdx = idx;
        refreshHighlight();
      });
    });
  };

  const refreshHighlight = () => {
    dropdown.querySelectorAll(".tc-font-combobox-option").forEach(el => {
      el.removeClass("tc-font-combobox-option--highlighted");
    });
    const target = dropdown.querySelector(`[data-idx="${highlightedIdx}"]`);
    if (target) {
      target.addClass("tc-font-combobox-option--highlighted");
      (target as HTMLElement).scrollIntoView({ block: "nearest" });
    }
  };

  // Focus: clear the filter so the full list is visible AND select all
  // text in the input so the next keystroke replaces the current value.
  // This is the standard autocomplete UX — typing shouldn't be restricted
  // by whatever's sitting in the input.
  input.addEventListener("focus", () => {
    filter = "";
    input.select();
    open();
  });

  input.addEventListener("input", () => {
    filter = input.value;
    highlightedIdx = -1;
    open();
  });

  input.addEventListener("keydown", (e) => {
    const max = currentOptions.length - 1;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen()) open();
      highlightedIdx = Math.min(max, highlightedIdx + 1);
      refreshHighlight();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      highlightedIdx = Math.max(0, highlightedIdx - 1);
      refreshHighlight();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIdx >= 0 && highlightedIdx <= max) {
        commit(currentOptions[highlightedIdx].value);
      } else {
        commit(input.value.trim());
      }
    } else if (e.key === "Escape") {
      // Esc reverts the input to the committed value and closes
      input.value = currentVal;
      filter = "";
      close();
      input.blur();
    }
  });

  // Blur closes + commits whatever is typed (with a small delay so option
  // mousedown events fire first). Fire-and-forget onChange.
  input.addEventListener("blur", () => {
    win.setTimeout(() => {
      close();
      const typed = input.value.trim();
      if (typed !== currentVal) {
        currentVal = typed;
        onChange(typed);
      }
    }, 150);
  });

  // Keep the dropdown pinned to the input if the user scrolls or resizes
  // while it's open. `capture: true` catches scrolls on inner containers.
  const onScroll = () => { if (isOpen()) positionDropdown(); };
  const onResize = () => { if (isOpen()) positionDropdown(); };
  win.addEventListener("scroll", onScroll, true);
  win.addEventListener("resize", onResize);

  // When the wrap element is removed from the DOM (tab re-render), tear
  // down the body-level dropdown too. MutationObserver watches the wrap's
  // parent chain; when wrap vanishes, we clean up.
  const cleanup = () => {
    dropdown.remove();
    win.removeEventListener("scroll", onScroll, true);
    win.removeEventListener("resize", onResize);
  };
  const observer = new MutationObserver(() => {
    if (!doc.contains(wrap)) {
      cleanup();
      observer.disconnect();
    }
  });
  observer.observe(doc.body, { childList: true, subtree: true });

  return wrap;
}

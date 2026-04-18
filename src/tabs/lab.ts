import { Setting } from "obsidian";
import Pickr from "@simonwep/pickr";
import TegenlichtControlsPlugin from "../main";
import {
  buildLeftRailShell,
  LeftRailSection,
  buildHorizontalTabs,
  buildCluster,
  buildSegmentSetting,
  buildColorToggleRow,
} from "./_shared";
import {
  buildTypographyPreview,
  buildCalloutPreview,
  buildEditingPreview,
} from "../preview-sample";

/**
 * Lab tab — sandbox for experimenting with two-axis navigation.
 *
 * Same left-rail shell as the Legacy tab, but each section's content
 * pane hosts a horizontal-tabs row at the top so the right side
 * subdivides further. Lets us A/B the pattern (deep vertical-only vs.
 * vertical+horizontal) in-product before committing.
 *
 * Settings shown here are dummy — they fire onChange callbacks that
 * write to a per-render scratch object, never persisted. Purpose is
 * purely visual / interaction; the controls just need to look real.
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

  // Scratch state for the dummy controls — never saved. Lets toggles /
  // sliders feel responsive without polluting plugin settings.
  const scratch: Record<string, unknown> = {};
  // Pickr instances created in the Editor accents section — collected
  // here for cleanup on tab teardown (Pickr leaks DOM if not destroyed).
  const pickrs: Pickr[] = [];

  const sections: LeftRailSection[] = [
    {
      id: "previews", label: "Previews", count: 3,
      render: pane => renderPreviews(pane),
    },
    {
      id: "tab-styles", label: "Tab styles", count: 12,
      render: pane => renderTabStyles(pane),
    },
    {
      id: "accordion-styles", label: "Accordion styles", count: 8,
      render: pane => renderAccordionStyles(pane),
    },
    {
      id: "switches", label: "Switches & inputs", count: 11,
      render: pane => renderSwitchesInputs(pane),
    },
    {
      id: "editor-accents", label: "Editor accents", count: 3,
      render: pane => renderEditorAccents(pane, s, refresh, pickrs),
    },
    {
      id: "interface", label: "Interface", count: 2,
      render: pane => renderInterface(pane, s, refresh),
    },
    {
      id: "layouts", label: "Layouts", count: 3,
      render: pane => renderSection(pane, "Layouts",
        "Three layout primitives — stack, grid, split. Pattern test for the horizontal sub-tabs row sitting at the top of the right pane.",
        [
          { id: "stack",  label: "Stack",  render: p => dummyControls(p, scratch, "stack",  ["Gap", "Padding", "Wrap"]) },
          { id: "grid",   label: "Grid",   render: p => dummyControls(p, scratch, "grid",   ["Columns", "Gap", "Auto-flow"]) },
          { id: "split",  label: "Split",  render: p => dummyControls(p, scratch, "split",  ["Direction", "Ratio", "Snap"]) },
        ],
      ),
    },
    {
      id: "components", label: "Components", count: 3,
      render: pane => renderSection(pane, "Components",
        "Reusable building blocks. The horizontal tabs swap which sub-component's controls show without leaving the section.",
        [
          { id: "card",   label: "Card",   render: p => dummyControls(p, scratch, "card",   ["Radius", "Elevation", "Padding"]) },
          { id: "button", label: "Button", render: p => dummyControls(p, scratch, "button", ["Variant", "Size", "Icon position"]) },
          { id: "pill",   label: "Pill",   render: p => dummyControls(p, scratch, "pill",   ["Tone", "Density"]) },
        ],
      ),
    },
    {
      id: "surfaces", label: "Surfaces", count: 3,
      render: pane => renderSection(pane, "Surfaces",
        "Material treatments. Mixes a pretty inset cluster with the horizontal tabs above to gauge how the two visual idioms cohabit.",
        [
          { id: "inset",   label: "Inset",   render: p => dummyControlsClustered(p, scratch, "inset",   "Inset card",   ["Depth", "Border opacity"]) },
          { id: "raised",  label: "Raised",  render: p => dummyControlsClustered(p, scratch, "raised",  "Raised card",  ["Elevation", "Halo"]) },
          { id: "frosted", label: "Frosted", render: p => dummyControlsClustered(p, scratch, "frosted", "Frosted card", ["Blur", "Saturation"]) },
        ],
      ),
    },
    {
      id: "inputs", label: "Inputs", count: 3,
      render: pane => renderSection(pane, "Inputs",
        "Form primitives. Tab-by-tab to see how the horizontal switcher reads when the underlying setting density changes.",
        [
          { id: "toggle", label: "Toggle", render: p => dummyControls(p, scratch, "toggle", ["Default state", "Animation"]) },
          { id: "slider", label: "Slider", render: p => dummyControls(p, scratch, "slider", ["Min", "Max", "Step"]) },
          { id: "text",   label: "Text",   render: p => dummyControls(p, scratch, "text",   ["Placeholder", "Max length"]) },
        ],
      ),
    },
  ];

  const shellCleanup = buildLeftRailShell(containerEl, sections, "lab");
  return () => {
    shellCleanup();
    pickrs.forEach(p => { try { p.destroyAndRemove(); } catch (_) { /* no-op */ } });
  };
}

// ─────────────────────────────────────────────────────────────────────
// Editor accents — three colour-toggle rows (Active line / Selection
// tint / Caret colour). Lifted from Appearance for sandbox iteration.
// Functional — writes directly to plugin settings.
// ─────────────────────────────────────────────────────────────────────
function renderEditorAccents(
  pane: HTMLElement,
  s: import("../settings").TegenlichtSettings,
  refresh: () => Promise<void>,
  pickrs: Pickr[],
): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Editor accents" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Per-element accent colours — overlay the editor with a tinted highlight, selection, or caret in your chosen accent. Each row pairs a colour swatch with an enable toggle." });

  const cluster = buildCluster(pane, "Editor accents");

  pickrs.push(buildColorToggleRow(cluster,
    "Active line", "Highlight the current cursor line in the editor",
    () => s.activeLineColour,
    v => { s.activeLineColour = v; },
    () => s.activeLineHighlight,
    v => { s.activeLineHighlight = v; },
    refresh,
  ));

  pickrs.push(buildColorToggleRow(cluster,
    "Selection tint", "Colour overlay applied to selected text",
    () => s.selectionTintColour,
    v => { s.selectionTintColour = v; },
    () => s.selectionTint,
    v => { s.selectionTint = v; },
    refresh,
  ));

  pickrs.push(buildColorToggleRow(cluster,
    "Caret colour", "Colour of the text insertion cursor",
    () => s.caretColour,
    v => { s.caretColour = v; },
    () => s.caretColourEnabled,
    v => { s.caretColourEnabled = v; },
    refresh,
  ));
}

// ─────────────────────────────────────────────────────────────────────
// Interface — tab style picker + tab spacing slider. Same controls
// as the Appearance → Workspace → Interface cluster, lifted to Lab
// for hands-on iteration.
// ─────────────────────────────────────────────────────────────────────
function renderInterface(
  pane: HTMLElement,
  s: import("../settings").TegenlichtSettings,
  refresh: () => Promise<void>,
): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Interface" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Top-tab navigation: which style and how much breathing room. The active style writes a body class (tc-tabs-{style}); the spacing slider writes --tc-tab-gap." });

  const cluster = buildCluster(pane, "Interface");

  buildSegmentSetting(cluster,
    "Tab style",
    "How the settings tab navigation renders",
    [
      { label: "Text",      value: "text"         },
      { label: "Switch",    value: "switch"       },
      { label: "Amber",     value: "switch-amber" },
      { label: "Underline", value: "underline"    },
      { label: "Ghost",     value: "ghost"        },
    ],
    s.tabBarStyle,
    async v => { s.tabBarStyle = v; await refresh(); },
  );

  new Setting(cluster)
    .setName("Tab spacing")
    .setDesc("Gap between tab buttons (0–16px)")
    .addSlider(sl => sl
      .setLimits(0, 16, 1)
      .setValue(s.tabBarSpacing ?? 6)
      .setDynamicTooltip()
      .onChange(async v => { s.tabBarSpacing = v; await refresh(); })
    );
}

/** Renders a section header + description + a horizontal-tabs row that
 *  swaps in different sub-content panes. */
function renderSection(
  pane: HTMLElement,
  title: string,
  desc: string,
  subTabs: { id: string; label: string; render: (pane: HTMLElement) => void }[],
): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: title });
  pane.createEl("p",  { cls: "tc-leftrail-secdesc", text: desc });
  buildHorizontalTabs(pane, subTabs);
}

/** Dummy toggles in the active sub-tab. Names come from the labels
 *  array; values write to the scratch object so re-rendering the
 *  same sub-tab re-reads the last value. */
function dummyControls(
  pane: HTMLElement,
  scratch: Record<string, unknown>,
  prefix: string,
  labels: string[],
): void {
  labels.forEach(label => {
    const key = `${prefix}.${label}`;
    new Setting(pane)
      .setName(label)
      .setDesc("Sandbox control — value lives only in memory for this session.")
      .addToggle(t => t
        .setValue(Boolean(scratch[key]))
        .onChange(v => { scratch[key] = v; })
      );
  });
}

/** Same as dummyControls but wrapped in a pretty inset cluster, so we
 *  can gauge how the cluster + horizontal-tabs combo reads. */
function dummyControlsClustered(
  pane: HTMLElement,
  scratch: Record<string, unknown>,
  prefix: string,
  clusterLabel: string,
  labels: string[],
): void {
  const cluster = buildCluster(pane, clusterLabel);
  dummyControls(cluster, scratch, prefix, labels);
}

// ─────────────────────────────────────────────────────────────────────
// Tab styles section — visual sandbox of top-tab styling variants.
//
// Each demo is a small mock tab bar with 4 fake tab buttons, the first
// active by default. Click any to swap. Pure visual showcase — does NOT
// touch the live tabBarStyle setting in Appearance. Lets us A/B
// different active-state treatments at a glance:
//   - Glow text  → current default (random off-centre radial bloom)
//   - Underline  → thin accent rule under the active tab
//   - Pill       → rounded accent fill
//   - Segment    → all-tabs-in-track, active is filled
//   - Cap        → small accent indicator above the active tab
// ─────────────────────────────────────────────────────────────────────
/** Lab → Previews — stack of every mini-Obsidian preview the plugin
 *  renders elsewhere (Typography, Callouts, Editing). Quick reference
 *  surface to compare them side-by-side and smoke-test new ones
 *  without hunting them down across tabs. */
function renderPreviews(pane: HTMLElement): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Previews" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Every mini-Obsidian preview the plugin ships, stacked for comparison. Re-uses the live build helpers — so changes to the preview content land here too." });

  const specs: { label: string; build: (p: HTMLElement) => void }[] = [
    { label: "Typography", build: buildTypographyPreview },
    { label: "Callouts",   build: buildCalloutPreview   },
    { label: "Editing",    build: buildEditingPreview   },
  ];
  specs.forEach(spec => {
    const slot = pane.createDiv("tc-mock-preview-slot");
    slot.createSpan({ cls: "tc-mock-tab-label", text: spec.label });
    const wrap = slot.createDiv("tc-mock-preview-wrap");
    spec.build(wrap);
  });
}

function renderTabStyles(pane: HTMLElement): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Tab styles" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Visual sandbox for top-tab styling experiments. Each row is a click-through demo — try them, see which one feels right. Live tab style still configured in Appearance." });

  // Existing five + B-variants experimenting with border treatments
  buildMockTabBar(pane, "Glow text",        "tc-mock--glow",       { glow: true });
  buildMockTabBar(pane, "Glow text B",      "tc-mock--glow-b",     { glow: true });
  buildMockTabBar(pane, "Underline",        "tc-mock--underline",  {});
  buildMockTabBar(pane, "Pill",             "tc-mock--pill",       {});
  buildMockTabBar(pane, "Pill B",           "tc-mock--pill-b",     {});
  buildMockTabBar(pane, "Segment",          "tc-mock--segment",    {});
  buildMockTabBar(pane, "Cap",              "tc-mock--cap",        {});
  // Container bloom + aura family
  buildMockTabBar(pane, "Container bloom",  "tc-mock--cbloom",     { containerBloom: true });
  buildMockTabBar(pane, "Aura",             "tc-mock--aura",       {});
  buildMockTabBar(pane, "Sliding indicator","tc-mock--slide",      { sliding: true });
  // Latest set
  buildMockTabBar(pane, "Spotlight",        "tc-mock--spot",       {});
  buildMockTabBar(pane, "Dual line",        "tc-mock--dual",       {});
  buildMockTabBar(pane, "Notch",            "tc-mock--notch",      {});
  buildMockTabBar(pane, "Dot indicator",    "tc-mock--dot",        {});
}

// ─────────────────────────────────────────────────────────────────────
// Accordion styles — 5 variants of the pretty-accordion shell, each
// exploring a different header layout, font treatment, chevron glyph,
// and accent-paint story (A/B/C accent-forward, C/D/E accent-free).
// Dummy rows inside so header rhythm can be judged against real
// content shape. Click headers to fold/unfold.
// ─────────────────────────────────────────────────────────────────────
function renderAccordionStyles(pane: HTMLElement): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Accordion styles" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Selected picks — eight accordion variants across Pretty (accent-forward) and Simple (neutral / mono). Scrapped: Slab / Bookmark / Ring / Float / Editorial / Marker / Hairline / Ledger / Compact." });

  // ── Pretty — accent-forward ──────────────────────────────
  pane.createEl("h4", { cls: "tc-lab-subhead", text: "Pretty" });

  buildMockAccordion(pane, {
    variant: "tc-mock-acc--pretty",
    title: "Pretty",
    quip: "Accent gradient fill + 1px accent border. All-caps subtitle, triangle chevron that rotates 90° on open. The baseline.",
  });

  buildMockAccordion(pane, {
    variant: "tc-mock-acc--gutter",
    title: "Gutter",
    quip: "3px accent stripe runs down the left edge. Near-neutral card, small-caps title, + / − glyph chevron. Accent reduced to a trim.",
  });

  buildMockAccordion(pane, {
    variant: "tc-mock-acc--ghost",
    title: "Ghost",
    quip: "Invisible at rest. A soft accent radial blooms behind the header on hover or when open; muted text lifts to full colour.",
  });

  buildMockAccordion(pane, {
    variant: "tc-mock-acc--twotone",
    title: "Two-tone",
    quip: "Accent-tinted header strip above a neutral body. Two surfaces stack — header carries the accent, body reads as a nested inset.",
  });

  buildMockAccordion(pane, {
    variant: "tc-mock-acc--halo",
    title: "Halo",
    quip: "Pretty default at rest. On hover or when open, a large blurred accent halo blooms OUTSIDE the card perimeter — the whole card haloes.",
  });

  // ── Simple — neutral / mono ──────────────────────────────
  pane.createEl("h4", { cls: "tc-lab-subhead", text: "Simple" });

  buildMockAccordion(pane, {
    variant: "tc-mock-acc--filed",
    title: "Folio",
    quip: "Title sits in a chip protruding above the card top edge — like a file folder's tab. Neutral chrome, circular ↑ / ↓ chevron.",
  });

  buildMockAccordion(pane, {
    variant: "tc-mock-acc--bloc",
    title: "Bloc",
    quip: "Neutral card with a small-caps kicker stacked above the title. Circular + / − disc chevron. Pure mono — no accent anywhere.",
    kicker: "SECTION",
  });

  buildMockAccordion(pane, {
    variant: "tc-mock-acc--subdued",
    title: "Dashed",
    quip: "Faint neutral bg with a 1px dashed mono border. Italic muted title. Monospace +/− chevron — minimal, deliberate quietude.",
  });
}

interface MockAccOpts {
  variant: string;
  title: string;    // the section title, integrated INSIDE the accordion header
  quip: string;     // subquip description, stacked below the title in the header
  kicker?: string;  // opt-in small-caps kicker (bloc variant)
}

/** Build one foldable mock accordion. Title + subquip live INSIDE
 *  the accordion's header as a stacked group so they read as ONE
 *  integrated unit with the variant chrome — no external h5/p
 *  splitting the pair off above the card. Chevron stays right;
 *  body is sample rows. */
function buildMockAccordion(parent: HTMLElement, opts: MockAccOpts): void {
  const acc = parent.createDiv("tc-mock-acc tc-mock-acc--open " + opts.variant);

  const header = acc.createDiv("tc-mock-acc-header");
  if (opts.kicker) header.createSpan({ cls: "tc-mock-acc-kicker", text: opts.kicker });
  const group = header.createDiv("tc-mock-acc-titlegroup");
  group.createSpan({ cls: "tc-mock-acc-title", text: opts.title });
  group.createSpan({ cls: "tc-mock-acc-quip", text: opts.quip });
  header.createSpan({ cls: "tc-mock-acc-chev" });

  const body = acc.createDiv("tc-mock-acc-body");
  ["Sample setting A", "Sample setting B", "Sample setting C"].forEach(label => {
    const row = body.createDiv("tc-mock-acc-row");
    row.createSpan({ cls: "tc-mock-acc-row-label", text: label });
    row.createDiv("tc-mock-acc-row-ctl");
  });

  header.addEventListener("click", () => {
    acc.toggleClass("tc-mock-acc--open", !acc.hasClass("tc-mock-acc--open"));
  });
}

const MOCK_TAB_LABELS = ["Appearance", "Typography", "Editing", "Layout"];

interface MockTabOptions {
  glow?: boolean;
  containerBloom?: boolean;
  sliding?: boolean;
}

function buildMockTabBar(
  parent: HTMLElement,
  label: string,
  variantClass: string,
  options: MockTabOptions,
): void {
  const wrap = parent.createDiv("tc-mock-tab-demo");
  wrap.createSpan({ cls: "tc-mock-tab-label", text: label });
  // Outer surround — for "container bloom" the radial gradient lives on
  // this element's ::before so the accent floods the area around the
  // tab bar, not just inside the active button. Other variants ignore it.
  const surround = wrap.createDiv(`tc-mock-tab-surround ${variantClass}`);
  const bar = surround.createDiv("tc-mock-tab-bar");
  // Sliding-indicator variant: a single accent pill that translates +
  // resizes between tabs via JS-set --tc-slide-x / --tc-slide-w vars.
  const slideIndicator = options.sliding ? bar.createDiv("tc-mock-slide-indicator") : null;
  const buttons: HTMLElement[] = [];

  const setGlowOrigin = (btn: HTMLElement) => {
    const off = () => {
      const sign = Math.random() < 0.5 ? -1 : 1;
      return Math.round(50 + sign * (12 + Math.random() * 26));
    };
    btn.style.setProperty("--tc-tab-glow-x", off() + "%");
    btn.style.setProperty("--tc-tab-glow-y", off() + "%");
  };

  /** Compute the active tab's centre relative to the surround, then
   *  set --tc-bloom-x/y so the surround's ::before radial gradient
   *  centres there. Container bloom variant only. */
  const updateBloom = (btn: HTMLElement) => {
    const sRect = surround.getBoundingClientRect();
    const bRect = btn.getBoundingClientRect();
    const x = ((bRect.left + bRect.width / 2) - sRect.left) / sRect.width * 100;
    const y = ((bRect.top + bRect.height / 2) - sRect.top) / sRect.height * 100;
    surround.style.setProperty("--tc-bloom-x", `${x}%`);
    surround.style.setProperty("--tc-bloom-y", `${y}%`);
  };

  /** Move + resize the sliding indicator to sit behind the active tab. */
  const updateSlide = (btn: HTMLElement) => {
    if (!slideIndicator) return;
    const bRect = bar.getBoundingClientRect();
    const tRect = btn.getBoundingClientRect();
    slideIndicator.style.setProperty("--tc-slide-x", `${tRect.left - bRect.left}px`);
    slideIndicator.style.setProperty("--tc-slide-w", `${tRect.width}px`);
  };

  MOCK_TAB_LABELS.forEach((text, i) => {
    const btn = bar.createEl("button", { cls: "tc-mock-tab", text });
    if (i === 0) {
      btn.addClass("tc-mock-tab--active");
      if (options.glow) setGlowOrigin(btn);
    }
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.removeClass("tc-mock-tab--active"));
      btn.addClass("tc-mock-tab--active");
      if (options.glow) setGlowOrigin(btn);
      if (options.containerBloom) updateBloom(btn);
      if (options.sliding) updateSlide(btn);
    });
    buttons.push(btn);
  });

  // Initial positions need layout to have happened — defer one frame.
  if (options.containerBloom || options.sliding) {
    requestAnimationFrame(() => {
      const active = buttons[0];
      if (options.containerBloom) updateBloom(active);
      if (options.sliding) updateSlide(active);
    });
  }
}

// ─────────────────────────────────────────────────────────────────────
// Switches & inputs section — visual sandbox for custom toggle, switch
// and checkbox treatments. Each demo is a self-contained interactive
// element (clickable to flip state). Pure visual — doesn't write to
// any plugin setting.
// ─────────────────────────────────────────────────────────────────────
function renderSwitchesInputs(pane: HTMLElement): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Inputs" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Custom variants for every form control we encounter in Obsidian — toggles, checkboxes, sliders, dropdowns, text inputs. Click anything to flip / interact. Pure visual; no settings written." });

  buildHorizontalTabs(pane, [
    { id: "toggles",   label: "Toggles",    render: p => renderToggles(p) },
    { id: "checks",    label: "Checkboxes", render: p => renderCheckboxes(p) },
    { id: "sliders",   label: "Sliders",    render: p => renderSliders(p) },
    { id: "dropdowns", label: "Dropdowns",  render: p => renderDropdowns(p) },
    { id: "text",      label: "Text",       render: p => renderTextInputs(p) },
  ]);
}

function renderToggles(pane: HTMLElement): void {
  // Existing 8
  buildMockToggle(pane, "Classic",        "tc-mtog--classic");
  buildMockToggle(pane, "iOS",            "tc-mtog--ios");
  buildMockToggle(pane, "Squared",        "tc-mtog--squared");
  buildMockToggle(pane, "Frosted",        "tc-mtog--frost");
  buildMockToggle(pane, "Pulsing glow",   "tc-mtog--pulse");
  buildMockToggle(pane, "Long pill",      "tc-mtog--long");
  buildMockToggle(pane, "Compact dot",    "tc-mtog--dot");
  buildMockToggle(pane, "Tab-rail Frost", "tc-mtog--rail");
  // 5 more
  buildMockToggle(pane, "Wireframe",      "tc-mtog--wire");
  buildMockToggle(pane, "Notch",          "tc-mtog--notch");
  buildMockToggle(pane, "Inverted thumb", "tc-mtog--invert");
  buildMockToggle(pane, "Heavy track",    "tc-mtog--heavy");
  buildMockToggle(pane, "Skeumorphic",    "tc-mtog--skeu");
}

function renderCheckboxes(pane: HTMLElement): void {
  // Existing 6
  buildMockCheckbox(pane, "Square",       "tc-mcb--square");
  buildMockCheckbox(pane, "Soft fill",    "tc-mcb--fill");
  buildMockCheckbox(pane, "Round",        "tc-mcb--round");
  buildMockCheckbox(pane, "Outlined",     "tc-mcb--outline");
  buildMockCheckbox(pane, "Filled disc",  "tc-mcb--disc");
  buildMockCheckbox(pane, "Frosted",      "tc-mcb--frost");
  // 5 more
  buildMockCheckbox(pane, "Big check",    "tc-mcb--big");
  buildMockCheckbox(pane, "Halo",         "tc-mcb--halo");
  buildMockCheckbox(pane, "Cross",        "tc-mcb--cross");
  buildMockCheckbox(pane, "Inset",        "tc-mcb--inset");
  buildMockCheckbox(pane, "Pill",         "tc-mcb--pill");
}

function renderSliders(pane: HTMLElement): void {
  buildMockSlider(pane, "Classic",       "tc-msl--classic", 30);
  buildMockSlider(pane, "Filled track",  "tc-msl--fill",    55);
  buildMockSlider(pane, "Notched",       "tc-msl--notch",   40);
  buildMockSlider(pane, "Mini",          "tc-msl--mini",    65);
  buildMockSlider(pane, "Value badge",   "tc-msl--badge",   75);
}

function renderDropdowns(pane: HTMLElement): void {
  buildMockDropdown(pane, "Classic", "tc-mdd--classic");
  buildMockDropdown(pane, "Pill",    "tc-mdd--pill");
  buildMockDropdown(pane, "Soft",    "tc-mdd--soft");
  buildMockDropdown(pane, "Frost",   "tc-mdd--frost");
  buildMockDropdown(pane, "Mono",    "tc-mdd--mono");
}

function renderTextInputs(pane: HTMLElement): void {
  buildMockTextInput(pane, "Classic",        "tc-mti--classic", "Search notes…");
  buildMockTextInput(pane, "Underline",      "tc-mti--under",   "Folder name");
  buildMockTextInput(pane, "Pill",           "tc-mti--pill",    "Tag query");
  buildMockTextInput(pane, "Mono / code",    "tc-mti--mono",    "const x = 1;");
  buildMockTextInput(pane, "Frost",          "tc-mti--frost",   "Vault path");
}

function buildMockToggle(
  parent: HTMLElement,
  label: string,
  variantClass: string,
): void {
  const row = parent.createDiv("tc-mock-input-row");
  row.createSpan({ cls: "tc-mock-input-label", text: label });
  const tog = row.createDiv(`tc-mock-toggle ${variantClass}`);
  tog.createDiv("tc-mock-toggle-thumb");
  const flip = () => tog.classList.toggle("tc-mock-toggle--on");
  tog.addEventListener("click", flip);
  // Two-thirds default to ON so the demo shows both states at a glance.
  if (variantClass !== "tc-mtog--classic" && variantClass !== "tc-mtog--squared") {
    tog.classList.add("tc-mock-toggle--on");
  }
}

function buildMockCheckbox(
  parent: HTMLElement,
  label: string,
  variantClass: string,
): void {
  const row = parent.createDiv("tc-mock-input-row");
  row.createSpan({ cls: "tc-mock-input-label", text: label });
  const cb = row.createDiv(`tc-mock-checkbox ${variantClass}`);
  cb.createDiv("tc-mock-check-mark");
  const flip = () => cb.classList.toggle("tc-mock-checkbox--on");
  cb.addEventListener("click", flip);
  if (variantClass === "tc-mcb--fill" || variantClass === "tc-mcb--inset") {
    cb.classList.add("tc-mock-checkbox--on");
  }
}

function buildMockSlider(
  parent: HTMLElement,
  label: string,
  variantClass: string,
  initial: number,
): void {
  const row = parent.createDiv("tc-mock-input-row");
  row.createSpan({ cls: "tc-mock-input-label", text: label });
  const wrap = row.createDiv(`tc-mock-slider ${variantClass}`);
  const track = wrap.createDiv("tc-mock-slider-track");
  const fill = track.createDiv("tc-mock-slider-fill");
  const thumb = wrap.createDiv("tc-mock-slider-thumb");
  const badge = wrap.createDiv("tc-mock-slider-badge");

  const setValue = (pct: number) => {
    const clamped = Math.max(0, Math.min(100, pct));
    fill.style.width = `${clamped}%`;
    thumb.style.left = `${clamped}%`;
    badge.textContent = String(Math.round(clamped));
  };
  setValue(initial);

  // Drag interaction — click anywhere to set, drag thumb to scrub.
  let dragging = false;
  const computePct = (clientX: number) => {
    const rect = track.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 100;
  };
  wrap.addEventListener("mousedown", (e) => {
    dragging = true;
    setValue(computePct(e.clientX));
    e.preventDefault();
  });
  window.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    setValue(computePct(e.clientX));
  });
  window.addEventListener("mouseup", () => { dragging = false; });
}

function buildMockDropdown(
  parent: HTMLElement,
  label: string,
  variantClass: string,
): void {
  const row = parent.createDiv("tc-mock-input-row");
  row.createSpan({ cls: "tc-mock-input-label", text: label });
  const dd = row.createDiv(`tc-mock-dropdown ${variantClass}`);
  const value = dd.createSpan({ cls: "tc-mock-dd-value", text: "Latte" });
  dd.createSpan({ cls: "tc-mock-dd-chev", text: "▾" });
  // Cycle through a few mock values on click for the demo feel.
  const choices = ["Latte", "Mocha", "Frappé", "Macchiato"];
  let idx = 0;
  dd.addEventListener("click", () => {
    idx = (idx + 1) % choices.length;
    value.textContent = choices[idx];
  });
}

function buildMockTextInput(
  parent: HTMLElement,
  label: string,
  variantClass: string,
  placeholder: string,
): void {
  const row = parent.createDiv("tc-mock-input-row");
  row.createSpan({ cls: "tc-mock-input-label", text: label });
  row.createEl("input", {
    cls: `tc-mock-text-input ${variantClass}`,
    attr: { type: "text", placeholder, spellcheck: "false" },
  });
}

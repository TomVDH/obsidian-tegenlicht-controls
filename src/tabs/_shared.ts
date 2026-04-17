import { Setting, setIcon } from "obsidian";
import Pickr from "@simonwep/pickr";

/**
 * Colour-picker + toggle row used by the Editor-accents-style settings:
 * a Pickr swatch on the left, an enable/disable toggle on the right,
 * inside a single Setting row. Returns the Pickr instance so the caller
 * can include it in its disposer set (Pickr leaks DOM on tab teardown
 * if not destroyed).
 *
 * Lifted out of appearance.ts so the Lab tab (and any future surface)
 * can build the same row without duplicating Pickr boilerplate.
 */
export function buildColorToggleRow(
  container: HTMLElement,
  name: string,
  desc: string,
  colourGetter: () => string,
  colourSetter: (v: string) => void,
  enabledGetter: () => boolean,
  enabledSetter: (v: boolean) => void,
  onChange: () => Promise<void>,
): Pickr {
  const setting = new Setting(container).setName(name).setDesc(desc);
  const pickerEl = setting.controlEl.createDiv("pickr");
  const pickr = Pickr.create({
    el: pickerEl,
    container: container.closest('.modal-content') as HTMLElement ?? document.body,
    theme: 'nano',
    default: colourGetter(),
    lockOpacity: true,
    swatches: [colourGetter()],
    position: 'left-middle',
    components: {
      preview: true,
      hue: true,
      opacity: false,
      interaction: { hex: true, input: true, save: true, cancel: true },
    },
  });
  pickr.on('save', (color: Pickr.HSVaColor | null, instance: Pickr) => {
    if (!color) return;
    const hex = color.toHEXA().toString().slice(0, 7);
    colourSetter(hex);
    instance.hide();
    onChange();
  });
  pickr.on('cancel', (instance: Pickr) => instance.hide());
  setting.addToggle(t => t
    .setValue(enabledGetter())
    .onChange(async v => { enabledSetter(v); await onChange(); })
  );
  return pickr;
}


/**
 * Create an inset-card cluster inside an accordion body. Used to group
 * semantically-related settings (e.g. "Palette", "Surface", "Accent
 * application") into visually-distinct sub-sections within a single
 * accordion. The returned element is the cluster container — append
 * Setting rows or other controls to it directly.
 *
 * Relies on .tc-cluster and .tc-cluster-label CSS in styles.css.
 */
export function buildCluster(parent: HTMLElement, label: string): HTMLElement {
  const cluster = parent.createDiv("tc-cluster");
  cluster.createEl("div", { cls: "tc-cluster-label", text: label });
  return cluster;
}

/**
 * Segmented pill picker: label + desc on the left, pill group on the right.
 *
 * Preferred over dropdowns for small option sets (<=4) — visually clearer
 * and matches the plugin's pill/tab language. Shared between tabs so the
 * Appearance tab's swatch-group pills and the Editing tab's tag-style
 * picker render identically.
 */
export function buildSegmentSetting(
  container: HTMLElement,
  name: string,
  desc: string,
  options: { label: string; value: string }[],
  current: string,
  onChange: (value: string) => Promise<void>,
): void {
  const setting = new Setting(container).setName(name).setDesc(desc);
  const group = setting.controlEl.createDiv("tc-seg");
  // Sliding indicator — the frosted pill that slides between
  // segments on selection. Paints are in styles.css (.tc-seg-slide-
  // indicator). Appended first so it sits behind the buttons.
  const slide = group.createDiv("tc-seg-slide-indicator");
  const buttons = new Map<string, HTMLElement>();

  const updateSlide = (btn: HTMLElement) => {
    requestAnimationFrame(() => {
      const trackRect = group.getBoundingClientRect();
      const btnRect   = btn.getBoundingClientRect();
      if (!trackRect.width || !btnRect.width) return;
      slide.style.setProperty("--tc-slide-x", `${btnRect.left - trackRect.left}px`);
      slide.style.setProperty("--tc-slide-w", `${btnRect.width}px`);
      slide.classList.add("tc-seg-slide-indicator--ready");
    });
  };

  options.forEach(o => {
    const btn = group.createEl("button", { text: o.label, cls: "tc-seg-btn" });
    if (o.value === current) {
      btn.addClass("tc-seg-btn--active");
      updateSlide(btn);
    }
    btn.addEventListener("click", async () => {
      if (btn.hasClass("tc-seg-btn--active")) return;
      buttons.forEach(b => b.removeClass("tc-seg-btn--active"));
      btn.addClass("tc-seg-btn--active");
      updateSlide(btn);
      await onChange(o.value);
    });
    buttons.set(o.value, btn);
  });
}

export interface LeftRailSection {
  id: string;
  label: string;
  count: number;
  render: (contentPane: HTMLElement) => void;
}

/**
 * Left-rail navigation shell for dense-content tabs.
 *
 * Renders a vertical rail of section labels on the left and a single
 * content pane on the right. Clicking a rail item swaps the content
 * pane by calling that section's render() callback. Only one section
 * is visible at a time.
 *
 * Active section state PERSISTS across redisplay() rebuilds via the
 * module-level `leftRailActiveId` map, keyed by a caller-supplied
 * `stateKey` (e.g. "appearance" / "typography"). Without the stateKey
 * the shell falls back to the transient in-closure behaviour — first
 * section active on every rebuild.
 *
 * Previously: flipping a setting triggered redisplay() which rebuilt
 * the whole tab, and the rail snapped back to its first section
 * because the active id only lived in the closure. User flow:
 * navigate to Workspace → toggle anything → rail jumps to Theme &
 * Colour. Fix threads the active id through the persisted map so
 * the rail stays put.
 *
 * Returns a cleanup function for any disposers registered by the
 * content pane (e.g. Pickr instances). The caller is responsible
 * for invoking it on tab teardown.
 */
const leftRailActiveId: Record<string, string> = {};

export function buildLeftRailShell(
  container: HTMLElement,
  sections: LeftRailSection[],
  stateKey?: string,
): () => void {
  const shell = container.createDiv("tc-leftrail-shell");
  const rail = shell.createDiv("tc-leftrail-rail");
  const pane = shell.createDiv("tc-leftrail-pane");

  const disposers: (() => void)[] = [];
  const railItems = new Map<string, HTMLElement>();

  // Restore prior active section if the caller supplied a stateKey
  // and the saved id still exists in the current sections list.
  // Otherwise open on the first section (original behaviour).
  let activeId = sections[0]?.id ?? "";
  if (stateKey) {
    const saved = leftRailActiveId[stateKey];
    if (saved && sections.some(s => s.id === saved)) activeId = saved;
    leftRailActiveId[stateKey] = activeId;
  }

  const renderActive = () => {
    pane.empty();
    const active = sections.find(s => s.id === activeId);
    if (!active) return;
    active.render(pane);
  };

  // Rainbow flourish retired (2026-04-17) — the accent divider below
  // the main tab bar already carries the "you're in the accent
  // universe" cue, so a second colour element at the top of every
  // rail was redundant. Leaving a little top padding via the rail
  // container so the first nav item doesn't hug the divider.

  sections.forEach(section => {
    const item = rail.createDiv("tc-leftrail-item");
    if (section.id === activeId) item.addClass("tc-leftrail-item--active");
    // Label wrapped in an outer span so the inner text span can marquee
    // on hover if it overflows the narrow rail width. Outer is the
    // overflow container; inner is the animated element. Per-section
    // count badge dropped to conserve sidebar width.
    const labelWrap = item.createSpan({ cls: "tc-leftrail-label" });
    const labelText = labelWrap.createSpan({ text: section.label, cls: "tc-leftrail-label-text" });

    // Marquee gating — measure overflow on next frame; if the label
    // clips the wrap, swap the text for a duplicated "label • label •"
    // sequence and add the --marquee class so the hover animation
    // engages. Short labels stay static. Duplicated content + 50%
    // translate gives a seamless loop (end frame == start frame).
    requestAnimationFrame(() => {
      if (labelText.scrollWidth > labelWrap.clientWidth + 1) {
        const sep = "\u2003\u2022\u2003"; // em-space · em-space
        labelText.setText(section.label + sep + section.label + sep);
        labelText.addClass("tc-leftrail-label-text--marquee");
      }
    });
    item.addEventListener("click", () => {
      if (section.id === activeId) return;
      railItems.forEach(el => el.removeClass("tc-leftrail-item--active"));
      item.addClass("tc-leftrail-item--active");
      activeId = section.id;
      if (stateKey) leftRailActiveId[stateKey] = activeId;
      renderActive();
    });
    railItems.set(section.id, item);
  });

  renderActive();

  return () => disposers.forEach(fn => { try { fn(); } catch { /* no-op */ } });
}

export interface HorizontalTab {
  id: string;
  label: string;
  render: (pane: HTMLElement) => void;
}

/**
 * Horizontal sub-tabs for the right side of a left-rail content pane.
 *
 * Renders a thin tab strip across the top of the parent, then a content
 * pane below it. Each tab's render() callback paints the active pane.
 * Active state lives in closure — when the parent rebuilds, we always
 * land on the first tab.
 *
 * Used by the Lab tab to experiment with two-axis navigation
 * (vertical sections in the rail, horizontal sub-sections in the pane).
 * Style relies on .tc-htabs / .tc-htabs-bar / .tc-htabs-btn /
 * .tc-htabs-pane CSS in styles.css.
 */
export function buildHorizontalTabs(parent: HTMLElement, tabs: HorizontalTab[]): void {
  const wrap = parent.createDiv("tc-htabs");
  const bar  = wrap.createDiv("tc-htabs-bar");
  const pane = wrap.createDiv("tc-htabs-pane");

  let activeId = tabs[0]?.id ?? "";
  const buttons = new Map<string, HTMLElement>();

  const renderActive = () => {
    pane.empty();
    const active = tabs.find(t => t.id === activeId);
    active?.render(pane);
  };

  tabs.forEach(t => {
    const btn = bar.createEl("button", { cls: "tc-htabs-btn", text: t.label });
    if (t.id === activeId) btn.addClass("tc-htabs-btn--active");
    btn.addEventListener("click", () => {
      if (t.id === activeId) return;
      buttons.forEach(b => b.removeClass("tc-htabs-btn--active"));
      btn.addClass("tc-htabs-btn--active");
      activeId = t.id;
      renderActive();
    });
    buttons.set(t.id, btn);
  });

  renderActive();
}

// ─── Pretty accordion + section preview helpers ────────────────────
// Shared across any tab that needs the rail-pane pattern established
// in Typography (Fonts / Rhythm): a foldable accent-painted card
// labelled with an all-caps subtitle, optionally preceded by a
// Callouts-style PREVIEW strip. Module-level open-state map keyed by
// caller-supplied id so open/collapsed state survives rail switches
// and redisplay() rebuilds. Use a tab-prefix to avoid key collisions
// (e.g. "typo-fonts", "app-palette").

const prettyAccordionOpen: Record<string, boolean> = {};

/** Foldable accent-painted accordion. Accepts a `variant` name that
 *  maps directly to the Lab → Accordion styles picks (pretty, gutter,
 *  ghost, twotone, halo, filed, bloc, subdued).
 *
 *  Production accordions use the SAME class system as Lab mocks —
 *  `.tc-mock-acc.tc-mock-acc--{variant}.tc-mock-acc--open?` — so every
 *  Lab variant rule applies verbatim and production's legacy
 *  `.tc-feat-group` base styles never compete. The ONLY production
 *  class retained is `.tc-feat-body .tc-setting-card` on the body,
 *  because the setting-item rendering rules (per-row padding,
 *  transparent backgrounds, control alignment) are scoped to that
 *  class set. Body show/hide is driven by `.tc-mock-acc--open` via
 *  a dedicated rule in styles.css, not production's
 *  `.tc-feat-group--open` toggle.
 *
 *  `defaultOpen` seeds the module-level map; subsequent visits
 *  respect the user's toggle state. Chevron glyph comes from each
 *  variant's `::before { content: … }` so the chevron span stays
 *  empty — no inline character to clash with the variant's symbol. */
export function buildPrettyAccordion(
  container: HTMLElement,
  key: string,
  title: string,
  defaultOpen = true,
  variant: string = "pretty",
): HTMLElement {
  if (!(key in prettyAccordionOpen)) prettyAccordionOpen[key] = defaultOpen;
  const isOpen = prettyAccordionOpen[key];
  const accordion = container.createDiv(
    `tc-mock-acc tc-mock-acc--${variant}` + (isOpen ? " tc-mock-acc--open" : "")
  );
  const header = accordion.createDiv("tc-mock-acc-header");
  header.createSpan({ text: title, cls: "tc-mock-acc-title" });
  header.createSpan({ cls: "tc-mock-acc-chev" });
  header.addEventListener("click", () => {
    const next = !prettyAccordionOpen[key];
    prettyAccordionOpen[key] = next;
    accordion.toggleClass("tc-mock-acc--open", next);
  });
  return accordion.createDiv("tc-feat-body tc-setting-card");
}

/** Collapsible PREVIEW strip matching the Callouts section in
 *  Legacy: [PREVIEW label] · [dashed connector] · [chevron button].
 *  Content is built eagerly into the wrap so the first expand lands
 *  without flicker. Accent sweep on hover/open lives in styles.css.
 *
 *  Open state persists via `sectionPreviewOpen` keyed by caller-
 *  supplied id — so when a setting change triggers redisplay() and
 *  the whole pane rebuilds, the preview that was expanded before
 *  lands expanded again on the new DOM. Tab-prefix the id to avoid
 *  collisions across tabs (e.g. "typo-fonts", "app-theme"). */
const sectionPreviewOpen: Record<string, boolean> = {};

export function buildSectionPreview(
  pane: HTMLElement,
  key: string,
  buildContent: (wrap: HTMLElement) => void,
): void {
  const bar = pane.createDiv("tc-section-preview-bar");
  bar.createSpan({ cls: "tc-section-preview-label", text: "PREVIEW" });
  bar.createDiv("tc-section-preview-dash");
  const btn = bar.createEl("button", {
    cls: "tc-circle-btn tc-section-preview-btn",
    attr: { "aria-label": "Toggle preview", title: "Toggle preview" },
  });
  setIcon(btn, "chevron-down");

  const wrap = pane.createDiv("tc-section-preview-wrap");
  buildContent(wrap);

  // Seed local state from the module-level map. If the preview was
  // expanded before a redisplay, re-open it on the new DOM — defer
  // two frames so layout has settled and `scrollHeight` reads the
  // true content size, not the 0 height the transition started at.
  let open = sectionPreviewOpen[key] ?? false;
  if (open) {
    btn.addClass("tc-section-preview-btn--open");
    requestAnimationFrame(() => requestAnimationFrame(() => {
      wrap.style.maxHeight = wrap.scrollHeight + "px";
    }));
  }

  btn.addEventListener("click", () => {
    open = !open;
    sectionPreviewOpen[key] = open;
    if (open) {
      wrap.style.maxHeight = wrap.scrollHeight + "px";
      btn.addClass("tc-section-preview-btn--open");
    } else {
      wrap.style.maxHeight = "0px";
      btn.removeClass("tc-section-preview-btn--open");
    }
  });
}

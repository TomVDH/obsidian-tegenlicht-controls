import { Setting } from "obsidian";
import TegenlichtControlsPlugin from "../main";
import { buildEditingPreview } from "../preview-sample";
import { buildSegmentSetting } from "./_shared";

// Session-scoped accordion state — same pattern as the Appearance and
// Typography tabs so flipping a toggle doesn't snap sections shut.
// Default: only the top accordion (`reading`) is open on first load.
const accordionOpen: Record<string, boolean> = {
  reading: true, coding: false, properties: false, highlights: false,
};

/** Build an accordion shell matching the Appearance tab's `tc-feat-group`
 *  pattern. Title gets accent tint via the global `.tc-feat-title` rule. */
function buildAccordion(
  container: HTMLElement,
  key: keyof typeof accordionOpen,
  title: string,
): HTMLElement {
  const accordion = container.createDiv(
    "tc-feat-group" + (accordionOpen[key] ? " tc-feat-group--open" : "")
  );
  const header = accordion.createDiv("tc-feat-header");
  header.createDiv("tc-feat-title").createSpan({ text: title });
  header.createDiv("tc-feat-meta").createSpan({ text: "▶", cls: "tc-feat-chevron" });
  header.addEventListener("click", () => {
    accordionOpen[key] = !accordionOpen[key];
    accordion.toggleClass("tc-feat-group--open", accordionOpen[key]);
  });
  return accordion.createDiv("tc-feat-body tc-setting-card");
}

/**
 * Editing tab — settings that shape how text actually gets written
 * and read in the note itself (live preview behaviour, code-editing
 * affordances, highlights that respond to caret/selection).
 *
 * Intentionally lighter than Typography (which is font-and-rhythm); this
 * tab is about the editing EXPERIENCE — cursor, line numbers, callouts,
 * inline styles. Much of what lives here was previously scattered across
 * Appearance > Highlights & Tints and Features. Consolidated so "editing
 * feel" is one stop.
 */
export function build(
  containerEl: HTMLElement,
  plugin: TegenlichtControlsPlugin,
  onChange: () => Promise<void>,
): void {
  const s = plugin.settings;

  // Accent-coloured divider bar (matches Typography tab's top bar)
  containerEl.createDiv("tc-color-bar tc-color-bar--accent");

  const wrap = containerEl.createDiv("tc-editing-wrap");

  // ── Reading accordion — how rendered text behaves in preview ──────
  const readingBody = buildAccordion(wrap, "reading", "Reading view");

  new Setting(readingBody)
    .setName("Inline title")
    .setDesc("Show the filename as an H1 above the note")
    .addToggle(t => t
      .setValue(s.inlineTitle)
      .onChange(async v => { s.inlineTitle = v; await onChange(); })
    );

  new Setting(readingBody)
    .setName("Floating title")
    .setDesc("Title floats over the note on scroll")
    .addToggle(t => t
      .setValue(s.floatingTitle)
      .onChange(async v => { s.floatingTitle = v; await onChange(); })
    );

  new Setting(readingBody)
    .setName("Custom checkboxes")
    .setDesc("Themed checkbox set for task lists")
    .addToggle(t => t
      .setValue(s.customCheckboxes)
      .onChange(async v => { s.customCheckboxes = v; await onChange(); })
    );

  new Setting(readingBody)
    .setName("Rainbow tags")
    .setDesc("Colour tags by first letter")
    .addToggle(t => t
      .setValue(s.rainbowTags)
      .onChange(async v => { s.rainbowTags = v; await onChange(); })
    );

  // ── Coding accordion — editor affordances for source work ────────
  const codingBody = buildAccordion(wrap, "coding", "Coding & source");

  new Setting(codingBody)
    .setName("Codeblock line numbers")
    .setDesc("Line numbers in fenced code blocks")
    .addToggle(t => t
      .setValue(s.codeblockLineNumbers)
      .onChange(async v => { s.codeblockLineNumbers = v; await onChange(); })
    );

  // ── Properties accordion — Properties panel styling
  //
  // First real control: "Boxed Properties panel" mirrors what the
  // vault's frontmatter-beauty.css snippet does — wraps the
  // .metadata-container in an accent-gradient card with a soft shadow.
  // Off by default (matches Obsidian's flat default rendering).
  //
  // The pretty-properties (anareaty) integration mention stays as a
  // forward-looking note below; when that plugin is detected, more
  // dedicated controls will land in this accordion and route through
  // its settings.
  const propertiesBody = buildAccordion(wrap, "properties", "Properties");

  new Setting(propertiesBody)
    .setName("Boxed Properties panel")
    .setDesc("Accent-tinted card around the Properties panel")
    .addToggle(t => t
      .setValue(s.propertiesBoxed)
      .onChange(async v => { s.propertiesBoxed = v; await onChange(); })
    );

  // Tag pill style — applies globally (Properties, autocomplete, search
  // chips, inline body tags), independent of the Boxed toggle. Pill-select
  // mirrors the Appearance tab pattern for consistency with other picks.
  buildSegmentSetting(
    propertiesBody,
    "Tag pill style",
    "Applies to every pill Obsidian draws",
    [
      { label: "Classic", value: "classic" },
      { label: "Ghost",   value: "ghost"   },
      { label: "Solid",   value: "solid"   },
    ],
    s.tagStyle || "classic",
    async v => { s.tagStyle = v; await onChange(); },
  );

  // Forward-looking note for pretty-properties integration.
  const propHint = propertiesBody.createDiv("tc-empty-hint");
  propHint.createSpan({
    text: "More controls land here once we wire pretty-properties (anareaty) integration — type-aware pills, inline colour + icon pickers, density. ",
  });
  const propLink = propHint.createEl("a", {
    text: "github.com/anareaty/pretty-properties",
    href: "https://github.com/anareaty/pretty-properties",
  });
  propLink.setAttr("target", "_blank");
  propLink.setAttr("rel", "noopener");

  // ── Highlights accordion — placeholder for the colour-toggle trio
  //    (Active line, Selection tint, Caret) currently in Appearance.
  //    Kept there for now to avoid disruptive duplication; will migrate
  //    in a follow-up commit once the controls here prove out.
  const highlightsBody = buildAccordion(wrap, "highlights", "Highlights & tints");
  highlightsBody.createEl("p", {
    cls: "tc-empty-hint",
    text: "Caret / selection / active-line colour pickers live in Appearance → Highlights & Tints for now. We'll move them here in the next pass.",
  });

  // ── Dynamic preview (bottom, full width) ─────────────────────────
  // Full mini-Obsidian simulation, same chrome as the Typography tab,
  // but the main content renders a Properties panel AT THE TOP OF THE
  // NOTE BODY (above the H1) — the same position real Obsidian uses.
  // Future property-styling settings from this tab re-render here live.
  const previewHeader = wrap.createDiv("tc-typo-preview-header");
  previewHeader.createSpan({ text: "Dynamic Preview", cls: "tc-typo-preview-title" });
  previewHeader.createSpan({ text: "Live mock — Properties panel above the note body, where editing settings take effect", cls: "tc-typo-preview-desc" });

  buildEditingPreview(wrap);
}

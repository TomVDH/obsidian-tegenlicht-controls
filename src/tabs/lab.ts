import { Setting } from "obsidian";
import TegenlichtControlsPlugin from "../main";
import {
  buildLeftRailShell,
  LeftRailSection,
  buildHorizontalTabs,
  buildCluster,
} from "./_shared";

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
  _plugin: TegenlichtControlsPlugin,
  _onChange: () => Promise<void>,
  _redisplay?: () => void,
): () => void {

  // Scratch state for the dummy controls — never saved. Lets toggles /
  // sliders feel responsive without polluting plugin settings.
  const scratch: Record<string, unknown> = {};

  const sections: LeftRailSection[] = [
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

  const shellCleanup = buildLeftRailShell(containerEl, sections);
  return () => shellCleanup();
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

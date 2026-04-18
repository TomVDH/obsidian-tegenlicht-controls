import Pickr from "@simonwep/pickr";
import TegenlichtControlsPlugin from "../main";
import {
  renderTheme, renderOutliner, renderGraph, renderWorkspace,
} from "./appearance";

/**
 * Appearance 2 — stacked / no-rail variant of the Appearance tab.
 *
 * Reuses the same four section renderers as Appearance (Theme,
 * Outliner, Graph, Workspace) but paints them all one above the other
 * in a single scrolling column instead of swapping via a left rail.
 * Same settings, same live behaviour — only the navigation shape
 * changes. Lets the user A/B the rail-based vs stacked pattern.
 *
 * Pickr disposer lifecycle mirrors Appearance's — every Pickr created
 * by Theme / Workspace goes into the `pickrs` array, destroyed on
 * tab teardown.
 */
export function build(
  containerEl: HTMLElement,
  plugin: TegenlichtControlsPlugin,
  onChange: () => Promise<void>,
  redisplay?: () => void,
): () => void {
  const s = plugin.settings;
  const pickrs: Pickr[] = [];
  const refresh = async () => {
    await onChange();
    redisplay?.();
  };

  const wrap = containerEl.createDiv("tc-appearance2-wrap");

  // Each section gets its own scrolling block. No rail, no state
  // key — every section always rendered, user scrolls between them.
  const sections: ((pane: HTMLElement) => void)[] = [
    pane => renderTheme(pane, s, containerEl, onChange, refresh, pickrs),
    pane => renderOutliner(pane, s, onChange),
    pane => renderGraph(pane, s, onChange, refresh),
    pane => renderWorkspace(pane, s, containerEl, onChange, refresh, pickrs),
  ];
  sections.forEach(renderer => {
    const sectionWrap = wrap.createDiv("tc-appearance2-section");
    renderer(sectionWrap);
  });

  return () => {
    pickrs.forEach(p => { try { p.destroyAndRemove(); } catch(_) {} });
  };
}

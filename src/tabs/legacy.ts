import TegenlichtControlsPlugin from "../main";
import { buildLeftRailShell, LeftRailSection } from "./_shared";
import {
  renderFonts, renderRhythm, renderHeadings,
  renderWeightLeading, renderAccents as renderTypoAccents,
} from "./typography";

/**
 * Legacy tab — staging area for everything not yet graduated into the
 * semantic tabs. Absorbed Typography's five rail sections (Step 3e)
 * on top of the existing Show/Hide + Accents stragglers so retired
 * tabs leave zero orphaned controls. Content still relocates as homes
 * earn them.
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

  // Legacy now holds the five Typography-absorbed sections only. The
  // earlier Show/Hide stragglers moved to Elements → Show / Hide, and
  // the Frame & accents pair (lightAccentColour + colorfulFrameColour)
  // moved to Appearance → Canvas & Frame → Accent application (Step 4).
  const sections: LeftRailSection[] = [
    { id: "fonts",    label: "Fonts",           count: 4,
      render: (pane) => renderFonts(pane, s, onChange, refresh) },
    { id: "rhythm",   label: "Rhythm",          count: 8,
      render: (pane) => renderRhythm(pane, s, onChange) },
    { id: "headings", label: "Headings",        count: 16,
      render: (pane) => renderHeadings(pane, s, onChange) },
    { id: "weight",   label: "Weight & leading", count: 22,
      render: (pane) => renderWeightLeading(pane, s, onChange) },
    { id: "decoration", label: "Decoration",    count: 3,
      render: (pane) => renderTypoAccents(pane, s, onChange) },
  ];

  return buildLeftRailShell(containerEl, sections, "legacy");
}


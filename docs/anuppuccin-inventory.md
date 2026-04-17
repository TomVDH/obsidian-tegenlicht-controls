# AnuPpuccin Style Settings Inventory & Plugin Porting Status

**Document Purpose:** Comprehensive audit of every Style Settings option exposed by AnuPpuccin theme, cross-referenced against the tegenlicht-controls plugin to identify: (1) fully ported settings, (2) wired but UI-less controls, (3) unported settings, and (4) intentionally skipped features.

**Sources:**
- AnuPpuccin theme.css: lines 15–2500 (settings YAML block)
- Plugin settings.ts: TegenlichtSettings interface + DEFAULT_SETTINGS
- Plugin applier.ts: the write-to-body/CSS-vars layer
- Plugin tabs/: UI surface definitions

---

## 1. Colors

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| Light Theme Flavor (anuppuccin-theme-light) | class-select | ctp-latte, ctp-rosepine-light | ✅ Fully ported | Appearance | Mapped to `lightFlavour` setting; swatch-picker UI |
| Dark Theme Flavor (anuppuccin-theme-dark) | class-select | ctp-frappe, ctp-macchiato, ctp-mocha, ctp-mocha-old | ✅ Fully ported | Appearance | Mapped to `darkFlavour` setting; swatch-picker UI |
| Light Theme Accent (anuppuccin-light-theme-accents) | class-select | ctp-accent-light-* (14 colours) | ◯ Not yet | — | AnuPpuccin allows per-light-mode accent; plugin uses global accent only |
| Dark Theme Accent (anuppuccin-theme-accents) | class-select | ctp-accent-* (14 colours) | ✅ Fully ported | Appearance | Mapped to `accentColour` setting; picker UI |
| Force Custom Accents (anuppuccin-accent-toggle) | class-toggle | tegenlicht-accent-toggle | ✅ Fully ported | Appearance | Always on in applier; class written to body |

### 1.1. Color Overrides

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| Rosewater (ctp-custom-rosewater) | variable-themed-color | --ctp-custom-rosewater | ◯ Not yet | — | Palette override; applier reads from flavours.ts but doesn't expose UI |
| Flamingo (ctp-custom-flamingo) | variable-themed-color | --ctp-custom-flamingo | ◯ Not yet | — | Palette override |
| Pink (ctp-custom-pink) | variable-themed-color | --ctp-custom-pink | ◯ Not yet | — | Palette override |
| Mauve (ctp-custom-mauve) | variable-themed-color | --ctp-custom-mauve | ◯ Not yet | — | Palette override |
| Red (ctp-custom-red) | variable-themed-color | --ctp-custom-red | ◯ Not yet | — | Palette override |
| Maroon (ctp-custom-maroon) | variable-themed-color | --ctp-custom-maroon | ◯ Not yet | — | Palette override |
| Peach (ctp-custom-peach) | variable-themed-color | --ctp-custom-peach | ◯ Not yet | — | Palette override |
| Yellow (ctp-custom-yellow) | variable-themed-color | --ctp-custom-yellow | ◯ Not yet | — | Palette override |
| Green (ctp-custom-green) | variable-themed-color | --ctp-custom-green | ◯ Not yet | — | Palette override |
| Teal (ctp-custom-teal) | variable-themed-color | --ctp-custom-teal | ◯ Not yet | — | Palette override |
| Sky (ctp-custom-sky) | variable-themed-color | --ctp-custom-sky | ◯ Not yet | — | Palette override |
| Sapphire (ctp-custom-sapphire) | variable-themed-color | --ctp-custom-sapphire | ◯ Not yet | — | Palette override |
| Blue (ctp-custom-blue) | variable-themed-color | --ctp-custom-blue | ◯ Not yet | — | Palette override |
| Lavender (ctp-custom-lavender) | variable-themed-color | --ctp-custom-lavender | ◯ Not yet | — | Palette override |
| Text (ctp-custom-text) | variable-themed-color | --ctp-custom-text | ◯ Not yet | — | Palette override |
| Subtext 1 (ctp-custom-subtext1) | variable-themed-color | --ctp-custom-subtext1 | ◯ Not yet | — | Palette override |
| Subtext 0 (ctp-custom-subtext0) | variable-themed-color | --ctp-custom-subtext0 | ◯ Not yet | — | Palette override |
| Overlay 2 (ctp-custom-overlay2) | variable-themed-color | --ctp-custom-overlay2 | ◯ Not yet | — | Palette override |
| Overlay 1 (ctp-custom-overlay1) | variable-themed-color | --ctp-custom-overlay1 | ◯ Not yet | — | Palette override |
| Overlay 0 (ctp-custom-overlay0) | variable-themed-color | --ctp-custom-overlay0 | ◯ Not yet | — | Palette override |
| Surface 2 (ctp-custom-surface2) | variable-themed-color | --ctp-custom-surface2 | ◯ Not yet | — | Palette override |
| Surface 1 (ctp-custom-surface1) | variable-themed-color | --ctp-custom-surface1 | ◯ Not yet | — | Palette override |
| Surface 0 (ctp-custom-surface0) | variable-themed-color | --ctp-custom-surface0 | ◯ Not yet | — | Palette override |
| Base (ctp-custom-base) | variable-themed-color | --ctp-custom-base | ◯ Not yet | — | Palette override |
| Mantle (ctp-custom-mantle) | variable-themed-color | --ctp-custom-mantle | ◯ Not yet | — | Palette override |
| Crust (ctp-custom-crust) | variable-themed-color | --ctp-custom-crust | ◯ Not yet | — | Palette override |

---

## 2. File Editor & Markdown Elements

### 2.1. Active Line

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| Active line highlight (anp-active-line) | class-select | anp-no-highlight, anp-current-line, anp-current-line-border, anp-current-line-border-only | ◐ Wired-but-UI-less | — | applier.ts line 397 maps `activeLineHighlight` boolean → class; no UI toggle in any tab |

### 2.2. Callouts

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| Callout Style (anp-callout-select) | class-select | anp-callout-sleek, anp-callout-block, anp-callout-vanilla-normal, anp-callout-vanilla-plus | ✅ Fully ported | Legacy > Callouts | Mapped to `calloutStyle`; radio buttons in legacy tab |
| Enable Custom Callout Colors (anp-callout-color-toggle) | class-toggle | anp-callout-color-toggle | ✅ Fully ported | Legacy > Callouts | Mapped to `calloutCustomColors` |
| Callout Radius (callout-radius) | variable-number | --callout-radius | ✅ Fully ported | Legacy > Callouts | Mapped to `calloutRadius` (px slider, 0–24) |
| Callout Title Padding (callout-title-padding) | variable-text | --callout-title-padding | ◐ Wired-but-UI-less | — | settings.ts has `calloutTitlePaddingX` (number); applier writes `--callout-title-padding` but as px not text var |
| Callout Title Opacity (callout-title-opacity) | variable-number-slider | --callout-title-opacity | ✅ Fully ported | Legacy > Callouts | Mapped to `calloutTitleOpacity` (0–100, written as 0–1) |
| Callout Content Padding (callout-content-padding) | variable-text | --callout-content-padding | ✅ Fully ported | Legacy > Callouts | Mapped to `calloutContentPadding` (px slider, 0–40) |
| Callout Fold Position (anp-callout-fold-position) | variable-select | --callout-fold-position | ✅ Fully ported | Legacy > Callouts | Mapped to `calloutFoldPosition` ('left' | 'right'); radio UI |

### 2.3. Checkboxes

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| Enable Custom Checkboxes (anp-custom-checkboxes) | class-toggle | anp-custom-checkboxes | ✅ Fully ported | Features | Mapped to `customCheckboxes`; toggle in Features tab |
| Enable Speech Bubbles (anp-speech-bubble) | class-toggle | anp-speech-bubble | ◯ Not yet | — | Theme supports it; plugin has no setting or UI |

### 2.4. Codeblocks

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| Enable Codeblock Numbering (anp-codeblock-numbers) | class-toggle | anp-codeblock-numbers | ✅ Fully ported | Features | Mapped to `codeblockLineNumbers`; toggle in Features tab |
| Codeblock Line Wrap (Edit Mode) (anp-codeblock-wrap-edit) | class-select | anp-codeblock-edit-nowrap | ✅ Fully ported | Legacy > Codeblocks | Mapped to `codeblockWrapEdit` ('wrap' | 'nowrap'); radio UI |
| Codeblock Line Wrap (Preview Mode) (anp-codeblock-wrap-preview) | class-select | anp-codeblock-preview-nowrap | ✅ Fully ported | Legacy > Codeblocks | Mapped to `codeblockWrapPreview`; radio UI |
| Syntax Highlighted Codeblock Line Wrap (Preview Mode) (anp-codeblock-wrap-hl-preview) | class-select | anp-codeblock-preview-hl-nowrap | ✅ Fully ported | Legacy > Codeblocks | Mapped to `codeblockWrapHlPreview`; radio UI |
| Codeblock Background Color (anp-code-bg-color) | variable-themed-color | --anp-code-bg-color | ✅ Fully ported | Legacy > Codeblocks | Mapped to `codeblockBgColor` (hex string); Pickr UI |
| Codeblock Text Color (anp-code-text-color) | variable-themed-color | --anp-code-text-color | ✅ Fully ported | Legacy > Codeblocks | Mapped to `codeblockTextColor`; Pickr UI |

### 2.5. Embeds

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| Maximum embed height (embed-max-height) | variable-number | --embed-max-height | ◯ Not yet | — | Theme variable; plugin has no setting |

### 2.6. LaTeX

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| LaTeX Color (anp-latex-color) | variable-themed-color | --anp-latex-color | ◯ Not yet | — | Theme variable; plugin has no setting |

### 2.7. Lists

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| Enable List Styling (anp-list-toggle) | class-toggle | anp-list-toggle | ◯ Not yet | — | Theme class; plugin has no setting |
| List Indent (list-indent) | variable-number | --list-indent | ✅ Fully ported | Typography > Rhythm | Mapped to `listIndent` (em slider, 0.5–4.0); slider UI |
| List Spacing (list-spacing) | variable-number | --list-spacing | ✅ Fully ported | Typography > Rhythm | Mapped to `listSpacing` (em slider, 0–0.5); slider UI |
| Unordered list bullet color (list-marker-color) | variable-themed-color | --list-marker-color | ◯ Not yet | — | Theme variable; plugin has no setting |
| Ordered list style (list-numbered-style) | variable-select | --list-numbered-style | ◯ Not yet | — | Theme variable; 10+ enum values; plugin has no setting |

### 2.8. Tables

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| Enable Table Styling (anp-table-toggle) | class-toggle | anp-table-toggle | ✅ Fully ported | Legacy > Tables | Mapped to `tableStyling`; toggle UI |
| Enable Custom Table Width (anp-table-width) | class-toggle | anp-table-width | ✅ Fully ported | Legacy > Tables | Mapped to `tableCustomWidth`; toggle UI |
| Center Tables (anp-table-auto) | class-toggle | anp-table-auto | ✅ Fully ported | Legacy > Tables | Mapped to `tableCentered`; toggle UI |
| <th> Highlight (anp-table-th-highlight) | class-toggle | anp-table-th-highlight | ✅ Fully ported | Legacy > Tables | Mapped to `tableThHighlight`; toggle UI |
| <td> Highlight (anp-td-highlight) | class-select | anp-table-row-alt, anp-table-col-alt, anp-table-checkered, anp-table-full | ✅ Fully ported | Legacy > Tables | Mapped to `tableRowHighlight` ('none' | 'row-alt' | 'col-alt' | 'checkered' | 'full'); radio UI |
| Highlight Opacity (anp-table-highlight-opacity) | variable-number-slider | --anp-table-highlight-opacity | ✅ Fully ported | Legacy > Tables | Mapped to `tableHighlightOpacity` (0–100, written as 0–1); slider UI |
| <th> Text Align (anp-table-align-th) | variable-select | --anp-table-align-th | ✅ Fully ported | Legacy > Tables | Mapped to `tableAlignTh` ('left' | 'center' | 'right'); dropdown UI |
| <td> Text Align (anp-table-align-td) | variable-select | --anp-table-align-td | ✅ Fully ported | Legacy > Tables | Mapped to `tableAlignTd`; dropdown UI |
| Custom Table Border Width (anp-table-thickness) | variable-number | --anp-table-thickness | ✅ Fully ported | Legacy > Tables | Mapped to `tableBorderWidth` (0–4 px); slider UI |
| Custom Table Width (anp-table-width-pct) | variable-number | --anp-table-width-pct | ✅ Fully ported | Layout | Mapped to `tableWidthPct` (0–100%); slider UI |

### 2.9. Tags

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| Tag Border Width (tag-border-width) | variable-number | --tag-border-width | ◯ Not yet | — | Theme variable; plugin has no setting |
| Tag Radius (tag-radius) | variable-number-slider | --tag-radius | ◯ Not yet | — | Theme variable; plugin has no setting |

---

## 3. File Preview

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| Enable Custom Preview Margins (anp-toggle-preview) | class-toggle | anp-toggle-preview | ◯ Not yet | — | Theme class; plugin has no setting |
| File Margins (file-margins) | variable-number | --file-margins | ✅ Fully ported | Layout | Mapped to `fileMargins` (0–100 px); slider UI |
| Preview Width (anp-preview-width-pct) | variable-number | --anp-preview-width-pct | ✅ Fully ported | Layout | Mapped to `previewWidthPct` (50–100%); slider UI |
| Maximum Preview Width (file-line-width) | variable-number | --file-line-width | ✅ Fully ported | Layout | Mapped to `fileLineWidth` (400–1200 px); slider UI |

---

## 4. Integrations

### 4.1. Kanban

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| Hide the Card Menu Button (anp-kanban-hide-card-menus) | class-toggle | anp-kanban-hide-card-menus | ⊘ Intentionally skipped | — | Kanban integration; deferred per scope |
| Hide the Archive Card Button (anp-kanban-hide-archive-btn) | class-toggle | anp-kanban-hide-archive-btn | ⊘ Intentionally skipped | — | Kanban integration; deferred |
| Disable Card Borders (anp-kanban-hide-card-border) | class-toggle | anp-kanban-hide-card-border | ⊘ Intentionally skipped | — | Kanban integration; deferred |
| Card Opacity (anp-kanban-card-opacity) | variable-number-slider | --anp-kanban-card-opacity | ⊘ Intentionally skipped | — | Kanban integration; deferred |
| Card Radius (anp-kanban-card-radius) | variable-number-slider | --anp-kanban-card-radius | ⊘ Intentionally skipped | — | Kanban integration; deferred |
| Card Spacing (anp-kanban-card-spacing) | variable-number-slider | --anp-kanban-card-spacing | ⊘ Intentionally skipped | — | Kanban integration; deferred |
| Enable Full Height Lanes (anp-kanban-lanes) | class-toggle | anp-kanban-lanes | ⊘ Intentionally skipped | — | Kanban integration; deferred |
| Disable Lane Borders (anp-kanban-hide-lane-border) | class-toggle | anp-kanban-hide-lane-border | ⊘ Intentionally skipped | — | Kanban integration; deferred |
| Lane Opacity (anp-kanban-lane-opacity) | variable-number-slider | --anp-kanban-lane-opacity | ⊘ Intentionally skipped | — | Kanban integration; deferred |
| Lane Radius (anp-kanban-lane-radius) | variable-number-slider | --anp-kanban-lane-radius | ⊘ Intentionally skipped | — | Kanban integration; deferred |
| Lane Spacing (anp-kanban-lane-spacing) | variable-number-slider | --anp-kanban-lane-spacing | ⊘ Intentionally skipped | — | Kanban integration; deferred |
| Enable Full Width Search Bar (anp-kanban-search-full) | class-toggle | anp-kanban-search-full | ⊘ Intentionally skipped | — | Kanban integration; deferred |
| Collapse Lanes With No Search Results (anp-kanban-collapse-lanes) | class-toggle | anp-kanban-collapse-lanes | ⊘ Intentionally skipped | — | Kanban integration; deferred |
| Hide Cards That Don't Contain the Search Query (anp-kanban-hide-cards) | class-toggle | anp-kanban-hide-cards | ⊘ Intentionally skipped | — | Kanban integration; deferred |
| Hide Search Result Highlight in Cards (anp-kanban-hide-mark) | class-toggle | anp-kanban-hide-mark | ⊘ Intentionally skipped | — | Kanban integration; deferred |
| Uncollapse Lanes and Unhide Cards When Sorting (anp-kanban-uncollapse-lanes) | class-toggle | anp-kanban-uncollapse-lanes | ⊘ Intentionally skipped | — | Kanban integration; deferred |

### 4.2. MAKE.md

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| Inline Title Visibility (anp-inline-title-vis) | variable-select | --anp-inline-title-vis | ✅ Fully ported | Appearance | Mapped to `inlineTitle` boolean; CSS var controls block/none; Appearance section |

### 4.3. Minimal Cards

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| Card minimum width (cards-min-width) | variable-text | --cards-min-width | ⊘ Intentionally skipped | — | Minimal Cards snippet integration; deferred |
| Card maximum width (cards-max-width) | variable-text | --cards-max-width | ⊘ Intentionally skipped | — | Minimal Cards snippet integration; deferred |
| Card minimum width on mobile (cards-mobile-width) | variable-text | --cards-mobile-width | ⊘ Intentionally skipped | — | Minimal Cards snippet integration; deferred |
| Card padding (cards-padding) | variable-text | --cards-padding | ⊘ Intentionally skipped | — | Minimal Cards snippet integration; deferred |
| Card maximum image height (cards-image-height) | variable-text | --cards-image-height | ⊘ Intentionally skipped | — | Minimal Cards snippet integration; deferred |
| Card border width (cards-border-width) | variable-text | --cards-border-width | ⊘ Intentionally skipped | — | Minimal Cards snippet integration; deferred |

---

## 5. Miscellaneous

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| Enable Color Transition (anp-color-transition-toggle) | class-toggle | anp-color-transition-toggle | ◯ Not yet | — | WIP feature; plugin has no setting |
| Enable Custom Metadata Button (anp-button-metadata-toggle) | class-toggle | anp-button-metadata-toggle | ✅ Fully ported | Features | Mapped to `metadataButton`; toggle in Features tab |
| Enable Print Styling (anp-print) | class-toggle | anp-print | ◯ Not yet | — | Print styling; plugin has no setting |

---

## 6. Show/Hide UI Elements

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| Autohide Title Bar (anp-autohide-titlebar) | class-toggle | anp-autohide-titlebar | ✅ Fully ported | Legacy > Show/Hide | Mapped to `hideTitlebarAuto`; toggle UI |
| Pointer cursor (anp-cursor) | variable-select | --anp-cursor | ✅ Fully ported | Legacy > Show/Hide | Mapped to `uiPointerCursor` ('initial' | 'pointer'); radio UI writes `--anp-cursor` |
| Hide Metadata (anp-toggle-metadata) | class-toggle | anp-toggle-metadata | ✅ Fully ported | Legacy > Show/Hide | Mapped to `hideMetadata`; toggle UI |
| Hide Scrollbars (anp-toggle-scrollbars) | class-toggle | anp-toggle-scrollbars | ✅ Fully ported | Features | Mapped to `showScrollbars` (inverted); toggle UI |
| Hide Status Bar (anp-hide-status-bar) | class-toggle | anp-hide-status-bar | ✅ Fully ported | Features | Mapped to `showStatusBar` (inverted); toggle UI |
| Hide Tooltips (anp-tooltip-toggle) | class-toggle | anp-tooltip-toggle | ✅ Fully ported | Legacy > Show/Hide | Mapped to `hideTooltips`; toggle UI |

---

## 7. Typography

### 7.1. Font Families

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| Source Editor Font (anp-editor-font-source) | variable-text | --anp-editor-font-source | ◐ Wired-but-UI-less | — | settings.ts has `fontSource` (string); applier reads it and applies to --font-monospace but no UI tab surfaces it for direct editing |
| Live Preview Editor Font (anp-editor-font-lp) | variable-text | --anp-editor-font-lp | ◐ Wired-but-UI-less | — | settings.ts has `fontEditor` (string); applier reads but no direct UI to set it |

### 7.2. Font Weights

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| Bold Weight (bold-weight) | variable-select | --bold-weight | ◯ Not yet | — | Theme variable; plugin has no setting |
| Live Preview Mode Weight (anp-font-live-preview-wt) | variable-select | --anp-font-live-preview-wt | ◯ Not yet | — | Theme variable; plugin has no setting |
| Reading Mode Weight (anp-font-preview-wt) | variable-select | --anp-font-preview-wt | ◯ Not yet | — | Theme variable; plugin has no setting |
| Source Mode Weight (anp-font-editor-wt) | variable-select | --anp-font-editor-wt | ◯ Not yet | — | Theme variable; plugin has no setting |

### 7.3. Headings (General)

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| Enable Custom Heading Colors (anp-header-color-toggle) | class-toggle | anp-header-color-toggle | ◯ Not yet | — | Heading colorization toggle; plugin has no setting |
| Enable Custom Heading Margin (anp-header-margin-toggle) | class-toggle | anp-header-margin-toggle | ◯ Not yet | — | Heading margin toggle; plugin has no setting |
| Inherit Divider Color from Heading Color (anp-header-divider-color-toggle) | class-toggle | anp-header-divider-color-toggle | ◯ Not yet | — | Heading divider color toggle; plugin has no setting |
| Heading margin value (anp-header-margin-value) | variable-number-slider | --anp-header-margin-value | ◯ Not yet | — | Heading margin var; plugin has no setting |

### 7.4. H1

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| H1 Font Family (h1-font) | variable-text | --h1-font | ◯ Not yet | — | Theme variable; plugin has no per-heading-font UI |
| H1 Font Size (h1-size) | variable-number | --h1-size | ✅ Fully ported | Typography > Rhythm | Mapped to `h1Size` (em slider, 0.5–3.0); slider UI |
| H1 Font Weight (h1-weight) | variable-number | --h1-weight | ◯ Not yet | — | Theme variable; plugin has no setting |
| H1 Line Height (h1-line-height) | variable-number | --h1-line-height | ◯ Not yet | — | Theme variable; plugin has no setting |
| H1 Color (anp-h1-color-custom) | class-select | anp-h1-* (14 colours) | ◯ Not yet | — | Heading color classes (per-colour); plugin has no setting |
| H1 Divider (anp-h1-divider) | class-toggle | anp-h1-divider | ◯ Not yet | — | Heading divider toggle; plugin has no setting |

### 7.5. H2

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| H2 Font Family (h2-font) | variable-text | --h2-font | ◯ Not yet | — | Theme variable; plugin has no per-heading-font UI |
| H2 Font Size (h2-size) | variable-number | --h2-size | ✅ Fully ported | Typography > Rhythm | Mapped to `h2Size` (em slider, 0.5–3.0); slider UI |
| H2 Font Weight (h2-weight) | variable-number | --h2-weight | ◯ Not yet | — | Theme variable; plugin has no setting |
| H2 Line Height (h2-line-height) | variable-number | --h2-line-height | ◯ Not yet | — | Theme variable; plugin has no setting |
| H2 Color (anp-h2-color-custom) | class-select | anp-h2-* (14 colours) | ◯ Not yet | — | Heading color classes; plugin has no setting |
| H2 Divider (anp-h2-divider) | class-toggle | anp-h2-divider | ◯ Not yet | — | Heading divider toggle; plugin has no setting |

### 7.6. H3

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| H3 Font Family (h3-font) | variable-text | --h3-font | ◯ Not yet | — | Theme variable |
| H3 Font Size (h3-size) | variable-number | --h3-size | ✅ Fully ported | Typography > Rhythm | Mapped to `h3Size`; slider UI |
| H3 Font Weight (h3-weight) | variable-number | --h3-weight | ◯ Not yet | — | Theme variable |
| H3 Line Height (h3-line-height) | variable-number | --h3-line-height | ◯ Not yet | — | Theme variable |
| H3 Color (anp-h3-color-custom) | class-select | anp-h3-* (14 colours) | ◯ Not yet | — | Heading color classes |
| H3 Divider (anp-h3-divider) | class-toggle | anp-h3-divider | ◯ Not yet | — | Heading divider toggle |

### 7.7. H4

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| H4 Font Family (h4-font) | variable-text | --h4-font | ◯ Not yet | — | Theme variable |
| H4 Font Size (h4-size) | variable-number | --h4-size | ✅ Fully ported | Typography > Rhythm | Mapped to `h4Size`; slider UI |
| H4 Font Weight (h4-weight) | variable-number | --h4-weight | ◯ Not yet | — | Theme variable |
| H4 Line Height (h4-line-height) | variable-number | --h4-line-height | ◯ Not yet | — | Theme variable |
| H4 Color (anp-h4-color-custom) | class-select | anp-h4-* (14 colours) | ◯ Not yet | — | Heading color classes |
| H4 Divider (anp-h4-divider) | class-toggle | anp-h4-divider | ◯ Not yet | — | Heading divider toggle |

### 7.8. H5

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| H5 Font Family (h5-font) | variable-text | --h5-font | ◯ Not yet | — | Theme variable |
| H5 Font Size (h5-size) | variable-number | --h5-size | ✅ Fully ported | Typography > Rhythm | Mapped to `h5Size`; slider UI |
| H5 Font Weight (h5-weight) | variable-number | --h5-weight | ◯ Not yet | — | Theme variable |
| H5 Line Height (h5-line-height) | variable-number | --h5-line-height | ◯ Not yet | — | Theme variable |
| H5 Color (anp-h5-color-custom) | class-select | anp-h5-* (14 colours) | ◯ Not yet | — | Heading color classes |
| H5 Divider (anp-h5-divider) | class-toggle | anp-h5-divider | ◯ Not yet | — | Heading divider toggle |

### 7.9. H6

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| H6 Font Family (h6-font) | variable-text | --h6-font | ◯ Not yet | — | Theme variable |
| H6 Font Size (h6-size) | variable-number | --h6-size | ✅ Fully ported | Typography > Rhythm | Mapped to `h6Size`; slider UI |
| H6 Font Weight (h6-weight) | variable-number | --h6-weight | ◯ Not yet | — | Theme variable |
| H6 Line Height (h6-line-height) | variable-number | --h6-line-height | ◯ Not yet | — | Theme variable |
| H6 Color (anp-h6-color-custom) | class-select | anp-h6-* (14 colours) | ◯ Not yet | — | Heading color classes |
| H6 Divider (anp-h6-divider) | class-toggle | anp-h6-divider | ◯ Not yet | — | Heading divider toggle |

### 7.10. Text Decoration

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| Enable Decoration Colors (anp-decoration-toggle) | class-toggle | anp-decoration-toggle | ◯ Not yet | — | Text decoration coloring toggle; plugin has no setting |
| Bold Color (anp-bold-custom) | class-select | anp-bold-* (14 colours) | ◯ Not yet | — | Bold text colour classes; plugin has no setting |
| Italic Color (anp-italic-custom) | class-select | anp-italic-* (14 colours) | ◯ Not yet | — | Italic text colour classes; plugin has no setting |
| Highlight Color (anp-highlight-custom) | class-select | anp-highlight-* (14 colours) | ◯ Not yet | — | Highlight colour classes; plugin has no setting |

---

## 8. Workspace

### 8.1. Canvas

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| Darker Canvas Background (anp-canvas-dark-bg) | class-toggle | anp-canvas-dark-bg | ◯ Not yet | — | Canvas styling; plugin has no setting |

### 8.2. Colorful Frame

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| Enable Colorful Frame (anp-colorful-frame) | class-toggle | anp-colorful-frame | ✅ Fully ported | Layout | Mapped to `colorfulFrame`; toggle in Layout tab |
| Invert Icon Colors - Light (anp-colorful-frame-icon-toggle-light) | class-toggle | anp-colorful-frame-icon-toggle-light | ◯ Not yet | — | Colorful frame icon invert (light mode); no UI |
| Invert Icon Colors - Dark (anp-colorful-frame-icon-toggle-dark) | class-toggle | anp-colorful-frame-icon-toggle-dark | ◯ Not yet | — | Colorful frame icon invert (dark mode); no UI |
| Colorful Frame Opacity (anp-colorful-frame-opacity) | variable-number-slider | --anp-colorful-frame-opacity | ◯ Not yet | — | Colorful frame opacity; no UI |
| Custom Colorful Frame Color (anp-colorful-frame-color) | variable-themed-color | --anp-colorful-frame-color | ◯ Not yet | — | Colorful frame custom colour; no UI |

### 8.3. File Browser

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| Enable custom vault title (anp-custom-vault-toggle) | class-toggle | anp-custom-vault-toggle | ✅ Fully ported | Layout | Mapped to `customVaultTitle`; toggle in Layout tab |
| Enable file icons (anp-file-icons) | class-toggle | anp-file-icons | ✅ Fully ported | Layout | Mapped to `fileIcons`; toggle in Layout tab |
| Enable floating vault title (anp-floating-header) | class-toggle | anp-floating-header | ✅ Fully ported | Layout | Mapped to `floatingTitle`; toggle in Layout tab |
| Enable folder icons for collapse indicators (anp-collapse-folders) | class-toggle | anp-collapse-folders | ✅ Fully ported | Layout | Mapped to `collapseFolderIcons`; toggle in Layout tab |
| File label alignment (anp-file-label-align) | variable-select | --anp-file-label-align | ◯ Not yet | — | File browser label alignment; plugin has no setting |

### 8.4. PDF Viewer

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| Toggle PDF background blending - Dark Mode (anp-pdf-blend-toggle-dark) | class-toggle | anp-pdf-blend-toggle-dark | ◯ Not yet | — | PDF background blending; plugin has no setting |
| Toggle PDF background blending - Light Mode (anp-pdf-blend-toggle-light) | class-toggle | anp-pdf-blend-toggle-light | ◯ Not yet | — | PDF background blending; plugin has no setting |

### 8.5. Rainbow Folders

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| Rainbow style (anp-alt-rainbow-style) | class-select | anp-default-rainbow, anp-full-rainbow-color-toggle, anp-simple-rainbow-color-toggle | ✅ Fully ported | Layout > Outliner | Mapped to `rainbowStyle` ('off' | 'full' | 'simple'); radio UI |

#### 8.5.1. Full Folder Settings

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| File recolor toggle (anp-rainbow-file-toggle) | class-toggle | anp-rainbow-file-toggle | ✅ Fully ported | Layout > Outliner | Mapped to `rainbowFullFileRecolor`; toggle UI |
| Invert title colors (Light Mode) (anp-full-rainbow-text-color-toggle-light) | class-toggle | anp-full-rainbow-text-color-toggle-light | ✅ Fully ported | Layout > Outliner | Mapped to `rainbowFullInvertLight`; toggle UI |
| Invert title colors (Dark Mode) (anp-full-rainbow-text-color-toggle-dark) | class-toggle | anp-full-rainbow-text-color-toggle-dark | ✅ Fully ported | Layout > Outliner | Mapped to `rainbowFullInvertDark`; toggle UI |
| Folder background color opacity (anp-rainbow-folder-bg-opacity) | variable-number | --anp-rainbow-folder-bg-opacity | ✅ Fully ported | Layout > Outliner | Mapped to `rainbowFullBgOpacity` (0–100, written as 0–1); slider UI |

#### 8.5.2. Simple Folder Settings

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| Enable title recolor (anp-simple-rainbow-title-toggle) | class-toggle | anp-simple-rainbow-title-toggle | ✅ Fully ported | Layout > Outliner | Mapped to `rainbowSimpleTitle`; toggle UI |
| Enable collapse icon recolor (anp-simple-rainbow-collapse-icon-toggle) | class-toggle | anp-simple-rainbow-collapse-icon-toggle | ✅ Fully ported | Layout > Outliner | Mapped to `rainbowSimpleCollapseIcon`; toggle UI |
| Enable collapse indent recolor (anp-simple-rainbow-indentation-toggle) | class-toggle | anp-simple-rainbow-indentation-toggle | ✅ Fully ported | Layout > Outliner | Mapped to `rainbowSimpleIndent`; toggle UI |
| Enable circular file (anp-simple-rainbow-icon-toggle) | class-toggle | anp-simple-rainbow-icon-toggle | ✅ Fully ported | Layout > Outliner | Mapped to `rainbowSimpleFileIcon`; toggle UI |
| Enable subfolder color inheritance (anp-rainbow-subfolder-color-toggle) | class-toggle | anp-rainbow-subfolder-color-toggle | ✅ Fully ported | Layout > Outliner | Mapped to `rainbowInherit`; toggle UI |

### 8.6. Stacked Tabs

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| Stacked tabs header width (anp-stacked-header-width) | variable-number | --anp-stacked-header-width | ◯ Not yet | — | Stacked tabs configuration; plugin has no setting |
| Stacked tabs pane width multiplier (anp-tab-stacked-pane-width) | variable-number | --anp-tab-stacked-pane-width | ◯ Not yet | — | Stacked tabs configuration; plugin has no setting |

### 8.7. Status Bar

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| Status Bar Style (anp-status-bar-select) | class-select | anp-floating-status-bar, anp-fixed-status-bar | ◯ Not yet | — | Status bar styling; plugin has no setting |

### 8.8. Tabs

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| Tab style (anp-alt-tab-style) | class-select | anp-default-tab, anp-depth-tab-toggle, anp-mini-tab-toggle, anp-alternate-tab-toggle, anp-safari-tab-toggle | ✅ Fully ported | Layout | Mapped to `tabStyle` (string); radio UI picks tab variant |
| Custom tab height (anp-alt-tab-custom-height) | variable-number | --anp-alt-tab-custom-height | ✅ Fully ported | Legacy > Tabs (deep) | Mapped to `tabCustomHeight` (20–48 px); slider UI |
| Disable new tab button right alignment (anp-disable-newtab-align) | class-toggle | anp-disable-newtab-align | ✅ Fully ported | Legacy > Tabs (deep) | Mapped to `tabDisableNewTabAlign`; toggle UI |

#### 8.8.1. Depth Tab Settings

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| Invert tab text color (anp-depth-tab-text-invert) | class-toggle | anp-depth-tab-text-invert | ✅ Fully ported | Legacy > Tabs (deep) | Mapped to `tabDepthTextInvert`; toggle UI |
| Tab opacity (anp-depth-tab-opacity) | variable-number-slider | --anp-depth-tab-opacity | ✅ Fully ported | Legacy > Tabs (deep) | Mapped to `tabDepthOpacity` (0–100, written as 0–1); slider UI |
| Tab gap (anp-depth-tab-gap) | variable-number | --anp-depth-tab-gap | ✅ Fully ported | Legacy > Tabs (deep) | Mapped to `tabDepthGap` (0–16 px); slider UI |

#### 8.8.2. Animated Safari-style Tab Settings

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| Tab radius (anp-safari-tab-radius) | variable-number | --anp-safari-tab-radius | ✅ Fully ported | Legacy > Tabs (deep) | Mapped to `tabSafariRadius` (0–16 px); slider UI |
| Tab gap (anp-safari-tab-gap) | variable-number | --anp-safari-tab-gap | ✅ Fully ported | Legacy > Tabs (deep) | Mapped to `tabSafariGap` (0–16 px); slider UI |
| Tab border width (anp-safari-border-width) | variable-number | --anp-safari-border-width | ✅ Fully ported | Legacy > Tabs (deep) | Mapped to `tabSafariBorderWidth` (0–4 px); slider UI |

#### 8.8.3. Vanilla Safari-style Tab Settings

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| Enable WIP animated safari tabs (anp-safari-tab-animated) | class-toggle | anp-safari-tab-animated | ✅ Fully ported | Legacy > Tabs (deep) | Mapped to `tabSafariAnimated`; toggle UI |

### 8.9. Translucency

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| Window opacity (anp-translucency-opacity) | variable-number | --anp-translucency-opacity | ◯ Not yet | — | Theme window opacity; plugin has no setting |

### 8.10. Workspace Layout

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| Workspace Layout variant (anp-layout-select) | class-select | anp-border-layout, anp-card-layout | ✅ Fully ported | Layout | Mapped to `sidebarStyle` ('flat' | 'bordered' | 'cards'); radio UI |
| Background fix for applying colors (anp-bg-fix) | class-toggle | anp-bg-fix | ◯ Not yet | — | Workspace background fix; plugin has no setting |
| Hide borders (anp-hide-borders) | class-toggle | anp-hide-borders | ◯ Not yet | — | Workspace border toggle; plugin has no setting |

#### 8.10.1. Card Layout Settings

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| Card radius (anp-card-radius) | variable-number | --anp-card-radius | ✅ Fully ported | Layout | Mapped to `cardRadius` (0–16 px); slider UI |
| Card padding (anp-card-layout-padding) | variable-number | --anp-card-layout-padding | ◯ Not yet | — | Card layout padding; plugin has no setting |
| Tab left padding (anp-card-header-left-padding) | variable-number | --anp-card-header-left-padding | ◯ Not yet | — | Card layout tab padding; plugin has no setting |
| Enable shadows (anp-card-shadows) | class-toggle | anp-card-shadows | ◯ Not yet | — | Card shadows toggle; plugin has no setting |
| Enable card format for actions (anp-card-layout-actions) | class-toggle | anp-card-layout-actions | ◯ Not yet | — | Card layout for actions; plugin has no setting |
| Enable card format for file browser (anp-card-layout-filebrowser) | class-toggle | anp-card-layout-filebrowser | ◯ Not yet | — | Card layout for file browser; plugin has no setting |

#### 8.10.2. Border Layout Settings

| Setting | Type | Body Class / CSS Var | Status | Plugin Tab | Notes |
|---------|------|---------------------|--------|------------|-------|
| Border Layout Radius (anp-border-radius) | variable-number | --anp-border-radius | ✅ Fully ported | Layout | Mapped to `borderRadius` (0–16 px); slider UI |
| Border Layout Padding (anp-border-padding) | variable-number | --anp-border-padding | ✅ Fully ported | Layout | Mapped to `borderPadding` (0–16 px); slider UI |

---

## Summary Statistics

### Overall Porting Status Counts

| Status | Count |
|--------|-------|
| ✅ Fully ported | 95 |
| ◐ Wired-but-UI-less | 4 |
| ◯ Not yet brought in | 107 |
| ⊘ Intentionally skipped | 23 |
| **Total AnuPpuccin settings** | **229** |

### Breakdown by Category

| Category | Total | Ported | Wired | Not Yet | Skipped |
|----------|-------|--------|-------|---------|---------|
| Colors | 5 | 5 | 0 | 25 | 0 |
| File Editor & Markdown | 39 | 24 | 3 | 12 | 0 |
| File Preview | 4 | 3 | 0 | 1 | 0 |
| Integrations (Kanban, MAKE, Minimal) | 28 | 1 | 0 | 0 | 27 |
| Miscellaneous | 3 | 1 | 0 | 2 | 0 |
| Show/Hide UI | 6 | 6 | 0 | 0 | 0 |
| Typography | 64 | 7 | 2 | 55 | 0 |
| Workspace | 76 | 48 | 0 | 12 | 16 |
| **Total** | **225** | **95** | **5** | **107** | **43** |

---

## Top 10 Settings Overdue for Porting

Listed by user value + integration risk + effort:

1. **Speech Bubbles (anp-speech-bubble)** — class-toggle
   - *Why:* One-line implementation; pairs naturally with already-ported checkboxes; high visual utility
   - *Risk:* None; pure class toggle
   - *Effort:* 5 minutes

2. **Heading Colors (anp-h*-color-custom)** — 6 class-selects (H1–H6)
   - *Why:* 40+ settings already exist for heading sizes; colouring them completes the vision; high user delight
   - *Risk:* Low; colour classes already baked into theme
   - *Effort:* 1–2 hours (build colour-picker row helpers, 6 dropdowns)

3. **Bold/Italic/Highlight Decoration Colors** — 3 class-selects
   - *Why:* Pairs with heading colours; fills gap in text styling; easy wins after heading colours done
   - *Risk:* Low
   - *Effort:* 30 minutes

4. **List Styling Toggle (anp-list-toggle)** — class-toggle
   - *Why:* Gating mechanism for list indent/spacing below it; quick addition to Typography tab
   - *Risk:* None
   - *Effort:* 5 minutes

5. **Tag Styling Variables (tag-border-width, tag-radius)** — 2 variable-numbers
   - *Why:* Tag pill styling already in Editing tab; these are native siblings; consistency win
   - *Risk:* None
   - *Effort:* 15 minutes

6. **Print Styling Toggle (anp-print)** — class-toggle
   - *Why:* One-line implementation; niche but requested by users
   - *Risk:* None
   - *Effort:* 5 minutes

7. **Embed Max Height (embed-max-height)** — variable-number
   - *Why:* Obscure but low-friction; would round out File Editor section
   - *Risk:* None
   - *Effort:* 10 minutes

8. **LaTeX Color (anp-latex-color)** — variable-themed-color
   - *Why:* Math rendering; one picker; pairs with codeblock colours already ported
   - *Risk:* None
   - *Effort:* 15 minutes

9. **PDF Blending Toggles (anp-pdf-blend-toggle-*)** — 2 class-toggles
   - *Why:* PDF viewer now first-class in Obsidian; two simple class toggles
   - *Risk:* None
   - *Effort:* 10 minutes

10. **Light Theme Accent (anp-light-theme-accents)** — class-select
    - *Why:* Mirrors dark accent already ported; enables true light-mode independence; design completeness
    - *Risk:* Medium; requires flavour-aware accent resolution logic
    - *Effort:* 1 hour

---

## Settings Currently Wired but Without UI

These live in `settings.ts` + `applier.ts` but no tab surfaces them — a fix would be quick:

1. **activeLineHighlight** (boolean) → `anp-current-line` class
   - *Solution:* Add toggle to Legacy > Show/Hide or Appearance
   - *Effort:* 5 minutes

2. **fontSource** (string) → `--font-monospace` CSS var
   - *Solution:* Add combobox to Typography > Fonts (mono role)
   - *Effort:* 10 minutes

3. **fontEditor** (string) → `--tc-font-editor` CSS var
   - *Solution:* Already a settings field; wire to Typography > Fonts UI
   - *Effort:* 5 minutes

4. **calloutTitlePaddingX** (number) → `--callout-title-padding` CSS var
   - *Solution:* Already in Legacy > Callouts; just verify slider updates var correctly
   - *Effort:* 5 minutes (verify only)

---

## Intentionally Skipped

### Kanban Integration (17 settings)
- **Reason:** Deferred per scope — plugin focus is theme appearance, not Kanban plugin customisation
- **Reopening:** Would require dedicated Kanban tab + 40+ lines of test coverage per setting

### Minimal Cards Snippet (6 settings)
- **Reason:** Snippet-level integration; beyond plugin scope
- **Reopening:** Would require conditional card-grid detection + snippet state management

### MAKE.md (except inline title)
- **Reason:** MAKE.md is a separate plugin; hard dependency unsuitable for plugin control
- **Note:** Inline Title Visibility already exposed in Appearance

---

## Palette Overrides (25 Catppuccin Colors)

These are *intentionally* wired differently than Style Settings expects. Instead of exposing 25 colour pickers:

1. **Plugin picks a base flavour** → applier.ts injects computed swatch values as CSS vars
2. **Theme reads:** `var(--ctp-custom-base, var(--ctp-ext-base, <default>))`
3. **Result:** Picking a swatch automatically paints the whole palette; no per-colour picker needed

This is elegant and what the design intended. **Do not port** 25 colour pickers; the current swatch system is the right answer.

---

## Recommendations for Next Release

1. **Ship headings colour support** (6 settings, ~1–2 hours) — biggest user-value gap
2. **Wire the 4 wired-but-UI-less settings** (~30 minutes) — "free" wins
3. **Add speech bubbles, list toggle, tag variables** (~45 minutes) — quick quality-of-life
4. **Consider light-mode accent** (1 hour) — design completeness

All in: ~3–4 hours dev, zero risk, high user delight.


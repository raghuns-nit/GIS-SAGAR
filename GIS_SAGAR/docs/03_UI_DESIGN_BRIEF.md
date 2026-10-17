# Visual direction: a climate-action field console

## Audience and task

Groundwater users, community facilitators, students and technical practitioners need to select a location, understand its evidence and identify a useful next assessment. Give the map and evidence priority. The application should feel like a considered scientific instrument rather than a generic sustainability landing page.

## Reference and interpretation

Reference: https://hairline.lucasmarkes.com/figures (reviewed 17 October 2026). Its minimal visual language is an aesthetic reference rather than a required reproduction. Translate that preference into fine contours, restrained linework, quiet surfaces, precise alignment and purposeful interaction. Do not copy brand marks, add a gallery of unrelated animations or make Hairline a runtime dependency. A small conceptual contour motif in About is appropriate; it is decorative, not a terrain measurement.

## Composition

- Compact header: GIS–SAGAR / Groundwater recharge; About, Help and Export results.
- One task toolbar: Site assessment, area, Load test site, then Site / Data / Settings disclosure controls.
- Desktop: map on the left, results on the right; approximately 60–65% map width. Avoid a hero banner above the work area.
- Mobile: toolbar, map, results. Controls and source checks remain reachable without a horizontal page scroll.
- Results: cell selection, screening score, mapped soil, slope, preliminary recommendations. Supporting source details, soil profile, complete structure list and requirements remain collapsed.
- About and Help are compact accessible reading panels already implemented in InfoPanel.tsx. Preserve their content and focus/escape behaviour.

## Tokens

| Role | Direction |
|---|---|
| Ground | Warm off-white / mineral grey, around #F3F5F1 |
| Surface | Near-white, around #FCFDF9 |
| Ink | Deep grey-green, around #213C33 |
| Primary action | Forest green, around #174D40 |
| Water accent | Desaturated teal; use sparingly |
| Divider | Fine light grey-green; not the only status cue |
| Unconfirmed status | Muted amber with explicit text |
| Type | System sans-serif or one lightweight, dependable sans family; tabular numerals for scores |
| Shape | 5–10 px radii, flat surfaces, limited shadow only for overlays |

Body text should remain legible; do not make the product sleek by shrinking all text. Touch targets should remain comfortable. Keep copy short in the work area; move explanation to Help. Source codes, spreadsheet names, row numbers, package versions, tokens and backend configuration details do not belong in the normal assessment flow.

## Motion

No autoplay water particles, rotating globe, parallax, bouncing cards or animated score counters. If adding transitions, use short opacity/state transitions with reduced-motion support. Map data must remain literal; decorative imagery must not imply observed recharge.

## Interaction integrity

A map-cell click selects its result and does not clear the boundary. Data-source changes clear the loaded observations. Weight changes rescore saved observations. Site changes clear observations and context. Unknown, missing, error, synthetic and real-data states remain distinct. Add a proper sign-in flow before claiming authenticated live operation; do not expose service keys in a visitor form.

## Success criterion

The first view should make the next action obvious without a wall of text. The loaded view should answer: Where is the site? What evidence do we have? What does the screening suggest? What needs checking on site?

# Acceptance and rollback

## Baseline

The default model is v1-development-0.4. About/Help panels and technical documentation accompany the application. The saved observation fixture provides a reproducibility baseline.

## Required checks

1. `npm ci`, `npm test`, `npm run build`.
2. Start with Load test site. Confirm 16 cells, five scores 60, eleven scores 30, no primary structure candidate and two provisional options retaining null structure scores.
3. Select a cell on the map and in the selector; confirm that evidence remains loaded and selection agrees.
4. Adjust a weight; confirm rescoring and no data request. Reset to baseline.
5. Change boundary; confirm old evidence/context are cleared. Import mismatch must produce an error.
6. Open About and Help; verify long content scrolls, links work, Escape closes the dialog and focus returns. Check keyboard navigation and desktop/mobile layouts.
7. Preserve explicit source choice and distinct synthetic, missing and provider-error states.
8. The normal interface must not expose internal sheet names, row IDs, 'No structure shortlisted' or standalone 'Not shortlisted' cards. Confirmed exclusion messages must remain truthful.
9. Keep existing raw outcome enums and provenance in exported results; do not alter the engine to make recommendation wording more positive.

The provided baseline has 67 model/spatial/provider-contract tests. None of these tests establishes browser quality, authenticated provider parity, field permeability or engineering suitability. Record the checks actually performed.

## Development workflow

Create a baseline commit/tag before editing. Keep visual refinement separate from live integration and future ranking-policy work. Store the data fixture unchanged. Do not mix the proposed India structure-specific rules into a visual redesign.

## Rollback

- UI rollback: revert frontend/content/style commits. Source data and model remain unchanged.
- API rollback: disable the live action and return to the Code Editor/import workflow; retain a visible connection status.
- Policy rollback: restore the exact baseline config and engine, then reproduce the saved 16-cell results.
- Supabase state: source-control history restores application source, not database contents or secrets. Keep any eventual migrations additive and review their independent rollback before running them.

No data migration or production-secret change is part of this application version.

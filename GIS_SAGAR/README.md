# GIS–SAGAR

Smart Application for Groundwater Artificial Recharge.

A map-based decision-support application for preliminary groundwater-recharge assessment. Soil texture and slope are enabled for the current assessment within a configurable framework. Source provenance, missing data, structure applicability and outstanding site checks remain explicit.

## Run

Node 24 recommended; minimum Node 20.19.

```sh
npm ci
npm test
npm run build
npm run dev
```

## Application

- React/TypeScript/Vite interface with a map/results workspace and About/Help panels.
- TypeScript scoring, input validation, soil classifiers and structure catalogue.
- Real Earth Engine observations and an input/configuration/result snapshot for reproducibility.
- Earth Engine extraction scripts, SDK utilities and a Supabase Edge Function adapter.
- Product, model, design, help, API and verification documentation in docs/.

## Documentation

| Document | Contents |
|---|---|
| docs/01_PRODUCT_BRIEF.md | Purpose and intended users |
| docs/02_MODEL_IMPLEMENTATION.md | Scoring and data contracts |
| docs/03_UI_DESIGN_BRIEF.md | Interface design |
| docs/04_ABOUT_COPY.md | About content |
| docs/05_USER_GUIDE.md | Application help |
| docs/06_LIVE_API_SETUP.md | Authentication and extraction setup |
| docs/07_ACCEPTANCE_AND_ROLLBACK.md | Acceptance checks and rollback |
| docs/08_PROPOSAL_TRACEABILITY.md | Research and design basis |
| docs/09_RESEARCH_RULES_BACKLOG.md | Structure-specific rule development |

## Example assessment

Load test site opens a 100 m × 100 m site near longitude 74.794309, latitude 13.018185760719339. Its 16 cells produce five location indices of 60 and eleven of 30 under the default model. Provisional structure options require site checks. These scores do not establish infiltration capacity or engineering suitability.

## Implementation status

Observation import, cell inspection, model configuration and JSON export are implemented. Direct hosted OpenLandMap extraction, authenticated provider parity, detailed field-observation forms and persistent assessment history require further implementation or verification. See VERIFICATION.md for checks performed.

## Research attribution

The project rationale derives from the GIS–SAGAR proposal by Anagha Raghunandan. Canonical application copy is in src/content/siteCopy.json.

## Configuration

Store Google credentials and Supabase secret/service-role keys in private server settings. The .env.example file contains configuration names and empty credential values.

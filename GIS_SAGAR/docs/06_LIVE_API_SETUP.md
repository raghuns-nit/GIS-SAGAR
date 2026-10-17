# Live Earth Engine integration

## Confirmed identifiers

- Google Cloud project ID: `nitk-cnn` (display name: NITK CNN).
- Service account: `gis-sagar-backend@nitk-cnn.iam.gserviceaccount.com`.
- Credentials and roles have not been independently verified. Private credentials and a verified hosted backend are not included.

## Intended topology

React UI → authenticated Supabase Edge Function → Google OAuth token → Earth Engine value:compute → validated evidence bundle → existing local decision engine.

Use the existing TypeScript/Deno adapter as the starting point. The current source authenticates a Supabase user and checks a pilot allowlist. Do not replace this with an origin check alone or make a Google compute endpoint anonymously callable. Keep the explicit observation-import route working while integrating the API.

## Existing files

- `supabase/functions/extract/index.ts`: server-side Google token exchange and fixed expression invocation.
- `src/core/request.ts`: validated boundary and server-rebuilt grid.
- `src/core/geeRest.ts`: fixed Earth Engine expression and response adapter.
- `scripts/gee-common.mjs`: official-SDK extraction builder.
- `scripts/gee-extract.mjs`: local ADC-based extraction utility.
- `gee/GWR1_74_794309_Site_Test.js`: source-comparison extractor successfully run by the user.

## Required implementation before the first hosted OpenLandMap request

1. Add a validated `soilSource` field to requests; allow only SOILGRIDS and OPENLANDMAP. Preserve old SoilGrids requests through a documented default. Source selection must never permit caller-defined Earth Engine assets or expressions.
2. Extend SDK and REST builders for `OpenLandMap/SOL/SOL_TEXTURE-CLASS_USDA-TT_M/v02`, bands b0/b10/b30/b60/b100. Reuse the checked 12-class mapping in soil.ts.
3. Sample soil using its complete native projection; do not pass Projection.transform() text into numeric crsTransform. Preserve ALOS slope sampling and the degrees-to-percent conversion. Record the sampling method and source projections.
4. Return the existing EvidenceBundle with explicit root/cell soilSource, soil:null for categorical input, and soilTextureProfile containing provider asset and depth/class/texture values. Preserve source errors and missing values. Keep terrain observations when a soil source fails; do not silently substitute a different source or synthetic results.
5. Replace manual session-token entry with a simple pilot Supabase Auth flow. Verify the signed-in user server-side and preserve ALLOWED_USER_IDS enforcement. A publishable Supabase key is not the user session token; support current Supabase key formats deliberately.
6. Configure credentials through private server-secret settings. Create a service-account key only when the storage destination is ready.
7. Deploy and compare against the saved baseline for the same boundary. Report request time, selected source, coverage, failures and parity separately from model suitability.

## Server settings

| Name | Meaning |
|---|---|
| GEE_PROJECT_ID | nitk-cnn |
| GEE_SERVICE_ACCOUNT_JSON | Complete Google service-account JSON, private server secret |
| ALLOWED_ORIGIN | Exact deployed frontend origin, without a path |
| ALLOWED_USER_IDS | Pilot Supabase Auth user IDs, comma-separated |
| SUPABASE_URL | Normally supplied to the Edge runtime |
| SUPABASE_ANON_KEY | Existing adapter uses this legacy public key for user verification; update deliberately if using current publishable-key settings |

Supabase reserves the SUPABASE_ prefix for its injected settings; do not attempt to create custom secrets with that prefix. Use the runtime-provided values or adapt the server to a separately named public-key setting if required.

Frontend: VITE_ANALYSIS_ENDPOINT points to the deployed extract function. If adding Supabase Auth, use VITE_SUPABASE_URL and a browser-safe publishable key. Google credentials and Supabase secret/service-role keys must never be VITE variables or frontend fields.

## Google setup

The project must be registered for Earth Engine and have the API enabled. The service account requires Earth Engine Resource Viewer and Service Usage Consumer roles on the computation project. Verify permissions with a small computation before the full 16-cell test. Use private server settings for a service-account key when the selected hosting setup requires it. Keep Google errors in server diagnostics without logging credentials.

## Live acceptance gates

- Unauthenticated and non-allowlisted users are rejected; allowed user succeeds.
- Requests use the server-rebuilt boundary/grid, not caller points or asset IDs.
- Both selected-source paths are exercised, including expected missing SoilGrids at this location.
- OpenLandMap class/depth mapping and ALOS slopes match the comparison fixture within justified numeric tolerances. Do not conceal a mismatch by changing fixture values or model weights.
- Complete saved-site observations reproduce five scores of 60 and eleven of 30, with no primary candidate and original null exploratory scores.
- Weight-only rescoring makes zero Earth Engine calls.
- Provider failure leaves an explicit error/no-data state; no synthetic fallback.
- Existing regression tests remain passing; add meaningful source-contract and authenticated-path checks.

## Sources for setup

- https://developers.google.com/earth-engine/guides/service_account
- https://developers.google.com/earth-engine/guides/access_control
- https://supabase.com/docs/guides/functions/secrets
- https://supabase.com/docs/guides/functions/quickstart-dashboard

Configure the frontend and Supabase project deliberately. Keep observation import available until live extraction is validated.

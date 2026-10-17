# Implemented model and data contracts

This describes executable application behaviour, not an engineering standard. The baseline model version is v1-development-0.4.

## Boundary and sampling

A pin-centred metric rectangle or imported/drawn polygon defines the site. The grid clips 30 m analysis cells to the boundary and retains each cell’s area and representative point. Site validation and projection/grid construction live in src/core/geometry.ts. Backend validation rebuilds the grid from the boundary rather than trusting caller-supplied sampling points. The pilot backend limits requests to 1,500 cells; site validation limits total area to 4 km².

Changing the boundary clears observations and context. Imports must match the boundary and account for every cell, including no-data cells. Coordinate order in GeoJSON/Earth Engine is longitude, latitude.

## Soil input

- SoilGrids: sand/silt/clay means, originally g/kg, converted to percentages; intervals 0–5, 5–15, 15–30, 30–60 and 60–100 cm. Fractions are checked, then normalized within the configured tolerance and classified with USDA decision regions.
- OpenLandMap: categorical USDA codes at depths 0, 10, 30, 60 and 100 cm. Preserve code, canonical texture, provider asset and depth. Do not invent fractions or relabel point depths as interval averages.
- Source choice is explicit. A missing selected source remains missing even when another source contains data.
- The minimum configured texture rank across the required profile controls the current soil rank. This is a development screening assumption. The broader, structure-specific receiving-profile design discussed in research has not replaced it.

## Score

For the enabled factors, compute the weighted mean rank, then convert it to the 0–100 index:

`score = 50 * ((sum(weight * rank) / sum(weight)) - 1)`

Ranks range from 1 to 3. An enabled factor with missing/invalid evidence produces a null score. Do not remove the factor and renormalize the denominator for that cell. Disabled weights remain stored. Null is never zero.

Location weights: soil 10, slope 15. Structure weights: soil 25, slope 20. These are development coefficients, not independently validated hydraulic coefficients.

The location slope bins give rank 3 below 5%, rank 2 from 5% through 15% inclusive, and rank 1 above 15%. The individual bins and endpoint rules in config.ts and engine.ts remain authoritative.

## Structure rules

Every catalogue family is evaluated. The catalogue contains 11 original families and 2 supplemental infiltration families. 'Family' means an intervention class, not a model node or a construction design.

Numerical structure mappings currently apply to:

| Variant | Minimum soil rank | Slope bins and ranks | Candidate threshold |
|---|---:|---|---:|
| Shallow infiltration pit | 2 | <3%: 3; 3–<5%: 2; 5–<10%: 1; ≥10%: unsupported | 50 |
| Shallow infiltration trench | 2 | <3%: 2; 3–<5%: 3; 5–<10%: 2; ≥10%: unsupported | 50 |
| Shallow spreading basin | 2 | <3%: 3; 3–<5%: 1; ≥5%: unsupported | 50 |

A low soil rank or unsupported slope gives the original NOT_SHORTLISTED outcome with no numerical score. A candidate score is conditional: outstanding field requirements remain visible. The spreading-basin score does not automatically apply to a full percolation tank or tank-plus-shaft variant.

Other structures return explicit evidence/applicability outcomes; do not assign them a pit/trench score. Channel/tank/well absence can make the matching intervention inapplicable. Recorded exclusions and failed water-quality/groundwater-separation checks block affected options. Unknown conditions remain unknown.

## Exploratory presentation

When there are no primary candidates, the engine targets two distinct non-excluded options. Evidence-support tiers precede the configured family order. Ties and original outcomes remain preserved. The saved site displays pit and trench as provisional options; it does not establish that they are the two hydraulically best structures.

The interface says 'Preliminary recommendations' when a complete screening score exists, and 'Options for site assessment' when it does not. Exploratory cards say 'Suitability unconfirmed' and describe their current limitation. The full original outcome remains in exported results. Presentation must never upgrade a weak result to confirmed suitability.

## Verified real-data fixture

- Centre: longitude 74.794309, latitude 13.018185760719339.
- Site: 100 m × 100 m; 16 clipped cells.
- ALOS slopes: all 16 cells, approximately 0–11.453%.
- SoilGrids: no complete local fractions; no request error. Nearby diagnostic pixels are not assigned to the site.
- OpenLandMap: all required depths present. Surface texture: loam in 12 cells, clay loam in 4; deeper sampled depths: clay loam throughout.
- Current model: soil rank 1 for every cell; five location scores 60, eleven scores 30; no primary structure candidates; pit/trench provisional options with null structure scores.

The approximately 250 m soil support is coarser than the whole test site. Sixteen analysis cells are not sixteen independent soil measurements. No subpixel soil detail, recharge volume, engineering dimensions or field suitability is established.

## Snapshots and storage

Export results downloads JSON containing evidence, configuration, context and results. The fixed example snapshot is reproducibility evidence. Runtime assessment state is page memory; there is no implemented cloud history database or snapshot import UI. Model configuration import/export is implemented. PDF, Excel and separately downloadable HTML reports are not implemented.

## Live integration boundary

The Code Editor comparison script has produced real results. The Node SDK and Supabase REST adapters are source-ready prototypes whose authenticated parity remains unverified. They currently request SoilGrids and ALOS, not OpenLandMap. The frontend correctly rejects a hosted OpenLandMap request. Extend the complete contract before enabling it: see 06_LIVE_API_SETUP.md.

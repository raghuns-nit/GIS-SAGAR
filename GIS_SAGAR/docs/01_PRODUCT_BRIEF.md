# GIS–SAGAR: product brief

## Purpose

GIS–SAGAR means Smart Application for Groundwater Artificial Recharge. Its purpose is to make geospatial recharge screening accessible to groundwater users and technical practitioners, so they can identify options for site assessment and discuss the evidence together. It is an environmental decision-support application with a climate-adaptation purpose, not a generic climate marketing site.

## Rationale from the original proposal

The project proposal identifies two connected gaps: access to practical technology and community participation. It argues that locating recharge opportunities and selecting a structure need to be addressed together. It proposes a site-selection workflow that combines remote-sensing/GIS layers with local conditions and a structure repository. Community access supports better-informed participation; it does not remove the need for hydrogeological and engineering review.

## Current user journey

1. Load the saved real-data test site, or select a boundary.
2. Explicitly select a soil source and import matching observations.
3. Inspect soil texture, slope and cell screening scores on the map.
4. Read preliminary recommendations, current evidence limitations and outstanding site checks.
5. Record channel/tank/well presence or verified exclusions.
6. Adjust enabled-factor weights and export the assessment.

## Enabled factors

Soil texture and slope are enabled for now. The configuration retains geology, geomorphology, land cover, drainage, weathering thickness, post-monsoon groundwater depth and rainfall for staged integration. Retaining a factor is different from having live observations or a complete structure-specific rule for it. Enabling an unsupported factor must not manufacture a complete score.

## Current implementation versus the research vision

The current application is React/TypeScript/Vite, with a pure deterministic weighted screening engine, Leaflet mapping and Earth Engine extraction utilities. The original proposal discussed ArcGIS and an AI/nearest-neighbour component. Those are historical design proposals, not claims about the present runtime. The application uses this stack. No LLM, learned ranking model, nearest-neighbour zone selection or ArcGIS service runs in this baseline.

## Language and claims

Use 'Preliminary recommendations', 'Suitability unconfirmed', 'Site checks', 'Mapped soil' and 'Screening score'. The data and model should support constructive next steps. An exploratory option whose preference criteria are not met must retain a clear limitation statement. Never represent a fixed fallback order as a scientifically established best choice. Confirmed exclusions remain effective.

Avoid internal spreadsheet titles, sheet/row identifiers, development sequence labels, long implementation caveats and unsupported impact claims in the public interface. Retain source lineage internally. Do not describe an individual cell as construction-ready, a score as recharge probability, or an assessment as validated by CGWB/Esri/NITK.

## Research attribution

The proposal is titled 'GIS - SAGAR: Smart Application for Groundwater Artificial Recharge' and names Anagha Raghunandan as author. Preserve that original-proposal attribution. Do not infer an employer, institutional endorsement or ownership change from the current developer’s account or the Cloud project name.

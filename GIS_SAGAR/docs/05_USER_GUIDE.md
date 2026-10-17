# Using GIS–SAGAR

Select a site. Read the evidence. Check the conditions.

Start with the saved test site, or import observations for your own boundary.

## 1 · Open a site

Choose Load test site for the saved 100 m × 100 m example. For another location, open Site and enter coordinates, adjust the dimensions, import a boundary or draw one on the map. Changing the boundary clears its observations and recorded site conditions.

## 2 · Load observations

Open Data, choose the soil source and import matching observations. OpenLandMap supplies texture classes at stated depths; SoilGrids supplies sand, silt and clay fractions for depth intervals. Source choice is explicit. Missing values are not filled from another dataset.

## 3 · Inspect the map

Select a coloured cell to view its mapped soil, slope and screening score. The score expresses relative preference under the current settings, not recharge probability. A 30 m analysis grid does not increase the approximately 250 m soil-data resolution.

## 4 · Read recommendations

Preliminary recommendations identify options for site assessment. Suitability unconfirmed means that an option still needs supporting field evidence. Limited screening support identifies a soil or slope constraint. Open Site checks for each option’s outstanding conditions. Structures excluded by recorded conditions are not suggested.

## 5 · Add site context

Under Site → Site conditions, record whether a channel, tank or dug well is present, absent or unknown. Exclude a structure only after site review. Detailed infiltration, groundwater and water-quality measurements are not yet collected through dedicated forms.

## 6 · Adjust the model

Open Settings to adjust the enabled factors’ location and structure weights. Existing observations are rescored without another data request. Additional factors need their own observations and assessment rules. Reset weights & rules returns to the baseline.

## 7 · Save the assessment

Export results downloads a JSON snapshot containing observations, settings, recorded conditions and calculated results. Export settings saves the model configuration separately. Assessment state is held in the current page session.

## Live data

The saved test data came from a real Earth Engine run. The hosted connection still requires backend configuration and validation. OpenLandMap currently uses the comparison-script/import workflow; the hosted adapter must be extended before retrieving it directly.

Use field verification and appropriate technical review before selecting or constructing a recharge intervention.

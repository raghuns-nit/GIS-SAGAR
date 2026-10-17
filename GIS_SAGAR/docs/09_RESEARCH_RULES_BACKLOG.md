# India structure-specific rules: research backlog

Status: proposed design direction, not implemented in this application version. Structure-specific soil/formation logic requires development; a validated nationwide 12-USDA-texture × 8-structure numeric matrix is not established here.

| Intervention | Future rule emphasis |
|---|---|
| Ditch/furrow | Receiving permeability, flow layout and diversion source; texture as screening evidence |
| Percolation tank / spreading basin | Separate variants; receiving formation, unsaturated storage, runoff and footprint |
| Check dam / nala bund | Channel presence and bed/underlying formation; catchment and structural conditions |
| Gabion | Channel/erosion-control purpose; recharge benefit needs receiving-ground evidence |
| Village-tank modification | Existing tank, bed condition, sediment and receiving formation; separate tank-plus-shaft variants |
| Inter-watershed transfer | Donor/receiver water balance and transfer route, plus a defined receiving recharge intervention |
| Dug-well recharge | Existing well, condition, aquifer acceptance and water quality; surface texture is not the main ranking variable |
| Recharge shaft | A confirmed low-permeability cover plus a suitable receiving layer; do not promote solely because topsoil is clay-rich |

## Governing principles for later implementation

Separate location preference, structure applicability, hydraulic compatibility and evidence completeness. Unknown evidence is not an engineering exclusion and not a suitability bonus. Evaluate the receiving formation appropriate to the mechanism. Keep a missing-data status instead of creating arbitrary scores. Use current Indian practice as supporting context, not as a substitute for site evidence.

Sources for further development:
- CGWB 2020 Master Plan, Chapter 5: https://faolex.fao.org/docs/pdf/ind211054.pdf
- Government sustainability manual, sections 8.4 and 8.8: https://jaljeevanmission.gov.in/sites/default/files/guideline/Sustainability%20Manual%20Final%2029032012_0.pdf
- NPTEL, Artificial recharge: https://archive.nptel.ac.in/content/storage2/courses/105103026/module4/lec29/2.html

Do not change baseline soil ranks or thresholds as part of design polish or API plumbing. A future matrix needs source, section/page, rule type, data requirement, exceptions and regression examples before activation.

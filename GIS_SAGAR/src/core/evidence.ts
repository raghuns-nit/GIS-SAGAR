import {validateSite,geometryKey,makeGrid,type Site,type GridCell} from './geometry.ts';
import type {CellEvidence,SoilSource,SoilTextureProfile} from './types.ts';
import {OPENLANDMAP_ASSET,OPENLANDMAP_TEXTURES,TEXTURE_DEPTHS,validateTextureProfile} from './soil.ts';
export interface EvidenceBundle {schema:'gis-sagar-evidence-v1';mode:'GEE'|'SYNTHETIC';site:Site;createdAt:string;method:string;sourceAssets:string[];soilSource?:SoilSource;sourceMetadata?:Record<string,unknown>;cells:(CellEvidence&{spatial:GridCell})[]}
export function validateBundle(raw:unknown,expectedSite?:Site,soilSource:SoilSource='SOILGRIDS'):EvidenceBundle {
 if((raw as {type?:string})?.type==='FeatureCollection')raw=fromGEEGeoJSON(raw,soilSource);
 const b=raw as EvidenceBundle;
 if(b?.schema!=='gis-sagar-evidence-v1'||!['GEE','SYNTHETIC'].includes(b.mode))throw new Error('Unsupported evidence file.');
 validateSite(b.site);if(expectedSite&&geometryKey(b.site)!==geometryKey(expectedSite))throw new Error('Evidence belongs to a different boundary.');
 if(!Array.isArray(b.sourceAssets)||!b.sourceAssets.every(x=>typeof x==='string')||typeof b.method!=='string'||typeof b.createdAt!=='string')throw new Error('Evidence provenance is missing.');
 if(!Array.isArray(b.cells)||!b.cells.length||b.cells.length>5000)throw new Error('Evidence needs 1–5,000 cells.');
 if(b.soilSource!==undefined&&!['SOILGRIDS','OPENLANDMAP'].includes(b.soilSource))throw new Error('Unknown bundle soil source.');
 if(b.soilSource==='OPENLANDMAP'&&!b.sourceAssets.includes(OPENLANDMAP_ASSET))throw new Error('OpenLandMap source asset is missing.');
 for(const c of b.cells){
  if(c.soilSource!==undefined&&!['SOILGRIDS','OPENLANDMAP'].includes(c.soilSource))throw new Error('Unknown cell soil source.');
  if(b.soilSource!==undefined&&(c.soilSource??'SOILGRIDS')!==b.soilSource)throw new Error('Mixed soil sources in evidence bundle.');
  if(c.soilTextureProfile!=null)validateTextureProfile(c.soilTextureProfile);
 }
 const grid=new Map(makeGrid(b.site).map(c=>[c.id,c]));
 if(b.cells.length!==grid.size)throw new Error('Evidence must account for every analysis cell, including no-data cells.');
 const ids=new Set<string>();for(const c of b.cells){if(typeof c.id!=='string'||ids.has(c.id))throw new Error('Missing or duplicate cell ID.');ids.add(c.id);const expected=grid.get(c.id);if(!expected||!c.spatial||c.spatial.id!==c.id||!Number.isFinite(c.spatial.areaM2)||Math.abs(c.spatial.areaM2-expected.areaM2)>0.1)throw new Error('Cell support does not match the selected boundary/grid.');c.spatial=expected;if(c.slopePercent!==null&&(typeof c.slopePercent!=='number'||!Number.isFinite(c.slopePercent)||c.slopePercent<0))throw new Error('Invalid slope observation.');if(c.soil!==null&&(!Array.isArray(c.soil)||c.soil.some(l=>typeof l.depth!=='string'||[l.sand,l.silt,l.clay].some(v=>typeof v!=='number'))))throw new Error('Invalid soil observation.');}
 return structuredClone(b);
}
export function fromGEEGeoJSON(raw:unknown,soilSource:SoilSource='SOILGRIDS'):EvidenceBundle {
 const fc=raw as {features:{properties:Record<string,unknown>;geometry:GridCell['geometry']}[]};
 if(!Array.isArray(fc.features)||!fc.features.length||fc.features.length>5000)throw new Error('Invalid GEE observation collection.');
 const first=fc.features[0].properties;
 if(first?._schema!=='gis-sagar-gee-feature-v1'||typeof first._site_json!=='string')throw new Error('This GeoJSON is not a GIS-SAGAR extraction.');
 const site=validateSite(JSON.parse(first._site_json));
 if(!['SOILGRIDS','OPENLANDMAP'].includes(soilSource))throw new Error('Unknown soil source.');
 if(soilSource==='OPENLANDMAP'&&first._openlandmap_asset!==OPENLANDMAP_ASSET)throw new Error('This extraction does not include the verified OpenLandMap asset. Use the comparison extractor.');
 const sourceErrors=first._source_errors_json?JSON.parse(String(first._source_errors_json)):{};
 return {schema:'gis-sagar-evidence-v1',mode:'GEE',site,soilSource,createdAt:String(first._created_at),method:String(first._method),sourceAssets:soilSource==='OPENLANDMAP'?[ASSETS[0],OPENLANDMAP_ASSET]:ASSETS,sourceMetadata:{alosTiles:first._alos_tiles?JSON.parse(String(first._alos_tiles)):[],soilBands:first._soil_bands?JSON.parse(String(first._soil_bands)):[],soilProjection:first._soil_projection??null,terrainProjection:first._terrain_projection??null,sourceErrors,sourceDetails:first._source_details_json?JSON.parse(String(first._source_details_json)):null,soilGridsValidPixelsWithin1km:first._soilgrids_valid_pixels_1km_json?JSON.parse(String(first._soilgrids_valid_pixels_1km_json)):null,textureDepthsCm:soilSource==='OPENLANDMAP'?TEXTURE_DEPTHS:null,soilSelection:'Explicit import selection; no fallback between soil sources.'},cells:fc.features.map(f=>{
  const p=f.properties;if(p._site_json!==first._site_json)throw new Error('Mixed site boundaries in extraction.');
  if(p._schema!==first._schema||p._created_at!==first._created_at||p._source_errors_json!==first._source_errors_json||(soilSource==='OPENLANDMAP'&&p._openlandmap_asset!==OPENLANDMAP_ASSET))throw new Error('Mixed extraction provenance.');
  const id=String(p.id);const depths=['0-5','5-15','15-30','30-60','60-100'];
  const has=depths.every(d=>['sand','silt','clay'].every(k=>typeof p[k+'_'+d+'cm_mean']==='number'));
  let soilTextureProfile:SoilTextureProfile|null=null;
  if(soilSource==='OPENLANDMAP'&&!sourceErrors.OPENLANDMAP){
   soilTextureProfile={source:'OPENLANDMAP',asset:OPENLANDMAP_ASSET,layers:[]};
   for(const depthCm of TEXTURE_DEPTHS){
    const value=p['olm_b'+depthCm];if(value===null||value===undefined)continue;
    if(typeof value!=='number'||!Number.isInteger(value)||value<1||value>12)throw new Error('Invalid OpenLandMap class code.');
    const texture=OPENLANDMAP_TEXTURES[value-1];
    if(p['olm_b'+depthCm+'_texture']!==undefined&&p['olm_b'+depthCm+'_texture']!==texture)throw new Error('OpenLandMap class and label disagree.');
    soilTextureProfile.layers.push({depthCm,sourceClass:value,texture});
   }
  }
  return {id,soilSource,soilTextureProfile,spatial:{id,geometry:f.geometry,areaM2:Number(p._area_m2),point:JSON.parse(String(p._point_json))},slopePercent:typeof p.slope_percent==='number'?p.slope_percent:null,soil:has&&!sourceErrors.SOILGRIDS?depths.map(depth=>({depth,sand:Number(p['sand_'+depth+'cm_mean'])/10,silt:Number(p['silt_'+depth+'cm_mean'])/10,clay:Number(p['clay_'+depth+'cm_mean'])/10})):null};
 })};
}
export const ASSETS=['JAXA/ALOS/AW3D30/V4_1','projects/soilgrids-isric/sand_mean','projects/soilgrids-isric/silt_mean','projects/soilgrids-isric/clay_mean'];
export function geeRequest(site:Site,cells:GridCell[]){return {schema:'gis-sagar-request-v1',site,cells,scale:30};}

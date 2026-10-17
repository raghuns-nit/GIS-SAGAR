import {makeGrid,validateSite,geometryKey} from './geometry.ts';
// Documented default: requests without soilSource keep the original SoilGrids behaviour.
export const SOIL_SOURCES=['SOILGRIDS','OPENLANDMAP'] as const;
export function validateRequest(raw:unknown){
 const r=raw as {schema:string;site:unknown;cells:unknown;scale:number;soilSource?:unknown};
 if(r?.schema!=='gis-sagar-request-v1'||r.scale!==30)throw new Error('Unsupported extraction request.');
 const soilSource=r.soilSource===undefined?'SOILGRIDS':r.soilSource;
 if(!SOIL_SOURCES.includes(soilSource as never))throw new Error('Unknown soil source.');
 const site=validateSite(r.site);const cells=makeGrid(site,30);
 // Do not trust client supplied sampling points/areas. Rebuild from the approved boundary.
 return {schema:'gis-sagar-request-v1',site,cells,scale:30,soilSource,siteKey:geometryKey(site)};
}

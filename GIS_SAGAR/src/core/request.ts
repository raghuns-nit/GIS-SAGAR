import {makeGrid,validateSite,geometryKey} from './geometry.ts';
export function validateRequest(raw:unknown){
 const r=raw as {schema:string;site:unknown;cells:unknown;scale:number};
 if(r?.schema!=='gis-sagar-request-v1'||r.scale!==30)throw new Error('Unsupported extraction request.');
 const site=validateSite(r.site);const cells=makeGrid(site,30);
 // Do not trust client supplied sampling points/areas. Rebuild from the approved boundary.
 return {schema:'gis-sagar-request-v1',site,cells,scale:30,siteKey:geometryKey(site)};
}

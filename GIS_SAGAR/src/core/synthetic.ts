import {makeGrid,type Site} from './geometry.ts';
import type {EvidenceBundle} from './evidence.ts';
/** Explicitly synthetic fixtures. Never called after a live API failure. */
export function syntheticEvidence(site:Site):EvidenceBundle {
 const cells=makeGrid(site);return {schema:'gis-sagar-evidence-v1',mode:'SYNTHETIC',site,createdAt:new Date().toISOString(),method:'Synthetic uniform loam and 4% slope for software demonstration; not extracted from this location.',sourceAssets:[],cells:cells.map(spatial=>({id:spatial.id,spatial,slopePercent:4,soil:['0-5','5-15','15-30','30-60','60-100'].map(depth=>({depth,sand:40,silt:40,clay:20}))}))};
}

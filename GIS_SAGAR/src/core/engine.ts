import { CATALOGUE, FACT_LABELS } from './catalogue.ts';
import { soilProfile,textureDepthProfile,TEXTURE_DEPTHS } from './soil.ts';
import type { Bin, CellEvidence, CellResult, Context, ModelConfig, StructureResult } from './types.ts';
export function binRank(x:number|null,bins:Bin[]):number|null {
 if(x===null||!Number.isFinite(x)||x<0) return null;
 // Explicit shared endpoints: the prior inclusive maximum owns that exact value.
 const b=bins.find(b=>x>=b.min&&(b.max===null||x<b.max||(b.includeMax&&x===b.max)));
 return b?.rank??null;
}
function validateBins(bins:Bin[]) {
 if(!bins.length||bins[0].min!==0||bins.at(-1)!.max!==null) throw new Error('Bins must cover nonnegative values to infinity.');
 bins.forEach((b,i)=>{if(!Number.isFinite(b.min)||(b.max!==null&&(!Number.isFinite(b.max)||b.max<=b.min))||(b.rank!==null&&(!Number.isInteger(b.rank)||b.rank<1||b.rank>3))) throw new Error('Invalid rank bin.');if(i&&bins[i-1].max!==b.min) throw new Error('Overlapping or gapped bins.');});
}
export function validateConfig(c:ModelConfig) {
 if(!c.version.trim()) throw new Error('Model version is required.');
 if(new Set(c.parameters.map(p=>p.id)).size!==c.parameters.length) throw new Error('Duplicate parameter.');
 if(!c.requiredDepths.length||new Set(c.requiredDepths).size!==c.requiredDepths.length) throw new Error('Required soil depths must be unique and nonempty.');
 if(c.requiredTextureDepthsCm!==undefined&&(!Array.isArray(c.requiredTextureDepthsCm)||!c.requiredTextureDepthsCm.length||new Set(c.requiredTextureDepthsCm).size!==c.requiredTextureDepthsCm.length||c.requiredTextureDepthsCm.some(d=>!TEXTURE_DEPTHS.includes(d))))throw new Error('Required texture depths must be unique supported OpenLandMap depths.');
 if(!Number.isFinite(c.soilTolerance)||c.soilTolerance<0||c.soilTolerance>20) throw new Error('Invalid soil fraction tolerance.');
 for(const r of Object.values(c.soilRanks)) if(!Number.isInteger(r)||r<1||r>3) throw new Error('Soil ranks must be 1–3.');
 if(Object.keys(c.soilRanks).length!==12||['sand','loamy sand','sandy loam','loam','silt loam','sandy clay loam','silt','clay loam','silty clay loam','sandy clay','silty clay','clay'].some(k=>!(k in c.soilRanks))) throw new Error('All 12 texture ranks are required.');
 for(const p of c.parameters) if([p.zoneWeight,p.structureWeight].some(w=>!Number.isFinite(w)||w<0)) throw new Error('Weights must be finite and nonnegative.');
 for(const id of ['soil_texture','slope_pct']) if(!c.parameters.find(p=>p.id===id)?.enabled) throw new Error('The V1 profile requires soil and slope enabled.');
 if(c.parameters.filter(p=>p.enabled).some(p=>p.zoneWeight<=0||p.structureWeight<=0)) throw new Error('Enabled factors need positive weights in both profiles.');
 validateBins(c.zoneSlopeBins);
 for(const [id,r] of Object.entries(c.structureRules)){if(!CATALOGUE.some(s=>s.id===id)) throw new Error('Unknown structure ID.');validateBins(r.slopeBins);if(!Number.isFinite(r.threshold)||r.threshold<0||r.threshold>100||!Number.isFinite(r.soilMinimum)||r.soilMinimum<1||r.soilMinimum>3) throw new Error('Invalid structure threshold.');}
 if(!Number.isInteger(c.fallback.count)||c.fallback.count<0||c.fallback.count>CATALOGUE.length) throw new Error('Invalid fallback count.');
 if(c.fallback.order.length!==CATALOGUE.length||new Set(c.fallback.order).size!==CATALOGUE.length||c.fallback.order.some(id=>!CATALOGUE.some(s=>s.id===id))) throw new Error('Fallback order must cover each family once.');
 return c;
}
function index(values:{weight:number;rank:number|null}[]) {
 if(!values.length||values.some(v=>v.rank===null||!Number.isFinite(v.rank)||v.rank!<1||v.rank!>3)) return null;
 const sum=values.reduce((s,v)=>s+v.weight,0);return sum>0?50*(values.reduce((s,v)=>s+v.weight*v.rank!,0)/sum-1):null;
}
export function evaluateCell(cell:CellEvidence,config:ModelConfig,context:Context={facts:{},blockedFamilies:[]}):CellResult {
 validateConfig(config);const errors:string[]=[];let soilRank:number|null=null;let layers:CellResult['layers']=[];
 try { if(cell.soilSource!==undefined&&!['SOILGRIDS','OPENLANDMAP'].includes(cell.soilSource))throw new Error('Unknown soil source.');const p=cell.soilSource==='OPENLANDMAP'?textureDepthProfile(cell.soilTextureProfile,config):soilProfile(cell.soil,config);soilRank=p.rank;layers=p.layers; } catch(e){errors.push((e as Error).message);}
 if(cell.slopePercent===null||!Number.isFinite(cell.slopePercent)||cell.slopePercent<0) errors.push('Slope is missing or invalid.');
 const active=config.parameters.filter(p=>p.enabled);
 const raw=(id:string)=>id==='soil_texture'?soilRank:id==='slope_pct'?binRank(cell.slopePercent,config.zoneSlopeBins):cell.featureRanks?.[id]??null;
 const zoneScore=index(active.map(p=>({weight:p.zoneWeight,rank:raw(p.id)})));
 const structures:StructureResult[]=CATALOGUE.map(s=>{
  const missing=s.requirements.filter(k=>context.facts[k]!==true).map(k=>FACT_LABELS[k]??k);
  const base:StructureResult={id:s.id,name:s.name,outcome:'NEEDS_ADDITIONAL_EVIDENCE',score:null,reasons:[],missing,support:'UNESTABLISHED'};
  if(context.blockedFamilies.includes(s.id)) return {...base,outcome:'BLOCKED_BY_SITE_CONDITION',reasons:['Excluded by a recorded site condition.']};
  if(s.discriminator&&context.facts[s.discriminator]===false) return {...base,outcome:'NOT_APPLICABLE',reasons:[`${FACT_LABELS[s.discriminator]}: confirmed absent.`]};
  // A negative recorded water-quality/separation assessment is an explicit contraindication,
  // not a soft missing-observation result.
  if(s.requirements.some(k=>['water_quality','groundwater_separation'].includes(k)&&context.facts[k]===false)) return {...base,outcome:'BLOCKED_BY_SITE_CONDITION',reasons:['A recorded water-quality or separation assessment fails.']};
  const rule=config.structureRules[s.id];
  if(!rule){const relevant=s.surfaceRelevant&&soilRank!==null;return {...base,support:relevant?(soilRank!>=2?'RELEVANT_OBSERVATIONS':'MIXED_EVIDENCE'):'UNESTABLISHED',reasons:[s.id==='STR_PERCOLATION'?'Tank/hybrid variants require additional evidence.':'No numerical structure mapping is defined for the current automatic inputs.',...(relevant?[`Surface soil rank ${soilRank}; this does not establish subsurface suitability.`]:[])]};}
  if(active.some(p=>!rule.factorMappings[p.id]))return {...base,outcome:'RULE_UNDEFINED',reasons:['An enabled factor has no structure-specific mapping.']};
  const slope=binRank(cell.slopePercent,rule.slopeBins);
  if(soilRank===null||cell.slopePercent===null||!Number.isFinite(cell.slopePercent)||cell.slopePercent<0) return {...base,outcome:'INSUFFICIENT_DATA',reasons:[...errors]};
  const values=active.map(p=>({weight:p.structureWeight,rank:rule.factorMappings[p.id]==='soil'?soilRank:rule.factorMappings[p.id]==='slope'?slope:cell.featureRanks?.[p.id]??null}));
  if(values.some((v,i)=>v.rank===null&&rule.factorMappings[active[i].id]!=='slope')) return {...base,outcome:'INSUFFICIENT_DATA',reasons:['An enabled factor is missing.']};
  if(soilRank<rule.soilMinimum||slope===null) return {...base,outcome:'NOT_SHORTLISTED',support:'MIXED_EVIDENCE',reasons:['A soft V1 soil/slope preference filter fails; this is not a universal engineering exclusion.']};
  const score=index(values);if(score===null)return {...base,outcome:'INSUFFICIENT_DATA',reasons:['Invalid enabled factor rank.']};
  return {...base,score,outcome:score+1e-9>=rule.threshold?'CONDITIONAL_CANDIDATE':'NOT_SHORTLISTED',support:score>=rule.threshold?'RELEVANT_OBSERVATIONS':'MIXED_EVIDENCE',reasons:[s.id==='STR_PERCOLATION'?'Score applies to shallow spreading basin only; tank/hybrid variants remain pending.':'Development rules; field verification remains required.',`Preference index ${score.toFixed(2)} / threshold ${rule.threshold}.`]};
 });
 const primary=structures.filter(s=>s.outcome==='CONDITIONAL_CANDIDATE').sort((a,b)=>b.score!-a.score!);
 const tier=(r:StructureResult)=>r.support==='RELEVANT_OBSERVATIONS'?2:r.support==='MIXED_EVIDENCE'?1:0;
 const exploratory=!primary.length&&config.fallback.enabled?structures.filter(s=>!['NOT_APPLICABLE','BLOCKED_BY_SITE_CONDITION'].includes(s.outcome)).sort((a,b)=>tier(b)-tier(a)||(CATALOGUE.find(s=>s.id===a.id)?.mechanism===CATALOGUE.find(s=>s.id===b.id)?.mechanism&&a.score!==null&&b.score!==null?b.score-a.score:0)||config.fallback.order.indexOf(a.id)-config.fallback.order.indexOf(b.id)).slice(0,config.fallback.count).map(s=>({...s,selectionBasis:s.support==='UNESTABLISHED'?'Unranked catalogue example':'Option to investigate; original model result retained'})):[];
 return {id:cell.id,zoneScore,soilRank,layers,structures,primary,exploratory,errors};
}

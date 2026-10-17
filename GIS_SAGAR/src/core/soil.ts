import type { SoilLayer, Texture, ModelConfig, SoilTextureProfile } from './types.ts';
export const OPENLANDMAP_ASSET='OpenLandMap/SOL/SOL_TEXTURE-CLASS_USDA-TT_M/v02' as const;
export const TEXTURE_DEPTHS=[0,10,30,60,100];
export const OPENLANDMAP_TEXTURES:Texture[]=['clay','silty clay','sandy clay','clay loam','silty clay loam','sandy clay loam','loam','silt loam','sandy loam','silt','loamy sand','sand'];
export function validateTextureProfile(profile:SoilTextureProfile) {
 if(profile?.source!=='OPENLANDMAP'||profile.asset!==OPENLANDMAP_ASSET||!Array.isArray(profile.layers))throw new Error('Invalid OpenLandMap soil provenance.');
 const seen=new Set<number>();
 for(const l of profile.layers){
  if(!l||!TEXTURE_DEPTHS.includes(l.depthCm)||seen.has(l.depthCm))throw new Error('Invalid or duplicate OpenLandMap depth.');
  seen.add(l.depthCm);
  if(!Number.isInteger(l.sourceClass)||l.sourceClass<1||l.sourceClass>12||OPENLANDMAP_TEXTURES[l.sourceClass-1]!==l.texture)throw new Error('OpenLandMap class does not match its USDA texture label.');
 }
 return profile;
}
export function textureDepthProfile(profile:SoilTextureProfile|null|undefined,config:ModelConfig) {
 if(!profile)throw new Error('OpenLandMap soil profile is missing.');
 validateTextureProfile(profile);
 const layers=(config.requiredTextureDepthsCm??TEXTURE_DEPTHS).map(depth=>{
  const layer=profile.layers.find(l=>l.depthCm===depth);
  if(!layer)throw new Error(`OpenLandMap texture at ${depth} cm depth is missing.`);
  return {depth:`${depth} (depth)`,depthCm:depth,texture:layer.texture,rank:config.soilRanks[layer.texture],sourceClass:layer.sourceClass};
 });
 return {rank:Math.min(...layers.map(l=>l.rank)),layers};
}
/** USDA triangle decision regions; fractions validated and normalized first. */
export function classifyTexture(sand:number,silt:number,clay:number): Texture {
 if (silt + 1.5*clay < 15) return 'sand';
 if (silt + 1.5*clay >= 15 && silt + 2*clay < 30) return 'loamy sand';
 if ((clay >= 7 && clay < 20 && sand > 52 && silt + 2*clay >= 30) || (clay < 7 && silt < 50 && silt + 2*clay >= 30)) return 'sandy loam';
 if (clay >= 7 && clay < 27 && silt >= 28 && silt < 50 && sand <= 52) return 'loam';
 if ((silt >= 50 && clay >= 12 && clay < 27) || (silt >= 50 && silt < 80 && clay < 12)) return 'silt loam';
 if (silt >= 80 && clay < 12) return 'silt';
 if (clay >= 20 && clay < 35 && silt < 28 && sand > 45) return 'sandy clay loam';
 if (clay >= 27 && clay < 40 && sand > 20 && sand <= 45) return 'clay loam';
 if (clay >= 27 && clay < 40 && sand <= 20) return 'silty clay loam';
 if (clay >= 35 && sand > 45) return 'sandy clay';
 if (clay >= 40 && silt >= 40) return 'silty clay';
 if (clay >= 40 && sand <= 45 && silt < 40) return 'clay';
 throw new Error('Texture triplet does not map to a USDA region.');
}
export function soilProfile(layers:SoilLayer[]|null,config:ModelConfig) {
 if(!layers) throw new Error('Soil profile is missing.');
 const depths=layers.map(x=>x.depth);
 if(new Set(depths).size!==depths.length) throw new Error('Duplicate soil depth interval.');
 const result=config.requiredDepths.map(depth=>{
  const l=layers.find(x=>x.depth===depth);if(!l) throw new Error(`Soil depth ${depth} cm is missing.`);
  const a=[l.sand,l.silt,l.clay]; if(a.some(x=>!Number.isFinite(x)||x<0||x>100)) throw new Error(`Invalid soil fractions at ${depth} cm.`);
  const sum=a.reduce((x,y)=>x+y,0);if(sum<=0||Math.abs(sum-100)>config.soilTolerance) throw new Error(`Soil fractions at ${depth} cm sum to ${sum}; outside tolerance.`);
  const texture=classifyTexture(l.sand*100/sum,l.silt*100/sum,l.clay*100/sum);
  return {depth,texture,rank:config.soilRanks[texture],raw:l,normalized:{sand:l.sand*100/sum,silt:l.silt*100/sum,clay:l.clay*100/sum},adjusted:Math.abs(sum-100)>1e-8};
 });
 return {rank:Math.min(...result.map(x=>x.rank)),layers:result};
}

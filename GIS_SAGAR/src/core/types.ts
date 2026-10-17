export type TriState = boolean | null;
export type Status = 'CONDITIONAL_CANDIDATE' | 'NOT_SHORTLISTED' | 'NEEDS_ADDITIONAL_EVIDENCE' | 'INSUFFICIENT_DATA' | 'RULE_UNDEFINED' | 'NOT_APPLICABLE' | 'BLOCKED_BY_SITE_CONDITION';
export type Texture = 'sand'|'loamy sand'|'sandy loam'|'loam'|'silt loam'|'silt'|'sandy clay loam'|'clay loam'|'silty clay loam'|'sandy clay'|'silty clay'|'clay';
export interface SoilLayer { depth: string; sand: number; silt: number; clay: number }
export type SoilSource = 'SOILGRIDS' | 'OPENLANDMAP';
export interface SoilTextureProfile {
 source:'OPENLANDMAP'; asset:'OpenLandMap/SOL/SOL_TEXTURE-CLASS_USDA-TT_M/v02';
 layers:{depthCm:number;sourceClass:number;texture:Texture}[];
}
export interface Parameter { id: string; label: string; enabled: boolean; zoneWeight: number; structureWeight: number; unit: string }
export interface Bin { min: number; max: number | null; includeMax?: boolean; rank: number | null }
export interface StructureRule { soilMinimum: number; slopeBins: Bin[]; threshold: number; factorMappings: Record<string, 'soil'|'slope'|'feature'> }
export interface ModelConfig {
  version: string; parameters: Parameter[]; requiredDepths: string[]; requiredTextureDepthsCm?:number[]; soilTolerance: number;
  soilRanks: Record<Texture,number>; zoneSlopeBins: Bin[]; structureRules: Record<string, StructureRule>;
  fallback: { enabled: boolean; count: number; order: string[] };
}
export interface Structure { id: string; name: string; sourceRows: number[]; sourceKind:'SHEET1'|'ADDITIONAL_V1'; mechanism: string; variants: string[]; requirements: string[]; discriminator?: string; surfaceRelevant?: boolean }
export interface CellEvidence { id: string; soil: SoilLayer[] | null; slopePercent: number | null; featureRanks?: Record<string,number|null>; soilSource?:SoilSource; soilTextureProfile?:SoilTextureProfile|null }
export interface Context { facts: Record<string,TriState>; blockedFamilies: string[] }
export interface StructureResult { id: string; name: string; outcome: Status; score: number|null; reasons: string[]; missing: string[]; support: 'RELEVANT_OBSERVATIONS'|'MIXED_EVIDENCE'|'UNESTABLISHED' }
export interface CellResult { id: string; zoneScore:number|null; soilRank:number|null; layers:{ depth:string; texture:Texture; rank:number }[]; structures:StructureResult[]; primary:StructureResult[]; exploratory:(StructureResult & { selectionBasis:string })[]; errors:string[] }

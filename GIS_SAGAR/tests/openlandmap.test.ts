import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {validateBundle} from '../src/core/evidence.ts';
import {evaluateCell,validateConfig} from '../src/core/engine.ts';
import {cloneConfig} from '../src/core/config.ts';
const read=()=>JSON.parse(fs.readFileSync(new URL('../examples/live/GWR1-74_794309-soil-slope-comparison.geojson',import.meta.url),'utf8'));
const imported=()=>validateBundle(read(),undefined,'OPENLANDMAP');
test('real site: legacy/default import does not substitute OpenLandMap for missing SoilGrids',()=>{
 const b=validateBundle(read());assert.equal(b.soilSource,'SOILGRIDS');
 for(const c of b.cells){assert.equal(c.soil,null);assert.equal(c.soilTextureProfile,null);assert.equal(evaluateCell(c,cloneConfig()).zoneScore,null);}
});
test('real site: explicit OpenLandMap selection supplies all depth classes, without invented fractions',()=>{
 const b=imported();assert.equal(b.cells.length,16);assert.equal(b.soilSource,'OPENLANDMAP');
 for(const c of b.cells){assert.equal(c.soil,null);assert.equal(c.soilSource,'OPENLANDMAP');assert.deepEqual(c.soilTextureProfile!.layers.map(l=>l.depthCm),[0,10,30,60,100]);}
 assert.equal(b.cells.filter(c=>c.soilTextureProfile!.layers[0].texture==='loam').length,12);
 assert.equal(b.cells.filter(c=>c.soilTextureProfile!.layers[0].texture==='clay loam').length,4);
});
test('real site: deeper clay loam controls every profile; low slopes cannot replace the soil filter',()=>{
 const r=imported().cells.map(c=>evaluateCell(c,cloneConfig()));
 assert.equal(r.filter(c=>Math.abs(c.zoneScore!-60)<1e-8).length,5);
 assert.equal(r.filter(c=>Math.abs(c.zoneScore!-30)<1e-8).length,11);
 for(const c of r){assert.equal(c.soilRank,1);assert.equal(c.errors.length,0);assert.equal(c.primary.length,0);assert.equal(c.exploratory.length,2);assert.ok(c.exploratory.every(s=>s.score===null&&s.selectionBasis!=='Unranked catalogue example'));assert.ok(c.layers.every(l=>l.depth.includes('(depth)')));}
});
test('categorical selection persists through evidence serialization',()=>{
 const b=imported();const round=validateBundle(JSON.parse(JSON.stringify(b)),b.site);
 assert.equal(round.soilSource,'OPENLANDMAP');assert.deepEqual(evaluateCell(round.cells[0],cloneConfig()),evaluateCell(b.cells[0],cloneConfig()));
});
test('missing deeper texture remains insufficient despite valid topsoil',()=>{
 const raw=read();delete raw.features[0].properties.olm_b100;delete raw.features[0].properties.olm_b100_texture;
 const b=validateBundle(raw,undefined,'OPENLANDMAP');const r=evaluateCell(b.cells[0],cloneConfig());assert.equal(r.zoneScore,null);assert.match(r.errors[0],/100 cm depth is missing/);
});
test('invalid class codes and inconsistent labels are rejected',()=>{
 for(const value of [0,13,4.5,'4']){const raw=read();raw.features[0].properties.olm_b0=value;assert.throws(()=>validateBundle(raw,undefined,'OPENLANDMAP'),/class code/);}
 const raw=read();raw.features[0].properties.olm_b0_texture='sand';assert.throws(()=>validateBundle(raw,undefined,'OPENLANDMAP'),/disagree/);
});
test('recorded source failure cannot be used as successful class evidence',()=>{
 const raw=read();for(const f of raw.features)f.properties._source_errors_json=JSON.stringify({OPENLANDMAP:'Provider failed',SOILGRIDS:null,ALOS:null});
 const b=validateBundle(raw,undefined,'OPENLANDMAP');assert.equal(b.cells[0].soilTextureProfile,null);assert.equal(evaluateCell(b.cells[0],cloneConfig()).zoneScore,null);assert.equal((b.sourceMetadata!.sourceErrors as any).OPENLANDMAP,'Provider failed');
});
test('wrong provider asset and mixed provenance are rejected',()=>{
 let raw=read();raw.features[0].properties._openlandmap_asset='other';assert.throws(()=>validateBundle(raw,undefined,'OPENLANDMAP'),/verified OpenLandMap asset/);
 raw=read();raw.features[1].properties._openlandmap_asset='other';assert.throws(()=>validateBundle(raw,undefined,'OPENLANDMAP'),/provenance/);
 raw=read();raw.features[1].properties._created_at='different run';assert.throws(()=>validateBundle(raw,undefined,'OPENLANDMAP'),/provenance/);
});
test('saved bundle cannot change class label or mix soil sources',()=>{
 let b=imported();b.cells[0].soilTextureProfile!.layers[0].texture='sand';assert.throws(()=>validateBundle(b),/does not match/);
 b=imported();b.cells[0].soilSource='SOILGRIDS';assert.throws(()=>validateBundle(b),/Mixed soil sources/);
 b=imported();b.sourceAssets=[];assert.throws(()=>validateBundle(b),/source asset/);
});
test('a duplicate specified depth is rejected',()=>{
 const b=imported();b.cells[0].soilTextureProfile!.layers.push(b.cells[0].soilTextureProfile!.layers[0]);assert.throws(()=>validateBundle(b),/duplicate/);
});
test('earlier configuration files use the declared default texture depths',()=>{
 const config=cloneConfig();delete config.requiredTextureDepthsCm;const r=evaluateCell(imported().cells[0],config);assert.equal(r.soilRank,1);assert.equal(r.layers.length,5);
});
test('texture-depth configuration rejects empty, duplicate or unsupported depths',()=>{
 for(const depths of [[],[0,0],[5],[200]]){const c=cloneConfig();c.requiredTextureDepthsCm=depths;assert.throws(()=>validateConfig(c),/texture depths/);}
});
test('configured soil ranks rescore categorical evidence without changing source classes',()=>{
 const b=imported(),original=JSON.stringify(b);const config=cloneConfig();config.soilRanks['clay loam']=2;
 const r=evaluateCell(b.cells[0],config);assert.equal(r.soilRank,2);assert.equal(r.primary[0].id,'STR_TRENCH');assert.ok(Math.abs(r.primary[0].score!-72.222222222)<1e-6);assert.equal(JSON.stringify(b),original);
});
test('known site exclusions continue to override the categorical profile',()=>{
 const r=evaluateCell(imported().cells[0],cloneConfig(),{facts:{water_quality:false},blockedFamilies:[]});assert.equal(r.structures.find(s=>s.id==='STR_PIT')!.outcome,'BLOCKED_BY_SITE_CONDITION');
});
test('native soil sampling passes a Projection rather than its WKT into the API',()=>{
 const script=fs.readFileSync(new URL('../gee/GWR1_Complete_Data_Test.js',import.meta.url),'utf8');
 const body=script.match(/function sampleNative\(image\) \{[\s\S]*?\n\}/)![0];
 const p={transform:()=> 'PARAM_MT["Affine",...]'};let calls=0;
 const image={select:()=>({projection:()=>p}),reduceRegion:(o:any)=>{calls++;assert.equal(o.crs,p);assert.equal(o.scale,undefined);if(o.crsTransform!==undefined)assert.ok(Array.isArray(o.crsTransform),'WKT must not be passed to crsTransform');return {};}};
 const f={geometry:()=>({}),set:()=>({})};
 vm.runInNewContext(body+'; sampleNative(image);',{image,points:{map:(fn:any)=>[fn(f)]},ee:{Feature:(x:any)=>x,Reducer:{first:()=>({})}}});assert.equal(calls,1);
});

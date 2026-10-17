import {test} from 'node:test';import assert from 'node:assert/strict';
import {pinSquare} from '../src/core/geometry.ts';
import {validateRequest} from '../src/core/request.ts';
import {geeExpression,restResult} from '../src/core/geeRest.ts';
import {validateBundle} from '../src/core/evidence.ts';
import {evaluateCell} from '../src/core/engine.ts';
import {cloneConfig} from '../src/core/config.ts';
import {OPENLANDMAP_ASSET,TEXTURE_DEPTHS,OPENLANDMAP_TEXTURES} from '../src/core/soil.ts';
const site=pinSquare(74.794309,13.018185760719339,100,100);
const request=(soilSource?:string)=>validateRequest({schema:'gis-sagar-request-v1',site,scale:30,...(soilSource?{soilSource}:{})});
test('requests default to SoilGrids and accept explicit OpenLandMap selection',()=>{
 assert.equal(request().soilSource,'SOILGRIDS');
 assert.equal(request('OPENLANDMAP').soilSource,'OPENLANDMAP');
 assert.throws(()=>request('EE'),/Unknown soil source/);
 assert.throws(()=>validateRequest({schema:'gis-sagar-request-v1',site,scale:30,soilSource:'projects/attacker/asset'}),/Unknown soil source/);
});
test('the OpenLandMap expression loads only the verified asset and samples at native projection',()=>{
 const e=geeExpression(request('OPENLANDMAP'));
 const serialized=JSON.stringify(e);
 assert.ok(serialized.includes(OPENLANDMAP_ASSET));
 assert.ok(!serialized.includes('soilgrids-isric'));
 assert.ok(!serialized.includes('crsTransform'));
 const names=Object.values(e.values).flatMap(v=>v.functionInvocationValue?[v.functionInvocationValue.functionName]:[]);
 assert.ok(names.includes('Image.reduceRegions'));
});
test('the SoilGrids default expression is unchanged in asset selection',()=>{
 const e=geeExpression(request());
 assert.ok(JSON.stringify(e).includes('soilgrids-isric'));
 assert.ok(!JSON.stringify(e).includes(OPENLANDMAP_ASSET));
});
function olmFixture(request:ReturnType<typeof validateRequest>){
 const classes=[7,4,4,4,4];
 return {features:request.cells.map((c,i)=>({properties:{id:c.id,slope_percent:4,b0:classes[i%5],b10:4,b30:4,b60:4,b100:4}}))};
}
test('OpenLandMap response becomes a categorical bundle without invented fractions',()=>{
 const r=request('OPENLANDMAP');const b=restResult(r,olmFixture(r));
 assert.equal(b.soilSource,'OPENLANDMAP');assert.ok(b.sourceAssets.includes(OPENLANDMAP_ASSET));
 for(const c of b.cells){assert.equal(c.soil,null);assert.equal(c.soilTextureProfile!.asset,OPENLANDMAP_ASSET);assert.deepEqual(c.soilTextureProfile!.layers.map(l=>l.depthCm),TEXTURE_DEPTHS);}
 const round=validateBundle(structuredClone(b),r.site);
 assert.equal(round.soilSource,'OPENLANDMAP');
});
test('incomplete class profiles remain explicit nulls, never synthetic',()=>{
 const r=request('OPENLANDMAP');const fixture=olmFixture(r);delete (fixture.features[0].properties as Record<string,unknown>).b100;
 const b=restResult(r,fixture);assert.equal(b.cells[0].soilTextureProfile,null);
 const evaluated=evaluateCell(b.cells[0],cloneConfig());assert.equal(evaluated.zoneScore,null);
});
test('slope is preserved alongside the categorical source',()=>{
 const r=request('OPENLANDMAP');const b=restResult(r,olmFixture(r));
 assert.equal(b.cells[0].slopePercent,4);
});
test('unexpected provider response is an error, not silent data',()=>{
 assert.throws(()=>restResult(request('OPENLANDMAP'),{}),/Unexpected Earth Engine response/);
 assert.throws(()=>restResult(request(),{}),/Unexpected Earth Engine response/);
});
test('out-of-range class codes are not silently accepted',()=>{
 const r=request('OPENLANDMAP');const fixture=olmFixture(r);fixture.features[0].properties.b0=13;
 const b=restResult(r,fixture);assert.equal(b.cells[0].soilTextureProfile,null);
});
test('canonical texture names come from the checked 12-class mapping',()=>{
 for(const [code,name] of OPENLANDMAP_TEXTURES.entries())assert.ok(name.length>0);
});

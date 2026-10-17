import {ASSETS,type EvidenceBundle} from './evidence.ts';
import type {validateRequest} from './request.ts';
type Request=ReturnType<typeof validateRequest>;
type Node={constantValue?:unknown;functionInvocationValue?:{functionName:string;arguments:Record<string,Node>};arrayValue?:{values:Node[]};dictionaryValue?:{values:Record<string,Node>}};
/** Fixed provider expression compiler. No caller-supplied algorithms/assets accepted.
 * Authenticated parity with the official-SDK path is a release gate, still pending.
 */
export function geeExpression(request:Request){
 const values:Record<string,Node>={};let n=0;
 const ref=(node:Node):Node=>{const id=String(n++);values[id]=node;return {valueReference:id} as Node;};
 const k=(value:unknown):Node=>({constantValue:value});
 const call=(name:string,args:Record<string,Node>={}):Node=>ref({functionInvocationValue:{functionName:name,arguments:args}});
 const select=(image:Node,names:string[])=>call('Image.select',{input:image,bandSelectors:k(names)});
 const img=(id:string)=>call('Image.load',{id:k(id)});
 const rename=(image:Node,names:string[])=>call('Image.rename',{input:image,names:k(names)});
 const add=(dst:Node,src:Node)=>call('Image.addBands',{dstImg:dst,srcImg:src});
 const roi=call('GeometryConstructors.Polygon',{coordinates:k(request.site.geometry.coordinates),geodesic:k(false)});
 const buffered=call('Geometry.buffer',{geometry:roi,distance:k(90)});
 const filter=call('Filter.intersects',{leftField:k('.geo'),rightValue:buffered});
 const tiles=call('Collection.filter',{collection:call('ImageCollection.load',{id:k(ASSETS[0])}),filter});
 const first=select(call('Collection.first',{collection:tiles}),['DSM']);
 const terrainProj=call('Image.projection',{image:first});
 const mosaic=select(call('ImageCollection.mosaic',{collection:tiles}),['DSM']);
 const dem=call('Image.setDefaultProjection',{image:mosaic,crs:terrainProj});
 const degrees=rename(call('Terrain.slope',{input:dem}),['slope_degrees']);
 const constantImage=(v:number)=>call('Image.constant',{value:k(v)});
 const radians=call('Image.multiply',{image1:degrees,image2:constantImage(Math.PI/180)});
 const percent=rename(call('Image.multiply',{image1:call('Image.tan',{image:radians}),image2:constantImage(100)}),['slope_percent']);
 const depths=['0-5','5-15','15-30','30-60','60-100'];
 const soil=['sand','silt','clay'].map((p,i)=>select(img(ASSETS[i+1]),depths.map(d=>`${p}_${d}cm_mean`)));
 const soilProj=call('Image.projection',{image:soil[0]});
 const support=rename(call('Image.pixelCoordinates',{projection:soilProj}),['soil_pixel_x','soil_pixel_y']);
 const features=request.cells.map(c=>call('Feature',{geometry:call('GeometryConstructors.Point',{coordinates:k(c.point)}),metadata:k({id:c.id})}));
 const points=call('Collection',{features:{arrayValue:{values:features}}});
 const reducer=call('Reducer.first');
 const sampledSoil=call('Image.reduceRegions',{image:add(add(add(soil[0],soil[1]),soil[2]),support),collection:points,reducer,scale:k(250),crs:soilProj,tileScale:k(2)});
 const sampled=call('Image.reduceRegions',{image:add(degrees,percent),collection:sampledSoil,reducer,scale:k(30),crs:terrainProj,tileScale:k(2)});
 // A FeatureCollection is supported by the value:compute getInfo-style response.
 const root=(sampled as unknown as {valueReference:string}).valueReference;
 return {result:root,values};
}
export function restResult(request:Request,data:unknown):EvidenceBundle {
 const r=data as {features?:{properties:Record<string,unknown>}[]};
 if(!Array.isArray(r?.features))throw new Error('Unexpected Earth Engine response. Provider adapter parity needs diagnosis.');
 const samples=new Map(r.features.map(f=>[String(f.properties.id),f.properties]));
 return {schema:'gis-sagar-evidence-v1',mode:'GEE',site:request.site,createdAt:new Date().toISOString(),method:'Representative points sampled at native soil (250 m) and terrain (30 m) support; REST adapter, authenticated parity pending.',sourceAssets:ASSETS,cells:request.cells.map(spatial=>{
  const p=samples.get(spatial.id)||{};const depths=['0-5','5-15','15-30','30-60','60-100'];
  const has=depths.every(d=>['sand','silt','clay'].every(k=>typeof p[`${k}_${d}cm_mean`]==='number'));
  return {id:spatial.id,spatial,slopePercent:typeof p.slope_percent==='number'?p.slope_percent:null,soil:has?depths.map(depth=>({depth,sand:Number(p[`sand_${depth}cm_mean`])/10,silt:Number(p[`silt_${depth}cm_mean`])/10,clay:Number(p[`clay_${depth}cm_mean`])/10})):null};
 })};
}

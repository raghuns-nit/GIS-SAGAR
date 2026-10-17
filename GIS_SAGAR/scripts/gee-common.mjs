export const ASSETS=['JAXA/ALOS/AW3D30/V4_1','projects/soilgrids-isric/sand_mean','projects/soilgrids-isric/silt_mean','projects/soilgrids-isric/clay_mean'];
/** Shared official-SDK expression builder, also emitted in the Code Editor script. */
export function buildData(ee,request) {
 var depths=['0-5','5-15','15-30','30-60','60-100'];
 var roi=ee.Geometry(request.site.geometry);
 var tiles=ee.ImageCollection('JAXA/ALOS/AW3D30/V4_1').filterBounds(roi.buffer(90));
 var elevation=tiles.select('DSM');
 var projection=ee.Image(elevation.first()).projection();
 var dem=elevation.mosaic().setDefaultProjection(projection);
 var slope=ee.Terrain.slope(dem).rename('slope_degrees');
 var percent=slope.multiply(Math.PI/180).tan().multiply(100).rename('slope_percent');
 var soilImages=['sand','silt','clay'].map(function(property){
  var names=depths.map(function(depth){return property+'_'+depth+'cm_mean';});
  return ee.Image('projects/soilgrids-isric/'+property+'_mean').select(names);
 });
 var soil=soilImages[0].addBands(soilImages[1]).addBands(soilImages[2]);
 var support=ee.Image.pixelCoordinates(soilImages[0].projection()).rename(['soil_pixel_x','soil_pixel_y']);
 var points=ee.FeatureCollection(request.cells.map(function(cell){return ee.Feature(ee.Geometry.Point(cell.point),{id:cell.id});}));
 // Sample each source on its own grid. Values are representative point samples,
 // not per-polygon means; the result records this explicitly.
 var soilSamples=soil.addBands(support).reduceRegions({collection:points,reducer:ee.Reducer.first(),crs:soilImages[0].projection(),scale:250,tileScale:2});
 var samples=slope.addBands(percent).reduceRegions({collection:soilSamples,reducer:ee.Reducer.first(),crs:projection,scale:30,tileScale:2});
 return ee.Dictionary({samples:samples.toList(request.cells.length).map(function(f){return ee.Feature(f).toDictionary();}),alos_tiles:tiles.aggregate_array('system:index'),soil_bands:soil.bandNames(),soil_projection:soilImages[0].projection().crs(),terrain_projection:projection.crs()});
}
export function bundleResult(request,data) {
 const depths=['0-5','5-15','15-30','30-60','60-100'];
 const byId=new Map(data.samples.map(s=>[s.id,s]));
 return {schema:'gis-sagar-evidence-v1',mode:'GEE',site:request.site,createdAt:new Date().toISOString(),method:'Representative point samples on source soil (250 m) and terrain (30 m) grids; not polygon means.',sourceAssets:ASSETS,sourceMetadata:{alosTiles:data.alos_tiles,soilBands:data.soil_bands,soilProjection:data.soil_projection,terrainProjection:data.terrain_projection},cells:request.cells.map(spatial=>{
  const s=byId.get(spatial.id)||{};
  const hasSoil=depths.every(d=>['sand','silt','clay'].every(p=>typeof s[p+'_'+d+'cm_mean']==='number'));
  return {id:spatial.id,spatial,slopePercent:typeof s.slope_percent==='number'?s.slope_percent:null,slopeDegrees:s.slope_degrees??null,soilSupport:{x:s.soil_pixel_x??null,y:s.soil_pixel_y??null,resolutionM:250},soil:hasSoil?depths.map(depth=>({depth,sand:s['sand_'+depth+'cm_mean']/10,silt:s['silt_'+depth+'cm_mean']/10,clay:s['clay_'+depth+'cm_mean']/10})):null};
 })};
}

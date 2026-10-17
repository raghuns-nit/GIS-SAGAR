function buildData(ee,request) {
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
// Run in https://code.earthengine.google.com with your registered project selected.
Map.centerObject(ee.Geometry(REQUEST.site.geometry),16);
Map.addLayer(ee.Geometry(REQUEST.site.geometry),{color:'17614f'},'Selected site');
buildData(ee,REQUEST).evaluate(function(data,error){
 if(error){print('EXTRACTION FAILED',error);return;}
 var byId={};data.samples.forEach(function(s){byId[s.id]=s;});
 var features=REQUEST.cells.map(function(cell){
  var p=byId[cell.id]||{};p._schema='gis-sagar-gee-feature-v1';p._site_json=JSON.stringify(REQUEST.site);p._created_at=new Date().toISOString();p._method='Representative point samples at native soil/terrain support; not polygon means.';p._alos_tiles=JSON.stringify(data.alos_tiles);p._soil_bands=JSON.stringify(data.soil_bands);p._soil_projection=data.soil_projection;p._terrain_projection=data.terrain_projection;p._area_m2=cell.areaM2;p._point_json=JSON.stringify(cell.point);
  return ee.Feature(ee.Geometry(cell.geometry),p);
 });
 var output=ee.FeatureCollection(features);
 output.getDownloadURL({format:'geojson',filename:'gis-sagar-observations',callback:function(url,error){
  if(error||!url){print('DOWNLOAD FAILED',error);return;}
  print(ui.Label('Download real observations — import this GeoJSON in GIS-SAGAR',{},url));
 }});
 print('Cell observations (raw source units; sand/silt/clay are g/kg)',data.samples);
 print('Source metadata',data.soil_bands,data.alos_tiles,data.soil_projection);
});

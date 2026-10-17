// GIS-SAGAR: real-data extraction test for GWR1
// Centre: 12.990000 N, 77.480000 E; 100 m x 100 m projected square.
// Run in a new Earth Engine script using your registered project.
// This extracts observations only; it does not certify structure suitability.
var REQUEST = {"schema":"gis-sagar-request-v1","site":{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[77.47953489057295,12.989552686978655],[77.48045614044483,12.989543891911474],[77.48046511108876,12.990447311873123],[77.47954385789347,12.990456107572658],[77.47953489057295,12.989552686978655]]]}},"cells":[{"id":"768960_1437270","geometry":{"type":"Polygon","coordinates":[[[77.47953489057295,12.989552686978655],[77.47970648784647,12.989551048759107],[77.47970745834598,12.989648819830613],[77.47953586104244,12.989650457780467],[77.47953489057295,12.989552686978655]]]},"point":[77.47962117445947,12.989600753269787],"areaM2":202.150404812105},{"id":"768960_1437300","geometry":{"type":"Polygon","coordinates":[[[77.47953586104244,12.989650457780467],[77.47970745834598,12.989648819830613],[77.47971014867869,12.989919845978473],[77.47953855123863,12.989921483963183],[77.47953586104244,12.989650457780467]]]},"point":[77.47962300486057,12.989785151896898],"areaM2":560.3713792174141},{"id":"768960_1437330","geometry":{"type":"Polygon","coordinates":[[[77.47953855123863,12.989921483963183],[77.47971014867869,12.989919845978473],[77.47971283907239,12.99019087212014],[77.47954124143477,12.990192510140295],[77.47953855123863,12.989921483963183]]]},"point":[77.4796256951555,12.990056178059383],"areaM2":560.3713027114093},{"id":"768960_1437360","geometry":{"type":"Polygon","coordinates":[[[77.47954124143477,12.990192510140295],[77.47971283907239,12.99019087212014],[77.47971545577981,12.990454469235383],[77.47954385789347,12.990456107572658],[77.47954124143477,12.990192510140295]]]},"point":[77.47962834860729,12.9903234898464],"areaM2":545.0115324486322},{"id":"768990_1437270","geometry":{"type":"Polygon","coordinates":[[[77.47970648784647,12.989551048759107],[77.47998286283975,12.98954841023865],[77.47998383344874,12.989646181450029],[77.47970745834598,12.989648819830613],[77.47970648784647,12.989551048759107]]]},"point":[77.47984516064761,12.98959861503463],"areaM2":325.58466674328366},{"id":"768990_1437300","geometry":{"type":"Polygon","coordinates":[[[77.47970745834598,12.989648819830613],[77.47998383344874,12.989646181450029],[77.47998652408054,12.989917207540977],[77.47971014867869,12.989919845978473],[77.47970745834598,12.989648819830613]]]},"point":[77.47984699121326,12.989783013714252],"areaM2":902.5357301862224},{"id":"768990_1437330","geometry":{"type":"Polygon","coordinates":[[[77.47971014867869,12.989919845978473],[77.47998652408054,12.989917207540977],[77.47998921477337,12.990188233625737],[77.47971283907239,12.99019087212014],[77.47971014867869,12.989919845978473]]]},"point":[77.47984968172602,12.990054039830557],"areaM2":902.5357051870409},{"id":"768990_1437360","geometry":{"type":"Polygon","coordinates":[[[77.47971283907239,12.99019087212014],[77.47998921477337,12.990188233625737],[77.4799918317701,12.99045183052522],[77.47971545577981,12.990454469235383],[77.47971283907239,12.99019087212014]]]},"point":[77.47985233542124,12.990321351430559],"areaM2":877.7962645985968},{"id":"769020_1437270","geometry":{"type":"Polygon","coordinates":[[[77.47998286283975,12.98954841023865],[77.48025923777493,12.989545771718747],[77.4802602084905,12.989643542776102],[77.47998383344874,12.989646181450029],[77.47998286283975,12.98954841023865]]]},"point":[77.48012153566512,12.989595976584388],"areaM2":325.58458165495716},{"id":"769020_1437300","geometry":{"type":"Polygon","coordinates":[[[77.47998383344874,12.989646181450029],[77.4802602084905,12.989643542776102],[77.4802628994214,12.98991456881014],[77.47998652408054,12.989917207540977],[77.47998383344874,12.989646181450029]]]},"point":[77.48012336643507,12.989780375158539],"areaM2":902.5353701154943},{"id":"769020_1437330","geometry":{"type":"Polygon","coordinates":[[[77.47998652408054,12.989917207540977],[77.4802628994214,12.98991456881014],[77.48026559041332,12.99018559483798],[77.47998921477337,12.990188233625737],[77.47998652408054,12.989917207540977]]]},"point":[77.48012605724693,12.990051401217938],"areaM2":902.5353450948247},{"id":"769020_1437360","geometry":{"type":"Polygon","coordinates":[[[77.47998921477337,12.990188233625737],[77.48026559041332,12.99018559483798],[77.4802682077023,12.990449191815612],[77.4799918317701,12.99045183052522],[77.47998921477337,12.990188233625737]]]},"point":[77.48012871123782,12.9903187126816],"areaM2":877.7958695711311},{"id":"769050_1437270","geometry":{"type":"Polygon","coordinates":[[[77.48025923777493,12.989545771718747],[77.48045614044483,12.989543891911474],[77.48045711127402,12.989641662649333],[77.4802602084905,12.989643542776102],[77.48025923777493,12.989545771718747]]]},"point":[77.48035817452447,12.989593717343787],"areaM2":231.9614326847998},{"id":"769050_1437300","geometry":{"type":"Polygon","coordinates":[[[77.4802602084905,12.989643542776102],[77.48045711127402,12.989641662649333],[77.48045980246725,12.98991268864235],[77.4802628994214,12.98991456881014],[77.4802602084905,12.989643542776102]]]},"point":[77.48036000547887,12.989778115729736],"areaM2":643.0092993478016},{"id":"769050_1437330","geometry":{"type":"Polygon","coordinates":[[[77.4802628994214,12.98991456881014],[77.48045980246725,12.98991268864235],[77.48046249366043,12.99018371462975],[77.48026559041332,12.99018559483798],[77.4802628994214,12.98991456881014]]]},"point":[77.48036269654091,12.990049141740165],"areaM2":643.0093425645404},{"id":"769050_1437360","geometry":{"type":"Polygon","coordinates":[[[77.48026559041332,12.99018559483798],[77.48046249366043,12.99018371462975],[77.48046511108876,12.990447311873123],[77.4802682077023,12.990449191815612],[77.48026559041332,12.99018559483798]]]},"point":[77.48036535075104,12.99031645322268],"areaM2":625.3841452527358}],"scale":30};
print('GIS-SAGAR GWR1 test centre',[77.48,12.99]);
print('Site dimensions: 100 m x 100 m; local CRS: EPSG:32643');
print('Analysis cells (including clipped edge cells):',REQUEST.cells.length);
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

import fs from 'node:fs/promises';
import {buildData} from './gee-common.mjs';
const tail=`
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
`;
await fs.mkdir(new URL('../gee/',import.meta.url),{recursive:true});
await fs.writeFile(new URL('../gee/code-editor-template.js',import.meta.url),buildData.toString()+tail);
console.log('Code Editor template generated. Authenticated execution remains untested.');

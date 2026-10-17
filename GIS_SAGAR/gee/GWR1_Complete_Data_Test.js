// GIS-SAGAR: complete, fixed-site Earth Engine data test.
// Centre: latitude 12.990000 N, longitude 77.480000 E.
// Boundary and 30 m clipped grid were generated in UTM 43N (EPSG:32643).
// SoilGrids and OpenLandMap are tested independently. No soil substitution.
// Revision 0.2: pass the complete native Projection; transform() is WKT text.
// This script extracts data; structure suitability is evaluated in the app.
// Sources:
// https://developers.google.com/earth-engine/datasets/catalog/JAXA_ALOS_AW3D30_V4_1
// https://docs.isric.org/globaldata/soilgrids/access_on_gee.html
// https://developers.google.com/earth-engine/datasets/catalog/OpenLandMap_SOL_SOL_TEXTURE-CLASS_USDA-TT_M_v02

var CENTRE = [77.48, 12.99]; // Earth Engine order: longitude, latitude.

// Shared vertices of the fixed 100 m x 100 m site and its clipped cells.
var V = [
  [77.47953489057295,12.989552686978655],
  [77.47970648784647,12.989551048759107],
  [77.47970745834598,12.989648819830613],
  [77.47953586104244,12.989650457780467],
  [77.47971014867869,12.989919845978473],
  [77.47953855123863,12.989921483963183],
  [77.47971283907239,12.99019087212014],
  [77.47954124143477,12.990192510140295],
  [77.47971545577981,12.990454469235383],
  [77.47954385789347,12.990456107572658],
  [77.47998286283975,12.98954841023865],
  [77.47998383344874,12.989646181450029],
  [77.47998652408054,12.989917207540977],
  [77.47998921477337,12.990188233625737],
  [77.4799918317701,12.99045183052522],
  [77.48025923777493,12.989545771718747],
  [77.4802602084905,12.989643542776102],
  [77.4802628994214,12.98991456881014],
  [77.48026559041332,12.99018559483798],
  [77.4802682077023,12.990449191815612],
  [77.48045614044483,12.989543891911474],
  [77.48045711127402,12.989641662649333],
  [77.48045980246725,12.98991268864235],
  [77.48046249366043,12.99018371462975],
  [77.48046511108876,12.990447311873123]
];

// Each record: cell ID, vertex indices, sampling point, area in square metres.
var RECORDS = [
  ['768960_1437270',[0,1,2,3],[77.47962117445947,12.989600753269787],202.150404812105],
  ['768960_1437300',[3,2,4,5],[77.47962300486057,12.989785151896898],560.3713792174141],
  ['768960_1437330',[5,4,6,7],[77.4796256951555,12.990056178059383],560.3713027114093],
  ['768960_1437360',[7,6,8,9],[77.47962834860729,12.9903234898464],545.0115324486322],
  ['768990_1437270',[1,10,11,2],[77.47984516064761,12.98959861503463],325.58466674328366],
  ['768990_1437300',[2,11,12,4],[77.47984699121326,12.989783013714252],902.5357301862224],
  ['768990_1437330',[4,12,13,6],[77.47984968172602,12.990054039830557],902.5357051870409],
  ['768990_1437360',[6,13,14,8],[77.47985233542124,12.990321351430559],877.7962645985968],
  ['769020_1437270',[10,15,16,11],[77.48012153566512,12.989595976584388],325.58458165495716],
  ['769020_1437300',[11,16,17,12],[77.48012336643507,12.989780375158539],902.5353701154943],
  ['769020_1437330',[12,17,18,13],[77.48012605724693,12.990051401217938],902.5353450948247],
  ['769020_1437360',[13,18,19,14],[77.48012871123782,12.9903187126816],877.7958695711311],
  ['769050_1437270',[15,20,21,16],[77.48035817452447,12.989593717343787],231.9614326847998],
  ['769050_1437300',[16,21,22,17],[77.48036000547887,12.989778115729736],643.0092993478016],
  ['769050_1437330',[17,22,23,18],[77.48036269654091,12.990049141740165],643.0093425645404],
  ['769050_1437360',[18,23,24,19],[77.48036535075104,12.99031645322268],625.3841452527358]
];

function polygon(indices) {
  var ring = indices.map(function(i) { return V[i]; });
  ring.push(ring[0]);
  return {type:'Polygon', coordinates:[ring]};
}

var REQUEST = {
  schema:'gis-sagar-request-v1', scale:30,
  site:{type:'Feature', properties:{}, geometry:polygon([0,20,24,9])},
  cells:RECORDS.map(function(r) {
    return {id:r[0], geometry:polygon(r[1]), point:r[2], areaM2:r[3]};
  })
};

var roi = ee.Geometry(REQUEST.site.geometry);
var centrePin = ee.Geometry.Point(CENTRE);
var contextArea = centrePin.buffer(1000);
var points = ee.FeatureCollection(REQUEST.cells.map(function(c) {
  return ee.Feature(ee.Geometry.Point(c.point), {id:c.id});
}));
var grid = ee.FeatureCollection(REQUEST.cells.map(function(c) {
  return ee.Feature(ee.Geometry(c.geometry), {id:c.id});
}));

Map.setOptions('SATELLITE');
Map.centerObject(centrePin, 18);
Map.addLayer(roi, {color:'00FFFF'}, 'Selected 100 m x 100 m site');
Map.addLayer(grid.style({color:'FFFFFF',fillColor:'00000000',width:1}), {}, '30 m clipped grid');
Map.addLayer(points, {color:'FFFF00'}, 'Sampling points', false);
Map.addLayer(centrePin, {color:'FF0000'}, 'Exact centre: 12.990000 N, 77.480000 E');
print('CENTRE: latitude 12.990000 N; longitude 77.480000 E');
print('Original: 12 degrees 59 minutes 24 seconds N; 77 degrees 28 minutes 48 seconds E');
print('Site: 100 m x 100 m in EPSG:32643; analysis cells:', REQUEST.cells.length);

var DEPTHS = ['0-5','5-15','15-30','30-60','60-100'];
var OLM_BANDS = ['b0','b10','b30','b60','b100'];
var TEXTURES = [null,'clay','silty clay','sandy clay','clay loam',
  'silty clay loam','sandy clay loam','loam','silt loam',
  'sandy loam','silt','loamy sand','sand'];

function projectionInfo(p) {
  return ee.Dictionary({crs:p.crs(),wkt:p.wkt(),
    transform:p.transform(),nominal_scale_m:p.nominalScale()});
}
function rows(collection) {
  return collection.toList(REQUEST.cells.length).map(function(f) {
    return ee.Feature(f).toDictionary();
  });
}
function sampleNative(image) {
  var p = image.select(0).projection();
  // Separate reduceRegion per point to cross-check the earlier batch sampling.
  // Exact source transform: no interpolation or invented 30 m soil detail.
  return points.map(function(f) {
    f = ee.Feature(f);
    return f.set(image.reduceRegion({reducer:ee.Reducer.first(),
      geometry:f.geometry(),crs:p,maxPixels:10000}));
  });
}

var jobs = {};
var pending = 3;
function submit(name, build) {
  function done(data, error) {
    jobs[name] = {data:data || {},error:error ? String(error) : null};
    if (error) print(name + ' FAILED', error);
    pending -= 1;
    if (pending === 0) finish();
  }
  try { build().evaluate(done); }
  catch (error) { done(null, error); }
}

submit('ALOS', function() {
  var tiles = ee.ImageCollection('JAXA/ALOS/AW3D30/V4_1')
    .filterBounds(roi.buffer(90));
  var elevation = tiles.select('DSM');
  var p = ee.Image(elevation.first()).projection();
  var dem = elevation.mosaic().setDefaultProjection(p);
  var degrees = ee.Terrain.slope(dem).rename('slope_degrees');
  var percent = degrees.multiply(Math.PI/180).tan().multiply(100)
    .rename('slope_percent');
  var sampled = degrees.addBands(percent).reduceRegions({
    collection:points,reducer:ee.Reducer.first(),crs:p,scale:30,tileScale:2
  });
  return ee.Dictionary({samples:rows(sampled),
    tiles:tiles.aggregate_array('system:index'),projection:projectionInfo(p)});
});

submit('SOILGRIDS', function() {
  var images = ['sand','silt','clay'].map(function(property) {
    return ee.Image('projects/soilgrids-isric/' + property + '_mean')
      .select(DEPTHS.map(function(d) {return property + '_' + d + 'cm_mean';}));
  });
  var soil = images[0].addBands(images[1]).addBands(images[2]);
  var p = soil.select(0).projection();
  var support = ee.Image.pixelCoordinates(p)
    .rename(['soil_pixel_x','soil_pixel_y']);
  return ee.Dictionary({samples:rows(sampleNative(soil.addBands(support))),
    bands:soil.bandNames(),projection:projectionInfo(p),
    valid_pixels_within_1km:soil.reduceRegion({reducer:ee.Reducer.count(),
      geometry:contextArea,crs:p,maxPixels:100000})});
});

submit('OPENLANDMAP', function() {
  var soil = ee.Image('OpenLandMap/SOL/SOL_TEXTURE-CLASS_USDA-TT_M/v02')
    .select(OLM_BANDS);
  return ee.Dictionary({samples:rows(sampleNative(soil)),
    projection:projectionInfo(soil.select(0).projection())});
});

function indexById(samples) {
  var result = {};
  (samples || []).forEach(function(s) {result[s.id] = s;});
  return result;
}
function numeric(x) {return typeof x === 'number' && isFinite(x);}
function finish() {
  var alos = jobs.ALOS.data;
  var sg = jobs.SOILGRIDS.data;
  var olm = jobs.OPENLANDMAP.data;
  var a = indexById(alos.samples);
  var s = indexById(sg.samples);
  var o = indexById(olm.samples);
  var createdAt = new Date().toISOString();
  var summary = {total_cells:REQUEST.cells.length,slope_cells:0,
    complete_soilgrids_profiles:0,complete_openlandmap_profiles:0};
  var errors = {};
  Object.keys(jobs).forEach(function(k) {errors[k] = jobs[k].error;});

  var features = REQUEST.cells.map(function(c) {
    var p = {id:c.id};
    [a[c.id] || {},s[c.id] || {}].forEach(function(source) {
      Object.keys(source).forEach(function(k) {p[k] = source[k];});
    });
    var alternative = o[c.id] || {};
    OLM_BANDS.forEach(function(b) {
      var code = alternative[b];
      var valid = numeric(code) && code === Math.floor(code) && code >= 1 && code <= 12;
      p['olm_' + b] = valid ? code : null;
      p['olm_' + b + '_texture'] = valid ? TEXTURES[code] :
        (jobs.OPENLANDMAP.error ? 'SOURCE_ERROR' : 'NO_DATA');
    });
    if (numeric(p.slope_percent)) summary.slope_cells += 1;
    if (DEPTHS.every(function(d) {
      return ['sand','silt','clay'].every(function(k) {
        return numeric(p[k + '_' + d + 'cm_mean']);
      });
    })) summary.complete_soilgrids_profiles += 1;
    if (OLM_BANDS.every(function(b) {return p['olm_' + b] !== null;}))
      summary.complete_openlandmap_profiles += 1;

    p._schema = 'gis-sagar-gee-feature-v1';
    p._extractor_version = 'gwr1-comparison-0.2';
    p._site_json = JSON.stringify(REQUEST.site);
    p._created_at = createdAt;
    p._method = 'Representative point samples; soil on exact native grid; terrain sampled at 30 m; not polygon means.';
    p._alos_tiles = JSON.stringify(alos.tiles || []);
    p._soil_bands = JSON.stringify(sg.bands || []);
    p._soil_projection = sg.projection ? (sg.projection.crs || sg.projection.wkt) : null;
    p._terrain_projection = alos.projection ? (alos.projection.crs || alos.projection.wkt) : null;
    p._source_details_json = JSON.stringify({alos:alos.projection || null,
      soilgrids:sg.projection || null,openlandmap:olm.projection || null});
    p._source_errors_json = JSON.stringify(errors);
    p._soilgrids_valid_pixels_1km_json = JSON.stringify(sg.valid_pixels_within_1km || {});
    p._openlandmap_asset = 'OpenLandMap/SOL/SOL_TEXTURE-CLASS_USDA-TT_M/v02';
    p._openlandmap_note = 'Diagnostic alternative. Bands represent depths 0,10,30,60,100 cm, not SoilGrids intervals. Not automatically used by the V1 model.';
    p._area_m2 = c.areaM2;
    p._point_json = JSON.stringify(c.point);
    return ee.Feature(ee.Geometry(c.geometry), p);
  });

  print('COVERAGE SUMMARY', summary);
  print('SOURCE ERRORS: null means no request error', errors);
  print('SOILGRIDS: valid source-pixel counts within 1 km', sg.valid_pixels_within_1km || {});
  var output = ee.FeatureCollection(features);
  print('ALL OBSERVATIONS: expand features / properties', output);
  output.getDownloadURL({format:'geojson',filename:'GWR1-soil-slope-comparison',
    callback:function(url,error) {
      if (error || !url) {print('DOWNLOAD FAILED',error);return;}
      print(ui.Label('DOWNLOAD: GWR1 soil and slope comparison GeoJSON',{},url));
    }});
}

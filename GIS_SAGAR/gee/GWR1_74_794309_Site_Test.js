// GIS-SAGAR: complete, fixed-site Earth Engine data test.
// Centre: latitude 13.018185760719339 N, longitude 74.794309 E.
// Boundary and 30 m clipped grid were generated in UTM 43N (EPSG:32643).
// SoilGrids and OpenLandMap are tested independently. No soil substitution.
// Revision 0.2: pass the complete native Projection; transform() is WKT text.
// This script extracts data; structure suitability is evaluated in the app.
// Sources:
// https://developers.google.com/earth-engine/datasets/catalog/JAXA_ALOS_AW3D30_V4_1
// https://docs.isric.org/globaldata/soilgrids/access_on_gee.html
// https://developers.google.com/earth-engine/datasets/catalog/OpenLandMap_SOL_SOL_TEXTURE-CLASS_USDA-TT_M_v02

var CENTRE = [74.79430899999998,13.018185760719339]; // [longitude, latitude]

var V = [
  [74.7938480838306,13.017951762176809],
  [74.79384826444029,13.017733262403732],
  [74.79397580992082,13.017733363536324],
  [74.79397562942823,13.017951863543182],
  [74.79384785959382,13.018223041538125],
  [74.79397540533202,13.018223142906685],
  [74.79384763535705,13.018494320893774],
  [74.79397518123075,13.018494422264515],
  [74.79384751698439,13.018637526934635],
  [74.79397506292712,13.018637628074492],
  [74.79425247498845,13.017733582907923],
  [74.79425229473809,13.017952083126804],
  [74.79425207094279,13.018223362495036],
  [74.79425184714245,13.018494641857604],
  [74.79425172899785,13.018637847461843],
  [74.79452914006092,13.017733802279523],
  [74.79452896005299,13.017952302415361],
  [74.79452873655863,13.018223581788318],
  [74.79452851305923,13.018494861155608],
  [74.79452839507343,13.0186380668492],
  [74.79477048134375,13.017733993642397],
  [74.79477030154197,13.017952493448393],
  [74.7947700783083,13.018223772825465],
  [74.79476985507465,13.01849505219687],
  [74.79476973723153,13.018638258225817]
];

var RECORDS = [
  ["477630_1439100",[0,1,2,3],[74.79391194687571,13.017842562973456],335.7226274481895],
  ["477630_1439130",[4,0,3,5],[74.79391174451104,13.018087452541746],416.81770364135394],
  ["477630_1439160",[6,4,5,7],[74.79391152034454,13.01835873190132],416.8176897364456],
  ["477630_1439190",[8,6,7,9],[74.79391134910756,13.018565974484133],220.03429086957894],
  ["477660_1439100",[3,2,10,11],[74.79411405220834,13.017842723331565],728.2329068044141],
  ["477660_1439130",[5,3,11,12],[74.79411385003505,13.018087613019109],904.1393953163798],
  ["477660_1439160",[7,5,12,13],[74.79411362608677,13.018358892382144],904.139370123806],
  ["477660_1439190",[9,7,13,14],[74.79411345503479,13.018566134863178],477.28628170624546],
  ["477690_1439100",[11,10,15,16],[74.7943907173995,13.017842942661641],728.2331331336038],
  ["477690_1439130",[12,11,16,17],[74.7943905154979,13.01808783245756],904.1394252234288],
  ["477690_1439160",[13,12,17,18],[74.79439029185053,13.018359111825323],904.1394001039143],
  ["477690_1439190",[14,13,18,19],[74.79439012102854,13.018566354353402],477.286095284637],
  ["477720_1439100",[16,15,20,21],[74.79464972069837,13.017843147863957],635.2538418722082],
  ["477720_1439130",[17,16,21,22],[74.7946495190503,13.018088037620412],788.7015305442759],
  ["477720_1439160",[18,17,22,23],[74.79464929568377,13.018359316992594],788.7015108762762],
  ["477720_1439190",[19,18,23,24],[74.79464912507405,13.018566559690711],416.3482118200904]
];

function polygon(indices) {
  var ring = indices.map(function(i) {return V[i];});
  ring.push(ring[0]);
  return {type:"Polygon",coordinates:[ring]};
}

var REQUEST = {
  schema:"gis-sagar-request-v1",scale:30,
  site:{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[74.79384826444029,13.017733262403732],[74.79477048134375,13.017733993642397],[74.79476973723153,13.018638258225817],[74.79384751698439,13.018637526934635],[74.79384826444029,13.017733262403732]]]}},
  cells:RECORDS.map(function(r) {
    return {id:r[0],geometry:polygon(r[1]),point:r[2],areaM2:r[3]};
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
Map.addLayer(centrePin, {color:'FF0000'}, 'Exact centre: 13.018185760719339 N, 74.794309 E');
print('CENTRE: latitude 13.018185760719339 N; longitude 74.794309 E');
print('Input order: longitude first, latitude second.');
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
  output.getDownloadURL({format:'geojson',filename:'GWR1-74_794309-soil-slope-comparison',
    callback:function(url,error) {
      if (error || !url) {print('DOWNLOAD FAILED',error);return;}
      print(ui.Label('DOWNLOAD: GWR1 soil and slope comparison GeoJSON',{},url));
    }});
}

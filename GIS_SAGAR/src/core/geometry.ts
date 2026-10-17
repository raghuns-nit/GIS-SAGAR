import proj4 from 'proj4';
import {area, bbox, booleanValid, intersect, featureCollection, pointOnFeature,kinks} from '@turf/turf';
import type {Feature, Polygon, MultiPolygon} from 'geojson';
export type Site = Feature<Polygon>;
export function localProjection(lon:number,lat:number) {
 if(!Number.isFinite(lon)||!Number.isFinite(lat)||lon<68||lon>98||lat<6||lat>38)throw new Error('Choose coordinates within the supported India extent (68–98°E, 6–38°N).');
 const zone=Math.floor((lon+180)/6)+1;
 return {code:`EPSG:${32600+zone}`,definition:`+proj=utm +zone=${zone} +datum=WGS84 +units=m +no_defs`};
}
export function pinSquare(lon:number,lat:number,width:number,height:number):Site {
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<30||height<30||width>5000||height>5000)throw new Error('Dimensions must be between 30 and 5,000 m.');
 const p=localProjection(lon,lat);const [x,y]=proj4('EPSG:4326',p.definition,[lon,lat]);
 const ring=[[-1,-1],[1,-1],[1,1],[-1,1],[-1,-1]].map(([a,b])=>proj4(p.definition,'EPSG:4326',[x+a*width/2,y+b*height/2]));
 return validateSite({type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[ring]}});
}
export function validateSite(raw:unknown):Site {
 const f=raw as Site;
 if(!f||f.type!=='Feature'||f.geometry?.type!=='Polygon'||!Array.isArray(f.geometry.coordinates))throw new Error('Provide a GeoJSON Polygon Feature.');
 let count=0;for(const ring of f.geometry.coordinates){if(ring.length<4)throw new Error('Polygon rings need at least four positions.');if(JSON.stringify(ring[0])!==JSON.stringify(ring.at(-1)))throw new Error('Close every polygon ring.');for(const c of ring){count++;if(c.length!==2||!c.every(Number.isFinite))throw new Error('Invalid coordinate.');localProjection(c[0],c[1]);}}
 if(count>1000)throw new Error('Limit the boundary to 1,000 positions.');
 if(!booleanValid(f)||kinks(f).features.length)throw new Error('Polygon is invalid or self-intersecting.');
 const a=area(f);if(a<1||a>4_000_000)throw new Error('Select an area between 1 m² and 4 km² for this test build.');
 return structuredClone(f);
}
export function geometryKey(site:Site){return JSON.stringify(site.geometry);}
export interface GridCell {id:string;geometry:Polygon|MultiPolygon;point:[number,number];areaM2:number}
export function makeGrid(site:Site,scale=30):GridCell[] {
 validateSite(site);if(!Number.isFinite(scale)||scale<30||scale>250)throw new Error('Analysis scale must be 30–250 m.');
 const bounds=bbox(site);const p=localProjection((bounds[0]+bounds[2])/2,(bounds[1]+bounds[3])/2);
 const positions=site.geometry.coordinates.flat().map(c=>proj4('EPSG:4326',p.definition,c));
 const minX=Math.floor(Math.min(...positions.map(c=>c[0]))/scale)*scale;const maxX=Math.max(...positions.map(c=>c[0]));
 const minY=Math.floor(Math.min(...positions.map(c=>c[1]))/scale)*scale;const maxY=Math.max(...positions.map(c=>c[1]));
 if(Math.ceil((maxX-minX)/scale)*Math.ceil((maxY-minY)/scale)>5000)throw new Error('This extent produces over 5,000 cells. Use a smaller boundary.');
 const cells:GridCell[]=[];
 for(let x=minX;x<maxX;x+=scale)for(let y=minY;y<maxY;y+=scale){
  const ring=[[x,y],[x+scale,y],[x+scale,y+scale],[x,y+scale],[x,y]].map(c=>proj4(p.definition,'EPSG:4326',c));
  const clipped=intersect(featureCollection([site,{type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[ring]}}]));
  if(clipped&&area(clipped)>0.01){const pt=pointOnFeature(clipped).geometry.coordinates as [number,number];cells.push({id:`${Math.round(x)}_${Math.round(y)}`,geometry:clipped.geometry,point:pt,areaM2:area(clipped)});}
 }
 return cells;
}

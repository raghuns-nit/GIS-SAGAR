import {useEffect,useRef,useState} from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type {Site} from './core/geometry.ts';
import type {EvidenceBundle} from './core/evidence.ts';
import type {CellResult} from './core/types.ts';
import type {Feature} from 'geojson';
export function MapPanel({site,bundle,results,selectedCellId,onCell,onPin,onPolygon}:{site:Site;bundle:EvidenceBundle|null;results:CellResult[];selectedCellId?:string;onCell:(id:string)=>void;onPin:(lon:number,lat:number)=>void;onPolygon:(site:Site)=>void}) {
 const el=useRef<HTMLDivElement>(null);const map=useRef<L.Map|null>(null);const layers=useRef<L.LayerGroup|null>(null);const handlers=useRef({onPin,onPolygon,onCell,hasData:!!bundle});handlers.current={onPin,onPolygon,onCell,hasData:!!bundle};
 const viewSite=useRef<Site|null>(null);
 const draw=useRef(false);const vertices=useRef<[number,number][]>([]);const [drawing,setDrawing]=useState(false);const [tileError,setTileError]=useState(false);
 useEffect(()=>{if(!el.current)return;const m=L.map(el.current,{zoomControl:true,attributionControl:true}).setView([12.8839,74.8333],16);map.current=m;
  const tiles=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(m);tiles.on('tileerror',()=>setTileError(true));
  layers.current=L.layerGroup().addTo(m);m.on('click',(e:L.LeafletMouseEvent)=>{if(draw.current){vertices.current.push([e.latlng.lng,e.latlng.lat]);L.circleMarker(e.latlng,{radius:4,color:'#17614f'}).addTo(layers.current!);}else if(!handlers.current.hasData) handlers.current.onPin(e.latlng.lng,e.latlng.lat);});
  return()=>{m.remove();map.current=null;viewSite.current=null;};
 },[]);
 useEffect(()=>{if(!layers.current||!map.current)return;layers.current.clearLayers();const outline=L.geoJSON(site,{style:{color:'#174d40',weight:3,fillOpacity:0.04}}).addTo(layers.current);if(viewSite.current!==site){map.current.fitBounds(outline.getBounds(),{padding:[25,25],maxZoom:18});viewSite.current=site;}
  if(bundle)for(const cell of bundle.cells){const r=results.find(r=>r.id===cell.id);const v=r?.zoneScore;const color=v==null?'#a3a7a0':v>=75?'#237657':v>=50?'#a3b36c':'#cc926a';const feature:Feature={type:'Feature',properties:{},geometry:cell.spatial.geometry};L.geoJSON(feature,{style:{color:cell.id===selectedCellId?'#174d40':color,weight:cell.id===selectedCellId?3:1,fillColor:color,fillOpacity:cell.id===selectedCellId?0.6:0.42},onEachFeature:(_f,layer)=>{layer.on('click',()=>{if(!draw.current)handlers.current.onCell(cell.id);});}}).bindTooltip(`Cell ${bundle.cells.indexOf(cell)+1} · ${v==null?'No score':v.toFixed(0)}${bundle.mode==='SYNTHETIC'?' · synthetic':''}`).addTo(layers.current);}
 },[site,bundle,results,selectedCellId]);
 function finish(){draw.current=false;setDrawing(false);const v=vertices.current;if(v.length>=3)handlers.current.onPolygon({type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[[...v,v[0]]]}});vertices.current=[];}
 return <section className="map-section" aria-label="Site map"><div className="map-toolbar"><span>Site map</span><button onClick={()=>{draw.current=!draw.current;vertices.current=[];setDrawing(draw.current);}}>{drawing?'Cancel drawing':'Draw boundary'}</button>{drawing&&<button className="primary" onClick={finish}>Apply boundary</button>}</div><div ref={el} className="map"/>{drawing&&<div className="map-note">Select at least three points, then Apply boundary.</div>}{tileError&&<div className="map-note">Basemap unavailable. Results remain available.</div>}</section>;
}

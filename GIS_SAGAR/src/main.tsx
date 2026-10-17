import React,{useMemo,useState,useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {area} from '@turf/turf';
import {cloneConfig} from './core/config.ts';
import {CATALOGUE,FACT_LABELS} from './core/catalogue.ts';
import {evaluateCell,validateConfig,binRank} from './core/engine.ts';
import {pinSquare,validateSite,makeGrid,type Site} from './core/geometry.ts';
import {syntheticEvidence} from './core/synthetic.ts';
import {validateBundle,geeRequest,type EvidenceBundle} from './core/evidence.ts';
import {codeEditorScript} from './core/codeEditor.ts';
import {MapPanel} from './MapPanel.tsx';
import type {Context,ModelConfig,SoilSource,StructureResult} from './core/types.ts';
import testSiteEvidence from '../examples/live/GWR1-74_794309-openlandmap-evidence.json';
import './style.css';
import {InfoPanel,type InfoPage} from './InfoPanel.tsx';

function download(name:string,value:unknown,text=false){
 const blob=new Blob([text?String(value):JSON.stringify(value,null,2)],{type:text?'text/javascript':'application/json'});
 const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
}
const outcomeLabel:Record<StructureResult['outcome'],string>={
 CONDITIONAL_CANDIDATE:'Conditional candidate',NOT_SHORTLISTED:'Limited screening support',NEEDS_ADDITIONAL_EVIDENCE:'More evidence needed',
 BLOCKED_BY_SITE_CONDITION:'Excluded',NOT_APPLICABLE:'Not applicable',INSUFFICIENT_DATA:'Insufficient data',RULE_UNDEFINED:'Assessment unavailable'
};
function reason(r:StructureResult){
 if(r.outcome==='NOT_SHORTLISTED')return 'Available soil or slope evidence gives limited support. Site checks are needed before use.';
 if(r.outcome==='CONDITIONAL_CANDIDATE')return 'Screening criteria met; site checks remain.';
 if(r.outcome==='BLOCKED_BY_SITE_CONDITION')return 'Excluded by a recorded site condition.';
 if(r.outcome==='NOT_APPLICABLE')return 'Required site feature is absent.';
 if(r.outcome==='INSUFFICIENT_DATA')return 'Required observations are missing.';
 if(r.outcome==='RULE_UNDEFINED')return 'A selected factor has no assessment rule.';
 return 'Additional site evidence is required.';
}
function siteGuidance(r:StructureResult){
 if(r.support==='UNESTABLISHED')return 'An option to assess once its site requirements are established.';
 if(r.id==='STR_PIT')return 'Consider a pit if field tests confirm infiltration, groundwater separation and suitable recharge water.';
 if(r.id==='STR_TRENCH')return 'Consider a trench if site drainage, infiltration and groundwater separation are suitable.';
 if(r.id==='STR_PERCOLATION')return 'Confirm receiving-ground permeability, available space and runoff before selecting the basin.';
 return 'Confirm the site requirements below before selecting this structure.';
}
function screeningSupport(r:StructureResult,soilRank:number|null,slope:number|null,config:ModelConfig){
 const rule=config.structureRules[r.id];
 if(r.outcome==='NOT_SHORTLISTED'&&rule){
  const soilLimited=soilRank!==null&&soilRank<rule.soilMinimum;
  const slopeLimited=slope!==null&&binRank(slope,rule.slopeBins)===null;
  if(soilLimited&&slopeLimited)return 'Mapped soil and slope give limited support.';
  if(soilLimited)return 'Mapped soil gives limited support.';
  if(slopeLimited)return 'Slope is outside the current screening range.';
 }
 return reason(r);
}
function Upload({children,onChange}:{children:React.ReactNode;onChange:(e:React.ChangeEvent<HTMLInputElement>)=>void}){
 return <label className="upload">{children}<input type="file" accept=".json,.geojson" onChange={onChange}/></label>;
}
function App(){
 const [infoPage,setInfoPage]=useState<InfoPage|null>(null);
 const [lon,setLon]=useState(74.79430899999998),[lat,setLat]=useState(13.018185760719339),[width,setWidth]=useState(100),[height,setHeight]=useState(100);
 const [site,setSite]=useState<Site>(()=>pinSquare(74.79430899999998,13.018185760719339,100,100));
 const [bundle,setBundle]=useState<EvidenceBundle|null>(null),[soilSource,setSoilSource]=useState<SoilSource>('OPENLANDMAP');
 const siteRef=useRef(site);siteRef.current=site;
 const [config,setConfig]=useState<ModelConfig>(cloneConfig),[context,setContext]=useState<Context>({facts:{},blockedFamilies:[]});
 const [error,setError]=useState(''),[cellId,setCellId]=useState('');
 const [endpoint,setEndpoint]=useState(import.meta.env.VITE_ANALYSIS_ENDPOINT||''),[accessToken,setAccessToken]=useState(''),[loading,setLoading]=useState(false);
 const results=useMemo(()=>bundle?bundle.cells.map(c=>evaluateCell(c,config,context)):[],[bundle,config,context]);
 const current=results.find(r=>r.id===cellId)||results[0];
 const selected=bundle?.cells.find(c=>c.id===current?.id);
 const valid=results.filter(r=>r.zoneScore!==null);
 const scores=valid.map(r=>r.zoneScore!);
 const scoreRange=scores.length?`${Math.min(...scores).toFixed(0)}–${Math.max(...scores).toFixed(0)}`:'—';
 const shown=current?(current.primary.length?current.primary:current.exploratory):[];
 function closeTools(){document.querySelectorAll<HTMLDetailsElement>('details.tool[open]').forEach(d=>d.open=false);}
 function changeSite(s:Site){try{setSite(validateSite(s));setBundle(null);setContext({facts:{},blockedFamilies:[]});setCellId('');setError('');closeTools();}catch(e){setError((e as Error).message);}}
 function pin(x:number,y:number){try{const s=pinSquare(x,y,width,height);setLon(x);setLat(y);changeSite(s);}catch(e){setError((e as Error).message);}}
 function editConfig(next:ModelConfig){try{next.version=`local-${Date.now()}`;validateConfig(next);setConfig(next);setError('');}catch(e){setError((e as Error).message);}}
 function loadVerifiedSite(){try{const b=validateBundle(structuredClone(testSiteEvidence));setSite(b.site);setLon(74.79430899999998);setLat(13.018185760719339);setWidth(100);setHeight(100);setSoilSource('OPENLANDMAP');setBundle(b);setConfig(cloneConfig());setContext({facts:{},blockedFamilies:[]});setCellId('');setError('');closeTools();}catch(e){setError((e as Error).message);}}
 async function importFile(e:React.ChangeEvent<HTMLInputElement>,kind:'evidence'|'site'|'config'){
  const f=e.target.files?.[0];if(!f)return;
  try{if(f.size>15_000_000)throw new Error('File exceeds 15 MB.');const raw=JSON.parse(await f.text());
   if(kind==='site')changeSite(raw.type==='Polygon'?{type:'Feature',properties:{},geometry:raw}:raw);
   else if(kind==='config'){validateConfig(raw);setConfig(raw);}
   else{const b=validateBundle(raw,siteRef.current,soilSource);setBundle(b);setSoilSource(b.soilSource??'SOILGRIDS');setCellId('');}
   setError('');closeTools();
  }catch(err){setError((err as Error).message);}e.target.value='';
 }
 async function live(){setLoading(true);setError('');try{
  if(soilSource==='OPENLANDMAP')throw new Error('OpenLandMap requires an observation file.');
  if(!endpoint||!accessToken)throw new Error('Enter the connection URL and session token.');
  const url=new URL(endpoint);if(url.protocol!=='https:'&&!(url.protocol==='http:'&&['localhost','127.0.0.1'].includes(url.hostname)))throw new Error('Connection requires HTTPS.');
  const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${accessToken}`},body:JSON.stringify(geeRequest(site,makeGrid(site)))});
  const data=await response.json();if(!response.ok)throw new Error(data.error||`Request failed (${response.status}).`);setBundle(validateBundle(data,siteRef.current));
 }catch(e){setError((e as Error).message);}finally{setLoading(false);}}
 function saveSnapshot(){download('gis-sagar-snapshot.json',{schema:'gis-sagar-snapshot-v1',createdAt:new Date().toISOString(),evidence:bundle,config,context,results});}
 function weightRows(active:boolean){return config.parameters.map((p,i)=>p.enabled===active&&<tr key={p.id}>
  <th scope="row">{p.label}</th>
  <td>{<input aria-label={`Enable ${p.label}`} disabled={['soil_texture','slope_pct'].includes(p.id)} type="checkbox" checked={p.enabled} onChange={e=>{const c=structuredClone(config);c.parameters[i].enabled=e.target.checked;editConfig(c);}}/>}</td>
  {(['zoneWeight','structureWeight'] as const).map(k=><td key={k}><input aria-label={`${p.label} ${k==='zoneWeight'?'location':'structure'} weight`} type="number" min="0" value={p[k]} onChange={e=>{const c=structuredClone(config);c.parameters[i][k]=+e.target.value;editConfig(c);}}/></td>)}
 </tr>);}
 return <>
  <header className="app-header"><a className="brand" href="#" aria-label="GIS-SAGAR home"><span className="brand-mark" aria-hidden="true">≈</span><span>GIS–SAGAR<small>Groundwater recharge</small></span></a><nav className="header-actions" aria-label="Application"><button className="nav-link" onClick={()=>setInfoPage('about')}>About</button><button className="nav-link" onClick={()=>setInfoPage('help')}>Help</button><button onClick={saveSnapshot} disabled={!bundle}>Export results</button></nav></header>
  <InfoPanel page={infoPage} onClose={()=>setInfoPage(null)}/>
  <main>
   <div className="toolbar">
    <div className="toolbar-title"><h1>Site assessment</h1><span>{(area(site)/10000).toFixed(2)} ha</span></div>
    <div className="tools">
     <button className="primary" onClick={loadVerifiedSite}>Load test site</button>
     <details className="tool" name="workspace-tools"><summary>Site</summary><div className="tool-panel">
      <h2>Site</h2><div className="field-pair"><label>Latitude °N<input type="number" step="any" value={lat} onChange={e=>setLat(+e.target.value)}/></label><label>Longitude °E<input type="number" step="any" value={lon} onChange={e=>setLon(+e.target.value)}/></label></div>
      <div className="field-pair"><label>Width · m<input type="number" min="30" max="5000" value={width} onChange={e=>setWidth(+e.target.value)}/></label><label>Height · m<input type="number" min="30" max="5000" value={height} onChange={e=>setHeight(+e.target.value)}/></label></div>
      <div className="actions"><button onClick={()=>pin(lon,lat)}>Apply</button><Upload onChange={e=>importFile(e,'site')}>Import boundary</Upload></div>
      <details><summary>Site conditions</summary><div className="detail-body">{[['channel_present','Channel'],['tank_present','Existing tank'],['dug_well_present','Dug well']].map(([k,label])=><label key={k}>{label}<select value={context.facts[k]===true?'yes':context.facts[k]===false?'no':'unknown'} onChange={e=>setContext({...context,facts:{...context.facts,[k]:e.target.value==='unknown'?null:e.target.value==='yes'}})}><option value="unknown">Unknown</option><option value="yes">Present</option><option value="no">Absent</option></select></label>)}</div></details>
      <details><summary>Exclude structures</summary><div className="detail-body">{CATALOGUE.map(s=><label className="check" key={s.id}><input type="checkbox" checked={context.blockedFamilies.includes(s.id)} onChange={e=>setContext({...context,blockedFamilies:e.target.checked?[...context.blockedFamilies,s.id]:context.blockedFamilies.filter(id=>id!==s.id)})}/>{s.name}</label>)}</div></details>
     </div></details>
     <details className="tool" name="workspace-tools"><summary>Data</summary><div className="tool-panel">
      <h2>Observations</h2><label>Soil source<select value={soilSource} onChange={e=>{setSoilSource(e.target.value as SoilSource);setBundle(null);setCellId('');}}><option value="OPENLANDMAP">OpenLandMap</option><option value="SOILGRIDS">SoilGrids</option></select></label>
      <Upload onChange={e=>importFile(e,'evidence')}>Import observations</Upload>
      <details><summary>Extraction tools</summary><div className="detail-body"><p className="muted">The generated script uses SoilGrids.</p><div className="stack"><button onClick={()=>{try{download('gis-sagar-code-editor.js',codeEditorScript(site,makeGrid(site)),true);}catch(e){setError((e as Error).message);}}}>Download GEE script</button><button onClick={()=>download('gis-sagar-request.json',geeRequest(site,makeGrid(site)))}>Export request</button><button onClick={()=>{setBundle(syntheticEvidence(site));setSoilSource('SOILGRIDS');setError('');}}>Load synthetic example</button></div></div></details>
      <details><summary>Connection</summary><div className="detail-body"><label>Service URL<input type="url" value={endpoint} onChange={e=>setEndpoint(e.target.value)}/></label><label>Session token<input type="password" autoComplete="off" value={accessToken} onChange={e=>setAccessToken(e.target.value)}/></label><button onClick={live} disabled={loading}>{loading?'Loading…':'Retrieve observations'}</button><p className="muted">SoilGrids only. Use an application session token.</p></div></details>
     </div></details>
     <details className="tool settings" name="workspace-tools"><summary>Settings</summary><div className="tool-panel">
      <h2>Weights</h2><div className="table-scroll"><table><thead><tr><th>Factor</th><th>On</th><th>Location</th><th>Structure</th></tr></thead><tbody>{weightRows(true)}</tbody></table></div>
      <details><summary>Additional factors</summary><p className="muted">Enabling a factor requires its observations and assessment rules.</p><div className="table-scroll"><table><thead><tr><th>Factor</th><th>On</th><th>Location</th><th>Structure</th></tr></thead><tbody>{weightRows(false)}</tbody></table></div></details>
      <details><summary>Model options</summary><div className="detail-body"><label>Exploratory options<input type="number" min="0" max="13" value={config.fallback.count} onChange={e=>{const c=structuredClone(config);c.fallback.count=+e.target.value;editConfig(c);}}/></label><div className="stack"><button onClick={()=>download('gis-sagar-model.json',config)}>Export settings</button><Upload onChange={e=>importFile(e,'config')}>Import settings</Upload></div></div></details>
      <button className="text-button" onClick={()=>setConfig(cloneConfig())}>Reset weights & rules</button>
     </div></details>
    </div>
   </div>
   {error&&<p className="error" role="alert">{error}</p>}
   <div className="assessment">
    <section className="map-column" aria-label="Site overview">
     <MapPanel site={site} bundle={bundle} results={results} selectedCellId={current?.id} onCell={setCellId} onPin={pin} onPolygon={changeSite}/>
     <div className="map-summary" role="status">{bundle?<><span>{bundle.mode==='SYNTHETIC'?'Synthetic example':'Observed data'} · {results.length} cells</span><span>Score {scoreRange} / 100</span></>:<><span>100 m × 100 m site</span><span>No observations</span></>}</div>
    </section>
    <section className="results" aria-label="Assessment results">
     {!current?<div className="empty"><span className="empty-icon" aria-hidden="true">≈</span><h2>No observations loaded</h2><p>Load the test site or import observations from Data.</p></div>:<>
      <div className="result-heading"><h2>Results</h2><select aria-label="Analysis cell" value={current.id} onChange={e=>setCellId(e.target.value)}>{results.map((r,i)=><option key={r.id} value={r.id}>Cell {i+1} · {r.zoneScore===null?'No score':r.zoneScore.toFixed(0)}</option>)}</select></div>
      {bundle?.mode==='SYNTHETIC'&&<p className="notice">Synthetic example · not site observations.</p>}
      <div className="score"><span>Screening score</span><strong>{current.zoneScore===null?'—':current.zoneScore.toFixed(0)}<small> / 100</small></strong></div>
      <div className="metrics"><div><span>Mapped soil</span><strong className="texture-value">{[...new Set(current.layers.map(l=>l.texture))].join(' / ')||'Unavailable'}</strong></div><div><span>Slope</span><strong>{selected?.slopePercent?.toFixed(2)??'—'}<small>%</small></strong></div></div>
      {current.errors.length>0&&<p className="error">{current.errors.join(' ')}</p>}
      <div className="outcome"><h3>{shown.length?(current.zoneScore!==null?'Preliminary recommendations':'Options for site assessment'):'Site assessment'}</h3>{shown.length>0&&<p>Based on available soil and slope data. Confirm suitability with site-specific checks.</p>}</div>
      <div className="structures">{shown.map(r=><article className="structure" key={r.id}><div className="structure-title"><h3>{r.id==='STR_PERCOLATION'&&r.score!==null?'Shallow spreading basin':r.name}</h3>{r.score!==null&&<strong>{r.score.toFixed(0)}</strong>}</div><span className={`status ${current.primary.length?'candidate':''}`}>{current.primary.length?'Conditional recommendation':'Suitability unconfirmed'}</span><p className="recommendation-note">{screeningSupport(r,current.soilRank,selected?.slopePercent??null,config)}</p><p className="recommendation-note">{siteGuidance(r)}</p><details><summary>Site checks · {r.missing.length}</summary><ul>{r.missing.map(x=><li key={x}>{x}</li>)}</ul></details></article>)}</div>
      {!shown.length&&<p className="muted">No eligible options under the recorded site conditions and settings.</p>}
      <details className="result-detail"><summary>Soil profile</summary><p className="muted">{bundle?.soilSource==='OPENLANDMAP'?'Texture at sampled depths.':'Texture by depth interval.'}</p><table><thead><tr><th>Depth · cm</th><th>Texture</th><th>Rank</th></tr></thead><tbody>{current.layers.map(l=><tr key={l.depth}><td>{l.depth.replace(' (depth)','')}</td><td>{l.texture}</td><td>{l.rank}</td></tr>)}</tbody></table></details>
      <details className="result-detail"><summary>All structures · {CATALOGUE.length}</summary><div className="catalogue">{CATALOGUE.map(s=>{const r=current.structures.find(r=>r.id===s.id)!;return <details key={s.id}><summary><span>{s.name}</span><small>{outcomeLabel[r.outcome]}</small></summary><p className="muted">{s.mechanism}. {reason(r)}</p><ul>{s.requirements.map(k=><li key={k}>{FACT_LABELS[k]||k}</li>)}</ul></details>;})}</div></details>
      <details className="result-detail"><summary>Data details</summary><dl><dt>Soil</dt><dd>{bundle?.mode==='SYNTHETIC'?'Synthetic':bundle?.soilSource==='OPENLANDMAP'?'OpenLandMap':'SoilGrids'} · ≈250 m</dd><dt>Terrain</dt><dd>{bundle?.mode==='SYNTHETIC'?'Synthetic':'ALOS'} · ≈30 m</dd><dt>Coverage</dt><dd>{(bundle!.cells.filter((_,i)=>results[i].zoneScore!==null).reduce((s,c)=>s+c.spatial.areaM2,0)/area(site)*100).toFixed(0)}%</dd><dt>Cell</dt><dd>{current.id}</dd><dt>Method</dt><dd>{bundle?.method}</dd></dl></details>
     </>}
    </section>
   </div>
   <footer>Screening only · field verification required.</footer>
  </main>
 </>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);

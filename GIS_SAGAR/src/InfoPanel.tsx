import {useEffect,useRef} from 'react';
import copy from './content/siteCopy.json';
export type InfoPage='about'|'help';
export function InfoPanel({page,onClose}:{page:InfoPage|null;onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const dialog=ref.current;if(!dialog)return;if(page&&!dialog.open)dialog.showModal();if(!page&&dialog.open)dialog.close();},[page]);
 const text=page?copy[page]:null;
 return <dialog ref={ref} className="info-dialog" aria-labelledby="info-title" onCancel={onClose} onClose={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
  {text&&<div className="info-sheet">
   <div className="info-top"><span>GIS–SAGAR</span><button autoFocus onClick={onClose} aria-label="Close information panel">Close</button></div>
   {page==='about'&&<svg className="contour-mark" viewBox="0 0 320 68" aria-hidden="true"><g fill="none" stroke="currentColor" strokeWidth="1"><path d="M1 57C45 57 35 14 92 14s36 43 87 43 52-44 96-44 25 40 45 40"/><path d="M1 48C43 48 39 7 93 7s39 42 87 42 50-43 95-43 30 40 45 40"/><path d="M1 66C50 66 31 23 92 23s35 42 87 42 53-43 96-43 26 40 45 40"/></g></svg>}
   <h1 id="info-title">{text.title}</h1><p className="info-subtitle">{text.subtitle}</p><p className="info-intro">{text.intro}</p>
   <div className="info-sections">{text.sections.map(s=><section key={s.title}><h2>{s.title}</h2><p>{s.text}</p></section>)}</div>
   <p className="info-credit">{text.credit}</p>
   {text.sources.length>0&&<details className="info-sources"><summary>Sources</summary><ul>{text.sources.map(s=><li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.label}</a></li>)}</ul></details>}
  </div>}
 </dialog>;
}

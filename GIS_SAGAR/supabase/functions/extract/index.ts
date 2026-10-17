import {validateRequest} from './lib/request.ts';
import {geeExpression,restResult} from './lib/geeRest.ts';
// Supabase Edge Function. Authored and source-tested; live parity still pending. Rev 5.
declare const Deno: {env:{get:(name:string)=>string|undefined};serve:(fn:(r:Request)=>Promise<Response>)=>void};
const get=(key:string)=>Deno.env.get(key)||'';
const encode=(value:Uint8Array)=>btoa(String.fromCharCode(...value)).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
const part=(v:unknown)=>encode(new TextEncoder().encode(JSON.stringify(v)));
async function googleToken(){
 const c=JSON.parse(get('GEE_SERVICE_ACCOUNT_JSON')) as {client_email:string;private_key:string};
 if(!c.client_email||!c.private_key)throw new Error('Backend Google credentials are incomplete.');
 const now=Math.floor(Date.now()/1000);const unsigned=part({alg:'RS256',typ:'JWT'})+'.'+part({iss:c.client_email,scope:'https://www.googleapis.com/auth/earthengine',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600});
 const pem=c.private_key.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g,'');
 const key=await crypto.subtle.importKey('pkcs8',Uint8Array.from(atob(pem),x=>x.charCodeAt(0)),{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['sign']);
 const signature=await crypto.subtle.sign('RSASSA-PKCS1-v1_5',key,new TextEncoder().encode(unsigned));
 const response=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:unsigned+'.'+encode(new Uint8Array(signature))}),signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw new Error('Google authentication failed; check service identity and project permissions.');
 return (await response.json()).access_token as string;
}
Deno.serve(async request=>{
 const origin=request.headers.get('origin');const allowed=get('ALLOWED_ORIGIN');
 const corsHeaders={'Access-Control-Allow-Origin':allowed||'*','Access-Control-Allow-Methods':'GET, POST, PUT, DELETE, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization, X-Client-Info, Apikey','Vary':'Origin'};
 const json=(status:number,data:unknown)=>new Response(JSON.stringify(data),{status,headers:{...corsHeaders,'Content-Type':'application/json'}});
 if(request.method==='OPTIONS')return new Response(null,{status:200,headers:corsHeaders});
 if(!allowed)return json(503,{error:'Backend origin is not configured.'});
 if(origin&&origin!==allowed)return json(403,{error:'Origin is not allowed.'});
 if(request.method!=='POST')return json(405,{error:'POST required.'});
 const bearer=request.headers.get('authorization');if(!bearer?.startsWith('Bearer '))return json(401,{error:'Sign in to the application first.'});
 // Current and legacy Supabase key formats are both accepted for user verification.
 const userKey=get('SUPABASE_ANON_KEY')||get('SUPABASE_PUBLISHABLE_KEY');
 if(!get('SUPABASE_URL')||!userKey||!get('ALLOWED_USER_IDS'))return json(503,{error:'Backend authentication allowlist is not configured.'});
 try{
  const userResponse=await fetch(get('SUPABASE_URL')+'/auth/v1/user',{headers:{Authorization:bearer,apikey:userKey},signal:AbortSignal.timeout(10000)});
  if(!userResponse.ok)return json(401,{error:'Session is invalid or expired.'});
  const user=await userResponse.json();if(!get('ALLOWED_USER_IDS').split(',').map(x=>x.trim()).includes(user.id))return json(403,{error:'User is not enabled for this pilot.'});
  const text=await request.text();if(text.length>2_000_000)return json(413,{error:'Request is too large.'});
  let validated;try{validated=validateRequest(JSON.parse(text));}catch(e){return json(400,{error:(e as Error).message});}
  if(validated.cells.length>1500)return json(400,{error:'Live pilot requests are limited to 1,500 analysis cells.'});
  if(!get('GEE_PROJECT_ID')||!get('GEE_SERVICE_ACCOUNT_JSON'))return json(503,{error:'Earth Engine project/service identity is not configured.'});
  const token=await googleToken();
  const response=await fetch(`https://earthengine.googleapis.com/v1/projects/${encodeURIComponent(get('GEE_PROJECT_ID'))}/value:compute`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({expression:geeExpression(validated),workloadTag:'gis-sagar-pilot'}),signal:AbortSignal.timeout(80000)});
  if(!response.ok)return json(502,{error:`Earth Engine returned HTTP ${response.status}. No demonstration data were substituted.`});
  const data=await response.json();return json(200,restResult(validated,data.result));
 }catch{return json(502,{error:'Authentication or extraction failed. Check backend diagnostics and Google permissions; no synthetic data were substituted.'});}
});

import fs from 'node:fs/promises';
import ee from '@google/earthengine';
import {GoogleAuth} from 'google-auth-library';
import {buildData,bundleResult} from './gee-common.mjs';
import {validateRequest} from '../src/core/request.ts';
const project=process.env.GEE_PROJECT_ID;
if(!project){console.error('Set GEE_PROJECT_ID to the registered Cloud project ID. An API key alone cannot authorize Earth Engine.');process.exit(2);}
try {
 const auth=new GoogleAuth({scopes:['https://www.googleapis.com/auth/earthengine','https://www.googleapis.com/auth/cloud-platform']});
 const client=await auth.getClient();
 // Read credentials through ADC / GOOGLE_APPLICATION_CREDENTIALS; never print them.
 ee.data.setAuthTokenRefresher((_args,callback)=>{client.getAccessToken().then(t=>callback({access_token:t.token,token_type:'Bearer',expires_in:3000})).catch(()=>callback({error:'Google authentication failed.'}));});
 await new Promise((resolve,reject)=>ee.data.refreshAuthToken(resolve,reject));
 await new Promise((resolve,reject)=>ee.initialize(null,null,resolve,reject,null,project));
 if(process.argv.includes('--check')) {
  const metadata=await new Promise((resolve,reject)=>ee.Dictionary({sand:ee.Image('projects/soilgrids-isric/sand_mean').bandNames(),alos:ee.Image(ee.ImageCollection('JAXA/ALOS/AW3D30/V4_1').first()).bandNames()}).evaluate((v,e)=>e?reject(new Error(e)):resolve(v)));
  console.log(JSON.stringify({status:'CONNECTED',project,metadata},null,2));
 } else {
  const [requestPath,outputPath]=process.argv.slice(2);if(!requestPath||!outputPath)throw new Error('Usage: npm run gee:extract -- request.json evidence.json; or --check.');
  const request=validateRequest(JSON.parse(await fs.readFile(requestPath,'utf8')));
  const data=await new Promise((resolve,reject)=>buildData(ee,request).evaluate((v,e)=>e?reject(new Error(e)):resolve(v)));
  await fs.writeFile(outputPath,JSON.stringify(bundleResult(request,data),null,2));console.log('Evidence written. Live model suitability is not independently validated.');
 }
}catch(e){console.error('Earth Engine request failed:',e instanceof Error?e.message:'Authentication or extraction failure.');process.exitCode=1;}

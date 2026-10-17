import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import fs from 'node:fs';
const ee=createRequire(import.meta.url)('@google/earthengine');
test('official SDK accepts named callback in download options without live API',async()=>{
 const previous=ee.data.getTableDownloadId;const previousUrl=ee.data.makeTableDownloadUrl;
 try{
  let captured:any;ee.data.getTableDownloadId=(request:any,callback:any)=>{captured=request;callback({docid:'fixture'});};
  ee.data.makeTableDownloadUrl=()=> 'https://example.invalid/offline-fixture';
  const url=await new Promise(resolve=>ee.FeatureCollection.prototype.getDownloadURL.call({}, {format:'geojson',filename:'site',callback:resolve}));
  assert.equal(url,'https://example.invalid/offline-fixture');assert.equal(captured.format,'GEOJSON');assert.equal(captured.filename,'site');
 }finally{ee.data.getTableDownloadId=previous;ee.data.makeTableDownloadUrl=previousUrl;}
});
test('generated download template passes the callback inside its options object',()=>{
 const template=fs.readFileSync(new URL('../gee/code-editor-template.js',import.meta.url),'utf8');
 assert.match(template,/getDownloadURL\(\{format:'geojson',filename:'gis-sagar-observations',callback:function/);
});

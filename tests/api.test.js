import test from 'node:test';
import assert from 'node:assert/strict';
import { handleApi, validateRows, loadMatches, DATASET_ID } from '../lib/compatibility.js';
import { createAppServer } from '../scripts/dev-server.js';
const names = Array.from({length:26},(_,i)=>`Person ${String(i+1).padStart(2,'0')}`);
const rows = names.flatMap((person_name,i)=>names.flatMap((match_name,j)=>{
  if(i===j) return [];
  const match_score=55+(i+j)/2;
  return [{person_name,match_name,match_score,match_group:match_score>=76?'베스트 프렌드':match_score>=68?'좋음':'보통',kai_difference:Math.abs(i-j),mbti_score:80,saju_score:70}];
}));
const env={SUPABASE_URL:'https://example.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'test-secret'};
const fetcher=async()=>Response.json(rows);
const call=(path,fetchImpl=fetcher,method='GET')=>handleApi(new Request(`https://example.com/api/${path}`,{method}),env,fetchImpl);

test('readiness requires complete symmetric valid data',async()=>{
 assert.deepEqual(await(await call('status')).json(),{configured:true});
 for(const invalid of [rows.slice(1),[...rows.slice(1),rows[1]],rows.map((r,i)=>i?r:{...r,match_score:NaN})]){
  assert.throws(()=>validateRows(invalid));
  const response=await call('status',async()=>Response.json(invalid));
  assert.equal(response.status,503); assert.deepEqual(await response.json(),{configured:false});
 }
});
test('upstream errors stay private',async()=>{
 const response=await call('highlight',async()=>{throw new Error('test-secret');});
 assert.equal(response.status,503); assert.doesNotMatch(await response.text(),/test-secret/);
});
test('queries pinned dataset and strips private response fields',async()=>{
 const result=await loadMatches(env,async(url,options)=>{
  assert.equal(url.searchParams.get('dataset_id'),`eq.${DATASET_ID}`);
  assert.doesNotMatch(url.searchParams.get('select'),/birth|actual|role|\*/i);
  assert.equal(options.headers.apikey,'test-secret');assert.equal(options.cache,'no-store');
  return Response.json(rows.map(r=>({...r,birth_date:'private'})));
 });
 assert.ok(result.every(r=>!('birth_date' in r)));
});
test('modern secret keys are not used as JWTs',async()=>{
 await loadMatches({...env,SUPABASE_SERVICE_ROLE_KEY:'sb_secret_test'},async(_,options)=>{
  assert.equal(options.headers.Authorization,undefined);assert.equal(options.headers.apikey,'sb_secret_test');
  return Response.json(rows);
 });
});
test('highlight uses raw maximum and deterministic ties',async()=>{
 const best=await(await call('highlight',async()=>Response.json([...rows].reverse()))).json();
 assert.equal(best.match_score,Math.max(...rows.map(r=>r.match_score)));assert.equal(best.tied_pairs,1);
 const ties=rows.map(r=>({...r,match_score:76,match_group:'베스트 프렌드'}));
 const tie=await(await call('highlight',async()=>Response.json(ties))).json();
 assert.equal(tie.tied_pairs,325);assert.equal(tie.person_name,names[0]);assert.equal(tie.match_name,names[1]);
});
test('match is symmetric, ranked, and rejects self/unknown names',async()=>{
 const query=(a,b)=>`match?${new URLSearchParams({person:a,match:b})}`;
 const a=await(await call(query(names[0],names[1]))).json();
 const b=await(await call(query(names[1],names[0]))).json();
 assert.equal(a.match_score,b.match_score);assert.equal(a.personal_rank,25);
 let calls=0;
 assert.equal((await call(query(names[0],names[0]),async()=>{calls++;})).status,400);assert.equal(calls,0);
 assert.equal((await call(query(names[0],"' OR 1=1 --"))).status,404);
});
test('four team members return 12 directed results; unknown members fail',async()=>{
 const query=`team?${new URLSearchParams(names.slice(0,4).map(n=>['member',n]))}`;
 assert.equal((await(await call(query)).json()).length,12);
 assert.equal((await call('team?member=Person+01&member=unknown')).status,404);
 assert.equal((await call('team?member=Person+01')).status,400);
});
test('people summaries, unknown routes, and unsupported methods',async()=>{
 assert.equal((await(await call('people')).json()).length,26);
 assert.equal((await call('unknown')).status,404);
 const response=await call('highlight',fetcher,'POST');assert.equal(response.status,405);assert.equal(response.headers.get('Allow'),'GET');
});
test('HTTP serves assets and API but never private files',async()=>{
 const server=createAppServer(env,fetcher);
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const root=`http://127.0.0.1:${server.address().port}`;
 try{
  for(const [path,type] of [['/','text/html'],['/styles.css','text/css'],['/app.js','text/javascript'],['/api/highlight','application/json']]){
   const response=await fetch(root+path);assert.equal(response.status,200);assert.ok(response.headers.get('content-type').includes(type));
  }
  assert.equal((await fetch(root+'/private/data.json')).status,404);
  assert.equal((await fetch(root+'/.env.local')).status,404);
 }finally{await new Promise(resolve=>server.close(resolve));}
});

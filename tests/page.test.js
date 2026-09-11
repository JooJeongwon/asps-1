import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { JSDOM } from 'jsdom';
const html = await fs.readFile(new URL('../public/index.html',import.meta.url),'utf8');
const script = await fs.readFile(new URL('../public/app.js',import.meta.url),'utf8');
const settle = () => new Promise(resolve=>setTimeout(resolve,20));
const result = { person_name:'A <img src=x onerror=alert(1)>',match_name:'B',match_score:80.25,match_group:'베스트 프렌드',mbti_score:88,saju_score:79,kai_difference:15,tied_pairs:2 };

test('page shows fetched highlight, handles ties, and escapes search results',async()=>{
 const dom = new JSDOM(html,{runScripts:'outside-only',url:'https://example.com'});
 const w=dom.window;
 try {
  w.AbortSignal=AbortSignal;
  w.fetch=async path=>Response.json(path.startsWith('/api/team') ? Array.from({length:6},(_,i)=>({...result,person_name:`A${i}`,match_name:`B${i}`})) : result);
  w.eval(script);await settle();
  assert.equal(w.document.querySelector('#blind-score').textContent,'80.3');
  assert.match(w.document.querySelector('#blind-data-label').textContent,/LIVE RESULT/);
  assert.match(w.document.querySelector('#blind-group').textContent,/공동 1위 2개/);
  assert.equal(w.document.querySelectorAll('#pair-grid article').length,6);
  const details=w.document.querySelector('#blind-result');details.open=true;assert.equal(details.open,true);
  w.document.querySelector('#match-form').dispatchEvent(new w.Event('submit',{cancelable:true}));await settle();
  assert.match(w.document.querySelector('#match-result').textContent,/<img/);
  assert.equal(w.document.querySelector('#match-result img'),null);
  assert.equal(w.document.querySelector('#match-form button').disabled,false);
 }finally{dom.window.close();}
});
test('offline page never labels placeholders as live and search can retry',async()=>{
 const dom=new JSDOM(html,{runScripts:'outside-only',url:'https://example.com'});
 const w=dom.window;
 try{
  w.AbortSignal=AbortSignal;w.fetch=async()=>{throw new Error('연결 오류');};
  w.eval(script);await settle();
  assert.equal(w.document.querySelector('#blind-score').textContent,'—');
  assert.doesNotMatch(w.document.querySelector('#blind-data-label').textContent,/LIVE/);
  w.document.querySelector('#match-form').dispatchEvent(new w.Event('submit',{cancelable:true}));await settle();
  assert.equal(w.document.querySelector('#match-result').textContent,'연결 오류');
  assert.equal(w.document.querySelector('#match-form button').disabled,false);
 }finally{dom.window.close();}
});

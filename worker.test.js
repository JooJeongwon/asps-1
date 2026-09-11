import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './worker.js';
test('static requests use assets', async () => {
 const request = new Request('https://example.com/');
 const env = {ASSETS:{fetch:async r => (assert.equal(r,request),new Response('landing'))}};
 assert.equal(await (await worker.fetch(request,env)).text(),'landing');
});
test('unconfigured worker readiness fails', async () => {
 const response = await worker.fetch(new Request('https://example.com/api/status'),{});
 assert.equal(response.status,503);
 assert.deepEqual(await response.json(),{configured:false});
});

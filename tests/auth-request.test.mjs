import {test} from 'node:test'
import assert from 'node:assert/strict'
import {fetchAuthResponse, AuthRequestTimeout, AuthResponseError, isRejectedAuthSession} from '../components/app/services/authRequest.ts'
const realFetch = globalThis.fetch
test('auth request preserves success and server errors without retrying', async () => {
  try {
    for (const status of [200,401,403,429,503]) {
      let calls=0
      globalThis.fetch=async()=>{calls++;return new Response(JSON.stringify({ok:status===200}),{status})}
      const response=await fetchAuthResponse('https://example.test')
      assert.equal(response.status,status);assert.equal((await response.json()).ok,status===200);assert.equal(calls,1)
    }
  } finally {globalThis.fetch=realFetch}
})
test('stalled headers time out and abort; late success cannot complete login', async()=>{
  let signal,complete,calls=0
  try{
    globalThis.fetch=(_,init)=>{calls++;signal=init.signal;return new Promise(r=>{complete=r})}
    await assert.rejects(fetchAuthResponse('https://example.test',{},15),AuthRequestTimeout)
    assert.equal(signal.aborted,true);assert.equal(calls,1)
    complete(new Response('{}'))
  }finally{globalThis.fetch=realFetch}
})
test('stalled response body also times out',async()=>{
  let stream
  try{
    globalThis.fetch=async()=>new Response(new ReadableStream({start(c){stream=c}}))
    await assert.rejects(fetchAuthResponse('https://example.test',{},15),AuthRequestTimeout)
  }finally{stream.close();globalThis.fetch=realFetch}
})
test('caller cancellation is honored',async()=>{
  const controller=new AbortController();controller.abort()
  try{
    globalThis.fetch=async(_,init)=>{init.signal.throwIfAborted();return new Response('{}')}
    await assert.rejects(fetchAuthResponse('https://example.test',{signal:controller.signal}),{name:'AbortError'})
  }finally{globalThis.fetch=realFetch}
})
test('only explicit auth refusal invalidates a restored session',()=>{
  for(const error of [new AuthRequestTimeout(),new TypeError('network'),new AuthResponseError(503,'unavailable'),new AuthResponseError(429,'rate_limit'),new Error('malformed_bootstrap')])assert.equal(isRejectedAuthSession(error),false)
  for(const status of [401,403])assert.equal(isRejectedAuthSession(new AuthResponseError(status,'rejected')),true)
})

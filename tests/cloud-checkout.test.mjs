import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cloudCheckoutUrl, requestCloudCheckout } from '../components/app/cloud-checkout.ts'
test('crypto and card use the correct returned checkout URL', async () => {
  for (const method of ['crypto', 'card']) {
    const calls = []
    const url = await requestCloudCheckout(async (payload, signal) => {
      calls.push(payload.action); assert.equal(signal.aborted, false)
      return { ok: true, invoice_url: 'https://nowpayments.io/payment/?iid=example', redirect_url: 'https://whop.com/checkout/example' }
    }, method)
    assert.equal(calls.length, 1)
    assert.equal(calls[0], method === 'crypto' ? 'checkout_crypto' : 'checkout_whop')
    assert.match(url, method === 'crypto' ? /nowpayments/ : /whop/)
  }
})
test('missing, malformed and unsafe links are errors instead of silent success', () => {
  for (const invoice_url of [undefined, '', {}, 'javascript:alert(1)', 'http://nowpayments.io', 'https://user:pass@example.com']) {
    assert.throws(() => cloudCheckoutUrl({ok:true, invoice_url}, 'crypto'), /CHECKOUT_LINK_MISSING/)
  }
})
test('provider failure is retained; no automatic second invoice is requested', async () => {
  let count = 0
  await assert.rejects(requestCloudCheckout(async () => { count++; throw Error('Provider unavailable') }, 'crypto'), /Provider unavailable/)
  assert.equal(count, 1)
})
test('a stalled checkout times out, aborts and cannot redirect on late success', async () => {
  let signal, complete
  const request = requestCloudCheckout((_, s) => { signal = s; return new Promise(r => { complete = r }) }, 'crypto', 10)
  await assert.rejects(request, /CHECKOUT_TIMEOUT/)
  assert.equal(signal.aborted, true)
  complete({ok:true,invoice_url:'https://nowpayments.io/payment/?iid=late'})
})

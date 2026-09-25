import {test} from 'node:test'
import assert from 'node:assert/strict'
import {baseSepolia} from 'viem/chains'
import {establishWalletSession} from '../components/app/defi/wallet-session.ts'
const owner='0x1111111111111111111111111111111111111111'
function fixture(options={}){
 const calls=[];let connected=false,chain='0x1',added=false
 const provider={request:async({method})=>{
  calls.push(method)
  if(method==='eth_requestAccounts'){if(options.reject)throw {code:options.reject};connected=true;return [owner]}
  assert.ok(connected,'network access requires prior permission')
  if(method==='eth_chainId')return chain
  if(method==='wallet_switchEthereumChain'){
   if(options.unknown&&!added)throw {cause:{code:4902}}
   if(!options.wrong)chain='0x14a34'
   return null
  }
  if(method==='wallet_addEthereumChain'){added=true;return null}
  if(method==='eth_accounts')return options.changed?[]:[owner]
  throw Error('Unexpected request: '+method)
 }}
 return {provider,calls}
}
test('permission precedes chain selection and account/chain are rechecked',async()=>{
 const {provider,calls}=fixture();assert.equal(await establishWalletSession(provider,baseSepolia),owner)
 assert.deepEqual(calls,['eth_requestAccounts','eth_chainId','wallet_switchEthereumChain','eth_chainId','eth_accounts'])
})
test('unknown chain is added only after explicit unknown-chain response',async()=>{
 const {provider,calls}=fixture({unknown:true});await establishWalletSession(provider,baseSepolia)
 assert.equal(calls.filter(x=>x==='wallet_addEthereumChain').length,1)
})
test('rejection stops before network changes',async()=>{
 const {provider,calls}=fixture({reject:4001});await assert.rejects(establishWalletSession(provider,baseSepolia),/WALLET_REJECTED/)
 assert.deepEqual(calls,['eth_requestAccounts'])
})
test('pending connection produces actionable error with no retry',async()=>{
 const {provider,calls}=fixture({reject:-32002});await assert.rejects(establishWalletSession(provider,baseSepolia),/WALLET_REQUEST_PENDING/)
 assert.equal(calls.length,1)
})
test('wallet falsely reporting successful switch cannot connect',async()=>{
 const {provider}=fixture({wrong:true});await assert.rejects(establishWalletSession(provider,baseSepolia),/WALLET_NETWORK_UNAVAILABLE/)
})
test('account change during connection invalidates session',async()=>{
 const {provider}=fixture({changed:true});await assert.rejects(establishWalletSession(provider,baseSepolia),/WALLET_CHANGED/)
})

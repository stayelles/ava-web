import type {Address, Chain, EIP1193Provider} from 'viem'

export function walletErrorCode(error:unknown):number|undefined{
 let current=error
 for(let depth=0;depth<8&&current&&typeof current==='object';depth++){
  const item=current as {code?:unknown;cause?:unknown}
  if(typeof item.code==='number')return item.code
  current=item.cause
 }
}

export function connectionError(error:unknown,stage:'CONNECT'|'NETWORK'):Error{
 const code=walletErrorCode(error)
 if(code===4001)return Error('WALLET_REJECTED')
 if(code===-32002)return Error('WALLET_REQUEST_PENDING')
 if(code===4100)return Error('WALLET_UNAUTHORIZED')
 if(stage==='NETWORK')return Error('WALLET_NETWORK_UNAVAILABLE')
 return Error('WALLET_CONNECTION_FAILED')
}

// Request permission first: a wallet may refuse network methods for an unknown site.
// Never sign or return a usable connection unless the selected chain is verified.
export async function establishWalletSession(provider:EIP1193Provider,chain:Chain):Promise<Address>{
 if(chain.id!==8453&&chain.id!==84532)throw Error('WALLET_NETWORK_UNAVAILABLE')
 let accounts:readonly Address[]
 try{accounts=await provider.request({method:'eth_requestAccounts'})}
 catch(error){throw connectionError(error,'CONNECT')}
 const address=accounts[0]
 if(!address||!/^0x[0-9a-f]{40}$/i.test(address))throw Error('WALLET_MISSING')
 try{
  if(Number(await provider.request({method:'eth_chainId'}))!==chain.id){
   const chainId=`0x${chain.id.toString(16)}`
   try{await provider.request({method:'wallet_switchEthereumChain',params:[{chainId}]})}
   catch(error){
    if(walletErrorCode(error)!==4902)throw error
    await provider.request({method:'wallet_addEthereumChain',params:[{chainId,chainName:chain.name,nativeCurrency:chain.nativeCurrency,rpcUrls:[...chain.rpcUrls.default.http],blockExplorerUrls:chain.blockExplorers?[chain.blockExplorers.default.url]:undefined}]})
    await provider.request({method:'wallet_switchEthereumChain',params:[{chainId}]})
   }
  }
  if(Number(await provider.request({method:'eth_chainId'}))!==chain.id)throw Error('WRONG_CHAIN')
 }catch(error){throw connectionError(error,'NETWORK')}
 const current=await provider.request({method:'eth_accounts'})
 if(current[0]?.toLowerCase()!==address.toLowerCase())throw Error('WALLET_CHANGED')
 return address
}

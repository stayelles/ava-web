'use client'
import {createPublicClient,createWalletClient,custom,parseAbi,type Address,type EIP1193Provider} from 'viem'
import {base,baseSepolia} from 'viem/chains'
import {supabaseAuth} from '../services/supabaseAuth'

export type Deployment={chain:8453|84532;stage:string;ready:boolean;factory:Address|null;executor:Address|null;usdc:Address|null;explorer:string}
export type DefiAccount={id:string;strategy:'arbitrage'|'liquidations';chain_id:number;vault:Address;enabled:boolean;config:{amountMicros?:string;minimumNetMicros?:string;maxGasMicros?:string}}
export type Operation={id:string;chain_id:number;hash:`0x${string}`|null;state:string;profit:string|null;gas:string|null;created_at:string;strategy:string}
export const factoryAbi=parseAbi(['function create(uint8 strategy) returns(address)','function vaults(address,uint8) view returns(address)'])
export const vaultAbi=parseAbi(['function deposit(uint256 amount)','function withdraw(uint256 amount)','function authorize(uint256 budget,uint256 perTrade,uint256 minimumProfit,uint256 expiry)','function revoke()'])
export const tokenAbi=parseAbi(['function approve(address,uint256) returns(bool)'])
export async function api<T>(path:string,body?:unknown,method?:string,publicRequest=false):Promise<T>{
 const url=process.env.NEXT_PUBLIC_DEFI_API_URL
 if(!url)throw Error('DEPLOYMENT_PENDING')
 const headers:Record<string,string>={'Content-Type':'application/json'}
 if(!publicRequest){const {data}=await supabaseAuth.auth.getSession();if(!data.session)throw Error('AVA_SIGN_IN');headers.Authorization='Bearer '+data.session.access_token}
 const response=await fetch(url.replace(/\/$/,'')+'/defi/v1'+path,{method:method??(body?'POST':'GET'),headers,body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(15_000)})
 const result=await response.json();if(!response.ok)throw Error(result.error??'SERVICE_UNAVAILABLE');return result
}
export async function connect(kind:'extension'|'walletconnect',d:Deployment){
 let provider:EIP1193Provider
 if(kind==='walletconnect'){
  const projectId=process.env.NEXT_PUBLIC_DEFI_WALLETCONNECT_PROJECT_ID;if(!projectId)throw Error('WALLETCONNECT_PENDING')
  const {EthereumProvider}=await import('@walletconnect/ethereum-provider')
  const wc=await EthereumProvider.init({projectId,chains:[d.chain],showQrModal:true,metadata:{name:'Ava DeFi',description:'Automatisations DeFi',url:window.location.origin,icons:[window.location.origin+'/logo.png']}})
  await wc.enable();provider=wc as unknown as EIP1193Provider
 }else{
  const injected=(window as unknown as {ethereum?:EIP1193Provider}).ethereum;if(!injected)throw Error('WALLET_MISSING');provider=injected
 }
 const chain=d.chain===8453?base:baseSepolia
 const wallet=createWalletClient({chain,transport:custom(provider)})
 try{await wallet.switchChain({id:d.chain})}catch(error){
  const e=error as {code?:number;cause?:{code?:number}}
  if(e.code!==4902&&e.cause?.code!==4902)throw error
  await wallet.addChain({chain});await wallet.switchChain({id:d.chain})
 }
 const [address]=await wallet.requestAddresses();if(!address)throw Error('WALLET_MISSING')
 const publicClient=createPublicClient({chain,transport:custom(provider)})
 return{address,wallet,publicClient,provider}
}
export type Connection=Awaited<ReturnType<typeof connect>>
export function micros(value:string):bigint{
 if(!/^\d{1,3}(?:[.,]\d{1,6})?$/.test(value.trim()))throw Error('INVALID_AMOUNT')
 const [whole,fraction='']=value.replace(',','.').split('.');return BigInt(whole)*BigInt(1_000_000)+BigInt(fraction.padEnd(6,'0'))
}

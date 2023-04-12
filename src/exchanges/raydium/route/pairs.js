/*#if _EVM

/*#elif _SOLANA

import { request, getProvider } from '@depay/web3-client-solana'

//#else */

import { request, getProvider } from '@depay/web3-client'

//#endif

import exchange from '../basics'
import { Buffer, TransactionInstruction, PublicKey, Transaction } from '@depay/solana-web3.js'
import { getMarket } from './markets'
import { PAIR_INFO } from '../apis'

const INITIALIZED = 1
const SWAP = 6

let getAccounts = async (base, quote) => {
  let accounts = await request(`solana://${exchange.pair.v4.address}/getProgramAccounts`, {
    params: { filters: [
      { dataSize: exchange.pair.v4.api.span },
      { memcmp: { offset: 400, bytes: base }},
      { memcmp: { offset: 432, bytes: quote }}
    ]},
    api: exchange.pair.v4.api,
    cache: 86400,
  })
  return accounts
}

let getPairs = async(base, quote) => {
  try {
    let accounts = await getAccounts(base, quote)
    if(accounts.length === 0) { accounts = await getAccounts(quote, base) }
    accounts = accounts.filter((account)=>{
      if(![INITIALIZED, SWAP].includes(account.data.status.toNumber())) { return }
      const normalizedLpReserve = ( BigInt(account.data.lpReserve.toString()) / BigInt(10**account.data.baseDecimal.toNumber()) )
      return normalizedLpReserve > BigInt(100)
    })
    return accounts
  } catch(e) {
    console.log(e)
    return []
  }
}

let getPair = async(base, quote) => {
  let accounts = await getPairs(base, quote)
  if(accounts.length == 1){ return accounts[0] }
  if(accounts.length < 1){ return null }
  let best = accounts.reduce((account, current) => {
    let currentReserve = current.data.lpReserve
    let accountReserve = account.data.lpReserve
    if(accountReserve.gte(currentReserve)) {
      return account
    } else {
      return current
    }
  })  
  return best
}

let anyPairs = async(base, quote) => {
  return (await getPairs(base, quote)).length > 0
}

const getInfo = async (pair)=>{
  const data = Buffer.alloc(PAIR_INFO.span)
  PAIR_INFO.encode({ instruction: 12, simulateType: 0 }, data)

  const market = await getMarket(pair.data.marketId.toString())
  const keys = [
    { pubkey: pair.pubkey, isWritable: false, isSigner: false },
    { pubkey: new PublicKey(exchange.pair.v4.authority), isWritable: false, isSigner: false },
    { pubkey: pair.data.openOrders, isWritable: false, isSigner: false },
    { pubkey: pair.data.baseVault, isWritable: false, isSigner: false },
    { pubkey: pair.data.quoteVault, isWritable: false, isSigner: false },
    { pubkey: pair.data.lpMint, isWritable: false, isSigner: false },
    { pubkey: pair.data.marketId, isWritable: false, isSigner: false },
    { pubkey: market.eventQueue, isWritable: false, isSigner: false },
  ]

  const instruction = new TransactionInstruction({
    programId: new PublicKey(exchange.pair.v4.address),
    keys,
    data,
  })

  const feePayer = new PublicKey("RaydiumSimuLateTransaction11111111111111111")

  let transaction = new Transaction({ feePayer })
  transaction.add(instruction)

  let result
  const provider = await getProvider('solana')
  try{ result = await provider.simulateTransaction(transaction) } catch {}

  let info
  if(result && result.value && result.value.logs) {
    let log = result.value.logs.find((log)=>log.match("GetPoolData:"))
    if(log) {
      info = JSON.parse(log.replace(/.*GetPoolData:\s/, ''))
    }
  }

  return info
}

export {
  getInfo,
  anyPairs,
  getPair,
}

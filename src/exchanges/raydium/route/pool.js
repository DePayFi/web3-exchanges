import Raydium from '../basics'
import { Buffer, TransactionInstruction, PublicKey, Transaction } from '@depay/solana-web3.js'
import { getMarket } from './markets'
import { POOL_INFO } from '../apis'
import { provider } from '@depay/web3-client'

const getInfo = async (pair)=>{
  const data = Buffer.alloc(POOL_INFO.span)
  POOL_INFO.encode({ instruction: 12, simulateType: 0 }, data)

  const market = await getMarket(pair.data.marketId.toString())
  const keys = [
    { pubkey: pair.pubkey, isWritable: false, isSigner: false },
    { pubkey: new PublicKey(Raydium.pair.v4.authority), isWritable: false, isSigner: false },
    { pubkey: pair.data.openOrders, isWritable: false, isSigner: false },
    { pubkey: pair.data.baseVault, isWritable: false, isSigner: false },
    { pubkey: pair.data.quoteVault, isWritable: false, isSigner: false },
    { pubkey: pair.data.lpMint, isWritable: false, isSigner: false },
    { pubkey: pair.data.marketId, isWritable: false, isSigner: false },
    { pubkey: market.eventQueue, isWritable: false, isSigner: false },
  ]

  const instruction = new TransactionInstruction({
    programId: new PublicKey(Raydium.pair.v4.address),
    keys,
    data,
  })

  const feePayer = new PublicKey("RaydiumSimuLateTransaction11111111111111111")

  let transaction = new Transaction({ feePayer })
  transaction.add(instruction)

  let result
  try{ result = await provider('solana').simulateTransaction(transaction) } catch {}

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
  getInfo
}

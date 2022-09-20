import Raydium from './../basics'
import { request } from '@depay/web3-client'
import { Buffer, PublicKey } from '@depay/solana-web3.js'

const getMarket = async (marketId)=> {
  return await request({
    blockchain: 'solana',
    address: marketId,
    api: Raydium.market.v3.api,
    cache: 3600000
  })
}

const getMarketAuthority = async (programId, marketId)=> {
  const seeds = [marketId.toBuffer()]

  let nonce = 0
  let publicKey

  while (nonce < 100) {
    try {
      // Buffer.alloc(7) nonce u64
      const seedsWithNonce = seeds.concat(Buffer.from([nonce]), Buffer.alloc(7))
      publicKey = await PublicKey.createProgramAddress(seedsWithNonce, programId)
    } catch (err) {
      if (err instanceof TypeError) { throw err }
      nonce++
      continue
    }
    return publicKey
  }
}

export {
  getMarket,
  getMarketAuthority,
}

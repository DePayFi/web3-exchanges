/*#if _EVM

/*#elif _SOLANA

import { request } from '@depay/web3-client-solana'

//#else */

import { request } from '@depay/web3-client'

//#endif

import exchange from '../../basics'
import { BN } from '@depay/solana-web3.js'
import { compute } from './compute'
import { getTickArrays } from './ticks'
import { MIN_SQRT_PRICE, MAX_SQRT_PRICE } from './math'
import { TickArraySequence } from './tick-sequence'

const getPrice = async ({
  account, // stale whirlpool account
  tokenA,
  tokenB,
  amountIn,
  amountOut,
})=>{

  try {

    const freshWhirlpoolData = await request({ blockchain: 'solana' , address: account.pubkey.toString(), api: exchange.router.v1.api, cache: 10 })

    const aToB = !!(account.data.tokenMintA.toString() === tokenA)

    const tickArrays = await getTickArrays({ account, freshWhirlpoolData, aToB })

    const tickSequence = new TickArraySequence(tickArrays, freshWhirlpoolData.tickSpacing, aToB)

    const sqrtPriceLimit = new BN(aToB ? MIN_SQRT_PRICE : MAX_SQRT_PRICE)

    const amountCalculated = compute({
      tokenAmount: new BN((amountIn || amountOut).toString()),
      aToB,
      freshWhirlpoolData,
      tickSequence,
      sqrtPriceLimit,
    })

    console.log('amountCalculated.toString()', amountCalculated.toString())
    return {
      price: amountCalculated.toString(),
      tickArrays,
      aToB,
      sqrtPriceLimit,
    }

  } catch {}
}

export {
  getPrice
}

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
  tokenIn,
  tokenOut,
  amountIn,
  amountInMax,
  amountOut,
  amountOutMin,
})=>{

  try {
    
    const freshWhirlpoolData = await request({ blockchain: 'solana' , address: account.pubkey.toString(), api: exchange.router.v1.api, cache: 10 })

    const aToB = (freshWhirlpoolData.tokenMintA.toString() === tokenIn)

    const tickArrays = await getTickArrays({ pool: account.pubkey, freshWhirlpoolData, aToB })

    const tickSequence = new TickArraySequence(tickArrays, freshWhirlpoolData.tickSpacing, aToB)

    const sqrtPriceLimit = new BN(aToB ? MIN_SQRT_PRICE : MAX_SQRT_PRICE)

    const amount = amountIn || amountInMax || amountOut || amountOutMin

    const amountSpecifiedIsInput = !!(amountIn || amountInMax)

    const amountCalculated = compute({
      tokenAmount: new BN(amount.toString()),
      aToB,
      freshWhirlpoolData,
      tickSequence,
      sqrtPriceLimit,
      amountSpecifiedIsInput,
    })

    return {
      price: amountCalculated.toString(),
      tickArrays,
      aToB,
      sqrtPriceLimit,
    }

  } catch {
    return {
      price: undefined,
      tickArrays: undefined,
      aToB: undefined,
      sqrtPriceLimit: undefined,
    }
  }
}

export {
  getPrice
}

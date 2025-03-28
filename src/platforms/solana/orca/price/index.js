/*#if _EVM

/*#elif _SVM

import { request } from '@depay/web3-client-svm'

//#else */

import { request } from '@depay/web3-client'

//#endif

import { BN } from '@depay/solana-web3.js'
import { compute } from './compute'
import { getTickArrays } from './ticks'
import { MIN_SQRT_PRICE, MAX_SQRT_PRICE } from './math'
import { TickArraySequence } from './tick-sequence'
import { WHIRLPOOL_LAYOUT } from '../layouts'

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
    
    const freshWhirlpoolData = await request({
      blockchain: 'solana',
      address: account.pubkey.toString(),
      api: WHIRLPOOL_LAYOUT,
    })

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

    if(amountCalculated.toString() == "0"){
      throw('amountCalculated cant be zero!')
    }

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

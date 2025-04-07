/*#if _EVM

/*#elif _SVM

//#else */

//#endif

import { ethers } from 'ethers'
import { getPairsWithPrice as getPairsWithPriceCPMM } from './cpmm/pairs'
import { getPairsWithPrice as getPairsWithPriceCLMM } from './clmm/pairs'

const getPairsWithPrice = async({ exchange, tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin, pairsDatum })=>{
  try {
    if(exchange?.name == 'raydium_cp') {
      return getPairsWithPriceCPMM({ tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin, pairsDatum })
    } else if (exchange?.name == 'raydium_cl') {
      return getPairsWithPriceCLMM({ tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin, pairsDatum })
    } else {
      return []
    }
  } catch(e) {
    console.log('ERROR', e)
    return []
  }
}

let getHighestPrice = (pairs)=>{
  return pairs.reduce((bestPricePair, currentPair)=> ethers.BigNumber.from(currentPair.price).gt(ethers.BigNumber.from(bestPricePair.price)) ? currentPair : bestPricePair)
}

let getLowestPrice = (pairs)=>{
  return pairs.reduce((bestPricePair, currentPair)=> ethers.BigNumber.from(currentPair.price).lt(ethers.BigNumber.from(bestPricePair.price)) ? currentPair : bestPricePair)
}

let getBestPair = async({ exchange, tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin, pairsDatum }) => {
  const pairs = await getPairsWithPrice({ exchange, tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin, pairsDatum })

  if(!pairs || pairs.length === 0) { return }

  let bestPair

  if(amountIn || amountInMax) {
    bestPair = getHighestPrice(pairs)
  } else { // amount out
    bestPair = getLowestPrice(pairs)
  }

  return bestPair
}

export {
  getPairsWithPrice,
  getBestPair,
}


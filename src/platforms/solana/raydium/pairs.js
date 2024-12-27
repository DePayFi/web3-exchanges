/*#if _EVM

/*#elif _SOLANA

//#else */

//#endif

import { ethers } from 'ethers'
import { getPairsWithPrice as getPairsWithPriceAMM } from './amm/pairs'
import { getPairsWithPrice as getPairsWithPriceCPAMM } from './cpamm/pairs'
import { getPairsWithPrice as getPairsWithPriceCLMM } from './clmm/pairs'

const getParisWithPriceForAllTypes = ({ tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin })=>{
  return Promise.all([
    getPairsWithPriceAMM({ tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin }),
    getPairsWithPriceCPAMM({ tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin }),
    getPairsWithPriceCLMM({ tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin }),
  ]).then((pairsAMM, pairsCPAMM, pairsCLMNN)=>{
    return [
      (pairsAMM || []).filter(Boolean).flat(),
      (pairsCPAMM || []).filter(Boolean).flat(),
      (pairsCLMNN || []).filter(Boolean).flat()
    ].flat()
  })
}

const getPairsWithPrice = async({ tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin })=>{
  try {
    return await getParisWithPriceForAllTypes({ tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin })
  } catch {
    return []
  }
}

let getHighestPrice = (pairs)=>{
  return pairs.reduce((bestPricePair, currentPair)=> ethers.BigNumber.from(currentPair.price).gt(ethers.BigNumber.from(bestPricePair.price)) ? currentPair : bestPricePair)
}

let getLowestPrice = (pairs)=>{
  return pairs.reduce((bestPricePair, currentPair)=> ethers.BigNumber.from(currentPair.price).lt(ethers.BigNumber.from(bestPricePair.price)) ? currentPair : bestPricePair)
}

let getBestPair = async({ tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin }) => {
  const pairs = await getPairsWithPrice({ tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin })

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

import { ethers } from 'ethers'
import { getExchangePath } from './path'
import { getBestPair } from './pairs'

let getAmountsOut = async ({ path, amountIn, amountInMax, pairsData }) => {

  let pools = []
  let amounts = [ethers.BigNumber.from(amountIn || amountInMax)]

  let bestPair = await getBestPair({ tokenIn: path[0], tokenOut: path[1], amountIn, amountInMax, pairsDatum: pairsData && pairsData[0] })
  if(!bestPair){ return({ amounts: undefined, pools: undefined }) }
  amounts.push(ethers.BigNumber.from(bestPair.price))
  pools.push(bestPair)
  
  if (path.length === 3) {
    let bestPair = await getBestPair({ tokenIn: path[1], tokenOut: path[2], amountIn: amountIn ? amounts[1] : undefined, amountInMax: amountInMax ? amounts[1] : undefined, pairsDatum: pairsData && pairsData[1] })
    if(!bestPair){ return({ amounts: undefined, pools: undefined }) }
    amounts.push(ethers.BigNumber.from(bestPair.price))
    pools.push(bestPair)
  }

  if(amounts.length != path.length) { return({ amounts: undefined, pools: undefined }) }

  return { amounts, pools }
}

let getAmountsIn = async({ path, amountOut, amountOutMin, pairsData }) => {

  path = path.slice().reverse()
  let pools = []
  let amounts = [ethers.BigNumber.from(amountOut || amountOutMin)]

  let bestPair = await getBestPair({ tokenIn: path[1], tokenOut: path[0], amountOut, amountOutMin, pairsDatum: pairsData && (path.length === 2 ? pairsData[0] : pairsData[1]) })
  if(!bestPair){ return({ amounts: undefined, pools: undefined }) }
  amounts.push(ethers.BigNumber.from(bestPair.price))
  pools.push(bestPair)
  
  if (path.length === 3) {
    let bestPair = await getBestPair({ tokenIn: path[2], tokenOut: path[1], amountOut: amountOut ? amounts[1] : undefined, amountOutMin: amountOutMin ? amounts[1] : undefined, pairsDatum: pairsData && pairsData[0] })
    if(!bestPair){ return({ amounts: undefined, pools: undefined }) }
    amounts.push(ethers.BigNumber.from(bestPair.price))
    pools.push(bestPair)
  }
  
  if(amounts.length != path.length) { return({ amounts: undefined, pools: undefined }) }

  return { amounts: amounts.slice().reverse(), pools: pools.slice().reverse() }
}

let getAmounts = async ({
  path,
  tokenIn,
  tokenOut,
  amountOut,
  amountIn,
  amountInMax,
  amountOutMin,
  pairsData
}) => {
  path = getExchangePath({ path })
  let amounts
  let pools
  if (amountOut) {
    ;({ amounts, pools } = await getAmountsIn({ path, amountOut, tokenIn, tokenOut, pairsData }));
    amountIn = amounts ? amounts[0] : undefined
    if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
      return {}
    } else if (amountInMax === undefined) {
      amountInMax = amountIn
    }
  } else if (amountIn) {
    ;({ amounts, pools } = await getAmountsOut({ path, amountIn, tokenIn, tokenOut, pairsData }));
    amountOut = amounts ? amounts[amounts.length-1] : undefined
    if (amountOut == undefined || amountOutMin && amountOut.lt(amountOutMin)) {
      return {}
    } else if (amountOutMin === undefined) {
      amountOutMin = amountOut
    }
  } else if(amountOutMin) {
    ;({ amounts, pools } = await getAmountsIn({ path, amountOutMin, tokenIn, tokenOut, pairsData }));
    amountIn = amounts ? amounts[0] : undefined
    if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
      return {}
    } else if (amountInMax === undefined) {
      amountInMax = amountIn
    }
  } else if(amountInMax) {
    ;({ amounts, pools } = await getAmountsOut({ path, amountInMax, tokenIn, tokenOut, pairsData }));
    amountOut = amounts ? amounts[amounts.length-1] : undefined
    if (amountOut == undefined ||amountOutMin && amountOut.lt(amountOutMin)) {
      return {}
    } else if (amountOutMin === undefined) {
      amountOutMin = amountOut
    }
  }
  return {
    amountOut: (amountOut || amountOutMin),
    amountIn: (amountIn || amountInMax),
    amountInMax: (amountInMax || amountIn),
    amountOutMin: (amountOutMin || amountOut),
    amounts,
    pools,
  }
}

export {
  getAmounts,
  getAmountsIn,
  getAmountsOut,
}

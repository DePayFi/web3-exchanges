import { ethers } from 'ethers'
import { getExchangePath } from './path'
import { getBestPair } from './pairs'

let getAmountsOut = async ({ exchange, path, amountIn, amountInMax }) => {

  let amounts = [ethers.BigNumber.from(amountIn || amountInMax)]

  let bestPair = await getBestPair({ exchange, tokenIn: path[0], tokenOut: path[1], amountIn, amountInMax })
  if(!bestPair){ return }
  amounts.push(ethers.BigNumber.from(bestPair.price))
  
  if (path.length === 3) {
    let bestPair = await getBestPair({ exchange, tokenIn: path[1], tokenOut: path[2], amountIn: amountIn ? amounts[1] : undefined, amountInMax: amountInMax ? amounts[1] : undefined })
    if(!bestPair){ return }
    amounts.push(ethers.BigNumber.from(bestPair.price))
  }

  if(amounts.length != path.length) { return }

  return amounts
}

let getAmountsIn = async({ exchange, path, amountOut, amountOutMin }) => {

  path = path.slice().reverse()
  let amounts = [ethers.BigNumber.from(amountOut || amountOutMin)]

  let bestPair = await getBestPair({ exchange, tokenIn: path[1], tokenOut: path[0], amountOut, amountOutMin })
  if(!bestPair){ return }
  amounts.push(ethers.BigNumber.from(bestPair.price))
  
  if (path.length === 3) {
    let bestPair = await getBestPair({ exchange, tokenIn: path[2], tokenOut: path[1], amountOut: amountOut ? amounts[1] : undefined, amountOutMin: amountOutMin ? amounts[1] : undefined })
    if(!bestPair){ return }
    amounts.push(ethers.BigNumber.from(bestPair.price))
  }
  
  if(amounts.length != path.length) { return }

  return amounts.slice().reverse()
}

let getAmounts = async ({
  path,
  tokenIn,
  tokenOut,
  amountOut,
  amountIn,
  amountInMax,
  amountOutMin,
  exchange
}) => {
  path = getExchangePath({ path })
  let amounts
  if (amountOut) {
    amounts = await getAmountsIn({ exchange, path, amountOut, tokenIn, tokenOut })
    amountIn = amounts ? amounts[0] : undefined
    if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
      return {}
    } else if (amountInMax === undefined) {
      amountInMax = amountIn
    }
  } else if (amountIn) {
    amounts = await getAmountsOut({ exchange, path, amountIn, tokenIn, tokenOut })
    amountOut = amounts ? amounts[amounts.length-1] : undefined
    if (amountOut == undefined || amountOutMin && amountOut.lt(amountOutMin)) {
      return {}
    } else if (amountOutMin === undefined) {
      amountOutMin = amountOut
    }
  } else if(amountOutMin) {
    amounts = await getAmountsIn({ exchange, path, amountOutMin, tokenIn, tokenOut })
    amountIn = amounts ? amounts[0] : undefined
    if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
      return {}
    } else if (amountInMax === undefined) {
      amountInMax = amountIn
    }
  } else if(amountInMax) {
    amounts = await getAmountsOut({ exchange, path, amountInMax, tokenIn, tokenOut })
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
    amounts
  }
}

export {
  getAmounts,
  getAmountsIn,
  getAmountsOut,
}

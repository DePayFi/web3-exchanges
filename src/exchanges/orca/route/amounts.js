/*#if _EVM

/*#elif _SOLANA

import { request } from '@depay/web3-client-solana'

//#else */

import { request } from '@depay/web3-client'

//#endif

import exchange from '../basics'
import { ethers } from 'ethers'
import { fixPath } from './path'
import { getBestPair } from './pairs'

let getAmountsOut = async ({ path, amountIn }) => {

  let amounts = [amountIn]  

  amounts.push(ethers.BigNumber.from((await getBestPair({ tokenA: path[1], tokenB: path[0], amountIn })).price))
  
  if (path.length === 3) {
    amounts.push(ethers.BigNumber.from((await getBestPair({ tokenA: path[2], tokenB: path[1], amountOut: amounts[1] })).price))
  }

  if(amounts.length != path.length) { return }

  return amounts
}

let getAmountsIn = async({ path, amountOut }) => {

  path = path.slice().reverse()
  let amounts = [amountOut]

  amounts.push(ethers.BigNumber.from((await getBestPair({ tokenA: path[1], tokenB: path[0], amountOut })).price))
  
  if (path.length === 3) {
    amounts.push(ethers.BigNumber.from((await getBestPair({ tokenA: path[2], tokenB: path[1], amountOut: amounts[1] })).price))
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
  amountOutMin
}) => {
  path = fixPath(path)
  let amounts
  if (amountOut) {
    amounts = await getAmountsIn({ path, amountOut, tokenIn, tokenOut })
    amountIn = amounts ? amounts[0] : undefined
    if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
      return {}
    } else if (amountInMax === undefined) {
      amountInMax = amountIn
    }
  } else if (amountIn) {
    amounts = await getAmountsOut({ path, amountIn, tokenIn, tokenOut })
    amountOut = amounts ? amounts[amounts.length-1] : undefined
    if (amountOut == undefined || amountOutMin && amountOut.lt(amountOutMin)) {
      return {}
    } else if (amountOutMin === undefined) {
      amountOutMin = amountOut
    }
  } else if(amountOutMin) {
    amounts = await getAmountsIn({ path, amountOut: amountOutMin, tokenIn, tokenOut })
    amountIn = amounts ? amounts[0] : undefined
    if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
      return {}
    } else if (amountInMax === undefined) {
      amountInMax = amountIn
    }
  } else if(amountInMax) {
    amounts = await getAmountsOut({ path, amountIn: amountInMax, tokenIn, tokenOut })
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

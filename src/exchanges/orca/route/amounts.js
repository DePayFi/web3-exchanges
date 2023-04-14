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

let getAmountsOut = async ({ path, amountIn, amountInMax }) => {

  let amounts = [(amountIn || amountInMax)]

  amounts.push(ethers.BigNumber.from((await getBestPair({ tokenIn: path[0], tokenOut: path[1], amountIn, amountInMax })).price))
  
  if (path.length === 3) {
    amounts.push(ethers.BigNumber.from((await getBestPair({ tokenIn: path[1], tokenOut: path[2], amountIn: amountIn ? amounts[1] : undefined, amountInMax: amountInMax ? amounts[1] : undefined })).price))
  }

  if(amounts.length != path.length) { return }

  return amounts
}

let getAmountsIn = async({ path, amountOut, amountOutMin }) => {

  path = path.slice().reverse()
  let amounts = [(amountOut || amountOutMin)]

  amounts.push(ethers.BigNumber.from((await getBestPair({ tokenIn: path[1], tokenOut: path[0], amountOut, amountOutMin })).price))
  
  if (path.length === 3) {
    amounts.push(ethers.BigNumber.from((await getBestPair({ tokenIn: path[2], tokenOut: path[1], amountOut: amountOut ? amounts[1] : undefined, amountOutMin: amountOutMin ? amounts[1] : undefined })).price))
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
    amounts = await getAmountsIn({ path, amountOutMin, tokenIn, tokenOut })
    amountIn = amounts ? amounts[0] : undefined
    if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
      return {}
    } else if (amountInMax === undefined) {
      amountInMax = amountIn
    }
  } else if(amountInMax) {
    amounts = await getAmountsOut({ path, amountInMax, tokenIn, tokenOut })
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

/*#if _EVM

/*#elif _SOLANA

import { request } from '@depay/web3-client-solana'

//#else */

import { request } from '@depay/web3-client'

//#endif

import Raydium from '../basics'
import { ethers } from 'ethers'
import { fixPath } from './path'
import { getPair } from './pairs'
import { getInfo } from './pool'

let getAmountsOut = async ({ path, amountIn }) => {

  let amounts = [amountIn]  

  let computedAmounts = await Promise.all(path.map(async (step, i)=>{
    const nextStep = path[i+1]
    if(nextStep == undefined){ return }
    const pair = await getPair(step, nextStep)
    const info = await getInfo(pair)
    if(!info){ return }
    const baseMint = pair.data.baseMint.toString()
    const reserves = [ethers.BigNumber.from(info.pool_coin_amount.toString()), ethers.BigNumber.from(info.pool_pc_amount.toString())]
    const [reserveIn, reserveOut] = baseMint == step ? [reserves[0], reserves[1]] : [reserves[1], reserves[0]]
    const feeRaw = amounts[i].mul(Raydium.pair.v4.LIQUIDITY_FEES_NUMERATOR).div(Raydium.pair.v4.LIQUIDITY_FEES_DENOMINATOR)
    const amountInWithFee = amounts[i].sub(feeRaw)
    const denominator = reserveIn.add(amountInWithFee)
    const amountOut = reserveOut.mul(amountInWithFee).div(denominator)
    amounts.push(amountOut)
  }))

  if(computedAmounts.length != path.length) { return }

  return amounts
}

let getAmountsIn = async({ path, amountOut }) => {

  path = path.slice().reverse()
  let amounts = [amountOut]
  
  let computedAmounts = await Promise.all(path.map(async (step, i)=>{
    const nextStep = path[i+1]
    if(nextStep == undefined){ return }
    const pair = await getPair(step, nextStep)
    const info = await getInfo(pair)
    if(!info){ return }
    const poolId = pair.pubkey.toString()
    const baseMint = pair.data.baseMint.toString()
    const quoteMint = pair.data.quoteMint.toString()
    const reserves = [ethers.BigNumber.from(info.pool_coin_amount.toString()), ethers.BigNumber.from(info.pool_pc_amount.toString())]
    const [reserveIn, reserveOut] = baseMint == step ? [reserves[1], reserves[0]] : [reserves[0], reserves[1]]
    const denominator = reserveOut.sub(amounts[i])
    const amountInWithoutFee = reserveIn.mul(amounts[i]).div(denominator)
    const amountIn = amountInWithoutFee
      .mul(Raydium.pair.v4.LIQUIDITY_FEES_DENOMINATOR)
      .div(Raydium.pair.v4.LIQUIDITY_FEES_DENOMINATOR.sub(Raydium.pair.v4.LIQUIDITY_FEES_NUMERATOR))
    amounts.push(amountIn)
  }))

  if(computedAmounts.length != path.length) { return }

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

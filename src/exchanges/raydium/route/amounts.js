import Raydium from '../basics'
import { ethers } from 'ethers'
import { getBestPair } from './pairs'
import { getInfo } from './pool'
import { request } from '@depay/web3-client'

let getAmountsOut = async ({ path, amountIn }) => {
  
  let amounts = [amountIn]  
  await Promise.all(path.map(async (step, i)=>{
    const nextStep = path[i+1]
    if(nextStep == undefined){ return }
    const pair = await getBestPair(step, nextStep)
    const info = await getInfo(pair)
    const baseMint = pair.data.baseMint.toString()
    const reserves = [ethers.BigNumber.from(info.pool_coin_amount), ethers.BigNumber.from(info.pool_pc_amount)]
    const [reserveIn, reserveOut] = baseMint == step ? [reserves[0], reserves[1]] : [reserves[1], reserves[0]]
    const feeRaw = amounts[i].mul(Raydium.pair.v4.LIQUIDITY_FEES_NUMERATOR).div(Raydium.pair.v4.LIQUIDITY_FEES_DENOMINATOR)
    const amountInWithFee = amounts[i].sub(feeRaw)
    const denominator = reserveIn.add(amountInWithFee)
    const amountOut = reserveOut.mul(amountInWithFee).div(denominator)
    amounts.push(amountOut)
  }))
  return amounts
}

let getAmountsIn = async({ path, amountOut }) => {

  path = path.slice().reverse()
  let amounts = [amountOut]
  await Promise.all(path.map(async (step, i)=>{
    const nextStep = path[i+1]
    if(nextStep == undefined){ return }
    const pair = await getBestPair(step, nextStep)
    const info = await getInfo(pair)
    const baseMint = pair.data.baseMint.toString()
    const reserves = [ethers.BigNumber.from(info.pool_coin_amount), ethers.BigNumber.from(info.pool_pc_amount)]
    const [reserveIn, reserveOut] = baseMint == step ? [reserves[1], reserves[0]] : [reserves[0], reserves[1]]
    const denominator = reserveOut.sub(amounts[i])
    const amountInWithoutFee = reserveIn.mul(amounts[i]).div(denominator)
    const amountIn = amountInWithoutFee
      .mul(Raydium.pair.v4.LIQUIDITY_FEES_DENOMINATOR)
      .div(Raydium.pair.v4.LIQUIDITY_FEES_DENOMINATOR.sub(Raydium.pair.v4.LIQUIDITY_FEES_NUMERATOR))
    amounts.push(amountIn)
  }))
  return amounts
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
  let amountsIn
  let amountsOut
  if (amountOut) {
    amountsIn = await getAmountsIn({ path, amountOut, tokenIn, tokenOut })
    amountIn = amountsIn[amountsIn.length-1]
    if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
      return {}
    } else if (amountInMax === undefined) {
      amountInMax = amountIn
    }
  } else if (amountIn) {
    amountsOut = await getAmountsOut({ path, amountIn, tokenIn, tokenOut })
    amountOut = amountsOut[amountsOut.length-1]
    if (amountOut == undefined || amountOutMin && amountOut.lt(amountOutMin)) {
      return {}
    } else if (amountOutMin === undefined) {
      amountOutMin = amountOut
    }
  } else if(amountOutMin) {
    amountsIn = await getAmountsIn({ path, amountOut, tokenIn, tokenOut })
    amountIn = amountsIn[amountsIn.length-1]
    if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
      return {}
    } else if (amountInMax === undefined) {
      amountInMax = amountIn
    }
  } else if(amountInMax) {
    amountsOut = await getAmountsOut({ path, amountIn, tokenIn, tokenOut })
    amountOut = amountsOut[amountsOut.length-1]
    if (amountOut == undefined ||amountOutMin && amountOut.lt(amountOutMin)) {
      return {}
    } else if (amountOutMin === undefined) {
      amountOutMin = amountOut
    }
  }
  return { amountOut, amountIn, amountInMax, amountOutMin, amountsIn, amountsOut }
}

export {
  getAmounts,
  getAmountsIn
}
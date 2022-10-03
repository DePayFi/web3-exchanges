import Raydium from '../basics'
import { ethers } from 'ethers'
import { getBestPair } from './pairs'
import { getInfo } from './pool'
import { request } from '@depay/web3-client'

let getAmountOut = async ({ path, amountIn }) => {
  
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
  return amounts[amounts.length-1]
}

let getAmountIn = async({ path, amountOut }) => {

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
  return amounts[amounts.length-1]
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
  if (amountOut) {
    amountIn = await getAmountIn({ path, amountOut, tokenIn, tokenOut })
    if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
      return {}
    } else if (amountInMax === undefined) {
      amountInMax = amountIn
    }
  } else if (amountIn) {
    amountOut = await getAmountOut({ path, amountIn, tokenIn, tokenOut })
    if (amountOut == undefined || amountOutMin && amountOut.lt(amountOutMin)) {
      return {}
    } else if (amountOutMin === undefined) {
      amountOutMin = amountOut
    }
  } else if(amountOutMin) {
    amountIn = await getAmountIn({ path, amountOut: amountOutMin, tokenIn, tokenOut })
    if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
      return {}
    } else if (amountInMax === undefined) {
      amountInMax = amountIn
    }
  } else if(amountInMax) {
    amountOut = await getAmountOut({ path, amountIn: amountInMax, tokenIn, tokenOut })
    if (amountOut == undefined ||amountOutMin && amountOut.lt(amountOutMin)) {
      return {}
    } else if (amountOutMin === undefined) {
      amountOutMin = amountOut
    }
  }
  return { amountOut, amountIn, amountInMax, amountOutMin }
}

export {
  getAmounts,
  getAmountIn
}

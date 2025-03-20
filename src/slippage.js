/*#if _EVM

import { request } from '@depay/web3-client-evm'

/*#elif _SVM

import { request } from '@depay/web3-client-svm'

//#else */

import { request } from '@depay/web3-client'

//#endif

import { ethers } from 'ethers'
import { supported } from './blockchains'

const DEFAULT_SLIPPAGE = '0.5' // percent

const getDefaultSlippage = ({ exchange, blockchain, pools, amountIn, amountOut })=>{
  return DEFAULT_SLIPPAGE
}

const calculateAmountInWithSlippage = async ({ exchange, blockchain, pools, exchangePath, amountIn, amountOut })=>{

  let defaultSlippage = getDefaultSlippage({ exchange, blockchain, pools, exchangePath, amountIn, amountOut })

  let newAmountInWithDefaultSlippageBN = amountIn.add(amountIn.mul(parseFloat(defaultSlippage)*100).div(10000))

  if(!supported.evm.includes(exchange.blockchain || blockchain)) { 
    return newAmountInWithDefaultSlippageBN
  }

  const currentBlock = await request({ blockchain: (exchange.blockchain || blockchain), method: 'latestBlockNumber' })

  let blocks = []
  for(var i = 0; i <= 2; i++){
    blocks.push(currentBlock-i)
  }

  const lastAmountsIn = await Promise.all(blocks.map(async (block)=>{
    let { amountIn } = await exchange.getAmounts({
      exchange,
      blockchain,
      path: exchangePath,
      pools,
      amountOut,
      block
    })
    return amountIn
  }))

  if(!lastAmountsIn[0] || !lastAmountsIn[1] || !lastAmountsIn[2]) { return newAmountInWithDefaultSlippageBN }

  let newAmountInWithExtremeSlippageBN
  
  if(
    (lastAmountsIn[0].gt(lastAmountsIn[1])) &&
    (lastAmountsIn[1].gt(lastAmountsIn[2]))
  ) {
    // EXTREME DIRECTIONAL PRICE CHANGE

    const difference1 = lastAmountsIn[0].sub(lastAmountsIn[1])
    const difference2 = lastAmountsIn[1].sub(lastAmountsIn[2])

    // velocity (avg. step size)
    const slippage = difference1.add(difference2).div(2)

    newAmountInWithExtremeSlippageBN = lastAmountsIn[0].add(slippage)

    if(newAmountInWithExtremeSlippageBN.gt(newAmountInWithDefaultSlippageBN)) {
      return newAmountInWithExtremeSlippageBN
    }
  } else if (
    !(
      lastAmountsIn[0].eq(lastAmountsIn[1]) ||
      lastAmountsIn[1].eq(lastAmountsIn[2])
    )
  ) {
    // EXTREME BASE VOLATILITIES

    const difference1 = lastAmountsIn[0].sub(lastAmountsIn[1]).abs()
    const difference2 = lastAmountsIn[1].sub(lastAmountsIn[2]).abs()

    let slippage
    if(difference1.lt(difference2)) {
      slippage = difference1
    } else {
      slippage = difference2
    }

    let highestAmountBN
    if(lastAmountsIn[0].gt(lastAmountsIn[1]) && lastAmountsIn[0].gt(lastAmountsIn[2])) {
      highestAmountBN = lastAmountsIn[0]
    } else if(lastAmountsIn[1].gt(lastAmountsIn[2]) && lastAmountsIn[1].gt(lastAmountsIn[0])) {
      highestAmountBN = lastAmountsIn[1]
    } else {
      highestAmountBN = lastAmountsIn[2]
    }

    newAmountInWithExtremeSlippageBN = highestAmountBN.add(slippage)

    if(newAmountInWithExtremeSlippageBN.gt(newAmountInWithDefaultSlippageBN)) {
      return newAmountInWithExtremeSlippageBN
    }
  }

  return newAmountInWithDefaultSlippageBN
}

const calculateAmountOutLessSlippage = async ({ exchange, exchangePath, amountOut, amountIn })=>{
  let defaultSlippage = getDefaultSlippage({ amountIn, amountOut })

  let newAmountOutWithoutDefaultSlippageBN = amountOut.sub(amountOut.mul(parseFloat(defaultSlippage)*100).div(10000))

  return newAmountOutWithoutDefaultSlippageBN
}

const calculateAmountsWithSlippage = async ({
  exchange,
  blockchain,
  pools,
  exchangePath,
  amounts,
  tokenIn, tokenOut,
  amountIn, amountInMax, amountOut, amountOutMin,
  amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput,
})=>{
  if(amountOutMinInput || amountOutInput) {
    if(supported.evm.includes(exchange.blockchain || blockchain)) {
      amountIn = amountInMax = await calculateAmountInWithSlippage({ exchange, blockchain, pools, exchangePath, amountIn, amountOut: (amountOutMinInput || amountOut) })
    } else if(supported.svm.includes(exchange.blockchain || blockchain)){
      let amountsWithSlippage = []
      await Promise.all(exchangePath.map((step, index)=>{
        if(index != 0) {
          let amountWithSlippage = calculateAmountInWithSlippage({ exchange, pools, exchangePath: [exchangePath[index-1], exchangePath[index]], amountIn: amounts[index-1], amountOut: amounts[index] })
          amountWithSlippage.then((amount)=>{
            amountsWithSlippage.push(amount)
          })
          return amountWithSlippage
        }
      }))
      amountsWithSlippage.push(amounts[amounts.length-1])
      amounts = amountsWithSlippage
      if(amounts.length > 2) { // lower middle amount to avoid first hop slippage issues on output amount (total hops remain within default slippage)
        let defaultSlippage = getDefaultSlippage({ exchange, blockchain, pools, exchangePath, amountIn, amountOut })
        amounts[1] = amounts[1].sub(amounts[1].mul(parseFloat(defaultSlippage)*100/2).div(10000))
      }
      amountIn = amountInMax = amounts[0]
    }
  } else if(amountInMaxInput || amountInInput) {
    if(supported.svm.includes(exchange.blockchain || blockchain)){
      let amountsWithSlippage = []
      await Promise.all(exchangePath.map((step, index)=>{
        if(index !== 0 && index < exchangePath.length-1) {
          amountsWithSlippage.unshift(amounts[index])
        } else if(index === exchangePath.length-1) {
          let amountWithSlippage = calculateAmountOutLessSlippage({ exchange, exchangePath: [exchangePath[index-1], exchangePath[index]], amountIn: amounts[index-1], amountOut: amounts[index] })
          amountWithSlippage.then((amount)=>{
            amountsWithSlippage.unshift(amount)
            return amount
          })
          return amountWithSlippage
        }
      }))
      amountsWithSlippage.push(amounts[0])
      amounts = amountsWithSlippage.slice().reverse()
      amountOut = amountOutMin = amounts[amounts.length-1]
    }
  }

  return({ amountIn, amountInMax, amountOut, amountOutMin, amounts })
}

export {
  calculateAmountsWithSlippage
}

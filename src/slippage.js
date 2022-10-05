import { ethers } from 'ethers'
import { request } from '@depay/web3-client'
import { supported } from './blockchains'

const DEFAULT_SLIPPAGE = '0.5' // percent
const STABLECOIN_SLIPPAGE = '0.1' // percent

const getDefaultSlippage = ({ amountIn, amountOut })=>{
  if(
    parseInt(amountIn.mul(10000).div(amountOut).sub(10000).toString(), 10)
    < 100
  ) {
    return STABLECOIN_SLIPPAGE
  } else {
    return DEFAULT_SLIPPAGE
  }
}

const calculateAmountInWithSlippage = async ({ exchange, path, amountIn, amountOut })=>{

  let defaultSlippage = getDefaultSlippage({ amountIn, amountOut })

  let newAmountInWithDefaultSlippageBN = amountIn.add(amountIn.mul(parseFloat(defaultSlippage)*100).div(10000))

  if(!supported.evm.includes(exchange.blockchain)) { 
    return newAmountInWithDefaultSlippageBN
  }

  const currentBlock = await request({ blockchain: exchange.blockchain, method: 'latestBlockNumber' })

  let blocks = []
  for(var i = 0; i <= 2; i++){
    blocks.push(currentBlock-i)
  }

  const lastAmountsIn = await Promise.all(blocks.map(async (block)=>{
    return await exchange.getAmountIn({
      path: path,
      amountOut,
      block
    })
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

    let slippage
    if(difference1.lt(difference2)) {
      slippage = difference2.add(difference2.sub(difference1))
    } else {
      slippage = difference1.add(difference1.sub(difference2))
    }

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

const calculateAmountOutLessSlippage = async ({ exchange, path, amountOut, amountIn })=>{
  let defaultSlippage = getDefaultSlippage({ amountIn, amountOut })

  let newAmountOutWithoutDefaultSlippageBN = amountOut.sub(amountOut.mul(parseFloat(defaultSlippage)*100).div(10000))

  return newAmountOutWithoutDefaultSlippageBN
}

const calculateAmountsWithSlippage = async ({
  exchange,
  path,
  amounts,
  tokenIn, tokenOut,
  amountIn, amountInMax, amountOut, amountOutMin,
  amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput,
})=>{
  if(amountOutMinInput || amountOutInput) {
    if(supported.evm.includes(exchange.blockchain)) {
      amountIn = amountInMax = await calculateAmountInWithSlippage({ exchange, path, amountIn, amountOut: (amountOutMinInput || amountOut) })
    } else if(supported.solana.includes(exchange.blockchain)){
      let amountsWithSlippage = []
      await Promise.all(path.map((step, index)=>{
        if(index != 0) {
          let amountWithSlippage = calculateAmountInWithSlippage({ exchange, path: [path[index-1], path[index]], amountIn: amounts[index-1], amountOut: amounts[index] })
          amountWithSlippage.then((amount)=>amountsWithSlippage.push(amount))
          return amountWithSlippage
        }
      }))
      amountsWithSlippage.push(amounts[amounts.length-1])
      amounts = amountsWithSlippage
      amountIn = amountInMax = amounts[0]
    }
  } else if(amountInMaxInput || amountInInput) {
    if(supported.solana.includes(exchange.blockchain)){
      let amountsWithSlippage = []
      await Promise.all(path.map((step, index)=>{
        if(index !== 0 && index < path.length-1) {
          amountsWithSlippage.unshift(amounts[index])
        } else if(index === path.length-1) {
          let amountWithSlippage = calculateAmountOutLessSlippage({ exchange, path: [path[index-1], path[index]], amountIn: amounts[index-1], amountOut: amounts[index] })
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

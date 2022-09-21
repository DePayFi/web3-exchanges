import { ethers } from 'ethers'
import { request } from '@depay/web3-client'
import { supported } from './blockchains'

const calculateAmountInWithSlippage = async ({ exchange, path, tokenIn, tokenOut, amountIn, amountOutMin })=>{

  let defaultSlippage = '0.5' // %
  if(
    parseInt(amountIn.mul(10000).div(amountOutMin).sub(10000).toString(), 10)
    < 100
  ) { // stable coin swap
    defaultSlippage = '0.1' // %
  }

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
      amountOut: amountOutMin,
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
    // EXTREME BASE VOLATILITYS

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

export {
  calculateAmountInWithSlippage
}

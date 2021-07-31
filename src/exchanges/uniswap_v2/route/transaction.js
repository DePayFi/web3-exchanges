import UniswapV2 from '../basics'
import { CONSTANTS } from 'depay-web3-constants'
import { fixUniswapPath } from './path'
import { Transaction } from 'depay-web3-transaction'

let getTransaction = ({
  path,
  amountIn,
  amountInMax,
  amountOut,
  amountOutMin,
  amountInInput,
  amountOutInput,
  amountInMaxInput,
  amountOutMinInput,
  toAddress
}) => {
  
  let transaction = {
    blockchain: 'ethereum',
    address: UniswapV2.contracts.router.address,
    api: UniswapV2.contracts.router.api,
  }

  if (path[0] === CONSTANTS.ethereum.NATIVE) {
    if (amountInInput || amountOutMinInput) {
      transaction.method = 'swapExactETHForTokens'
      transaction.value = amountIn
      transaction.params = { amountOutMin: amountOutMin }
    } else if (amountOutInput || amountInMaxInput) {
      transaction.method = 'swapETHForExactTokens'
      transaction.value = amountInMax
      transaction.params = { amountOut: amountOut }
    }
  } else if (path[path.length - 1] === CONSTANTS.ethereum.NATIVE) {
    if (amountInInput || amountOutMinInput) {
      transaction.method = 'swapExactTokensForETH'
      transaction.params = { amountIn: amountIn, amountOutMin: amountOutMin }
    } else if (amountOutInput || amountInMaxInput) {
      transaction.method = 'swapTokensForExactETH'
      transaction.params = { amountInMax: amountInMax, amountOut: amountOut }
    }
  } else {
    if (amountInInput || amountOutMinInput) {
      transaction.method = 'swapExactTokensForTokens'
      transaction.params = { amountIn: amountIn, amountOutMin: amountOutMin }
    } else if (amountOutInput || amountInMaxInput) {
      transaction.method = 'swapTokensForExactTokens'
      transaction.params = { amountInMax: amountInMax, amountOut: amountOut }
    }
  }

  transaction.params = Object.assign({}, transaction.params, {
    path: fixUniswapPath(path),
    to: toAddress,
    deadline: Math.round(Date.now() / 1000) + 30 * 60, // 30 minutes
  })

  return new Transaction(transaction)
}

export {
  getTransaction
}

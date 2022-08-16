import PancakeSwap from '../basics'
import { CONSTANTS } from '@depay/web3-constants'
import { fixPath } from './path'

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
  toAddress,
  fromAddress
}) => {

  let blockchain = 'bsc'
  
  let transaction = {
    blockchain,
    from: fromAddress,
    to: PancakeSwap.contracts.router.address,
    api: PancakeSwap.contracts.router.api,
  }

  if (path[0] === CONSTANTS[blockchain].NATIVE) {
    if (amountInInput || amountOutMinInput) {
      transaction.method = 'swapExactETHForTokens'
      transaction.value = amountIn.toString()
      transaction.params = { amountOutMin: amountOutMin.toString() }
    } else if (amountOutInput || amountInMaxInput) {
      transaction.method = 'swapETHForExactTokens'
      transaction.value = amountInMax.toString()
      transaction.params = { amountOut: amountOut.toString() }
    }
  } else if (path[path.length - 1] === CONSTANTS[blockchain].NATIVE) {
    if (amountInInput || amountOutMinInput) {
      transaction.method = 'swapExactTokensForETH'
      transaction.params = { amountIn: amountIn.toString(), amountOutMin: amountOutMin.toString() }
    } else if (amountOutInput || amountInMaxInput) {
      transaction.method = 'swapTokensForExactETH'
      transaction.params = { amountInMax: amountInMax.toString(), amountOut: amountOut.toString() }
    }
  } else {
    if (amountInInput || amountOutMinInput) {
      transaction.method = 'swapExactTokensForTokens'
      transaction.params = { amountIn: amountIn.toString(), amountOutMin: amountOutMin.toString() }
    } else if (amountOutInput || amountInMaxInput) {
      transaction.method = 'swapTokensForExactTokens'
      transaction.params = { amountInMax: amountInMax.toString(), amountOut: amountOut.toString() }
    }
  }

  transaction.params = Object.assign({}, transaction.params, {
    path: fixPath(path),
    to: toAddress,
    deadline: Math.round(Date.now() / 1000) + 30 * 60, // 30 minutes
  })

  return transaction
}

export {
  getTransaction
}

import { CONSTANTS } from '@depay/web3-constants'
import WETH from '../basics'

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
  fromAddress
}) => {
  
  let transaction = {
    blockchain: 'ethereum',
    from: fromAddress,
    to: WETH.wrapper.address,
    api: WETH.wrapper.api,
  }

  if (path[0] === CONSTANTS.ethereum.NATIVE && path[1] === CONSTANTS.ethereum.WRAPPED) {
    transaction.method = 'deposit'
    transaction.value = amountIn.toString()
    return transaction
  } else if (path[0] === CONSTANTS.ethereum.WRAPPED && path[1] === CONSTANTS.ethereum.NATIVE) {
    transaction.method = 'withdraw'
    transaction.value = 0
    transaction.params = { wad: amountIn }
    return transaction
  }
}

export {
  getTransaction
}

import { CONSTANTS } from '@depay/web3-constants'
import WMATIC from '../basics'

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
    blockchain: 'polygon',
    from: fromAddress,
    to: WMATIC.wrapper.address,
    api: WMATIC.wrapper.api,
  }

  if (path[0] === CONSTANTS.polygon.NATIVE && path[1] === CONSTANTS.polygon.WRAPPED) {
    transaction.method = 'deposit'
    transaction.value = amountIn.toString()
    return transaction
  } else if (path[0] === CONSTANTS.polygon.WRAPPED && path[1] === CONSTANTS.polygon.NATIVE) {
    transaction.method = 'withdraw'
    transaction.value = 0
    transaction.params = { wad: amountIn }
    return transaction
  }
}

export {
  getTransaction
}

import { CONSTANTS } from '@depay/web3-constants'
import WBNB from '../basics'

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
    blockchain: 'bsc',
    from: fromAddress,
    to: WBNB.wrapper.address,
    api: WBNB.wrapper.api,
  }

  if (path[0] === CONSTANTS.bsc.NATIVE && path[1] === CONSTANTS.bsc.WRAPPED) {
    transaction.method = 'deposit'
    transaction.value = amountIn.toString()
    return transaction
  } else if (path[0] === CONSTANTS.bsc.WRAPPED && path[1] === CONSTANTS.bsc.NATIVE) {
    transaction.method = 'withdraw'
    transaction.value = 0
    transaction.params = { wad: amountIn }
    return transaction
  }
}

export {
  getTransaction
}

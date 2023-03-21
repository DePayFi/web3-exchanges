import { CONSTANTS } from '@depay/web3-constants'
import WFTM from '../basics'

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
    blockchain: 'fantom',
    from: fromAddress,
    to: WFTM.wrapper.address,
    api: WFTM.wrapper.api,
  }

  if (path[0] === CONSTANTS.fantom.NATIVE && path[1] === CONSTANTS.fantom.WRAPPED) {
    transaction.method = 'deposit'
    transaction.value = amountIn.toString()
    return transaction
  } else if (path[0] === CONSTANTS.fantom.WRAPPED && path[1] === CONSTANTS.fantom.NATIVE) {
    transaction.method = 'withdraw'
    transaction.value = 0
    transaction.params = { wad: amountIn }
    return transaction
  }
}

export {
  getTransaction
}

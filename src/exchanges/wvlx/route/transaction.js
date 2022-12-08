import { CONSTANTS } from '@depay/web3-constants'
import WVLX from '../basics'

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
    blockchain: 'velas',
    from: fromAddress,
    to: WVLX.wrapper.address,
    api: WVLX.wrapper.api,
  }

  if (path[0] === CONSTANTS.velas.NATIVE && path[1] === CONSTANTS.velas.WRAPPED) {
    transaction.method = 'deposit'
    transaction.value = amountIn.toString()
    return transaction
  } else if (path[0] === CONSTANTS.velas.WRAPPED && path[1] === CONSTANTS.velas.NATIVE) {
    transaction.method = 'withdraw'
    transaction.value = 0
    transaction.params = { wad: amountIn }
    return transaction
  }
}

export {
  getTransaction
}

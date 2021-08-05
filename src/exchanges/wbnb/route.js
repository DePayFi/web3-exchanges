import Route from '../../classes/Route'
import { CONSTANTS } from 'depay-web3-constants'
import { Transaction } from 'depay-web3-transaction'
import { WBNB } from './apis'

let route = ({
  exchange,
  tokenIn,
  tokenOut,
  fromAddress,
  toAddress,
  amountIn = undefined,
  amountOut = undefined,
  amountInMax = undefined,
  amountOutMin = undefined,
}) => {
  return new Promise(async (resolve)=> {

    if(
      ![CONSTANTS.bsc.NATIVE, CONSTANTS.bsc.WRAPPED].includes(tokenIn) &&
      ![CONSTANTS.bsc.NATIVE, CONSTANTS.bsc.WRAPPED].includes(tokenOut)
    ) { return resolve() }

    amountIn = amountInMax = amountOut = amountOutMin = [amountIn, amountInMax, amountOut, amountOutMin].filter(Boolean)[0]

    let route

    if(tokenIn === CONSTANTS.bsc.NATIVE && tokenOut === CONSTANTS.bsc.WRAPPED) {
      route = new Route({
        tokenIn,
        tokenOut,
        path: [CONSTANTS.bsc.NATIVE, CONSTANTS.bsc.WRAPPED],
        amountIn,
        amountInMax,
        amountOut,
        amountOutMin,
        fromAddress,
        toAddress,
        exchange,
        transaction: new Transaction({
          blockchain: 'bsc',
          address: CONSTANTS.bsc.WRAPPED,
          api: WBNB,
          method: 'deposit',
          value: amountOut
        })
      })
    } else if(tokenIn === CONSTANTS.bsc.WRAPPED && tokenOut === CONSTANTS.bsc.NATIVE) {
      route = new Route({
        tokenIn,
        tokenOut,
        path: [CONSTANTS.bsc.WRAPPED, CONSTANTS.bsc.NATIVE],
        amountIn,
        amountInMax,
        amountOut,
        amountOutMin,
        fromAddress,
        toAddress,
        exchange,
        transaction: new Transaction({
          blockchain: 'bsc',
          address: CONSTANTS.bsc.WRAPPED,
          api: WBNB,
          method: 'withdraw',
          params: [amountOut]
        })
      })
    }

    return resolve(route)
  })
}

export default route

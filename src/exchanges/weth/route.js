import Route from '../../classes/Route'
import { CONSTANTS } from 'depay-web3-constants'
import { WETH } from './apis'

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
      ![CONSTANTS.ethereum.NATIVE, CONSTANTS.ethereum.WRAPPED].includes(tokenIn) &&
      ![CONSTANTS.ethereum.NATIVE, CONSTANTS.ethereum.WRAPPED].includes(tokenOut)
    ) { return resolve() }

    amountIn = amountInMax = amountOut = amountOutMin = [amountIn, amountInMax, amountOut, amountOutMin].filter(Boolean)[0]

    let route

    if(tokenIn === CONSTANTS.ethereum.NATIVE && tokenOut === CONSTANTS.ethereum.WRAPPED) {
      route = new Route({
        tokenIn,
        tokenOut,
        path: [CONSTANTS.ethereum.NATIVE, CONSTANTS.ethereum.WRAPPED],
        amountIn,
        amountInMax,
        amountOut,
        amountOutMin,
        fromAddress,
        toAddress,
        exchange,
        transaction: {
          blockchain: 'ethereum',
          from: fromAddress,
          to: CONSTANTS.ethereum.WRAPPED,
          api: WETH,
          method: 'deposit',
          value: amountOut.toString()
        }
      })
    } else if(tokenIn === CONSTANTS.ethereum.WRAPPED && tokenOut === CONSTANTS.ethereum.NATIVE) {
      route = new Route({
        tokenIn,
        tokenOut,
        path: [CONSTANTS.ethereum.WRAPPED, CONSTANTS.ethereum.NATIVE],
        amountIn,
        amountInMax,
        amountOut,
        amountOutMin,
        fromAddress,
        toAddress,
        exchange,
        transaction: {
          blockchain: 'ethereum',
          from: fromAddress,
          to: CONSTANTS.ethereum.WRAPPED,
          api: WETH,
          method: 'withdraw',
          params: [amountOut]
        }
      })
    }

    return resolve(route)
  })
}

export default route

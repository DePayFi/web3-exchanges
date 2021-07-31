import UniswapV2 from '../basics'
import { fixUniswapPath } from './path'
import { request } from 'depay-web3-client'

let getAmountsOut = ({ path, amountIn, tokenIn, tokenOut }) => {
  return new Promise((resolve) => {
    request({
      blockchain: 'ethereum',
      address: UniswapV2.contracts.router.address,
      method: 'getAmountsOut'
    },{
      api: UniswapV2.contracts.router.api,
      params: {
        amountIn: amountIn,
        path: fixUniswapPath(path),
      },
    })
    .then((amountsOut)=>resolve(amountsOut[amountsOut.length - 1]))
    .catch(()=>resolve())
  })
}

let getAmountsIn = ({ path, amountOut, tokenIn, tokenOut }) => {
  return new Promise((resolve) => {
    request({
      blockchain: 'ethereum',
      address: UniswapV2.contracts.router.address,
      method: 'getAmountsIn'
    },{
      api: UniswapV2.contracts.router.api,
      params: {
        amountOut: amountOut,
        path: fixUniswapPath(path),
      },
    })
    .then((amountsIn)=>resolve(amountsIn[0]))
    .catch(()=>resolve())
  })
}

export {
  getAmountsIn,
  getAmountsOut
}

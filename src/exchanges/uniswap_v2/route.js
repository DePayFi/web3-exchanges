import Route from '../../classes/Route'
import UniswapV2 from './basics'
import { findPath } from './route/path'
import { getAmountsOut, getAmountsIn } from './route/amounts'
import { getTransaction } from './route/transaction'

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
    let path = await findPath({ tokenIn, tokenOut })
    if (path === undefined || path.length == 0) { return resolve() }
    let [amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput] = [amountIn, amountOut, amountInMax, amountOutMin]
    
    if (amountOut) {
      amountIn = await getAmountsIn({ path, amountOut, tokenIn, tokenOut })
      if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
        return resolve()
      } else if (amountInMax === undefined) {
        amountInMax = amountIn
      }
    } else if (amountIn) {
      amountOut = await getAmountsOut({ path, amountIn, tokenIn, tokenOut })
      if (amountOut == undefined || amountOutMin && amountOut.lt(amountOutMin)) {
        return resolve()
      } else if (amountOutMin === undefined) {
        amountOutMin = amountOut
      }
    } else if(amountOutMin) {
      amountIn = await getAmountsIn({ path, amountOut: amountOutMin, tokenIn, tokenOut })
      if (amountIn == undefined || amountInMax && amountIn.gt(amountInMax)) {
        return resolve()
      } else if (amountInMax === undefined) {
        amountInMax = amountIn
      }
    } else if(amountInMax) {
      amountOut = await getAmountsOut({ path, amountIn: amountInMax, tokenIn, tokenOut })
      if (amountOut == undefined ||amountOutMin && amountOut.lt(amountOutMin)) {
        return resolve()
      } else if (amountOutMin === undefined) {
        amountOutMin = amountOut
      }
    }

    let transaction = getTransaction({
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
    })

    resolve(
      new Route({
        tokenIn,
        tokenOut,
        path,
        amountIn,
        amountInMax,
        amountOut,
        amountOutMin,
        fromAddress,
        toAddress,
        exchange,
        transaction,
      })
    )
  })
}

export default route

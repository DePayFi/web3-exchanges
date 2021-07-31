import Route from '../../classes/Route'
import { findPath } from './route/path'
import { getAmounts } from './route/amounts'
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
    let [amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput] = [amountIn, amountOut, amountInMax, amountOutMin];
    
    ({ amountIn, amountInMax, amountOut, amountOutMin } = await getAmounts({ path, tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin }))
    if([amountIn, amountInMax, amountOut, amountOutMin].every((amount)=>{ return amount == undefined })) { return resolve() }

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

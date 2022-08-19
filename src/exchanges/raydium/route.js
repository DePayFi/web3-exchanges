import { findPath } from './route/path'

let route = ({
  exchange,
  tokenIn,
  tokenOut,
  amountIn = undefined,
  amountOut = undefined,
  amountInMax = undefined,
  amountOutMin = undefined,
}) => {
  return new Promise(async (resolve)=> {
    let path = await findPath({ tokenIn, tokenOut })
    console.log('PATH!!!', path)
    if (path === undefined || path.length == 0) { return resolve() }
    let [amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput] = [amountIn, amountOut, amountInMax, amountOutMin];
    
    ({ amountIn, amountInMax, amountOut, amountOutMin } = await getAmounts({ path, tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin }))
    console.log('AMOUNTS', { amountIn, amountInMax, amountOut, amountOutMin })
    if([amountIn, amountInMax, amountOut, amountOutMin].every((amount)=>{ return amount == undefined })) { return resolve() }

    // let transaction = getTransaction({
    //   path,
    //   amountIn,
    //   amountInMax,
    //   amountOut,
    //   amountOutMin,
    //   amountInInput,
    //   amountOutInput,
    //   amountInMaxInput,
    //   amountOutMinInput,
    // })

    // resolve(
    //   new Route({
    //     tokenIn,
    //     tokenOut,
    //     path,
    //     amountIn,
    //     amountInMax,
    //     amountOut,
    //     amountOutMin,
    //     exchange,
    //     transaction,
    //   })
    // )
  })
}

export default route

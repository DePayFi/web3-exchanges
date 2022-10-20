import all from './all'
import { fixRouteParams, preflight } from './params'

let route = ({
  blockchain,
  fromAddress,
  tokenIn,
  tokenOut,
  amountIn,
  amountOut,
  amountInMax,
  amountOutMin,
  amountOutMax,
  amountInMin,
}) => {
  return Promise.all(
    all[blockchain].map((exchange) => {
      return exchange.route({
        fromAddress,
        tokenIn,
        tokenOut,
        amountIn,
        amountOut,
        amountInMax,
        amountOutMin,
        amountOutMax,
        amountInMin,
      })
    }),
  )
  .then((routes)=>routes.filter(Boolean))
}

export { route }

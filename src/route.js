import all from './all'
import { fixRouteParams, preflight } from './params'

let route = ({
  blockchain,
  fromAddress,
  toAddress,
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
    all.map((exchange) => {
      if(exchange.blockchain !== blockchain) { return null }
      return exchange.route({
        fromAddress,
        toAddress,
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

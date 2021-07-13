import all from './all'
import { fixRouteParams, preflight } from './params'

let route = ({
  from,
  to,
  tokenIn,
  tokenOut,
  amountIn,
  amountOut,
  amountInMax,
  amountOutMin,
  amountOutMax,
  amountInMin,
}) => {
  return new Promise((resolve, reject) => {
    Promise.all(
      all.map((exchange) => {
        return exchange.route({
          from,
          to,
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
      .then((routes) => {
        resolve(routes.filter(Boolean))
      })
      .catch(reject)
  })
}

export { route }

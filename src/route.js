import exchanges from './exchanges'

let route = ({
  blockchain,
  tokenIn,
  tokenOut,
  amountIn,
  amountOut,
  amountInMax,
  amountOutMin,
}) => {
  return Promise.all(
    exchanges[blockchain].map((exchange) => {
      return exchange.route({
        tokenIn,
        tokenOut,
        amountIn,
        amountOut,
        amountInMax,
        amountOutMin,
      })
    }),
  )
  .then((routes)=>{
    return routes.filter(Boolean).sort((a, b)=>{
      if ((amountIn || amountInMax) ? (BigInt(a.amountOut) < BigInt(b.amountOut)) : (BigInt(a.amountIn) > BigInt(b.amountIn))) {
        return 1;
      }
      if ((amountIn || amountInMax) ? (BigInt(a.amountOut) > BigInt(b.amountOut)) : (BigInt(a.amountIn) < BigInt(b.amountIn))) {
        return -1;
      }
      return 0;
    })
  })
}

export default route

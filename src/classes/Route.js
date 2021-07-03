class Route {
  
  constructor({ tokenIn, tokenOut, path, amountIn, amountInMax, amountOut, amountOutMin, from, to, transaction, exchange }) {
    this.tokenIn = tokenIn
    this.tokenOut = tokenOut
    this.path = path
    this.amountIn = amountIn
    this.amountOutMin = amountOutMin
    this.amountOut = amountOut
    this.amountInMax = amountInMax
    this.from = from
    this.to = to
    this.transaction = transaction
    this.exchange = exchange
  }
}

export default Route

class Route {
  constructor({
    tokenIn,
    tokenOut,
    path,
    amountIn,
    amountInMax,
    amountOut,
    amountOutMin,
    fromAddress,
    toAddress,
    transaction,
    exchange,
  }) {
    this.tokenIn = tokenIn
    this.tokenOut = tokenOut
    this.path = path
    this.amountIn = amountIn
    this.amountOutMin = amountOutMin
    this.amountOut = amountOut
    this.amountInMax = amountInMax
    this.fromAddress = fromAddress
    this.toAddress = toAddress
    this.transaction = transaction
    this.exchange = exchange
  }
}

export default Route

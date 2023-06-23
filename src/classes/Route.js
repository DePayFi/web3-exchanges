class Route {
  constructor({
    tokenIn,
    tokenOut,
    path,
    pool,
    amountIn,
    amountInMax,
    amountOut,
    amountOutMin,
    exchange,
    approvalRequired,
    getApproval,
    getTransaction,
  }) {
    this.tokenIn = tokenIn
    this.tokenOut = tokenOut
    this.path = path
    this.pool = pool
    this.amountIn = amountIn?.toString()
    this.amountOutMin = amountOutMin?.toString()
    this.amountOut = amountOut?.toString()
    this.amountInMax = amountInMax?.toString()
    this.exchange = exchange
    this.getTransaction = getTransaction
  }
}

export default Route

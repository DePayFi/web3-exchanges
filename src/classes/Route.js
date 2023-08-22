class Route {
  constructor({
    blockchain,
    tokenIn,
    tokenOut,
    path,
    pools,
    amountIn,
    amountInMax,
    amountOut,
    amountOutMin,
    exchange,
    approvalRequired,
    getApproval,
    getPrep,
    getTransaction,
  }) {
    this.blockchain = blockchain
    this.tokenIn = tokenIn
    this.tokenOut = tokenOut
    this.path = path
    this.pools = pools
    this.amountIn = amountIn?.toString()
    this.amountOutMin = amountOutMin?.toString()
    this.amountOut = amountOut?.toString()
    this.amountInMax = amountInMax?.toString()
    this.exchange = exchange
    this.getPrep = getPrep
    this.getTransaction = getTransaction
  }
}

export default Route

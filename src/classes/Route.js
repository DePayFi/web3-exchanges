class Route {
  constructor({
    blockchain,
    tokenIn,
    decimalsIn,
    tokenOut,
    decimalsOut,
    path,
    pools,
    amounts,
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
    this.decimalsIn = decimalsIn
    this.tokenOut = tokenOut
    this.decimalsOut = decimalsOut
    this.path = path
    this.pools = pools
    this.amounts = amounts
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

import { fixRouteParams, preflight } from '../params'

class Exchange {
  constructor({ name, blockchain, alternativeNames, label, logo, route, getAmountIn, router, factory, pair }) {
    this.name = name
    this.blockchain = blockchain
    this.alternativeNames = alternativeNames
    this.label = label
    this.logo = logo
    this.router = router
    this.factory = factory
    this.pair = pair
    this._route = route
    this.getAmountIn = getAmountIn
  }

  async route({
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
  }) {
    if(tokenIn === tokenOut){ return Promise.resolve() }
    
    preflight({
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

    return await this._route(
      await fixRouteParams({
        blockchain: this.blockchain,
        exchange: this,
        fromAddress,
        toAddress,
        tokenIn,
        tokenOut,
        amountIn,
        amountOut,
        amountInMax,
        amountOutMin,
      }),
    )
  }
}

export default Exchange

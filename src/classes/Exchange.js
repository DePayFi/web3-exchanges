import { fixRouteParams, preflight } from '../route'

class Exchange {
  constructor({ name, blockchain, alternativeNames, label, logo, route }) {
    this.name = name
    this.blockchain = blockchain
    this.alternativeNames = alternativeNames
    this.label = label
    this.logo = logo
    this._route = route
  }

  async route({
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
  }) {
    preflight({
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

    return await this._route(
      await fixRouteParams({
        blockchain: this.blockchain,
        exchange: this,
        from,
        to,
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

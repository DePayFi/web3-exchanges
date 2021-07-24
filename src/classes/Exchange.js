import { fixRouteParams, preflight } from '../params'

class Exchange {
  constructor({ name, blockchain, alternativeNames, label, logo, contracts, route }) {
    this.name = name
    this.blockchain = blockchain
    this.alternativeNames = alternativeNames
    this.label = label
    this.logo = logo
    this.contracts = contracts
    this._route = route
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

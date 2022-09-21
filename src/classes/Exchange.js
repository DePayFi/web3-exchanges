import Route from './Route'
import { calculateAmountInWithSlippage } from '../slippage'
import { fixAddress } from '../address'
import { fixRouteParams, preflight } from '../params'

const route = ({
  exchange,
  tokenIn,
  tokenOut,
  fromAddress,
  toAddress,
  amountIn = undefined,
  amountOut = undefined,
  amountInMax = undefined,
  amountOutMin = undefined,
  findPath,
  getAmounts,
  getTransaction,
}) => {
  tokenIn = fixAddress(tokenIn)
  tokenOut = fixAddress(tokenOut)
  return new Promise(async (resolve)=> {
    let path = await findPath({ tokenIn, tokenOut })
    if (path === undefined || path.length == 0) { return resolve() }
    let [amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput] = [amountIn, amountOut, amountInMax, amountOutMin];
    
    ({ amountIn, amountInMax, amountOut, amountOutMin } = await getAmounts({ path, tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin }))
    if([amountIn, amountInMax, amountOut, amountOutMin].every((amount)=>{ return amount == undefined })) { return resolve() }

    if(amountOutMinInput) {
      amountIn = amountInMax = await calculateAmountInWithSlippage({ exchange, path, tokenIn, tokenOut, amountIn, amountOutMin })
    }

    let transaction = await getTransaction({
      path,
      amountIn,
      amountInMax,
      amountOut,
      amountOutMin,
      amountInInput,
      amountOutInput,
      amountInMaxInput,
      amountOutMinInput,
      toAddress,
      fromAddress
    })

    resolve(
      new Route({
        tokenIn,
        tokenOut,
        path,
        amountIn,
        amountInMax,
        amountOut,
        amountOutMin,
        fromAddress,
        toAddress,
        exchange,
        transaction,
      })
    )
  })
}

class Exchange {
  constructor({
    name,
    blockchain,
    alternativeNames,
    label,
    logo,
    router,
    factory,
    pair,
    findPath,
    getAmountIn,
    getAmounts,
    getTransaction,
  }) {
    this.name = name
    this.blockchain = blockchain
    this.alternativeNames = alternativeNames
    this.label = label
    this.logo = logo
    this.router = router
    this.factory = factory
    this.pair = pair
    this.findPath = findPath
    this.getAmountIn = getAmountIn
    this.getAmounts = getAmounts
    this.getTransaction = getTransaction
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

    return await route({
      ...
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
      findPath: this.findPath,
      getAmounts: this.getAmounts,
      getTransaction: this.getTransaction,
    })
  }
}

export default Exchange

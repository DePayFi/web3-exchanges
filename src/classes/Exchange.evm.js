import Route from './Route'
import { calculateAmountsWithSlippage } from '../slippage.evm'
import { fixAddress } from '../address'
import { fixRouteParams, preflight } from '../params.evm'

const route = ({
  exchange,
  tokenIn,
  tokenOut,
  amountIn = undefined,
  amountOut = undefined,
  amountInMax = undefined,
  amountOutMin = undefined,
  findPath,
  getAmounts,
  getTransaction,
  slippage,
}) => {
  tokenIn = fixAddress(tokenIn)
  tokenOut = fixAddress(tokenOut)
  return new Promise(async (resolve)=> {
    let { path, fixedPath } = await findPath({ tokenIn, tokenOut })
    if (path === undefined || path.length == 0) { return resolve() }
    let [amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput] = [amountIn, amountOut, amountInMax, amountOutMin];

    let amounts // includes intermediary amounts for longer routes
    ({ amountIn, amountInMax, amountOut, amountOutMin, amounts } = await getAmounts({ path, tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin }))
    if([amountIn, amountInMax, amountOut, amountOutMin].every((amount)=>{ return amount == undefined })) { return resolve() }

    if(slippage) {
      ({ amountIn, amountInMax, amountOut, amountOutMin, amounts } = await calculateAmountsWithSlippage({
        exchange,
        fixedPath,
        amounts,
        tokenIn, tokenOut,
        amountIn, amountInMax, amountOut, amountOutMin,
        amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput,
      }))
    }

    resolve(
      new Route({
        tokenIn,
        tokenOut,
        path,
        amountIn,
        amountInMax,
        amountOut,
        amountOutMin,
        exchange,
        getTransaction: async ({ from })=> await getTransaction({
          exchange,
          path,
          amountIn,
          amountInMax,
          amountOut,
          amountOutMin,
          amounts,
          amountInInput,
          amountOutInput,
          amountInMaxInput,
          amountOutMinInput,
          fromAddress: from
        }),
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
    wrapper,
    pair,
    market,
    findPath,
    getAmounts,
    getTransaction,
    slippage,
  }) {
    this.name = name
    this.blockchain = blockchain
    this.alternativeNames = alternativeNames
    this.label = label
    this.logo = logo
    this.router = router
    this.factory = factory
    this.wrapper = wrapper
    this.pair = pair
    this.market = market
    this.findPath = findPath
    this.getAmounts = getAmounts
    this.getTransaction = getTransaction
    this.slippage = slippage
  }

  async route({
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
      slippage: this.slippage,
    })
  }
}

export default Exchange

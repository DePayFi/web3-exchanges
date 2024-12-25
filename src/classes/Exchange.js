/*#if _EVM

import Token from '@depay/web3-tokens-evm'

/*#elif _SOLANA

import Token from '@depay/web3-tokens-solana'

//#else */

import Token from '@depay/web3-tokens'

//#endif

import Route from './Route'
import { calculateAmountsWithSlippage } from '../slippage'
import { fixAddress } from '../address'
import { fixRouteParams, preflight } from '../params'

const route = ({
  blockchain,
  exchange,
  tokenIn,
  tokenOut,
  amountIn = undefined,
  amountOut = undefined,
  amountInMax = undefined,
  amountOutMin = undefined,
  findPath,
  getAmounts,
  getPrep,
  getTransaction,
  slippage,
}) => {

  tokenIn = fixAddress(tokenIn)
  tokenOut = fixAddress(tokenOut)

  if([amountIn, amountOut, amountInMax, amountOutMin].filter(Boolean).length > 1) { throw('You can only pass one: amountIn, amountOut, amountInMax or amountOutMin') }
  if([amountIn, amountOut, amountInMax, amountOutMin].filter(Boolean).length < 1) { throw('You need to pass exactly one: amountIn, amountOut, amountInMax or amountOutMin') }

  return new Promise(async (resolve)=> {
    let { path, exchangePath, pools } = await findPath({ blockchain, tokenIn, tokenOut, amountIn, amountOut, amountInMax, amountOutMin })
    if (path === undefined || path.length == 0) { return resolve() }
    let [amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput] = [amountIn, amountOut, amountInMax, amountOutMin];

    let amounts // includes intermediary amounts for longer routes
    try {
      ;({ amountIn, amountInMax, amountOut, amountOutMin, amounts } = await getAmounts({ exchange, blockchain, path, pools, tokenIn, tokenOut, amountIn, amountInMax, amountOut, amountOutMin }));
    } catch(e) {
      console.log(e);
      return resolve()
    }
    if([amountIn, amountInMax, amountOut, amountOutMin].every((amount)=>{ return amount == undefined })) { return resolve() }

    if(exchange.slippage && slippage !== false) {
      try {
        ({ amountIn, amountInMax, amountOut, amountOutMin, amounts } = await calculateAmountsWithSlippage({
          exchange,
          blockchain,
          pools,
          exchangePath,
          amounts,
          tokenIn, tokenOut,
          amountIn, amountInMax, amountOut, amountOutMin,
          amountInInput, amountOutInput, amountInMaxInput, amountOutMinInput,
        }));
      } catch { return resolve() }
    }

    const decimalsIn = await new Token({ blockchain, address: tokenIn }).decimals()
    const decimalsOut = await new Token({ blockchain, address: tokenOut }).decimals()

    resolve(
      new Route({
        blockchain,
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        path,
        pools,
        amountIn,
        amountInMax,
        amountOut,
        amountOutMin,
        exchange,
        getPrep: async ({ account })=> await getPrep({
          exchange,
          blockchain,
          tokenIn,
          tokenOut,
          amountIn: (amountIn || amountInMax),
          account,
        }),
        getTransaction: async ({ account, permit2, inputTokenPushed })=> await getTransaction({
          exchange,
          blockchain,
          pools,
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
          account,
          permit2,
          inputTokenPushed
        }),
      })
    )
  })
}

class Exchange {
  constructor(...args) {
    Object.assign(this, ...args)
  }

  async route({
    blockchain,
    tokenIn,
    tokenOut,
    amountIn,
    amountOut,
    amountInMax,
    amountOutMin,
    slippage,
  }) {
    if(tokenIn === tokenOut){ return Promise.resolve() }

    if(blockchain === undefined) {
      if(this.scope) { 
        blockchain = this.scope
      } else if (this.blockchains.length === 1) {
        blockchain = this.blockchains[0]
      }
    }

    preflight({
      blockchain,
      exchange: this,
      tokenIn,
      tokenOut,
      amountIn,
      amountOut,
      amountInMax,
      amountOutMin,
    })

    return await route({
      ...
      await fixRouteParams({
        blockchain,
        exchange: this,
        tokenIn,
        tokenOut,
        amountIn,
        amountOut,
        amountInMax,
        amountOutMin,
      }),
      blockchain,
      findPath: this.findPath,
      getAmounts: this.getAmounts,
      getPrep: this.getPrep,
      getTransaction: this.getTransaction,
      slippage,
    })
  }
}

export default Exchange

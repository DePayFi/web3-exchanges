import CONSTANTS from 'depay-blockchain-constants'
import Route from '../../../../src/classes/Route'
import { UniswapV2Router02 } from '../../../../src/exchanges/uniswap_v2/apis'
import { ethers } from 'ethers'
import { findByName } from 'dist/cjs/index.js'
import { mock, resetMocks, anything, normalize } from 'depay-web3mock'
import { mockDecimals } from '../../../mocks/token'
import { mockPair, mockAmounts } from '../../../mocks/uniswap_v2'
import { resetCache } from 'depay-blockchain-call'

describe('uniswap_v2', () => {
  
  beforeEach(()=>{
    resetMocks()
    resetCache()
  })
  afterEach(resetMocks)

  let exchange = findByName('uniswap_v2');
  let pair = '0xEF8cD6Cb5c841A4f02986e8A8ab3cC545d1B8B6d'
  let from = '0x5Af489c8786A018EC4814194dC8048be1007e390'
  let to = '0x5Af489c8786A018EC4814194dC8048be1007e390'

  function mockTransaction({ method, params }){
    return mock({
      blockchain: 'ethereum',
      transaction: {
        to: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
        api: UniswapV2Router02,
        method: method,
        params: params
      }
    })
  }

  function expectRoute({
    route,
    tokenIn,
    tokenOut,
    path,
    amountOutBN,
    amountInBN,
    amountOutMinBN,
    amountInMaxBN,
    from,
    to,
    exchange,
    transaction
  }) {
    expect(route.tokenIn).toEqual(tokenIn)
    expect(route.tokenOut).toEqual(tokenOut)
    expect(route.path).toEqual(path)
    if(typeof amountOutBN !== 'undefined') { expect(route.amountOut).toEqual(amountOutBN) }
    if(typeof amountInBN !== 'undefined') { expect(route.amountIn).toEqual(amountInBN) }
    if(typeof amountOutMinBN !== 'undefined') { expect(route.amountOutMin).toEqual(amountOutMinBN) }
    if(typeof amountInMaxBN !== 'undefined') { expect(route.amountInMax).toEqual(amountInMaxBN) }
    expect(route.from).toEqual(from)
    expect(route.to).toEqual(to)
    expect(route.exchange).toEqual(exchange)
    expect(route.transaction.blockchain).toEqual('ethereum')
    expect(route.transaction.address).toEqual('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D')
    expect(route.transaction.api).toEqual(UniswapV2Router02)
    expect(route.transaction.method).toEqual(transaction.method)
    expect(route.transaction.params.deadline).toBeDefined()
    expect(route.transaction.value).toEqual(transaction.value)
    expect(
      Object.keys(transaction.params).every((key)=>{
        return JSON.stringify(normalize(route.transaction.params[key])) == JSON.stringify(normalize(transaction.params[key]))
      })
    ).toEqual(true)
  }

  async function testRouting({
    tokenIn,
    decimalsIn,
    tokenOut,
    decimalsOut,
    path,
    amountIn,
    amountInMax,
    amountOut,
    amountOutMin,
    pair,
    from,
    to,
    transaction
  }) {
    let amountInBN = typeof amountIn === 'undefined' ? undefined : ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
    let amountInMaxBN = typeof amountInMax === 'undefined' ? undefined : ethers.utils.parseUnits(amountInMax.toString(), decimalsIn)
    let amountOutBN = typeof amountOut === 'undefined' ? undefined : ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
    let amountOutMinBN = typeof amountOutMin === 'undefined' ? undefined : ethers.utils.parseUnits(amountOutMin.toString(), decimalsOut)

    mockDecimals({ address: tokenIn, value: decimalsIn })
    mockDecimals({ address: tokenOut, value: decimalsOut })

    let route = await exchange.route({
      from,
      to,
      amountIn,
      amountInMax,
      amountOut,
      amountOutMin,
      tokenIn,
      tokenOut
    })

    expectRoute({
      route,
      tokenIn,
      tokenOut,
      path,
      amountInBN,
      amountInMaxBN,
      amountOutBN,
      amountOutMinBN,
      from,
      to, 
      exchange,
      transaction
    })
    
    let transactionMock = mockTransaction(transaction)

    await route.transaction.submit()

    expect(transactionMock).toHaveBeenCalled()
  }

  describe('route token to token', ()=>{

    let tokenIn = '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb'
    let decimalsIn = 18
    let tokenOut = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    let decimalsOut = 6
    let path = [tokenIn, tokenOut]

    it('routes a token to token swap for given amountOut without given amountInMax on uniswap_v2', async ()=> {

      let amountOut = 1
      let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
      let fetchedAmountIn = 43
      let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)

      mockPair({ tokenIn, tokenOut, pair })
      mockAmounts({ method: 'getAmountsIn', params: [amountOutBN,path], amounts: [fetchedAmountInBN, amountOutBN] })

      await testRouting({
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        path,
        amountOut,
        pair,
        from,
        to,
        transaction: {
          method: 'swapTokensForExactTokens',
          params: {
            amountInMax: fetchedAmountInBN,
            amountOut: amountOutBN,
            path: path,
            to: to
          }
        }
      })
    });

    it('routes a token to token swap for given amountIn without given amountOutMin on uniswap_v2', async ()=> {

      let amountIn = 1
      let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
      let fetchedAmountOut = 43
      let fetchedAmountOutBN = ethers.utils.parseUnits(fetchedAmountOut.toString(), decimalsOut)
      let path = [tokenIn, tokenOut]

      mockPair({ tokenIn, tokenOut, pair })
      mockAmounts({ method: 'getAmountsOut', params: [amountInBN,path], amounts: [amountInBN, fetchedAmountOutBN] })

      await testRouting({
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        amountIn,
        path,
        pair,
        from,
        to,
        transaction: {
          method: 'swapExactTokensForTokens',
          params: {
            amountIn: amountInBN,
            amountOutMin: fetchedAmountOutBN,
            path: [tokenIn, tokenOut],
            to: to
          }
        }
      })
    });

    it('routes a token to token swap for given amountOut and amountInMax on uniswap_v2', async ()=> {

      let amountOut = 1
      let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
      let amountInMax = 32
      let amountInMaxBN = ethers.utils.parseUnits(amountInMax.toString(), decimalsIn)
      let path = [tokenIn, tokenOut]

      mockPair({ tokenIn, tokenOut, pair })
      mockAmounts({ method: 'getAmountsIn', params: [amountOutBN,path], amounts: [amountInMaxBN, amountOutBN] })

      await testRouting({
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        amountInMax,
        amountOut,
        path,
        pair,
        from,
        to,
        transaction: {
          method: 'swapTokensForExactTokens',
          params: {
            amountInMax: amountInMaxBN,
            amountOut:  amountOutBN,
            path: [tokenIn, tokenOut],
            to: to
          }
        },
      })
    });

    it('routes a token to token swap for given amountIn and amountOutMin on uniswap_v2', async ()=> {

      let amountOutMin = 1
      let amountOutMinBN = ethers.utils.parseUnits(amountOutMin.toString(), decimalsOut)
      let amountIn = 32
      let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
      let path = [tokenIn, tokenOut]

      mockPair({ tokenIn, tokenOut, pair })
      mockAmounts({ method: 'getAmountsOut', params: [amountInBN,path], amounts: [amountInBN, amountOutMinBN] })

      await testRouting({
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        amountIn,
        amountOutMin,
        path,
        pair,
        from,
        to,
        transaction: {
          method: 'swapExactTokensForTokens',
          params: {
            amountIn: amountInBN,
            amountOutMin: amountOutMinBN,
            path: path,
            to
          }
        },
      })
    });

    it('routes a token to token swap on uniswap_v2 also if the routing path is via another token A->B->C', async ()=> {
      let amountOutMin = 1
      let amountOutMinBN = ethers.utils.parseUnits(amountOutMin.toString(), decimalsOut)
      let amountIn = 32
      let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)

      let tokenVia = CONSTANTS.ethereum.WRAPPED
      let amountVia = 0.1
      let amountViaBN = ethers.utils.parseUnits(amountVia.toString(), CONSTANTS.ethereum.DECIMALS)

      path = [tokenIn, tokenVia, tokenOut]

      mockPair({ tokenIn, tokenOut, pair: CONSTANTS.ethereum.ZERO })
      mockPair({ tokenIn, tokenOut: tokenVia, pair: '0xef8cd6cb5c841a4f02986e8a8ab3cc545d1b8b6d' })
      mockPair({ tokenIn: tokenOut, tokenOut: tokenVia, pair: '0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852' })
      mockAmounts({ method: 'getAmountsOut', params: [amountInBN, path], amounts: [amountInBN, amountViaBN, amountOutMinBN] })

      await testRouting({
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        path,
        amountIn,
        amountOutMin,
        pair,
        from,
        to,
        transaction: {
          method: 'swapExactTokensForTokens',
          params: {
            amountIn: amountInBN,
            amountOutMin: amountOutMinBN,
            path: path,
            to
          }
        }
      })
    })

    it('does not fail, but it provides no route if none was found', async ()=> {
      let amountOutMin = 1
      let amountOutMinBN = ethers.utils.parseUnits(amountOutMin.toString(), decimalsOut)
      let amountIn = 32
      let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)

      mockDecimals({ address: tokenIn, value: decimalsIn })
      mockDecimals({ address: tokenOut, value: decimalsOut })
      
      mockPair({ tokenIn, tokenOut, pair: CONSTANTS.ethereum.ZERO })
      mockPair({ tokenIn, tokenOut: CONSTANTS.ethereum.WRAPPED, pair: CONSTANTS.ethereum.ZERO })

      let route = await exchange.route({
        from,
        to,
        amountIn,
        amountOutMin,
        tokenIn,
        tokenOut
      })

      expect(route).toEqual(undefined)
    })
  })

  describe('route ETH to token', ()=>{

    let tokenIn = CONSTANTS.ethereum.NATIVE
    let decimalsIn = CONSTANTS.ethereum.DECIMALS
    let tokenOut = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    let decimalsOut = 6
    let path = [tokenIn, tokenOut]

    it('routes a ETH to token swap for given amountOut without given amountInMax on uniswap_v2', async ()=> {

      let amountOut = 1
      let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
      let fetchedAmountIn = 43
      let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)

      mockPair({ tokenIn: CONSTANTS.ethereum.WRAPPED, tokenOut, pair })
      mockAmounts({ method: 'getAmountsIn', params: [amountOutBN,[CONSTANTS.ethereum.WRAPPED,tokenOut]], amounts: [fetchedAmountInBN, amountOutBN] })

      await testRouting({
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        path,
        amountOut,
        pair,
        from,
        to,
        transaction: {
          method: 'swapETHForExactTokens',
          params: {
            amountOut: amountOutBN,
            path: [CONSTANTS.ethereum.WRAPPED, tokenOut],
            to: to
          },
          value: fetchedAmountInBN
        }
      })
    });

    it('routes a ETH to token swap for given amountIn without given amountOutMin on uniswap_v2', async ()=> {

      let amountIn = 1
      let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
      let fetchedAmountOut = 43
      let fetchedAmountOutBN = ethers.utils.parseUnits(fetchedAmountOut.toString(), decimalsOut)
      let path = [tokenIn, tokenOut]

      mockPair({ tokenIn: CONSTANTS.ethereum.WRAPPED, tokenOut, pair })
      mockAmounts({ method: 'getAmountsOut', params: [amountInBN,[CONSTANTS.ethereum.WRAPPED,tokenOut]], amounts: [amountInBN, fetchedAmountOutBN] })

      await testRouting({
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        amountIn,
        path,
        pair,
        from,
        to,
        transaction: {
          method: 'swapExactETHForTokens',
          params: {
            amountOutMin: fetchedAmountOutBN,
            path: [CONSTANTS.ethereum.WRAPPED, tokenOut],
            to: to
          },
          value: amountInBN
        }
      })
    });

    it('routes a ETH to token swap for given amountOut and amountInMax on uniswap_v2', async ()=> {

      let amountOut = 1
      let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
      let amountInMax = 32
      let amountInMaxBN = ethers.utils.parseUnits(amountInMax.toString(), decimalsIn)
      let path = [tokenIn, tokenOut]

      mockPair({ tokenIn: CONSTANTS.ethereum.WRAPPED, tokenOut, pair })
      mockAmounts({ method: 'getAmountsIn', params: [amountOutBN,[CONSTANTS.ethereum.WRAPPED,tokenOut]], amounts: [amountInMaxBN, amountOutBN] })

      await testRouting({
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        amountInMax,
        amountOut,
        path,
        pair,
        from,
        to,
        transaction: {
          method: 'swapETHForExactTokens',
          params: {
            amountOut:  amountOutBN,
            path: [CONSTANTS.ethereum.WRAPPED, tokenOut],
            to: to
          },
          value: amountInMaxBN
        },
      })
    });

    it('routes a ETH to token swap for given amountIn and amountOutMin on uniswap_v2', async ()=> {

      let amountOutMin = 1
      let amountOutMinBN = ethers.utils.parseUnits(amountOutMin.toString(), decimalsOut)
      let amountIn = 32
      let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
      let path = [tokenIn, tokenOut]

      mockPair({ tokenIn: CONSTANTS.ethereum.WRAPPED, tokenOut, pair })
      mockAmounts({ method: 'getAmountsOut', params: [amountInBN,[CONSTANTS.ethereum.WRAPPED,tokenOut]], amounts: [amountInBN, amountOutMinBN] })

      await testRouting({
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        amountIn,
        amountOutMin,
        path,
        pair,
        from,
        to,
        transaction: {
          method: 'swapExactETHForTokens',
          params: {
            amountOutMin: amountOutMinBN,
            path: [CONSTANTS.ethereum.WRAPPED,tokenOut],
            to
          },
          value: amountInBN
        },
      })
    });
  })

  describe('route token to ETH', ()=>{

    let tokenIn = '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb'
    let decimalsIn = 18
    let tokenOut = CONSTANTS.ethereum.NATIVE
    let decimalsOut = CONSTANTS.ethereum.DECIMALS
    let path = [tokenIn, tokenOut]

    it('routes a token to ETH swap for given amountOut without given amountInMax on uniswap_v2', async ()=> {

      let amountOut = 1
      let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
      let fetchedAmountIn = 43
      let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)

      mockPair({ tokenIn, tokenOut: CONSTANTS.ethereum.WRAPPED, pair })
      mockAmounts({ method: 'getAmountsIn', params: [amountOutBN,[tokenIn, CONSTANTS.ethereum.WRAPPED]], amounts: [fetchedAmountInBN, amountOutBN] })

      await testRouting({
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        path,
        amountOut,
        pair,
        from,
        to,
        transaction: {
          method: 'swapTokensForExactETH',
          params: {
            amountInMax: fetchedAmountInBN,
            amountOut: amountOutBN,
            path: [tokenIn, CONSTANTS.ethereum.WRAPPED],
            to: to
          }
        }
      })
    });

    it('routes a token to ETH swap for given amountIn without given amountOutMin on uniswap_v2', async ()=> {

      let amountIn = 1
      let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
      let fetchedAmountOut = 43
      let fetchedAmountOutBN = ethers.utils.parseUnits(fetchedAmountOut.toString(), decimalsOut)
      let path = [tokenIn, tokenOut]

      mockPair({ tokenIn, tokenOut: CONSTANTS.ethereum.WRAPPED, pair })
      mockAmounts({ method: 'getAmountsOut', params: [amountInBN,[tokenIn, CONSTANTS.ethereum.WRAPPED]], amounts: [amountInBN, fetchedAmountOutBN] })

      await testRouting({
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        amountIn,
        path,
        pair,
        from,
        to,
        transaction: {
          method: 'swapExactTokensForETH',
          params: {
            amountIn: amountInBN,
            amountOutMin: fetchedAmountOutBN,
            path: [tokenIn, CONSTANTS.ethereum.WRAPPED],
            to: to
          }
        }
      })
    });

    it('routes a token to ETH swap for given amountOut and amountInMax on uniswap_v2', async ()=> {

      let amountOut = 1
      let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
      let amountInMax = 32
      let amountInMaxBN = ethers.utils.parseUnits(amountInMax.toString(), decimalsIn)
      let path = [tokenIn, tokenOut]

      mockPair({ tokenIn, tokenOut: CONSTANTS.ethereum.WRAPPED, pair })
      mockAmounts({ method: 'getAmountsIn', params: [amountOutBN,[tokenIn, CONSTANTS.ethereum.WRAPPED]], amounts: [amountInMaxBN, amountOutBN] })

      await testRouting({
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        amountInMax,
        amountOut,
        path,
        pair,
        from,
        to,
        transaction: {
          method: 'swapTokensForExactETH',
          params: {
            amountInMax: amountInMaxBN,
            amountOut:  amountOutBN,
            path: [tokenIn, CONSTANTS.ethereum.WRAPPED],
            to: to
          }
        },
      })
    });

    it('routes a token to ETH swap for given amountIn and amountOutMin on uniswap_v2', async ()=> {

      let amountOutMin = 1
      let amountOutMinBN = ethers.utils.parseUnits(amountOutMin.toString(), decimalsOut)
      let amountIn = 32
      let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
      let path = [tokenIn, tokenOut]

      mockPair({ tokenIn, tokenOut: CONSTANTS.ethereum.WRAPPED, pair })
      mockAmounts({ method: 'getAmountsOut', params: [amountInBN,[tokenIn, CONSTANTS.ethereum.WRAPPED]], amounts: [amountInBN, amountOutMinBN] })

      await testRouting({
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        amountIn,
        amountOutMin,
        path,
        pair,
        from,
        to,
        transaction: {
          method: 'swapExactTokensForETH',
          params: {
            amountIn: amountInBN,
            amountOutMin: amountOutMinBN,
            path: [tokenIn, CONSTANTS.ethereum.WRAPPED],
            to
          }
        },
      })
    });
  })
});

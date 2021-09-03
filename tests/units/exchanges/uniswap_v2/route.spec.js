import Route from 'src/classes/Route'
import { CONSTANTS } from 'depay-web3-constants'
import { ethers } from 'ethers'
import { findByName } from 'src'
import { mock, resetMocks, anything } from 'depay-web3-mock'
import { mockDecimals } from 'tests/mocks/token'
import { mockPair, mockAmounts } from 'tests/mocks/uniswap_v2'
import { resetCache, provider } from 'depay-web3-client'
import { testRouting } from 'tests/helpers/testRouting'

describe('uniswap_v2', () => {
  
  beforeEach(resetMocks)
  beforeEach(resetCache)

  let blockchain = 'ethereum'
  let exchange = findByName('uniswap_v2')
  let pair = '0xEF8cD6Cb5c841A4f02986e8A8ab3cC545d1B8B6d'
  let fromAddress = '0x5Af489c8786A018EC4814194dC8048be1007e390'
  let toAddress = '0x5Af489c8786A018EC4814194dC8048be1007e390'

  describe('basic routing', ()=>{

    it('does not try to find a route from and to the same token, as that doesnt make any sense on uniswap_v2', async ()=> {

      mock(blockchain)

      let amountOut = 5
      let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), 18)
      let amountIn = 5

      let route = await exchange.route({
        tokenIn: '0xa0bed124a09ac2bd941b10349d8d224fe3c955eb',
        tokenOut: '0xa0bed124a09ac2bd941b10349d8d224fe3c955eb',
        amountInMax: amountIn,
        amountOut,
        fromAddress,
        toAddress
      })

      expect(route).toEqual(undefined)
    })

    it('returns undefined and does not fail or reject in case an error happens during the routing on uniswap_v2', async ()=> {

      mock(blockchain)

      let tokenIn = '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb'
      let decimalsIn = 18
      let fetchedAmountIn = 43
      let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)
      let tokenOut = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
      let decimalsOut = 6
      let amountOut = 1
      let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
      let path = [tokenIn, tokenOut]

      mockDecimals({ provider: provider(blockchain), blockchain, address: tokenIn, value: decimalsIn })
      mockDecimals({ provider: provider(blockchain), blockchain, address: tokenOut, value: decimalsOut })
      mockPair({ provider: provider(blockchain), tokenIn, tokenOut, pair })
      mock({
        provider: provider(blockchain),
        blockchain,
        call: {
          to: exchange.contracts.router.address,
          api: exchange.contracts.router.api,
          method: 'getAmountsIn',
          params: [amountOutBN, path],
          return: Error('Routing Error')
        }
      })

      let route = await exchange.route({
        tokenIn: tokenIn,
        tokenOut: tokenOut,
        amountOut,
        amountInMax: fetchedAmountIn,
        fromAddress,
        toAddress
      })

      expect(route).toEqual(undefined)
    })
  })

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

      mockPair({ provider: provider(blockchain), tokenIn, tokenOut, pair })
      mockAmounts({ provider: provider(blockchain), method: 'getAmountsIn', params: [amountOutBN,path], amounts: [fetchedAmountInBN, amountOutBN] })

      await testRouting({
        blockchain,
        exchange,
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        path,
        amountOut,
        pair,
        fromAddress,
        toAddress,
        transaction: {
          to: exchange.contracts.router.address,
          api: exchange.contracts.router.api,
          method: 'swapTokensForExactTokens',
          params: {
            amountInMax: fetchedAmountInBN,
            amountOut: amountOutBN,
            path: path,
            to: toAddress
          }
        }
      })
    });

    it('routes a token to token swap for given amountOutMin without given amountIn on uniswap_v2', async ()=> {

      let amountOutMin = 1
      let amountOutMinBN = ethers.utils.parseUnits(amountOutMin.toString(), decimalsOut)
      let fetchedAmountIn = 43
      let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)

      mockPair({ provider: provider(blockchain), tokenIn, tokenOut, pair })
      mockAmounts({ provider: provider(blockchain), method: 'getAmountsIn', params: [amountOutMinBN,path], amounts: [fetchedAmountInBN, amountOutMinBN] })

      await testRouting({
        blockchain,
        exchange,
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        path,
        amountOutMin,
        pair,
        fromAddress,
        toAddress,
        transaction: {
          to: exchange.contracts.router.address,
          api: exchange.contracts.router.api,
          method: 'swapExactTokensForTokens',
          params: {
            amountIn: fetchedAmountInBN,
            amountOutMin: amountOutMinBN,
            path: path,
            to: toAddress
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

      mockPair({ provider: provider(blockchain), tokenIn, tokenOut, pair })
      mockAmounts({ provider: provider(blockchain), method: 'getAmountsOut', params: [amountInBN,path], amounts: [amountInBN, fetchedAmountOutBN] })

      await testRouting({
        blockchain,
        exchange,
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        amountIn,
        path,
        pair,
        fromAddress,
        toAddress,
        transaction: {
          to: exchange.contracts.router.address,
          api: exchange.contracts.router.api,
          method: 'swapExactTokensForTokens',
          params: {
            amountIn: amountInBN,
            amountOutMin: fetchedAmountOutBN,
            path: [tokenIn, tokenOut],
            to: toAddress
          }
        }
      })
    });

    it('routes a token to token swap for given amountInMax without given amountOut on uniswap_v2', async ()=> {

      let amountInMax = 1
      let amountInMaxBN = ethers.utils.parseUnits(amountInMax.toString(), decimalsIn)
      let fetchedAmountOut = 43
      let fetchedAmountOutBN = ethers.utils.parseUnits(fetchedAmountOut.toString(), decimalsOut)
      let path = [tokenIn, tokenOut]

      mockPair({ provider: provider(blockchain), tokenIn, tokenOut, pair })
      mockAmounts({ provider: provider(blockchain), method: 'getAmountsOut', params: [amountInMaxBN, path], amounts: [amountInMaxBN, fetchedAmountOutBN] })

      await testRouting({
        blockchain,
        exchange,
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        amountInMax,
        path,
        pair,
        fromAddress,
        toAddress,
        transaction: {
          to: exchange.contracts.router.address,
          api: exchange.contracts.router.api,
          method: 'swapTokensForExactTokens',
          params: {
            amountInMax: amountInMaxBN,
            amountOut: fetchedAmountOutBN,
            path: [tokenIn, tokenOut],
            to: toAddress
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

      mockPair({ provider: provider(blockchain), tokenIn, tokenOut, pair })
      mockAmounts({ provider: provider(blockchain), method: 'getAmountsIn', params: [amountOutBN,path], amounts: [amountInMaxBN, amountOutBN] })

      await testRouting({
        blockchain,
        exchange,
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        amountInMax,
        amountOut,
        path,
        pair,
        fromAddress,
        toAddress,
        transaction: {
          to: exchange.contracts.router.address,
          api: exchange.contracts.router.api,
          method: 'swapTokensForExactTokens',
          params: {
            amountInMax: amountInMaxBN,
            amountOut:  amountOutBN,
            path: [tokenIn, tokenOut],
            to: toAddress
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

      mockPair({ provider: provider(blockchain), tokenIn, tokenOut, pair })
      mockAmounts({ provider: provider(blockchain), method: 'getAmountsOut', params: [amountInBN,path], amounts: [amountInBN, amountOutMinBN] })

      await testRouting({
        blockchain,
        exchange,
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        amountIn,
        amountOutMin,
        path,
        pair,
        fromAddress,
        toAddress,
        transaction: {
          to: exchange.contracts.router.address,
          api: exchange.contracts.router.api,
          method: 'swapExactTokensForTokens',
          params: {
            amountIn: amountInBN,
            amountOutMin: amountOutMinBN,
            path: path,
            to: toAddress
          }
        },
      })
    });

    it('routes a token to token swap on uniswap_v2 also if the routing path is via another token A->B->C', async ()=> {
      let amountOutMin = 1
      let amountOutMinBN = ethers.utils.parseUnits(amountOutMin.toString(), decimalsOut)
      let amountIn = 32
      let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)

      let tokenVia = CONSTANTS[blockchain].WRAPPED
      let amountVia = 0.1
      let amountViaBN = ethers.utils.parseUnits(amountVia.toString(), CONSTANTS[blockchain].DECIMALS)

      path = [tokenIn, tokenVia, tokenOut]

      mockPair({ provider: provider(blockchain), tokenIn, tokenOut, pair: CONSTANTS[blockchain].ZERO })
      mockPair({ provider: provider(blockchain), tokenIn, tokenOut: tokenVia, pair: '0xef8cd6cb5c841a4f02986e8a8ab3cc545d1b8b6d' })
      mockPair({ provider: provider(blockchain), tokenIn: tokenOut, tokenOut: tokenVia, pair: '0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852' })
      mockAmounts({ provider: provider(blockchain), method: 'getAmountsOut', params: [amountInBN, path], amounts: [amountInBN, amountViaBN, amountOutMinBN] })

      await testRouting({
        blockchain,
        exchange,
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        path,
        amountIn,
        amountOutMin,
        pair,
        fromAddress,
        toAddress,
        transaction: {
          to: exchange.contracts.router.address,
          api: exchange.contracts.router.api,
          method: 'swapExactTokensForTokens',
          params: {
            amountIn: amountInBN,
            amountOutMin: amountOutMinBN,
            path: path,
            to: toAddress
          }
        }
      })
    })

    it('does not fail, but it provides no route if none was found', async ()=> {
      let amountOutMin = 1
      let amountOutMinBN = ethers.utils.parseUnits(amountOutMin.toString(), decimalsOut)
      let amountIn = 32
      let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)

      mockDecimals({ provider: provider(blockchain), blockchain, address: tokenIn, value: decimalsIn })
      mockDecimals({ provider: provider(blockchain), blockchain, address: tokenOut, value: decimalsOut })
      
      mockPair({ provider: provider(blockchain), tokenIn, tokenOut, pair: CONSTANTS[blockchain].ZERO })
      mockPair({ provider: provider(blockchain), tokenIn, tokenOut: CONSTANTS[blockchain].WRAPPED, pair: CONSTANTS[blockchain].ZERO })

      let route = await exchange.route({
        tokenIn,
        tokenOut,
        amountIn,
        amountOutMin,
        fromAddress,
        toAddress
      })

      expect(route).toEqual(undefined)
    })
  })

  describe('route ETH to token', ()=>{

    let tokenIn = CONSTANTS[blockchain].NATIVE
    let decimalsIn = CONSTANTS[blockchain].DECIMALS
    let tokenOut = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    let decimalsOut = 6
    let path = [tokenIn, CONSTANTS[blockchain].WRAPPED, tokenOut]

    it('routes a ETH to token swap for given amountOut without given amountInMax on uniswap_v2', async ()=> {

      let amountOut = 1
      let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
      let fetchedAmountIn = 43
      let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)

      mockPair({ provider: provider(blockchain), tokenIn: CONSTANTS[blockchain].WRAPPED, tokenOut, pair })
      mockAmounts({ provider: provider(blockchain), method: 'getAmountsIn', params: [amountOutBN,[CONSTANTS[blockchain].WRAPPED,tokenOut]], amounts: [fetchedAmountInBN, amountOutBN] })

      await testRouting({
        blockchain,
        exchange,
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        path,
        amountOut,
        pair,
        fromAddress,
        toAddress,
        transaction: {
          to: exchange.contracts.router.address,
          api: exchange.contracts.router.api,
          method: 'swapETHForExactTokens',
          params: {
            amountOut: amountOutBN,
            path: [CONSTANTS[blockchain].WRAPPED, tokenOut],
            to: toAddress
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
      let path = [tokenIn, CONSTANTS[blockchain].WRAPPED, tokenOut]

      mockPair({ provider: provider(blockchain), tokenIn: CONSTANTS[blockchain].WRAPPED, tokenOut, pair })
      mockAmounts({ provider: provider(blockchain), method: 'getAmountsOut', params: [amountInBN,[CONSTANTS[blockchain].WRAPPED,tokenOut]], amounts: [amountInBN, fetchedAmountOutBN] })

      await testRouting({
        blockchain,
        exchange,
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        amountIn,
        path,
        pair,
        fromAddress,
        toAddress,
        transaction: {
          to: exchange.contracts.router.address,
          api: exchange.contracts.router.api,
          method: 'swapExactETHForTokens',
          params: {
            amountOutMin: fetchedAmountOutBN,
            path: [CONSTANTS[blockchain].WRAPPED, tokenOut],
            to: toAddress
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
      let path = [tokenIn, CONSTANTS[blockchain].WRAPPED, tokenOut]

      mockPair({ provider: provider(blockchain), tokenIn: CONSTANTS[blockchain].WRAPPED, tokenOut, pair })
      mockAmounts({ provider: provider(blockchain), method: 'getAmountsIn', params: [amountOutBN,[CONSTANTS[blockchain].WRAPPED,tokenOut]], amounts: [amountInMaxBN, amountOutBN] })

      await testRouting({
        blockchain,
        exchange,
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        amountInMax,
        amountOut,
        path,
        pair,
        fromAddress,
        toAddress,
        transaction: {
          to: exchange.contracts.router.address,
          api: exchange.contracts.router.api,
          method: 'swapETHForExactTokens',
          params: {
            amountOut:  amountOutBN,
            path: [CONSTANTS[blockchain].WRAPPED, tokenOut],
            to: toAddress
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
      let path = [tokenIn, CONSTANTS[blockchain].WRAPPED, tokenOut]

      mockPair({ provider: provider(blockchain), tokenIn: CONSTANTS[blockchain].WRAPPED, tokenOut, pair })
      mockAmounts({ provider: provider(blockchain), method: 'getAmountsOut', params: [amountInBN,[CONSTANTS[blockchain].WRAPPED,tokenOut]], amounts: [amountInBN, amountOutMinBN] })

      await testRouting({
        blockchain,
        exchange,
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        amountIn,
        amountOutMin,
        path,
        pair,
        fromAddress,
        toAddress,
        transaction: {
          to: exchange.contracts.router.address,
          api: exchange.contracts.router.api,
          method: 'swapExactETHForTokens',
          params: {
            amountOutMin: amountOutMinBN,
            path: [CONSTANTS[blockchain].WRAPPED,tokenOut],
            to: toAddress
          },
          value: amountInBN
        },
      })
    });
  })

  describe('route token to ETH', ()=>{

    let tokenIn = '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb'
    let decimalsIn = 18
    let tokenOut = CONSTANTS[blockchain].NATIVE
    let decimalsOut = CONSTANTS[blockchain].DECIMALS
    let path = [tokenIn, CONSTANTS[blockchain].WRAPPED, tokenOut]

    it('routes a token to ETH swap for given amountOut without given amountInMax on uniswap_v2', async ()=> {

      let amountOut = 1
      let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
      let fetchedAmountIn = 43
      let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)

      mockPair({ provider: provider(blockchain), tokenIn, tokenOut: CONSTANTS[blockchain].WRAPPED, pair })
      mockAmounts({ provider: provider(blockchain), method: 'getAmountsIn', params: [amountOutBN,[tokenIn, CONSTANTS[blockchain].WRAPPED]], amounts: [fetchedAmountInBN, amountOutBN] })

      await testRouting({
        blockchain,
        exchange,
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        path,
        amountOut,
        pair,
        fromAddress,
        toAddress,
        transaction: {
          to: exchange.contracts.router.address,
          api: exchange.contracts.router.api,
          method: 'swapTokensForExactETH',
          params: {
            amountInMax: fetchedAmountInBN,
            amountOut: amountOutBN,
            path: [tokenIn, CONSTANTS[blockchain].WRAPPED],
            to: toAddress
          }
        }
      })
    });

    it('routes a token to ETH swap for given amountIn without given amountOutMin on uniswap_v2', async ()=> {

      let amountIn = 1
      let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
      let fetchedAmountOut = 43
      let fetchedAmountOutBN = ethers.utils.parseUnits(fetchedAmountOut.toString(), decimalsOut)
      let path = [tokenIn, CONSTANTS[blockchain].WRAPPED, tokenOut]

      mockPair({ provider: provider(blockchain), tokenIn, tokenOut: CONSTANTS[blockchain].WRAPPED, pair })
      mockAmounts({ provider: provider(blockchain), method: 'getAmountsOut', params: [amountInBN,[tokenIn, CONSTANTS[blockchain].WRAPPED]], amounts: [amountInBN, fetchedAmountOutBN] })

      await testRouting({
        blockchain,
        exchange,
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        amountIn,
        path,
        pair,
        fromAddress,
        toAddress,
        transaction: {
          to: exchange.contracts.router.address,
          api: exchange.contracts.router.api,
          method: 'swapExactTokensForETH',
          params: {
            amountIn: amountInBN,
            amountOutMin: fetchedAmountOutBN,
            path: [tokenIn, CONSTANTS[blockchain].WRAPPED],
            to: toAddress
          }
        }
      })
    });

    it('routes a token to ETH swap for given amountOut and amountInMax on uniswap_v2', async ()=> {

      let amountOut = 1
      let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
      let amountInMax = 32
      let amountInMaxBN = ethers.utils.parseUnits(amountInMax.toString(), decimalsIn)
      let path = [tokenIn, CONSTANTS[blockchain].WRAPPED, tokenOut]

      mockPair({ provider: provider(blockchain), tokenIn, tokenOut: CONSTANTS[blockchain].WRAPPED, pair })
      mockAmounts({ provider: provider(blockchain), method: 'getAmountsIn', params: [amountOutBN,[tokenIn, CONSTANTS[blockchain].WRAPPED]], amounts: [amountInMaxBN, amountOutBN] })

      await testRouting({
        blockchain,
        exchange,
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        amountInMax,
        amountOut,
        path,
        pair,
        fromAddress,
        toAddress,
        transaction: {
          to: exchange.contracts.router.address,
          api: exchange.contracts.router.api,
          method: 'swapTokensForExactETH',
          params: {
            amountInMax: amountInMaxBN,
            amountOut:  amountOutBN,
            path: [tokenIn, CONSTANTS[blockchain].WRAPPED],
            to: toAddress
          }
        },
      })
    });

    it('routes a token to ETH swap for given amountIn and amountOutMin on uniswap_v2', async ()=> {

      let amountOutMin = 1
      let amountOutMinBN = ethers.utils.parseUnits(amountOutMin.toString(), decimalsOut)
      let amountIn = 32
      let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
      let path = [tokenIn, CONSTANTS[blockchain].WRAPPED, tokenOut]

      mockPair({ provider: provider(blockchain), tokenIn, tokenOut: CONSTANTS[blockchain].WRAPPED, pair })
      mockAmounts({ provider: provider(blockchain), method: 'getAmountsOut', params: [amountInBN,[tokenIn, CONSTANTS[blockchain].WRAPPED]], amounts: [amountInBN, amountOutMinBN] })

      await testRouting({
        blockchain,
        exchange,
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        amountIn,
        amountOutMin,
        path,
        pair,
        fromAddress,
        toAddress,
        transaction: {
          to: exchange.contracts.router.address,
          api: exchange.contracts.router.api,
          method: 'swapExactTokensForETH',
          params: {
            amountIn: amountInBN,
            amountOutMin: amountOutMinBN,
            path: [tokenIn, CONSTANTS[blockchain].WRAPPED],
            to: toAddress
          }
        },
      })
    });
  })
});

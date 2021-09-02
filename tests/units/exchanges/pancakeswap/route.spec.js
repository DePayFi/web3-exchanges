import Route from 'src/classes/Route'
import { CONSTANTS } from 'depay-web3-constants'
import { ethers } from 'ethers'
import { findByName } from 'src'
import { mock, resetMocks, anything } from 'depay-web3-mock'
import { mockDecimals } from 'tests/mocks/token'
import { mockPair, mockAmounts } from 'tests/mocks/pancakeswap'
import { resetCache, provider as getProvider } from 'depay-web3-client'
import { testRouting } from 'tests/helpers/testRouting'

describe('pancakeswap', () => {
  
  beforeEach(resetMocks)
  beforeEach(resetCache)
  afterEach(resetMocks)

  let blockchain = 'bsc'
  let provider
  beforeEach(async ()=> { provider = await getProvider(blockchain) })
  let exchange = findByName('pancakeswap')
  let pair = '0x804678fa97d91B974ec2af3c843270886528a9E6'
  let fromAddress = '0x5Af489c8786A018EC4814194dC8048be1007e390'
  let toAddress = '0x5Af489c8786A018EC4814194dC8048be1007e390'

  describe('basic routing', ()=>{

    it('does not try to find a route from and to the same token, as that doesnt make any sense on pancakeswap', async ()=> {

      mock(blockchain)

      let amountOut = 5
      let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), 18)
      let amountIn = 5

      let route = await exchange.route({
        tokenIn: '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82',
        tokenOut: '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82',
        amountInMax: amountIn,
        amountOut,
        fromAddress,
        toAddress
      })

      expect(route).toEqual(undefined)
    })

    it('returns undefined and does not fail or reject in case an error happens during the routing on pancakeswap', async ()=> {

      mock(blockchain)

      let tokenIn = '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82'
      let decimalsIn = 18
      let fetchedAmountIn = 43
      let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)
      let tokenOut = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56'
      let decimalsOut = 18
      let amountOut = 1
      let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
      let path = [tokenIn, tokenOut]

      mockDecimals({ provider, blockchain, address: tokenIn, value: decimalsIn })
      mockDecimals({ provider, blockchain, address: tokenOut, value: decimalsOut })
      mockPair({ provider, tokenIn, tokenOut, pair })
      mock({
        provider,
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

    let tokenIn = '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82'
    let decimalsIn = 18
    let tokenOut = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56'
    let decimalsOut = 18
    let path = [tokenIn, tokenOut]

    it('routes a token to token swap for given amountOut without given amountInMax on pancakeswap', async ()=> {

      let amountOut = 1
      let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
      let fetchedAmountIn = 43
      let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)

      mockPair({ provider, tokenIn, tokenOut, pair })
      mockAmounts({ method: 'getAmountsIn', params: [amountOutBN,path], amounts: [fetchedAmountInBN, amountOutBN] })

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

    it('routes a token to token swap for given amountOutMin without given amountIn on pancakeswap', async ()=> {

      let amountOutMin = 1
      let amountOutMinBN = ethers.utils.parseUnits(amountOutMin.toString(), decimalsOut)
      let fetchedAmountIn = 43
      let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)

      mockPair({ provider, tokenIn, tokenOut, pair })
      mockAmounts({ method: 'getAmountsIn', params: [amountOutMinBN,path], amounts: [fetchedAmountInBN, amountOutMinBN] })

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

    it('routes a token to token swap for given amountIn without given amountOutMin on pancakeswap', async ()=> {

      let amountIn = 1
      let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
      let fetchedAmountOut = 43
      let fetchedAmountOutBN = ethers.utils.parseUnits(fetchedAmountOut.toString(), decimalsOut)
      let path = [tokenIn, tokenOut]

      mockPair({ provider, tokenIn, tokenOut, pair })
      mockAmounts({ method: 'getAmountsOut', params: [amountInBN,path], amounts: [amountInBN, fetchedAmountOutBN] })

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

    it('routes a token to token swap for given amountInMax without given amountOut on pancakeswap', async ()=> {

      let amountInMax = 1
      let amountInMaxBN = ethers.utils.parseUnits(amountInMax.toString(), decimalsIn)
      let fetchedAmountOut = 43
      let fetchedAmountOutBN = ethers.utils.parseUnits(fetchedAmountOut.toString(), decimalsOut)
      let path = [tokenIn, tokenOut]

      mockPair({ provider, tokenIn, tokenOut, pair })
      mockAmounts({ method: 'getAmountsOut', params: [amountInMaxBN, path], amounts: [amountInMaxBN, fetchedAmountOutBN] })

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

    it('routes a token to token swap for given amountOut and amountInMax on pancakeswap', async ()=> {

      let amountOut = 1
      let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
      let amountInMax = 32
      let amountInMaxBN = ethers.utils.parseUnits(amountInMax.toString(), decimalsIn)
      let path = [tokenIn, tokenOut]

      mockPair({ provider, tokenIn, tokenOut, pair })
      mockAmounts({ method: 'getAmountsIn', params: [amountOutBN,path], amounts: [amountInMaxBN, amountOutBN] })

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

    it('routes a token to token swap for given amountIn and amountOutMin on pancakeswap', async ()=> {

      let amountOutMin = 1
      let amountOutMinBN = ethers.utils.parseUnits(amountOutMin.toString(), decimalsOut)
      let amountIn = 32
      let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
      let path = [tokenIn, tokenOut]

      mockPair({ provider, tokenIn, tokenOut, pair })
      mockAmounts({ method: 'getAmountsOut', params: [amountInBN,path], amounts: [amountInBN, amountOutMinBN] })

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

    it('routes a token to token swap on pancakeswap also if the routing path is via another token A->B->C', async ()=> {
      let amountOutMin = 1
      let amountOutMinBN = ethers.utils.parseUnits(amountOutMin.toString(), decimalsOut)
      let amountIn = 32
      let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)

      let tokenVia = CONSTANTS[blockchain].WRAPPED
      let amountVia = 0.1
      let amountViaBN = ethers.utils.parseUnits(amountVia.toString(), CONSTANTS[blockchain].DECIMALS)

      path = [tokenIn, tokenVia, tokenOut]

      mockPair({ provider, tokenIn, tokenOut, pair: CONSTANTS[blockchain].ZERO })
      mockPair({ provider, tokenIn, tokenOut: tokenVia, pair: '0xef8cd6cb5c841a4f02986e8a8ab3cc545d1b8b6d' })
      mockPair({ provider, tokenIn: tokenOut, tokenOut: tokenVia, pair: '0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852' })
      mockAmounts({ method: 'getAmountsOut', params: [amountInBN, path], amounts: [amountInBN, amountViaBN, amountOutMinBN] })

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

      mockDecimals({ provider, blockchain, address: tokenIn, value: decimalsIn })
      mockDecimals({ provider, blockchain, address: tokenOut, value: decimalsOut })
      
      mockPair({ provider, tokenIn, tokenOut, pair: CONSTANTS[blockchain].ZERO })
      mockPair({ provider, tokenIn, tokenOut: CONSTANTS[blockchain].WRAPPED, pair: CONSTANTS[blockchain].ZERO })

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

  describe('route BNB to token', ()=>{

    let tokenIn = CONSTANTS[blockchain].NATIVE
    let decimalsIn = CONSTANTS[blockchain].DECIMALS
    let tokenOut = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56'
    let decimalsOut = 18
    let path = [tokenIn, CONSTANTS[blockchain].WRAPPED, tokenOut]

    it('routes a BNB to token swap for given amountOut without given amountInMax on pancakeswap', async ()=> {

      let amountOut = 1
      let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
      let fetchedAmountIn = 43
      let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)

      mockPair({ provider, tokenIn: CONSTANTS[blockchain].WRAPPED, tokenOut, pair })
      mockAmounts({ method: 'getAmountsIn', params: [amountOutBN,[CONSTANTS[blockchain].WRAPPED,tokenOut]], amounts: [fetchedAmountInBN, amountOutBN] })

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

    it('routes a BNB to token swap for given amountIn without given amountOutMin on pancakeswap', async ()=> {

      let amountIn = 1
      let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
      let fetchedAmountOut = 43
      let fetchedAmountOutBN = ethers.utils.parseUnits(fetchedAmountOut.toString(), decimalsOut)
      let path = [tokenIn, CONSTANTS[blockchain].WRAPPED, tokenOut]

      mockPair({ provider, tokenIn: CONSTANTS[blockchain].WRAPPED, tokenOut, pair })
      mockAmounts({ method: 'getAmountsOut', params: [amountInBN,[CONSTANTS[blockchain].WRAPPED,tokenOut]], amounts: [amountInBN, fetchedAmountOutBN] })

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

    it('routes a BNB to token swap for given amountOut and amountInMax on pancakeswap', async ()=> {

      let amountOut = 1
      let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
      let amountInMax = 32
      let amountInMaxBN = ethers.utils.parseUnits(amountInMax.toString(), decimalsIn)
      let path = [tokenIn, CONSTANTS[blockchain].WRAPPED, tokenOut]

      mockPair({ provider, tokenIn: CONSTANTS[blockchain].WRAPPED, tokenOut, pair })
      mockAmounts({ method: 'getAmountsIn', params: [amountOutBN,[CONSTANTS[blockchain].WRAPPED,tokenOut]], amounts: [amountInMaxBN, amountOutBN] })

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

    it('routes a BNB to token swap for given amountIn and amountOutMin on pancakeswap', async ()=> {

      let amountOutMin = 1
      let amountOutMinBN = ethers.utils.parseUnits(amountOutMin.toString(), decimalsOut)
      let amountIn = 32
      let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
      let path = [tokenIn, CONSTANTS[blockchain].WRAPPED, tokenOut]

      mockPair({ provider, tokenIn: CONSTANTS[blockchain].WRAPPED, tokenOut, pair })
      mockAmounts({ method: 'getAmountsOut', params: [amountInBN,[CONSTANTS[blockchain].WRAPPED,tokenOut]], amounts: [amountInBN, amountOutMinBN] })

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

  describe('route token to BNB', ()=>{

    let tokenIn = '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82'
    let decimalsIn = 18
    let tokenOut = CONSTANTS[blockchain].NATIVE
    let decimalsOut = CONSTANTS[blockchain].DECIMALS
    let path = [tokenIn, CONSTANTS[blockchain].WRAPPED, tokenOut]

    it('routes a token to BNB swap for given amountOut without given amountInMax on pancakeswap', async ()=> {

      let amountOut = 1
      let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
      let fetchedAmountIn = 43
      let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)

      mockPair({ provider, tokenIn, tokenOut: CONSTANTS[blockchain].WRAPPED, pair })
      mockAmounts({ method: 'getAmountsIn', params: [amountOutBN,[tokenIn, CONSTANTS[blockchain].WRAPPED]], amounts: [fetchedAmountInBN, amountOutBN] })

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

    it('routes a token to BNB swap for given amountIn without given amountOutMin on pancakeswap', async ()=> {

      let amountIn = 1
      let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
      let fetchedAmountOut = 43
      let fetchedAmountOutBN = ethers.utils.parseUnits(fetchedAmountOut.toString(), decimalsOut)
      let path = [tokenIn, CONSTANTS[blockchain].WRAPPED, tokenOut]

      mockPair({ provider, tokenIn, tokenOut: CONSTANTS[blockchain].WRAPPED, pair })
      mockAmounts({ method: 'getAmountsOut', params: [amountInBN,[tokenIn, CONSTANTS[blockchain].WRAPPED]], amounts: [amountInBN, fetchedAmountOutBN] })

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

    it('routes a token to BNB swap for given amountOut and amountInMax on pancakeswap', async ()=> {

      let amountOut = 1
      let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
      let amountInMax = 32
      let amountInMaxBN = ethers.utils.parseUnits(amountInMax.toString(), decimalsIn)
      let path = [tokenIn, CONSTANTS[blockchain].WRAPPED, tokenOut]

      mockPair({ provider, tokenIn, tokenOut: CONSTANTS[blockchain].WRAPPED, pair })
      mockAmounts({ method: 'getAmountsIn', params: [amountOutBN,[tokenIn, CONSTANTS[blockchain].WRAPPED]], amounts: [amountInMaxBN, amountOutBN] })

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

    it('routes a token to BNB swap for given amountIn and amountOutMin on pancakeswap', async ()=> {

      let amountOutMin = 1
      let amountOutMinBN = ethers.utils.parseUnits(amountOutMin.toString(), decimalsOut)
      let amountIn = 32
      let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
      let path = [tokenIn, CONSTANTS[blockchain].WRAPPED, tokenOut]

      mockPair({ provider, tokenIn, tokenOut: CONSTANTS[blockchain].WRAPPED, pair })
      mockAmounts({ method: 'getAmountsOut', params: [amountInBN,[tokenIn, CONSTANTS[blockchain].WRAPPED]], amounts: [amountInBN, amountOutMinBN] })

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

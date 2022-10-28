import Route from 'src/classes/Route'
import { CONSTANTS } from '@depay/web3-constants'
import { ethers } from 'ethers'
import { find } from 'src/index.evm'
import { mock, resetMocks, anything } from '@depay/web3-mock'
import { mockDecimals } from 'tests/mocks/token'
import { mockPair, mockAmounts } from 'tests/mocks/quickswap'
import { resetCache, getProvider } from '@depay/web3-client-evm'
import { testRouting } from 'tests/helpers/testRouting'

describe('quickswap', () => {
  
  const blockchain = 'polygon'
  const accounts = ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045']
  const exchange = find('polygon', 'quickswap')
  const pair = '0xEF8cD6Cb5c841A4f02986e8A8ab3cC545d1B8B6d'
  const fromAddress = '0x5Af489c8786A018EC4814194dC8048be1007e390'
  const toAddress = '0x5Af489c8786A018EC4814194dC8048be1007e390'
  
  let provider
  beforeEach(async ()=>{
    resetMocks()
    resetCache()
    provider = await getProvider(blockchain)
    mock({ blockchain, accounts: { return: accounts } })
  })

  describe('basic routing', ()=>{

    it('does not try to find a route from and to the same token, as that doesnt make any sense on quickswap', async ()=> {

      mock(blockchain)

      const amountOut = 5
      const amountOutBN = ethers.utils.parseUnits(amountOut.toString(), 18)
      const amountIn = 5

      const route = await exchange.route({
        tokenIn: '0xa0bed124a09ac2bd941b10349d8d224fe3c955eb',
        tokenOut: '0xa0bed124a09ac2bd941b10349d8d224fe3c955eb',
        amountInMax: amountIn,
        amountOut,
        fromAddress,
        toAddress
      })

      expect(route).toEqual(undefined)
    })

    it('returns undefined and does not fail or reject in case an error happens during the routing on quickswap', async ()=> {

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

      mockDecimals({ provider, blockchain, address: tokenIn, value: decimalsIn })
      mockDecimals({ provider, blockchain, address: tokenOut, value: decimalsOut })
      mockPair({ provider, tokenIn, tokenOut, pair })
      mock({
        provider,
        blockchain,
        request: {
          to: exchange.router.address,
          api: exchange.router.api,
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

    it('routes a token to token swap for given amountOut on quickswap', async ()=> {

      let amountOut = 1
      let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
      let fetchedAmountIn = 43
      let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)
      let slippage = ethers.BigNumber.from('215000000000000000')

      mockPair({ provider, tokenIn, tokenOut, pair })
      mockAmounts({ provider, method: 'getAmountsIn', params: [amountOutBN,path], amounts: [fetchedAmountInBN, amountOutBN] })

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
          to: exchange.router.address,
          api: exchange.router.api,
          method: 'swapTokensForExactTokens',
          params: {
            amountInMax: fetchedAmountInBN.add(slippage),
            amountOut: amountOutBN,
            path: path,
            to: toAddress
          }
        }
      })
    });

    it('fixes lowercase token addresses given either as tokenIn or tokenOut', async ()=> {

      let amountOut = 1
      let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
      let fetchedAmountIn = 43
      let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)
      let slippage = ethers.BigNumber.from('215000000000000000')

      mockPair({ provider, tokenIn, tokenOut, pair })
      mockAmounts({ provider, method: 'getAmountsIn', params: [amountOutBN,path], amounts: [fetchedAmountInBN, amountOutBN] })

      await testRouting({
        blockchain,
        exchange,
        tokenIn: tokenIn.toLowerCase(),
        decimalsIn,
        tokenOut: tokenOut.toLowerCase(),
        decimalsOut,
        path,
        amountOut,
        pair,
        fromAddress,
        toAddress,
        transaction: {
          to: exchange.router.address,
          api: exchange.router.api,
          method: 'swapTokensForExactTokens',
          params: {
            amountInMax: fetchedAmountInBN.add(slippage),
            amountOut: amountOutBN,
            path: path,
            to: toAddress
          }
        }
      })
    });

    it('routes a token to token swap for given amountOutMin without given amountIn on quickswap', async ()=> {

      let amountOutMin = 1
      let amountOutMinBN = ethers.utils.parseUnits(amountOutMin.toString(), decimalsOut)
      let fetchedAmountIn = 43
      let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)
      let slippage = ethers.BigNumber.from('215000000000000000')

      mockPair({ provider, tokenIn, tokenOut, pair })
      mockAmounts({ provider, method: 'getAmountsIn', params: [amountOutMinBN,path], amounts: [fetchedAmountInBN, amountOutMinBN] })

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
          to: exchange.router.address,
          api: exchange.router.api,
          method: 'swapExactTokensForTokens',
          params: {
            amountIn: fetchedAmountInBN.add(slippage),
            amountOutMin: amountOutMinBN,
            path: path,
            to: toAddress
          }
        }
      })
    });

    it('routes a token to token swap for given amountIn on quickswap', async ()=> {

      let amountIn = 1
      let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
      let fetchedAmountOut = 43
      let fetchedAmountOutBN = ethers.utils.parseUnits(fetchedAmountOut.toString(), decimalsOut)
      let path = [tokenIn, tokenOut]

      mockPair({ provider, tokenIn, tokenOut, pair })
      mockAmounts({ provider, method: 'getAmountsOut', params: [amountInBN,path], amounts: [amountInBN, fetchedAmountOutBN] })

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
          to: exchange.router.address,
          api: exchange.router.api,
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

    it('routes a token to token swap for given amountInMax without given amountOut on quickswap', async ()=> {

      let amountInMax = 1
      let amountInMaxBN = ethers.utils.parseUnits(amountInMax.toString(), decimalsIn)
      let fetchedAmountOut = 43
      let fetchedAmountOutBN = ethers.utils.parseUnits(fetchedAmountOut.toString(), decimalsOut)
      let path = [tokenIn, tokenOut]

      mockPair({ provider, tokenIn, tokenOut, pair })
      mockAmounts({ provider, method: 'getAmountsOut', params: [amountInMaxBN, path], amounts: [amountInMaxBN, fetchedAmountOutBN] })

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
          to: exchange.router.address,
          api: exchange.router.api,
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

    it('routes a token to token swap for given amountOut and amountInMax on quickswap', async ()=> {

      let amountOut = 1
      let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
      let amountInMax = 32
      let amountInMaxBN = ethers.utils.parseUnits(amountInMax.toString(), decimalsIn)
      let slippage = ethers.BigNumber.from('160000000000000000')
      let path = [tokenIn, tokenOut]

      mockPair({ provider, tokenIn, tokenOut, pair })
      mockAmounts({ provider, method: 'getAmountsIn', params: [amountOutBN,path], amounts: [amountInMaxBN, amountOutBN] })

      await testRouting({
        blockchain,
        exchange,
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        amountOut,
        path,
        pair,
        fromAddress,
        toAddress,
        transaction: {
          to: exchange.router.address,
          api: exchange.router.api,
          method: 'swapTokensForExactTokens',
          params: {
            amountInMax: amountInMaxBN.add(slippage),
            amountOut:  amountOutBN,
            path: [tokenIn, tokenOut],
            to: toAddress
          }
        },
      })
    });

    it('routes a token to token swap for given amountIn and amountOutMin on quickswap', async ()=> {

      let amountOutMin = 1
      let amountOutMinBN = ethers.utils.parseUnits(amountOutMin.toString(), decimalsOut)
      let fetchedAmountIn = 32
      let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)
      let slippage = ethers.BigNumber.from('160000000000000000')
      let path = [tokenIn, tokenOut]

      mockPair({ provider, tokenIn, tokenOut, pair })
      mockAmounts({ provider, method: 'getAmountsIn', params: [amountOutMinBN, path], amounts: [fetchedAmountInBN, amountOutMinBN] })

      await testRouting({
        blockchain,
        exchange,
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        amountOutMin,
        path,
        pair,
        fromAddress,
        toAddress,
        transaction: {
          to: exchange.router.address,
          api: exchange.router.api,
          method: 'swapExactTokensForTokens',
          params: {
            amountIn: fetchedAmountInBN.add(slippage),
            amountOutMin: amountOutMinBN,
            path: path,
            to: toAddress
          }
        },
      })
    });

    it('routes a token to token swap on quickswap also if the routing path is via another token A->B->C', async ()=> {
      let amountOutMin = 1
      let amountOutMinBN = ethers.utils.parseUnits(amountOutMin.toString(), decimalsOut)
      let fetchedAmountIn = 32
      let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)
      let slippage = ethers.BigNumber.from('160000000000000000')

      let tokenVia = CONSTANTS[blockchain].WRAPPED
      let amountVia = 0.1
      let amountViaBN = ethers.utils.parseUnits(amountVia.toString(), CONSTANTS[blockchain].DECIMALS)

      path = [tokenIn, tokenVia, tokenOut]

      mockPair({ provider, tokenIn, tokenOut, pair: CONSTANTS[blockchain].ZERO })
      mockPair({ provider, tokenIn, tokenOut: tokenVia, pair: '0xef8cd6cb5c841a4f02986e8a8ab3cc545d1b8b6d' })
      mockPair({ provider, tokenIn: tokenOut, tokenOut: tokenVia, pair: '0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852' })
      mockAmounts({ provider, method: 'getAmountsIn', params: [amountOutMinBN, path], amounts: [fetchedAmountInBN, amountOutMinBN] })

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
          to: exchange.router.address,
          api: exchange.router.api,
          method: 'swapExactTokensForTokens',
          params: {
            amountIn: fetchedAmountInBN.add(slippage),
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
      mockPair({ provider, tokenIn, tokenOut: CONSTANTS[blockchain].USD, pair: CONSTANTS[blockchain].ZERO })

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

    it('routes a token to token swap on quickswap also if the routing path is via TOKEN_A->USD->WRAPPED->TOKEN_B', async ()=> {
      let amountOutMin = 1
      let amountOutMinBN = ethers.utils.parseUnits(amountOutMin.toString(), decimalsOut)
      let fetchedAmountIn = 32
      let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)
      let slippage = ethers.BigNumber.from('160000000000000000')
      let amountWRAPPED = 0.1
      let amountWRAPPEDBN = ethers.utils.parseUnits(amountWRAPPED.toString(), CONSTANTS[blockchain].DECIMALS)
      let amountUSD = 420
      let amountUSDBN = ethers.utils.parseUnits(amountUSD.toString(), CONSTANTS[blockchain].DECIMALS)

      path = [tokenIn, CONSTANTS[blockchain].USD, CONSTANTS[blockchain].WRAPPED, tokenOut]

      mockDecimals({ provider, blockchain, address: CONSTANTS[blockchain].USD, value: CONSTANTS[blockchain].DECIMALS })
      mockPair({ provider, tokenIn, tokenOut, pair: CONSTANTS[blockchain].ZERO })
      mockPair({ provider, tokenIn, tokenOut: CONSTANTS[blockchain].WRAPPED, pair: CONSTANTS[blockchain].ZERO })
      mockPair({ provider, tokenIn, tokenOut: CONSTANTS[blockchain].USD, pair: '0xef8cd6cb5c841a4f02986e8a8ab3cc545d1b8b6d' })
      mockPair({ provider, tokenIn: CONSTANTS[blockchain].WRAPPED, tokenOut, pair: '0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852' })
      mockAmounts({ provider, method: 'getAmountsIn', params: [amountOutMinBN, path], amounts: [fetchedAmountInBN, amountUSDBN, amountWRAPPEDBN, amountOutMinBN] })

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
          to: exchange.router.address,
          api: exchange.router.api,
          method: 'swapExactTokensForTokens',
          params: {
            amountIn: fetchedAmountInBN.add(slippage),
            amountOutMin: amountOutMinBN,
            path: path,
            to: toAddress
          }
        }
      })
    })

    it('routes a token to token swap on quickswap also if the routing path is via TOKEN_A->WRAPPED->USD->TOKEN_B', async ()=> {
      let amountOutMin = 1
      let amountOutMinBN = ethers.utils.parseUnits(amountOutMin.toString(), decimalsOut)
      let fetchedAmountIn = 32
      let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)
      let slippage = ethers.BigNumber.from('160000000000000000')
      let amountWRAPPED = 0.1
      let amountWRAPPEDBN = ethers.utils.parseUnits(amountWRAPPED.toString(), CONSTANTS[blockchain].DECIMALS)
      let amountUSD = 420
      let amountUSDBN = ethers.utils.parseUnits(amountUSD.toString(), CONSTANTS[blockchain].DECIMALS)

      path = [tokenIn, CONSTANTS[blockchain].WRAPPED, CONSTANTS[blockchain].USD, tokenOut]

      mockDecimals({ provider, blockchain, address: CONSTANTS[blockchain].USD, value: CONSTANTS[blockchain].DECIMALS })
      mockPair({ provider, tokenIn, tokenOut, pair: CONSTANTS[blockchain].ZERO })
      mockPair({ provider, tokenIn, tokenOut: CONSTANTS[blockchain].USD, pair: CONSTANTS[blockchain].ZERO })
      mockPair({ provider, tokenIn, tokenOut: CONSTANTS[blockchain].WRAPPED, pair: '0xef8cd6cb5c841a4f02986e8a8ab3cc545d1b8b6d' })
      mockPair({ provider, tokenIn: tokenOut, tokenOut: CONSTANTS[blockchain].WRAPPED, pair: CONSTANTS[blockchain].ZERO })
      mockPair({ provider, tokenIn: CONSTANTS[blockchain].USD, tokenOut, pair: '0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852' })
      mockAmounts({ provider, method: 'getAmountsIn', params: [amountOutMinBN, path], amounts: [fetchedAmountInBN, amountWRAPPEDBN, amountUSDBN, amountOutMinBN] })

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
          to: exchange.router.address,
          api: exchange.router.api,
          method: 'swapExactTokensForTokens',
          params: {
            amountIn: fetchedAmountInBN.add(slippage),
            amountOutMin: amountOutMinBN,
            path: path,
            to: toAddress
          }
        }
      })
    })
  })

  describe('route ETH to token', ()=>{

    let tokenIn = CONSTANTS[blockchain].NATIVE
    let decimalsIn = CONSTANTS[blockchain].DECIMALS
    let tokenOut = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    let decimalsOut = 6
    let path = [tokenIn, CONSTANTS[blockchain].WRAPPED, tokenOut]

    it('routes a ETH to token swap for given amountOut without given amountInMax on quickswap', async ()=> {

      let amountOut = 1
      let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
      let fetchedAmountIn = 43
      let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)
      let slippage = ethers.BigNumber.from('215000000000000000')

      mockPair({ provider, tokenIn: CONSTANTS[blockchain].WRAPPED, tokenOut, pair })
      mockAmounts({ provider, method: 'getAmountsIn', params: [amountOutBN,[CONSTANTS[blockchain].WRAPPED,tokenOut]], amounts: [fetchedAmountInBN, amountOutBN] })

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
          to: exchange.router.address,
          api: exchange.router.api,
          method: 'swapETHForExactTokens',
          params: {
            amountOut: amountOutBN,
            path: [CONSTANTS[blockchain].WRAPPED, tokenOut],
            to: toAddress
          },
          value: fetchedAmountInBN.add(slippage)
        }
      })
    });

    it('routes a ETH to token swap for given amountIn on quickswap', async ()=> {

      let amountIn = 1
      let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
      let fetchedAmountOut = 43
      let fetchedAmountOutBN = ethers.utils.parseUnits(fetchedAmountOut.toString(), decimalsOut)
      let path = [tokenIn, CONSTANTS[blockchain].WRAPPED, tokenOut]

      mockPair({ provider, tokenIn: CONSTANTS[blockchain].WRAPPED, tokenOut, pair })
      mockAmounts({ provider, method: 'getAmountsOut', params: [amountInBN,[CONSTANTS[blockchain].WRAPPED,tokenOut]], amounts: [amountInBN, fetchedAmountOutBN] })

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
          to: exchange.router.address,
          api: exchange.router.api,
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

    it('routes a ETH to token swap for given amountOut on quickswap', async ()=> {

      let amountOut = 1
      let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
      let amountInMax = 32
      let amountInMaxBN = ethers.utils.parseUnits(amountInMax.toString(), decimalsIn)
      let slippage = ethers.BigNumber.from('160000000000000000')
      let path = [tokenIn, CONSTANTS[blockchain].WRAPPED, tokenOut]

      mockPair({ provider, tokenIn: CONSTANTS[blockchain].WRAPPED, tokenOut, pair })
      mockAmounts({ provider, method: 'getAmountsIn', params: [amountOutBN,[CONSTANTS[blockchain].WRAPPED,tokenOut]], amounts: [amountInMaxBN, amountOutBN] })

      await testRouting({
        blockchain,
        exchange,
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        amountOut,
        path,
        pair,
        fromAddress,
        toAddress,
        transaction: {
          to: exchange.router.address,
          api: exchange.router.api,
          method: 'swapETHForExactTokens',
          params: {
            amountOut:  amountOutBN,
            path: [CONSTANTS[blockchain].WRAPPED, tokenOut],
            to: toAddress
          },
          value: amountInMaxBN.add(slippage)
        },
      })
    });

    it('routes a ETH to token swap for given amountIn on quickswap', async ()=> {

      let amountOutMin = 1
      let amountOutMinBN = ethers.utils.parseUnits(amountOutMin.toString(), decimalsOut)
      let fetchedAmountIn = 32
      let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)
      let slippage = ethers.BigNumber.from('160000000000000000')
      let path = [tokenIn, CONSTANTS[blockchain].WRAPPED, tokenOut]

      mockPair({ provider, tokenIn: CONSTANTS[blockchain].WRAPPED, tokenOut, pair })
      mockAmounts({ provider, method: 'getAmountsIn', params: [amountOutMinBN, [CONSTANTS[blockchain].WRAPPED,tokenOut]], amounts: [fetchedAmountInBN, amountOutMinBN] })

      await testRouting({
        blockchain,
        exchange,
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        amountOutMin,
        path,
        pair,
        fromAddress,
        toAddress,
        transaction: {
          to: exchange.router.address,
          api: exchange.router.api,
          method: 'swapExactETHForTokens',
          params: {
            amountOutMin: amountOutMinBN,
            path: [CONSTANTS[blockchain].WRAPPED,tokenOut],
            to: toAddress
          },
          value: fetchedAmountInBN.add(slippage)
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

    it('routes a token to ETH swap for given amountOut on quickswap', async ()=> {

      let amountOut = 1
      let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
      let fetchedAmountIn = 43
      let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)
      let slippage = ethers.BigNumber.from('215000000000000000')

      mockPair({ provider, tokenIn, tokenOut: CONSTANTS[blockchain].WRAPPED, pair })
      mockAmounts({ provider, method: 'getAmountsIn', params: [amountOutBN,[tokenIn, CONSTANTS[blockchain].WRAPPED]], amounts: [fetchedAmountInBN, amountOutBN] })

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
          to: exchange.router.address,
          api: exchange.router.api,
          method: 'swapTokensForExactETH',
          params: {
            amountInMax: fetchedAmountInBN.add(slippage),
            amountOut: amountOutBN,
            path: [tokenIn, CONSTANTS[blockchain].WRAPPED],
            to: toAddress
          }
        }
      })
    });

    it('routes a token to ETH swap for given amountIn on quickswap', async ()=> {

      let amountIn = 1
      let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
      let fetchedAmountOut = 43
      let fetchedAmountOutBN = ethers.utils.parseUnits(fetchedAmountOut.toString(), decimalsOut)
      let path = [tokenIn, CONSTANTS[blockchain].WRAPPED, tokenOut]

      mockPair({ provider, tokenIn, tokenOut: CONSTANTS[blockchain].WRAPPED, pair })
      mockAmounts({ provider, method: 'getAmountsOut', params: [amountInBN,[tokenIn, CONSTANTS[blockchain].WRAPPED]], amounts: [amountInBN, fetchedAmountOutBN] })

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
          to: exchange.router.address,
          api: exchange.router.api,
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

    it('routes a token to ETH swap for given amountOut and amountInMax on quickswap', async ()=> {

      let amountOut = 1
      let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
      let amountInMax = 32
      let amountInMaxBN = ethers.utils.parseUnits(amountInMax.toString(), decimalsIn)
      let slippage = ethers.BigNumber.from('160000000000000000')
      let path = [tokenIn, CONSTANTS[blockchain].WRAPPED, tokenOut]

      mockPair({ provider, tokenIn, tokenOut: CONSTANTS[blockchain].WRAPPED, pair })
      mockAmounts({ provider, method: 'getAmountsIn', params: [amountOutBN,[tokenIn, CONSTANTS[blockchain].WRAPPED]], amounts: [amountInMaxBN, amountOutBN] })

      await testRouting({
        blockchain,
        exchange,
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        amountOut,
        path,
        pair,
        fromAddress,
        toAddress,
        transaction: {
          to: exchange.router.address,
          api: exchange.router.api,
          method: 'swapTokensForExactETH',
          params: {
            amountInMax: amountInMaxBN.add(slippage),
            amountOut:  amountOutBN,
            path: [tokenIn, CONSTANTS[blockchain].WRAPPED],
            to: toAddress
          }
        },
      })
    });

    it('routes a token to ETH swap for given amountOutMin on quickswap', async ()=> {
      let amountOutMin = 1
      let amountOutMinBN = ethers.utils.parseUnits(amountOutMin.toString(), decimalsOut)
      let fetchedAmountIn = 32
      let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)
      let slippage = ethers.BigNumber.from('160000000000000000')
      let path = [tokenIn, CONSTANTS[blockchain].WRAPPED, tokenOut]

      mockPair({ provider, tokenIn, tokenOut: CONSTANTS[blockchain].WRAPPED, pair })
      mockAmounts({ provider, method: 'getAmountsIn', params: [amountOutMinBN, [tokenIn, CONSTANTS[blockchain].WRAPPED]], amounts: [fetchedAmountInBN, amountOutMinBN] })

      await testRouting({
        blockchain,
        exchange,
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        amountOutMin,
        path,
        pair,
        fromAddress,
        toAddress,
        transaction: {
          to: exchange.router.address,
          api: exchange.router.api,
          method: 'swapExactTokensForETH',
          params: {
            amountIn: fetchedAmountInBN.add(slippage),
            amountOutMin: amountOutMinBN,
            path: [tokenIn, CONSTANTS[blockchain].WRAPPED],
            to: toAddress
          }
        },
      })
    });
  })
});
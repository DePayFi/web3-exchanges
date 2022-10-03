import Raydium from 'src/exchanges/raydium/basics'
import Route from 'src/classes/Route'
import { CONSTANTS } from '@depay/web3-constants'
import { ethers } from 'ethers'
import { find } from 'src'
import { mock, resetMocks, anything } from '@depay/web3-mock'
import { mockPair, mockToken, mockTokenAccounts, mockMarket, mockTransactionKeys } from 'tests/mocks/raydium'
import { resetCache, provider } from '@depay/web3-client'
import { struct, u64, u8 } from '@depay/solana-web3.js'
import { testRouting } from 'tests/helpers/testRouting'

describe('raydium', () => {
  
  let blockchain = 'solana'
  const accounts = ['2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1']
  beforeEach(resetMocks)
  beforeEach(resetCache)
  beforeEach(()=>mock({ blockchain, provider: provider(blockchain), accounts: { return: accounts } }))

  let exchange = find('solana', 'raydium')
  let fromAddress = '2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1'
  let toAddress = '2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1'

  describe('basic routing', ()=>{

    it('does not try to find a route from and to the same token, as that doesnt make any sense', async ()=> {

      let amountOut = 5
      let amountIn = 5

      let route = await exchange.route({
        tokenIn: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        tokenOut: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        amountInMax: amountIn,
        amountOut,
        fromAddress,
        toAddress
      })

      expect(route).toEqual(undefined)
    })

    it('returns undefined and does not fail or reject in case an error happens during the routing', async ()=> {

      let tokenIn = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
      let tokenOut = CONSTANTS[blockchain].WRAPPED
      let amountOut = 1
      let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), CONSTANTS[blockchain].DECIMALS)
      let path = [tokenIn, tokenOut]

      mockToken({ symbol: 'WSOL', name: 'Wrapped SOL', mint: CONSTANTS[blockchain].WRAPPED, meta: CONSTANTS[blockchain].WRAPPED, decimals: CONSTANTS[blockchain].DECIMALS })
      mockPair({ tokenIn, tokenOut, _return: Error('Something went wrong!') })

      let route = await exchange.route({
        tokenIn: tokenIn,
        tokenOut: tokenOut,
        amountOut,
        fromAddress,
        toAddress
      })

      expect(route).toEqual(undefined)
    })
  })

   describe('route token to token', ()=>{

    let tokenIn = CONSTANTS[blockchain].USD
    let decimalsIn = CONSTANTS[blockchain].USD_DECIMALS
    let tokenOut = CONSTANTS[blockchain].WRAPPED
    let decimalsOut = CONSTANTS[blockchain].DECIMALS
    let path = [tokenIn, tokenOut]

    it('routes a token to token swap for given amountOut on raydium', async ()=> {

      let amountOut = 1
      let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
      let fetchedAmountIn = 43
      let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)
      let pair = '58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2'
      let market = '9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT'

      mockTokenAccounts({ owner: fromAddress, token: tokenIn, accounts: [] })
      mockTokenAccounts({ owner: fromAddress, token: tokenOut, accounts: [] })
      mockPair({ tokenIn, tokenOut, pair, market, 
        baseReserve: 300000000000000,
        quoteReserve: 10000000000000,
      })
      mockMarket({ market })

      await testRouting({
        provider: provider(blockchain),
        blockchain,
        exchange,
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        path,
        amountOut,
        fromAddress,
        toAddress,
        transaction: {
          blockchain,
          instructions: [{
            to: Raydium.pair.v4.address,
            api: struct([u8("instruction"), u64("amountIn"), u64("amountOut")]),
            params: {
              instruction: 11,
              amountIn: '33450402',
              amountOut: '1000000000',
            },
            keys: mockTransactionKeys({ pair, market, fromAddress })
          }]
        }
      })
    })

    it('routes a token to token swap for given amountOutMin on raydium', async ()=> {

      let amountOutMin = 1
      let amountOutMinBN = ethers.utils.parseUnits(amountOutMin.toString(), decimalsOut)
      let fetchedAmountIn = 43
      let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)
      let pair = '58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2'
      let market = '9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT'

      mockTokenAccounts({ owner: fromAddress, token: tokenIn, accounts: [] })
      mockTokenAccounts({ owner: fromAddress, token: tokenOut, accounts: [] })
      mockPair({ tokenIn, tokenOut, pair, market, 
        baseReserve: 300000000000000,
        quoteReserve: 10000000000000,
      })
      mockMarket({ market })

      await testRouting({
        provider: provider(blockchain),
        blockchain,
        exchange,
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        path,
        amountOutMin,
        fromAddress,
        toAddress,
        transaction: {
          blockchain,
          instructions: [{
            to: Raydium.pair.v4.address,
            api: struct([u8("instruction"), u64("amountIn"), u64("amountOut")]),
            params: {
              instruction: 9,
              amountIn: '33450402',
              amountOut: '1000000000',
            },
            keys: mockTransactionKeys({ pair, market, fromAddress })
          }]
        }
      })
    })

    it('routes a token to token swap for given amountIn on raydium', async ()=> {
      let amountOutMin = 1
      let amountOutMinBN = ethers.utils.parseUnits(amountOutMin.toString(), decimalsOut)
      let amountIn = 43
      let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
      let pair = '58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2'
      let market = '9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT'

      mockTokenAccounts({ owner: fromAddress, token: tokenIn, accounts: [] })
      mockTokenAccounts({ owner: fromAddress, token: tokenOut, accounts: [] })
      mockPair({ tokenIn, tokenOut, pair, market, 
        baseReserve: 300000000000000,
        quoteReserve: 10000000000000,
      })
      mockMarket({ market })

      await testRouting({
        provider: provider(blockchain),
        blockchain,
        exchange,
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        path,
        amountIn,
        fromAddress,
        toAddress,
        transaction: {
          blockchain,
          instructions: [{
            to: Raydium.pair.v4.address,
            api: struct([u8("instruction"), u64("amountIn"), u64("amountOut")]),
            params: {
              instruction: 9,
              amountIn: '43000000',
              amountOut: '1286769480',
            },
            keys: mockTransactionKeys({ pair, market, fromAddress })
          }]
        }
      })
    })

    it('routes a token to token swap for given amountInMax on raydium', async ()=> {
      let amountOutMin = 1
      let amountOutMinBN = ethers.utils.parseUnits(amountOutMin.toString(), decimalsOut)
      let amountInMax = 43
      let amountInMaxBN = ethers.utils.parseUnits(amountInMax.toString(), decimalsIn)
      let pair = '58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2'
      let market = '9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT'

      mockTokenAccounts({ owner: fromAddress, token: tokenIn, accounts: [] })
      mockTokenAccounts({ owner: fromAddress, token: tokenOut, accounts: [] })
      mockPair({ tokenIn, tokenOut, pair, market, 
        baseReserve: 300000000000000,
        quoteReserve: 10000000000000,
      })
      mockMarket({ market })

      await testRouting({
        provider: provider(blockchain),
        blockchain,
        exchange,
        tokenIn,
        decimalsIn,
        tokenOut,
        decimalsOut,
        path,
        amountInMax,
        fromAddress,
        toAddress,
        transaction: {
          blockchain,
          instructions: [{
            to: Raydium.pair.v4.address,
            api: struct([u8("instruction"), u64("amountIn"), u64("amountOut")]),
            params: {
              instruction: 11,
              amountIn: '43000000',
              amountOut: '1286769480',
            },
            keys: mockTransactionKeys({ pair, market, fromAddress })
          }]
        }
      })
    })
  })
})

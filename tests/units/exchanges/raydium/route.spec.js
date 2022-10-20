import Raydium from 'src/exchanges/raydium/basics'
import Route from 'src/classes/Route'
import { CONSTANTS } from '@depay/web3-constants'
import { ethers } from 'ethers'
import { find } from 'src'
import { mock, anything, resetMocks } from '@depay/web3-mock'
import { mockPair, mockToken, mockTokenAccounts, mockMarket, mockTransactionKeys, mockRent } from 'tests/mocks/raydium'
import { resetCache, getProvider } from '@depay/web3-client'
import { struct, u64, u32, u8, publicKey, BN } from '@depay/solana-web3.js'
import { testRouting } from 'tests/helpers/testRouting'
import { Token } from '@depay/web3-tokens'

describe('raydium', () => {
  
  const blockchain = 'solana'
  const accounts = ['2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1']
  const exchange = find('solana', 'raydium')
  const fromAddress = '2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1'
  const toAddress = '2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1'
  
  let provider
  beforeEach(async ()=>{
    resetMocks()
    resetCache()
    provider = await getProvider(blockchain)
    mock({ provider, blockchain, accounts: { return: accounts } })
  })

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

  describe('route token to token via 1 pool without any existing token accounts', ()=>{

    let tokenIn = CONSTANTS[blockchain].USD
    let decimalsIn = CONSTANTS[blockchain].USD_DECIMALS
    let tokenOut = CONSTANTS[blockchain].WRAPPED
    let decimalsOut = CONSTANTS[blockchain].DECIMALS
    let path = [tokenIn, tokenOut]

    it('routes a token to token swap via 1 pool for given amountOut on raydium', async ()=> {

      let amountOut = 1
      let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
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
        provider,
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
            keys: mockTransactionKeys({
              pair,
              market,
              marketAuthority: 'F8Vyqk3unwxkXukZFQeYyGmFfTG3CAX4v24iyrjEYBJV',
              fromAddress,
              tokenAccountIn: 'F7e4iBrxoSmHhEzhuBcXXs1KAknYvEoZWieiocPvrCD9',
              tokenAccountOut: '5nrTLrjSCNQ4uTVr9BxBUcwf4G4Dwuo8H5wQAQgxand8'
            })
          }]
        }
      })
    })

    it('routes a token to token swap via 1 pool for given amountOutMin on raydium', async ()=> {

      let amountOutMin = 1
      let amountOutMinBN = ethers.utils.parseUnits(amountOutMin.toString(), decimalsOut)
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
        provider,
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
            keys: mockTransactionKeys({
              pair,
              market,
              marketAuthority: 'F8Vyqk3unwxkXukZFQeYyGmFfTG3CAX4v24iyrjEYBJV',
              fromAddress,
              tokenAccountIn: 'F7e4iBrxoSmHhEzhuBcXXs1KAknYvEoZWieiocPvrCD9',
              tokenAccountOut: '5nrTLrjSCNQ4uTVr9BxBUcwf4G4Dwuo8H5wQAQgxand8'
            })
          }]
        }
      })
    })

    it('routes a token to token swap via 1 pool for given amountIn on raydium', async ()=> {
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
        provider,
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
              amountOut: '1285482711',
            },
            keys: mockTransactionKeys({
              pair,
              market,
              marketAuthority: 'F8Vyqk3unwxkXukZFQeYyGmFfTG3CAX4v24iyrjEYBJV',
              fromAddress,
              tokenAccountIn: 'F7e4iBrxoSmHhEzhuBcXXs1KAknYvEoZWieiocPvrCD9',
              tokenAccountOut: '5nrTLrjSCNQ4uTVr9BxBUcwf4G4Dwuo8H5wQAQgxand8'
            })
          }]
        }
      })
    })

    it('routes a token to token swap via 1 pool for given amountInMax on raydium', async ()=> {
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
        provider,
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
              amountOut: '1285482711',
            },
            keys: mockTransactionKeys({
              pair,
              market,
              marketAuthority: 'F8Vyqk3unwxkXukZFQeYyGmFfTG3CAX4v24iyrjEYBJV',
              fromAddress,
              tokenAccountIn: 'F7e4iBrxoSmHhEzhuBcXXs1KAknYvEoZWieiocPvrCD9',
              tokenAccountOut: '5nrTLrjSCNQ4uTVr9BxBUcwf4G4Dwuo8H5wQAQgxand8'
            })
          }]
        }
      })
    })
  })

  describe('route NATIVE to token via 1 pool without any existing token accounts', ()=>{

    let tokenIn = CONSTANTS[blockchain].NATIVE
    let decimalsIn = CONSTANTS[blockchain].DECIMALS
    let tokenOut = CONSTANTS[blockchain].USD
    let decimalsOut = CONSTANTS[blockchain].USD_DECIMALS
    let path = [tokenIn, tokenOut]

    it('routes NATIVE to token swap via 1 pool for given amountOut on raydium', async ()=> {

      let amountOut = 1
      let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
      let pair = '58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2'
      let market = '9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT'

      mockTokenAccounts({ owner: fromAddress, token: CONSTANTS.solana.WRAPPED, accounts: [] })
      mockTokenAccounts({ owner: fromAddress, token: tokenOut, accounts: [] })
      mockPair({ tokenIn: CONSTANTS.solana.WRAPPED, tokenOut, pair, market, 
        baseReserve: 300000000000000,
        quoteReserve: 10000000000000,
      })
      mockMarket({ market })
      mockRent({ rent: 2039280 })

      await testRouting({
        provider,
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
          instructions: [
            {
              to: '11111111111111111111111111111111',
              api: struct([u32("instruction"), u64("lamports"), u64("space"), publicKey("programId")]),
              params: {
                instruction: 0,
                lamports: '32264845',
                space: Token.solana.TOKEN_LAYOUT.span,
                programId: Token.solana.TOKEN_PROGRAM
              }
            },{
              to: Token.solana.TOKEN_PROGRAM,
              api: struct([u8("instruction"), publicKey("owner")]),
              params: {
                instruction: 18,
                owner: fromAddress,
              }
            },{
              to: Raydium.pair.v4.address,
              api: struct([u8("instruction"), u64("amountIn"), u64("amountOut")]),
              params: {
                instruction: 11,
                amountIn: '30225565',
                amountOut: '1000000',
              },
              keys: mockTransactionKeys({
                pair,
                market,
                marketAuthority: 'F8Vyqk3unwxkXukZFQeYyGmFfTG3CAX4v24iyrjEYBJV',
                fromAddress,
                tokenAccountIn: anything,
                tokenAccountOut: 'F7e4iBrxoSmHhEzhuBcXXs1KAknYvEoZWieiocPvrCD9'
              })
            }, {
              to: Token.solana.TOKEN_PROGRAM,
              api: struct([u8("instruction")]),
              params: { instruction: 9 }
            }
          ]
        }
      })
    })
  })

  describe('route token to NATIVE via 1 pool without any token accounts', ()=>{

    let tokenIn = CONSTANTS[blockchain].USD
    let decimalsIn = CONSTANTS[blockchain].USD_DECIMALS
    let tokenOut = CONSTANTS[blockchain].NATIVE
    let decimalsOut = CONSTANTS[blockchain].DECIMALS
    let path = [tokenIn, tokenOut]

    it('routes token to NATIVE swap via 1 pool for given amountOut on raydium', async ()=> {

      let amountOut = 1
      let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
      let pair = '58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2'
      let market = '9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT'

      mockTokenAccounts({ owner: fromAddress, token: tokenIn, accounts: [] })
      mockTokenAccounts({ owner: fromAddress, token: CONSTANTS.solana.WRAPPED, accounts: [] })
      mockPair({ tokenIn, tokenOut: CONSTANTS.solana.WRAPPED, pair, market, 
        baseReserve: 300000000000000,
        quoteReserve: 10000000000000,
      })
      mockMarket({ market })
      mockRent({ rent: 2039280 })

      await testRouting({
        provider,
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
          instructions: [
            {
              to: '11111111111111111111111111111111',
              api: struct([u32("instruction"), u64("lamports"), u64("space"), publicKey("programId")]),
              params: {
                instruction: 0,
                lamports: '2039280',
                space: Token.solana.TOKEN_LAYOUT.span,
                programId: Token.solana.TOKEN_PROGRAM
              }
            },{
              to: Token.solana.TOKEN_PROGRAM,
              api: struct([u8("instruction"), publicKey("owner")]),
              params: {
                instruction: 18,
                owner: fromAddress,
              }
            },{
              to: Raydium.pair.v4.address,
              api: struct([u8("instruction"), u64("amountIn"), u64("amountOut")]),
              params: {
                instruction: 11,
                amountIn: '33450402',
                amountOut: '1000000000',
              },
              keys: mockTransactionKeys({
                pair,
                market,
                marketAuthority: 'F8Vyqk3unwxkXukZFQeYyGmFfTG3CAX4v24iyrjEYBJV',
                fromAddress,
                tokenAccountIn: 'F7e4iBrxoSmHhEzhuBcXXs1KAknYvEoZWieiocPvrCD9',
                tokenAccountOut: anything
              })
            },{
              to: Token.solana.TOKEN_PROGRAM,
              api: struct([u8("instruction")]),
              params: { instruction: 9 }
            }
          ]
        }
      })
    })
  })

  describe('route token to token via 2 pools without any token accounts', ()=>{

    let tokenIn = '9LzCMqDgTKYz9Drzqnpgee3SGa89up3a247ypMj2xrqM' // AUDIUS
    let decimalsIn = 8
    let tokenMiddle = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' // USDC
    let decimalsMiddle = 6
    let tokenOut = 'StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT' // STEPN
    let decimalsOut = 9
    let path = [tokenIn, tokenMiddle, tokenOut]

    it('routes a token to token swap via 2 pools for given amountOut on raydium', async ()=> {

      let amountOut = 1
      let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
      let pairs = [ // Raydium
        '4EbdAfaShVDNeHm6GbXZX3xsKccRHdTbR5962Bvya8xt', // AUDIO-USDC
        '4Sx1NLrQiK4b9FdLKe2DhQ9FHvRzJhzKN3LoD6BrEPnf', // STEP-USDC
      ]
      let markets = [ // Serum
        'FxquLRmVMPXiS84FFSp8q5fbVExhLkX85yiXucyu7xSC', // AUDIO-USDC
        '97qCB4cAVSTthvJu3eNoEx6AY6DLuRDtCoPm5Tdyg77S', // STEP-USDC 
      ]

      mockTokenAccounts({ owner: fromAddress, token: tokenIn, accounts: [] })
      mockTokenAccounts({ owner: fromAddress, token: tokenMiddle, accounts: [] })
      mockTokenAccounts({ owner: fromAddress, token: tokenOut, accounts: [] })
      mockPair({ tokenIn, tokenOut: tokenMiddle, pair: pairs[0], market: markets[0], 
        baseReserve: 9152000000000,
        quoteReserve: 16602000000,
      })
      mockMarket({ market: markets[0] })
      mockPair({ tokenIn: tokenMiddle, tokenOut, pair: pairs[1], market: markets[1], 
        baseReserve: 703345000000000,
        quoteReserve: 182596000000,
      })
      mockMarket({ market: markets[1] })

      await testRouting({
        provider,
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
          from: fromAddress,
          instructions: [
            {
              to: Raydium.pair.v4.address,
              api: struct([u8("instruction"), u64("amountIn"), u64("amountOut")]),
              params: {
                instruction: 11,
                amountIn: '740642659534923',
                amountOut: '3902251747122',
              },
              keys: mockTransactionKeys({
                pair: pairs[0],
                market: markets[0],
                marketAuthority: '6bhvdkoTfqfmLxiMhTBU9quSVDgRHYhmRbFBpTNQVvxF',
                fromAddress, 
                tokenAccountIn: '3VCor9E7BmH83jds6Nvwu2FNcjEZqgcocqAiyiB9dEG4',
                tokenAccountOut: 'F7e4iBrxoSmHhEzhuBcXXs1KAknYvEoZWieiocPvrCD9',
              })
            },{
              to: Raydium.pair.v4.address,
              api: struct([u8("instruction"), u64("amountIn"), u64("amountOut")]),
              params: {
                instruction: 9,
                amountIn: '3902251747122',
                amountOut: '1000000000',
              },
              keys: mockTransactionKeys({
                pair: pairs[1],
                market: markets[1],
                marketAuthority: 'FbwU5U1Doj2PSKRJi7pnCny4dFPPJURwALkFhHwdHaMW',
                fromAddress,
                tokenAccountIn: 'F7e4iBrxoSmHhEzhuBcXXs1KAknYvEoZWieiocPvrCD9',
                tokenAccountOut: 'BKaytRHisVsQ4onoNGTw6JH8qv31aUHENGDEsXq8nEk9',
              })
            }
          ]
        }
      })
    })

    it('routes a token to token swap via 2 pools for given amountOutMin on raydium', async ()=> {

      let amountOutMin = 1
      let amountOutMinBN = ethers.utils.parseUnits(amountOutMin.toString(), decimalsOut)
      let pairs = [ // Raydium
        '4EbdAfaShVDNeHm6GbXZX3xsKccRHdTbR5962Bvya8xt', // AUDIO-USDC
        '4Sx1NLrQiK4b9FdLKe2DhQ9FHvRzJhzKN3LoD6BrEPnf', // STEP-USDC
      ]
      let markets = [ // Serum
        'FxquLRmVMPXiS84FFSp8q5fbVExhLkX85yiXucyu7xSC', // AUDIO-USDC
        '97qCB4cAVSTthvJu3eNoEx6AY6DLuRDtCoPm5Tdyg77S', // STEP-USDC 
      ]

      mockTokenAccounts({ owner: fromAddress, token: tokenIn, accounts: [] })
      mockTokenAccounts({ owner: fromAddress, token: tokenMiddle, accounts: [] })
      mockTokenAccounts({ owner: fromAddress, token: tokenOut, accounts: [] })
      mockPair({ tokenIn, tokenOut: tokenMiddle, pair: pairs[0], market: markets[0], 
        baseReserve: 9152000000000,
        quoteReserve: 16602000000,
      })
      mockMarket({ market: markets[0] })
      mockPair({ tokenIn: tokenMiddle, tokenOut, pair: pairs[1], market: markets[1], 
        baseReserve: 703345000000000,
        quoteReserve: 182596000000,
      })
      mockMarket({ market: markets[1] })

      await testRouting({
        provider,
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
          from: fromAddress,
          instructions: [
            {
              to: Raydium.pair.v4.address,
              api: struct([u8("instruction"), u64("amountIn"), u64("amountOut")]),
              params: {
                instruction: 11,
                amountIn: '740642659534923',
                amountOut: '3902251747122',
              },
              keys: mockTransactionKeys({
                pair: pairs[0],
                market: markets[0],
                marketAuthority: '6bhvdkoTfqfmLxiMhTBU9quSVDgRHYhmRbFBpTNQVvxF',
                fromAddress, 
                tokenAccountIn: '3VCor9E7BmH83jds6Nvwu2FNcjEZqgcocqAiyiB9dEG4',
                tokenAccountOut: 'F7e4iBrxoSmHhEzhuBcXXs1KAknYvEoZWieiocPvrCD9',
              })
            },{
              to: Raydium.pair.v4.address,
              api: struct([u8("instruction"), u64("amountIn"), u64("amountOut")]),
              params: {
                instruction: 9,
                amountIn: '3902251747122',
                amountOut: '1000000000',
              },
              keys: mockTransactionKeys({
                pair: pairs[1],
                market: markets[1],
                marketAuthority: 'FbwU5U1Doj2PSKRJi7pnCny4dFPPJURwALkFhHwdHaMW',
                fromAddress,
                tokenAccountIn: 'F7e4iBrxoSmHhEzhuBcXXs1KAknYvEoZWieiocPvrCD9',
                tokenAccountOut: 'BKaytRHisVsQ4onoNGTw6JH8qv31aUHENGDEsXq8nEk9',
              })
            }
          ]
        }
      })
    })

    it('routes a token to token swap via 2 pools for given amountIn on raydium', async ()=> {

      let amountIn = 1
      let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsOut)
      let pairs = [ // Raydium
        '4EbdAfaShVDNeHm6GbXZX3xsKccRHdTbR5962Bvya8xt', // AUDIO-USDC
        '4Sx1NLrQiK4b9FdLKe2DhQ9FHvRzJhzKN3LoD6BrEPnf', // STEP-USDC
      ]
      let markets = [ // Serum
        'FxquLRmVMPXiS84FFSp8q5fbVExhLkX85yiXucyu7xSC', // AUDIO-USDC
        '97qCB4cAVSTthvJu3eNoEx6AY6DLuRDtCoPm5Tdyg77S', // STEP-USDC 
      ]

      mockTokenAccounts({ owner: fromAddress, token: tokenIn, accounts: [] })
      mockTokenAccounts({ owner: fromAddress, token: tokenMiddle, accounts: [] })
      mockTokenAccounts({ owner: fromAddress, token: tokenOut, accounts: [] })
      mockPair({ tokenIn, tokenOut: tokenMiddle, pair: pairs[0], market: markets[0], 
        baseReserve: 9152000000000,
        quoteReserve: 16602000000,
      })
      mockMarket({ market: markets[0] })
      mockPair({ tokenIn: tokenMiddle, tokenOut, pair: pairs[1], market: markets[1], 
        baseReserve: 703345000000000,
        quoteReserve: 182596000000,
      })
      mockMarket({ market: markets[1] })

      await testRouting({
        provider,
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
          from: fromAddress,
          instructions: [
            {
              to: Raydium.pair.v4.address,
              api: struct([u8("instruction"), u64("amountIn"), u64("amountOut")]),
              params: {
                instruction: 11,
                amountIn: '100000000',
                amountOut: '384019134271',
              },
              keys: mockTransactionKeys({
                pair: pairs[0],
                market: markets[0],
                marketAuthority: '6bhvdkoTfqfmLxiMhTBU9quSVDgRHYhmRbFBpTNQVvxF',
                fromAddress, 
                tokenAccountIn: '3VCor9E7BmH83jds6Nvwu2FNcjEZqgcocqAiyiB9dEG4',
                tokenAccountOut: 'F7e4iBrxoSmHhEzhuBcXXs1KAknYvEoZWieiocPvrCD9',
              })
            },{
              to: Raydium.pair.v4.address,
              api: struct([u8("instruction"), u64("amountIn"), u64("amountOut")]),
              params: {
                instruction: 9,
                amountIn: '384019134271',
                amountOut: '475825776007818',
              },
              keys: mockTransactionKeys({
                pair: pairs[1],
                market: markets[1],
                marketAuthority: 'FbwU5U1Doj2PSKRJi7pnCny4dFPPJURwALkFhHwdHaMW',
                fromAddress,
                tokenAccountIn: 'F7e4iBrxoSmHhEzhuBcXXs1KAknYvEoZWieiocPvrCD9',
                tokenAccountOut: 'BKaytRHisVsQ4onoNGTw6JH8qv31aUHENGDEsXq8nEk9',
              })
            }
          ]
        }
      })
    })

    it('routes a token to token swap via 2 pools for given amountInMax on raydium', async ()=> {

      let amountInMax = 1
      let amountInMaxBN = ethers.utils.parseUnits(amountInMax.toString(), decimalsOut)
      let pairs = [ // Raydium
        '4EbdAfaShVDNeHm6GbXZX3xsKccRHdTbR5962Bvya8xt', // AUDIO-USDC
        '4Sx1NLrQiK4b9FdLKe2DhQ9FHvRzJhzKN3LoD6BrEPnf', // STEP-USDC
      ]
      let markets = [ // Serum
        'FxquLRmVMPXiS84FFSp8q5fbVExhLkX85yiXucyu7xSC', // AUDIO-USDC
        '97qCB4cAVSTthvJu3eNoEx6AY6DLuRDtCoPm5Tdyg77S', // STEP-USDC 
      ]

      mockTokenAccounts({ owner: fromAddress, token: tokenIn, accounts: [] })
      mockTokenAccounts({ owner: fromAddress, token: tokenMiddle, accounts: [] })
      mockTokenAccounts({ owner: fromAddress, token: tokenOut, accounts: [] })
      mockPair({ tokenIn, tokenOut: tokenMiddle, pair: pairs[0], market: markets[0], 
        baseReserve: 9152000000000,
        quoteReserve: 16602000000,
      })
      mockMarket({ market: markets[0] })
      mockPair({ tokenIn: tokenMiddle, tokenOut, pair: pairs[1], market: markets[1], 
        baseReserve: 703345000000000,
        quoteReserve: 182596000000,
      })
      mockMarket({ market: markets[1] })

      await testRouting({
        provider,
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
          from: fromAddress,
          instructions: [
            {
              to: Raydium.pair.v4.address,
              api: struct([u8("instruction"), u64("amountIn"), u64("amountOut")]),
              params: {
                instruction: 11,
                amountIn: '100000000',
                amountOut: '384019134271',
              },
              keys: mockTransactionKeys({
                pair: pairs[0],
                market: markets[0],
                marketAuthority: '6bhvdkoTfqfmLxiMhTBU9quSVDgRHYhmRbFBpTNQVvxF',
                fromAddress, 
                tokenAccountIn: '3VCor9E7BmH83jds6Nvwu2FNcjEZqgcocqAiyiB9dEG4',
                tokenAccountOut: 'F7e4iBrxoSmHhEzhuBcXXs1KAknYvEoZWieiocPvrCD9',
              })
            },{
              to: Raydium.pair.v4.address,
              api: struct([u8("instruction"), u64("amountIn"), u64("amountOut")]),
              params: {
                instruction: 9,
                amountIn: '384019134271',
                amountOut: '475825776007818',
              },
              keys: mockTransactionKeys({
                pair: pairs[1],
                market: markets[1],
                marketAuthority: 'FbwU5U1Doj2PSKRJi7pnCny4dFPPJURwALkFhHwdHaMW',
                fromAddress,
                tokenAccountIn: 'F7e4iBrxoSmHhEzhuBcXXs1KAknYvEoZWieiocPvrCD9',
                tokenAccountOut: 'BKaytRHisVsQ4onoNGTw6JH8qv31aUHENGDEsXq8nEk9',
              })
            }
          ]
        }
      })
    })
  })

  describe('route token to token via 1 pool wit existing token account for tokenIn and tokenOut', ()=>{

    let tokenIn = CONSTANTS[blockchain].USD
    let decimalsIn = CONSTANTS[blockchain].USD_DECIMALS
    let tokenOut = CONSTANTS[blockchain].WRAPPED
    let decimalsOut = CONSTANTS[blockchain].DECIMALS
    let path = [tokenIn, tokenOut]

    it('routes a token to token swap via 1 pool for given amountOut on raydium', async ()=> {

      let amountOut = 1
      let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
      let pair = '58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2'
      let market = '9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT'

      mockTokenAccounts({ owner: fromAddress, token: tokenIn, accounts: ['F7e4iBrxoSmHhEzhuBcXXs1KAknYvEoZWieiocPvrCD9'] })
      mockTokenAccounts({ owner: fromAddress, token: tokenOut, accounts: ['BKaytRHisVsQ4onoNGTw6JH8qv31aUHENGDEsXq8nEk9'] })
      mockPair({ tokenIn, tokenOut, pair, market, 
        baseReserve: 300000000000000,
        quoteReserve: 10000000000000,
      })
      mockMarket({ market })

      await testRouting({
        provider,
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
            keys: mockTransactionKeys({
              pair,
              market,
              marketAuthority: 'F8Vyqk3unwxkXukZFQeYyGmFfTG3CAX4v24iyrjEYBJV',
              fromAddress,
              tokenAccountIn: 'F7e4iBrxoSmHhEzhuBcXXs1KAknYvEoZWieiocPvrCD9',
              tokenAccountOut: 'BKaytRHisVsQ4onoNGTw6JH8qv31aUHENGDEsXq8nEk9'
            })
          }]
        }
      })
    })
  })

  describe('route NATIVE to token via 1 pool with existing token accounts', ()=>{

    let tokenIn = CONSTANTS[blockchain].NATIVE
    let decimalsIn = CONSTANTS[blockchain].DECIMALS
    let tokenOut = CONSTANTS[blockchain].USD
    let decimalsOut = CONSTANTS[blockchain].USD_DECIMALS
    let path = [tokenIn, tokenOut]

    it('routes NATIVE to token swap via 1 pool for given amountOut on raydium', async ()=> {

      let amountOut = 1
      let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
      let pair = '58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2'
      let market = '9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT'

      mockTokenAccounts({ owner: fromAddress, token: CONSTANTS.solana.WRAPPED, accounts: ['F7e4iBrxoSmHhEzhuBcXXs1KAknYvEoZWieiocPvrCD9'] })
      mockTokenAccounts({ owner: fromAddress, token: tokenOut, accounts: ['F8Vyqk3unwxkXukZFQeYyGmFfTG3CAX4v24iyrjEYBJV'] })
      mockPair({ tokenIn: CONSTANTS.solana.WRAPPED, tokenOut, pair, market, 
        baseReserve: 300000000000000,
        quoteReserve: 10000000000000,
      })
      mockMarket({ market })
      mockRent({ rent: 2039280 })

      await testRouting({
        provider,
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
          instructions: [
            {
              to: '11111111111111111111111111111111',
              api: struct([u32("instruction"), u64("lamports"), u64("space"), publicKey("programId")]),
              params: {
                instruction: 0,
                lamports: '32264845',
                space: Token.solana.TOKEN_LAYOUT.span,
                programId: Token.solana.TOKEN_PROGRAM
              }
            },{
              to: Token.solana.TOKEN_PROGRAM,
              api: struct([u8("instruction"), publicKey("owner")]),
              params: {
                instruction: 18,
                owner: fromAddress,
              }
            },{
              to: Raydium.pair.v4.address,
              api: struct([u8("instruction"), u64("amountIn"), u64("amountOut")]),
              params: {
                instruction: 11,
                amountIn: '30225565',
                amountOut: '1000000',
              },
              keys: mockTransactionKeys({
                pair,
                market,
                marketAuthority: 'F8Vyqk3unwxkXukZFQeYyGmFfTG3CAX4v24iyrjEYBJV',
                fromAddress,
                tokenAccountIn: anything,
                tokenAccountOut: 'F8Vyqk3unwxkXukZFQeYyGmFfTG3CAX4v24iyrjEYBJV'
              })
            }, {
              to: Token.solana.TOKEN_PROGRAM,
              api: struct([u8("instruction")]),
              params: { instruction: 9 }
            }
          ]
        }
      })
    })
  })
})

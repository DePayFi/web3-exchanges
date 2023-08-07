import { ethers } from 'ethers'
import { mock, resetMocks } from '@depay/web3-mock'
import { mockDecimals } from 'tests/mocks/token'
import { mockPair, mockAmounts } from 'tests/mocks/evm/uniswap_v2'
import { mockPair as mockPairV3, mockAmounts as mockAmountsV3 } from 'tests/mocks/evm/uniswap_v3'
import { resetCache, getProvider } from '@depay/web3-client'
import Exchanges from 'src'
import { supported } from 'src/blockchains'

describe('route', ()=> {

  const blockchain = 'ethereum'
  const accounts = ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045']
  const tokenIn = '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb'
  const decimalsIn = 18
  const tokenOut = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'
  const decimalsOut = 6
  const path = [tokenIn, tokenOut]
  const fee = 3000
  const amountOut = 1
  const amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
  const amountIn = 1
  const amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
  const fetchedAmountIn = 43
  const fetchedAmountOut = 43
  const slippage = ethers.BigNumber.from('215000000000000000')
    
  let provider
  beforeEach(async ()=>{
    resetMocks()
    resetCache()
    provider = await getProvider(blockchain)
    mock({ blockchain, accounts: { return: accounts } })
    mock({ blockchain, provider })
    mockDecimals({ blockchain, address: tokenIn, value: decimalsIn })
    mockDecimals({ blockchain, address: tokenOut, value: decimalsOut })
  })

  const mockV2 = ({fetchedAmountIn, fetchedAmountOut})=>{
    mockPair({ blockchain, exchange: Exchanges.uniswap_v2, provider, tokenIn, tokenOut, pair: '0xEF8cD6Cb5c841A4f02986e8A8ab3cC545d1B8B6d' })

    if(fetchedAmountIn) {
      mockAmounts({ blockchain, exchange: Exchanges.uniswap_v2, provider, method: 'getAmountsIn', params: [amountOutBN,path], amounts: [fetchedAmountIn, amountOutBN] })
    } else {
      mockAmounts({ blockchain, exchange: Exchanges.uniswap_v2, provider, method: 'getAmountsOut', params: [amountInBN,path], amounts: [amountInBN, fetchedAmountOut] })
    }
  }

  const mockV3 = ({fetchedAmountIn, fetchedAmountOut})=>{
    mockPairV3({ blockchain, exchange: Exchanges.uniswap_v3, provider, tokenIn, tokenOut, fee, pair: '0xEF8cD6Cb5c841A4f02986e8A8ab3cC545d1B8B6d' })

    if(fetchedAmountIn) {
      mockAmountsV3({ blockchain, exchange: Exchanges.uniswap_v3, provider, method: 'quoteExactOutput',
        params: [ethers.utils.solidityPack(["address","uint24","address"],[tokenOut, fee, tokenIn]), amountOutBN],
        amount: fetchedAmountIn
      })
      ;[0,1].forEach((block)=>{
        mockAmountsV3({ blockchain, exchange: Exchanges.uniswap_v3, provider, method: 'quoteExactOutput',
          params: [ethers.utils.solidityPack(["address","uint24","address"],[tokenOut, fee, tokenIn]), amountOutBN],
          amount: fetchedAmountIn,
          block
        })
      })
    } else {
      mockAmountsV3({ blockchain, exchange: Exchanges.uniswap_v3, provider, method: 'quoteExactInput',
        params: [ethers.utils.solidityPack(["address","uint24","address"],[tokenIn, fee, tokenOut]), amountInBN],
        amount: fetchedAmountOut
      })
      ;[0,1].forEach((block)=>{
        mockAmountsV3({ blockchain, exchange: Exchanges.uniswap_v3, provider, method: 'quoteExactInput',
          params: [ethers.utils.solidityPack(["address","uint24","address"],[tokenIn, fee, tokenOut]), amountInBN],
          amount: fetchedAmountOut,
          block
        })
      })
    }
  }

  it('returns v3 before v2 if price is the same', async ()=>{

    mockV2({ fetchedAmountIn: ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn) })
    mockV3({ fetchedAmountIn: ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn) })

    let routes = await Exchanges.route({
      blockchain,
      tokenIn: tokenIn,
      tokenOut: tokenOut,
      amountOut: amountOut,
      fromAddress: accounts[0],
      toAddress: accounts[0]
    })

    expect(routes[0].exchange.name).toEqual('uniswap_v3')
    expect(routes[1].exchange.name).toEqual('uniswap_v2')
  })

  it('returns best price first for amountOut', async ()=>{

    mockV2({ fetchedAmountIn: ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn) })
    mockV3({ fetchedAmountIn: ethers.utils.parseUnits((fetchedAmountIn+1).toString(), decimalsIn) })

    let routes = await Exchanges.route({
      blockchain,
      tokenIn: tokenIn,
      tokenOut: tokenOut,
      amountOut: amountOut,
      fromAddress: accounts[0],
      toAddress: accounts[0]
    })

    expect(routes[0].exchange.name).toEqual('uniswap_v2')
    expect(routes[1].exchange.name).toEqual('uniswap_v3')
  })

  it('returns best price first for amountOut', async ()=>{

    mockV2({ fetchedAmountIn: ethers.utils.parseUnits((fetchedAmountIn+1).toString(), decimalsIn) })
    mockV3({ fetchedAmountIn: ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn) })

    let routes = await Exchanges.route({
      blockchain,
      tokenIn: tokenIn,
      tokenOut: tokenOut,
      amountOut: amountOut,
      fromAddress: accounts[0],
      toAddress: accounts[0]
    })

    expect(routes[0].exchange.name).toEqual('uniswap_v3')
    expect(routes[1].exchange.name).toEqual('uniswap_v2')
  })

  it('returns best price first for amountIn', async ()=>{

    mockV2({ fetchedAmountOut: ethers.utils.parseUnits((fetchedAmountOut+1).toString(), decimalsIn) })
    mockV3({ fetchedAmountOut: ethers.utils.parseUnits(fetchedAmountOut.toString(), decimalsIn) })

    let routes = await Exchanges.route({
      blockchain,
      tokenIn: tokenIn,
      tokenOut: tokenOut,
      amountIn: amountIn,
      fromAddress: accounts[0],
      toAddress: accounts[0]
    })

    expect(routes[0].exchange.name).toEqual('uniswap_v2')
    expect(routes[1].exchange.name).toEqual('uniswap_v3')
  })

  it('returns best price first for amountIn', async ()=>{

    mockV2({ fetchedAmountOut: ethers.utils.parseUnits(fetchedAmountOut.toString(), decimalsIn) })
    mockV3({ fetchedAmountOut: ethers.utils.parseUnits((fetchedAmountOut+1).toString(), decimalsIn) })

    let routes = await Exchanges.route({
      blockchain,
      tokenIn: tokenIn,
      tokenOut: tokenOut,
      amountIn: amountIn,
      fromAddress: accounts[0],
      toAddress: accounts[0]
    })

    expect(routes[0].exchange.name).toEqual('uniswap_v3')
    expect(routes[1].exchange.name).toEqual('uniswap_v2')
  })
})

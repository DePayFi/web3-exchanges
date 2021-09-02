import PancakeSwap from 'src/exchanges/pancakeswap/basics'
import { CONSTANTS } from 'depay-web3-constants'
import { ethers } from 'ethers'
import { mock, resetMocks } from 'depay-web3-mock'
import { mockDecimals } from 'tests/mocks/token'
import { mockPair, mockAmounts } from 'tests/mocks/pancakeswap'
import { resetCache, provider as getProvider } from 'depay-web3-client'
import { route, findByName } from 'src'
import { WBNB } from 'src/exchanges/wbnb/apis'

describe('route', ()=> {

  beforeEach(resetMocks)
  beforeEach(resetCache)
  afterEach(resetMocks)

  let blockchain = 'bsc'
  let provider
  beforeEach(async ()=> { provider = await getProvider(blockchain) })
  
  it('returns routes for all exchanges on the bsc blockchain', async ()=>{

    let tokenIn = '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82' // CAKE
    let decimalsIn = 18
    let tokenOut = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56' // BUSD
    let decimalsOut = 18
    let path = [tokenIn, tokenOut]
    let amountIn = 1
    let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
    let amountOutMin = 2
    let amountOutMinBN = ethers.utils.parseUnits(amountOutMin.toString(), decimalsOut)
    let pair = '0x804678fa97d91B974ec2af3c843270886528a9E6'
    let wallet = '0x5Af489c8786A018EC4814194dC8048be1007e390'

    mockDecimals({ provider, blockchain, address: tokenIn, value: decimalsIn })
    mockDecimals({ provider, blockchain, address: tokenOut, value: decimalsOut })
    mockPair({ provider, tokenIn, tokenOut, pair })
    mockAmounts({ provider, method: 'getAmountsOut', params: [amountInBN,path], amounts: [amountInBN, amountOutMinBN] })

    let routes = await route({
      blockchain,
      tokenIn: tokenIn,
      tokenOut: tokenOut,
      amountIn: amountIn,
      amountOutMin: amountOutMin,
      fromAddress: wallet,
      toAddress: wallet
    });

    expect(routes.length).toEqual(1)
    expect(routes[0].fromAddress).toEqual(wallet)
    expect(routes[0].toAddress).toEqual(wallet)
    expect(routes[0].exchange).toEqual(findByName('pancakeswap'))
    expect(routes[0].path).toEqual(path)
    expect(routes[0].transaction.blockchain).toEqual('bsc')
    expect(routes[0].transaction.address).toEqual(PancakeSwap.contracts.router.address)
    expect(routes[0].transaction.api).toEqual(PancakeSwap.contracts.router.api)
    expect(routes[0].transaction.method).toEqual('swapExactTokensForTokens')
    expect(routes[0].transaction.params.amountIn).toEqual(amountInBN)
    expect(routes[0].transaction.params.amountOutMin).toEqual(amountOutMinBN)
    expect(routes[0].transaction.params.path).toEqual(path)
    expect(routes[0].transaction.params.to).toEqual(wallet)
    expect(routes[0].transaction.params.deadline).toBeDefined()

    // TODO: sorts the routes by most cost-effective routes first (once support for multiple exchanges)
  })

  it('offers to unwrap WBNB to BNB if trying to find exchanges for that pair', async ()=>{

    let wallet = '0x5Af489c8786A018EC4814194dC8048be1007e390'
    let amount = 1
    let amountBN = ethers.utils.parseUnits(amount.toString(), 18)

    mockDecimals({ provider, blockchain, address: CONSTANTS.bsc.WRAPPED, value: 18 })

    let routes = await route({
      blockchain,
      tokenIn: CONSTANTS.bsc.WRAPPED,
      tokenOut: CONSTANTS.bsc.NATIVE,
      amountIn: amount,
      fromAddress: wallet,
      toAddress: wallet
    });

    expect(routes.length).toEqual(1)

    expect(routes[0].tokenIn).toEqual(CONSTANTS.bsc.WRAPPED)
    expect(routes[0].tokenOut).toEqual(CONSTANTS.bsc.NATIVE)
    expect(routes[0].path).toEqual([CONSTANTS.bsc.WRAPPED, CONSTANTS.bsc.NATIVE])
    expect(routes[0].amountIn).toEqual(amountBN)
    expect(routes[0].amountOutMin).toEqual(amountBN)
    expect(routes[0].amountOut).toEqual(amountBN)
    expect(routes[0].amountInMax).toEqual(amountBN)
    expect(routes[0].fromAddress).toEqual(wallet)
    expect(routes[0].toAddress).toEqual(wallet)
    expect(routes[0].exchange.name).toEqual('wbnb')
    expect(routes[0].transaction.blockchain).toEqual('bsc')
    expect(routes[0].transaction.address).toEqual(CONSTANTS.bsc.WRAPPED)
    expect(routes[0].transaction.api).toEqual(WBNB)
    expect(routes[0].transaction.method).toEqual('withdraw')
    expect(routes[0].transaction.params).toEqual([amountBN])
  })

  it('offers to wrap BNB to WBNB if trying to find exchanges for that pair', async ()=>{
    let wallet = '0x5Af489c8786A018EC4814194dC8048be1007e390'
    let amount = 1
    let amountBN = ethers.utils.parseUnits(amount.toString(), 18)

    mockDecimals({ provider, blockchain, address: CONSTANTS.bsc.WRAPPED, value: 18 })

    let routes = await route({
      blockchain,
      tokenIn: CONSTANTS.bsc.NATIVE,
      tokenOut: CONSTANTS.bsc.WRAPPED,
      amountIn: amount,
      fromAddress: wallet,
      toAddress: wallet
    });

    expect(routes.length).toEqual(1)

    expect(routes[0].tokenIn).toEqual(CONSTANTS.bsc.NATIVE)
    expect(routes[0].tokenOut).toEqual(CONSTANTS.bsc.WRAPPED)
    expect(routes[0].path).toEqual([CONSTANTS.bsc.NATIVE, CONSTANTS.bsc.WRAPPED])
    expect(routes[0].amountIn).toEqual(amountBN)
    expect(routes[0].amountOutMin).toEqual(amountBN)
    expect(routes[0].amountOut).toEqual(amountBN)
    expect(routes[0].amountInMax).toEqual(amountBN)
    expect(routes[0].fromAddress).toEqual(wallet)
    expect(routes[0].toAddress).toEqual(wallet)
    expect(routes[0].exchange.name).toEqual('wbnb')
    expect(routes[0].transaction.blockchain).toEqual('bsc')
    expect(routes[0].transaction.address).toEqual(CONSTANTS.bsc.WRAPPED)
    expect(routes[0].transaction.api).toEqual(WBNB)
    expect(routes[0].transaction.method).toEqual('deposit')
    expect(routes[0].transaction.value).toEqual(amountBN)
  }) 
})

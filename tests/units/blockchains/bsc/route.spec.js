import PancakeSwap from 'src/exchanges/pancakeswap/basics'
import { ethers } from 'ethers'
import { mock, resetMocks } from 'depay-web3-mock'
import { mockDecimals } from 'tests/mocks/token'
import { mockPair, mockAmounts } from 'tests/mocks/pancakeswap'
import { resetCache } from 'depay-web3-client'
import { route, findByName } from 'src'

describe('route', ()=> {

  beforeEach(resetMocks)
  beforeEach(resetCache)
  afterEach(resetMocks)
  
  it('returns routes for all exchanges on the bsc blockchain', async ()=>{

    let blockchain = 'bsc'
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

    mockDecimals({ blockchain, address: tokenIn, value: decimalsIn })
    mockDecimals({ blockchain, address: tokenOut, value: decimalsOut })
    mockPair({ tokenIn, tokenOut, pair })
    mockAmounts({ method: 'getAmountsOut', params: [amountInBN,path], amounts: [amountInBN, amountOutMinBN] })

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
})

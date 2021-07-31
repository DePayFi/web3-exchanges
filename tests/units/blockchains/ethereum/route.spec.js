import UniswapV2 from 'src/exchanges/uniswap_v2/basics'
import { ethers } from 'ethers'
import { mock, resetMocks } from 'depay-web3-mock'
import { mockDecimals } from 'tests/mocks/token'
import { mockPair, mockAmounts } from 'tests/mocks/uniswap_v2'
import { resetCache } from 'depay-web3-client'
import { route, findByName } from 'src'

describe('route', ()=> {

  beforeEach(resetMocks)
  beforeEach(resetCache)
  afterEach(resetMocks)
  
  it('returns routes for all exchanges on the ethereum blockchain', async ()=>{

    let blockchain = 'ethereum'
    let tokenIn = '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb' // DEPAY
    let decimalsIn = 18
    let tokenOut = '0xdAC17F958D2ee523a2206206994597C13D831ec7' // USDT
    let decimalsOut = 6
    let path = [tokenIn, tokenOut]
    let amountIn = 1
    let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
    let amountOutMin = 2
    let amountOutMinBN = ethers.utils.parseUnits(amountOutMin.toString(), decimalsOut)
    let pair = '0xEF8cD6Cb5c841A4f02986e8A8ab3cC545d1B8B6d'
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
    expect(routes[0].exchange).toEqual(findByName('uniswap_v2'))
    expect(routes[0].path).toEqual(path)
    expect(routes[0].transaction.blockchain).toEqual('ethereum')
    expect(routes[0].transaction.address).toEqual(UniswapV2.contracts.router.address)
    expect(routes[0].transaction.api).toEqual(UniswapV2.contracts.router.api)
    expect(routes[0].transaction.method).toEqual('swapExactTokensForTokens')
    expect(routes[0].transaction.params.amountIn).toEqual(amountInBN)
    expect(routes[0].transaction.params.amountOutMin).toEqual(amountOutMinBN)
    expect(routes[0].transaction.params.path).toEqual(path)
    expect(routes[0].transaction.params.to).toEqual(wallet)
    expect(routes[0].transaction.params.deadline).toBeDefined()

    // TODO: sorts the routes by most cost-effective routes first (once support for multiple exchanges)
  })
})

import { ERC20, UniswapV2Factory, UniswapV2Router02 } from '../apis'
import { ethers } from 'ethers'
import { mock, resetMocks } from 'depay-web3mock'
import { mockDecimals } from '../mocks/token'
import { mockPair, mockAmounts } from '../mocks/uniswap_v2'
import { resetCache } from 'depay-blockchain-client'
import { route, findByName } from 'dist/cjs/index.js'

describe('route', ()=> {

  beforeEach(()=>{
    resetMocks()
    resetCache()
  })
  afterEach(resetMocks)
  
  it('returns routes for all exchanges', async ()=>{

    let tokenIn = '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb'
    let decimalsIn = 18
    let tokenOut = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    let decimalsOut = 6
    let path = [tokenIn, tokenOut]
    let amountIn = 1
    let amountInBN = ethers.utils.parseUnits(amountIn.toString(), decimalsIn)
    let amountOutMin = 2
    let amountOutMinBN = ethers.utils.parseUnits(amountOutMin.toString(), decimalsOut)
    let pair = '0xEF8cD6Cb5c841A4f02986e8A8ab3cC545d1B8B6d'
    let wallet = '0x5Af489c8786A018EC4814194dC8048be1007e390'

    mockDecimals({ address: tokenIn, value: decimalsIn })
    mockDecimals({ address: tokenOut, value: decimalsOut })
    mockPair({ tokenIn, tokenOut, pair })
    mockAmounts({ method: 'getAmountsOut', params: [amountInBN,path], amounts: [amountInBN, amountOutMinBN] })

    let routes = await route({
      tokenIn: tokenIn,
      tokenOut: tokenOut,
      amountIn: amountIn,
      amountOutMin: amountOutMin,
      from: wallet,
      to: wallet
    });

    expect(routes.length).toEqual(1)
    expect(routes[0].from).toEqual(wallet)
    expect(routes[0].to).toEqual(wallet)
    expect(routes[0].exchange).toEqual(findByName('uniswap_v2'))
    expect(routes[0].path).toEqual(path)
    expect(routes[0].transaction.blockchain).toEqual('ethereum')
    expect(routes[0].transaction.address).toEqual('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D')
    expect(routes[0].transaction.api).toEqual(UniswapV2Router02)
    expect(routes[0].transaction.method).toEqual('swapExactTokensForTokens')
    expect(routes[0].transaction.params.amountIn).toEqual(amountInBN)
    expect(routes[0].transaction.params.amountOutMin).toEqual(amountOutMinBN)
    expect(routes[0].transaction.params.path).toEqual(path)
    expect(routes[0].transaction.params.to).toEqual(wallet)
    expect(routes[0].transaction.params.deadline).toBeDefined()
  });

  // it('sorts the routes by most cost-effective routes first', async()=>{
  //   throw('PENDING')
  // })

  // it('does preflight too', async()=>{
  //   throw('PENDING')
  // })
});

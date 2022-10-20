import PancakeSwap from 'src/exchanges/pancakeswap/basics'
import { CONSTANTS } from '@depay/web3-constants'
import { ethers } from 'ethers'
import { mock, resetMocks } from '@depay/web3-mock'
import { mockDecimals } from 'tests/mocks/token'
import { mockPair, mockAmounts } from 'tests/mocks/pancakeswap'
import { resetCache, getProvider } from '@depay/web3-client'
import { route, find } from 'src'

describe('route', ()=> {

  const blockchain = 'bsc'
  const accounts = ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045']

  let provider
  beforeEach(async ()=>{
    resetMocks()
    resetCache()
    provider = await getProvider(blockchain)
    mock({ blockchain, accounts: { return: accounts } })
  })

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
    let wallet = accounts[0]

    mockDecimals({ provider, blockchain, address: tokenIn, value: decimalsIn })
    mockDecimals({ provider, blockchain, address: tokenOut, value: decimalsOut })
    mockPair({ provider, tokenIn, tokenOut, pair })
    mockAmounts({ provider, method: 'getAmountsOut', params: [amountInBN, path], amounts: [amountInBN, amountOutMinBN] })

    let routes = await route({
      blockchain,
      tokenIn: tokenIn,
      tokenOut: tokenOut,
      amountIn: amountIn,
      fromAddress: wallet,
      toAddress: wallet
    });

    expect(routes.length).toEqual(1)
    expect(routes[0].fromAddress).toEqual(wallet)
    expect(routes[0].exchange).toEqual(find('bsc', 'pancakeswap'))
    expect(routes[0].path).toEqual(path.map((address)=>ethers.utils.getAddress(address)))
    expect(routes[0].transaction.blockchain).toEqual('bsc')
    expect(routes[0].transaction.to).toEqual(PancakeSwap.router.address)
    expect(routes[0].transaction.from).toEqual(accounts[0])
    expect(routes[0].transaction.api).toEqual(PancakeSwap.router.api)
    expect(routes[0].transaction.method).toEqual('swapExactTokensForTokens')
    expect(routes[0].transaction.params.amountIn).toEqual(amountInBN.toString())
    expect(routes[0].transaction.params.amountOutMin).toEqual(amountOutMinBN.toString())
    expect(routes[0].transaction.params.path).toEqual(path.map((address)=>ethers.utils.getAddress(address)))
    expect(routes[0].transaction.params.to).toEqual(wallet)
    expect(routes[0].transaction.params.deadline).toBeDefined()

    // TODO: sorts the routes by most cost-effective routes first (once support for multiple exchanges)
  })
})

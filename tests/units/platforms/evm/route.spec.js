import { ethers } from 'ethers'
import { mock, resetMocks } from '@depay/web3-mock'
import { mockDecimals } from 'tests/mocks/token'
import { mockPair, mockAmounts } from 'tests/mocks/evm/uniswap_v2'
import { resetCache, getProvider } from '@depay/web3-client'
import { route, all } from 'src'
import { supported } from 'src/blockchains'

describe('route', ()=> {

  const blockchain = 'ethereum'
  const accounts = ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045']
    
  let provider
  beforeEach(async ()=>{
    resetMocks()
    resetCache()
    provider = await getProvider(blockchain)
    mock({ blockchain, accounts: { return: accounts } })
  })

  it('returns routes for all exchanges available on the given blockchain (sorted by best price first)', async ()=>{

    throw('pending')

    let tokenIn = '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb'
    let decimalsIn = 18
    let tokenOut = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'
    let decimalsOut = 6
    let path = [tokenIn, tokenOut]
    let fee = 3000

    let amountOut = 1
    let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
    let fetchedAmountIn = 43
    let fetchedAmountInBN = ethers.utils.parseUnits(fetchedAmountIn.toString(), decimalsIn)
    let slippage = ethers.BigNumber.from('215000000000000000')


    let routes = await route({
      blockchain,
      tokenIn: tokenIn,
      tokenOut: tokenOut,
      amountOut: amountOut,
      fromAddress: accounts[0],
      toAddress: accounts[0]
    })


  })
})

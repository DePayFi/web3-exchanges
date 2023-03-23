import Blockchains from '@depay/web3-blockchains'
import { ethers } from 'ethers'
import { find } from 'src'
import { mock, resetMocks } from '@depay/web3-mock'
import { mockPair, mockToken, mockTokenAccounts, mockMarket, mockTransactionKeys } from 'tests/mocks/solana/raydium'
import { getProvider, resetCache } from '@depay/web3-client'

describe('raydium', () => {
  
  let provider
  const blockchain = 'solana'
  const accounts = ['2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1']

  beforeEach(async()=>{
    resetMocks()
    resetCache()
    provider = await getProvider(blockchain)
    mock({ provider, blockchain, accounts: { return: accounts } })
  })

  let exchange = find('solana', 'raydium')
  let fromAddress = '2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1'
  let toAddress = '2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1'

  describe('getAmounts', ()=>{

    it('provides amounts for the route', async ()=> {

      let tokenIn = Blockchains[blockchain].stables.usd[0]
      let decimalsIn = Blockchains[blockchain].tokens.find((token)=>token.address == tokenIn).decimals
      let tokenOut = Blockchains[blockchain].wrapped.address
      let decimalsOut = CONSTANTS[blockchain].DECIMALS
      let path = [tokenIn, tokenOut]
      let amountOut = 1
      let amountOutBN = ethers.utils.parseUnits(amountOut.toString(), decimalsOut)
      let pair = '58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2'
      let market = '9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT'

      mockTokenAccounts({ provider, owner: fromAddress, token: tokenIn, accounts: [] })
      mockTokenAccounts({ provider, owner: fromAddress, token: tokenOut, accounts: [] })
      mockPair({ provider, tokenIn, tokenOut, pair, market, 
        baseReserve: 300000000000000,
        quoteReserve: 10000000000000,
      })
      mockMarket({ provider, market })
      
      let { amountIn } = await exchange.getAmounts({ path, amountOut: amountOutBN.toString() })

      expect(amountIn.toString()).toEqual('33416986')
    })
  })
})

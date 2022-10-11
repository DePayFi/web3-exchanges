import { CONSTANTS } from '@depay/web3-constants'
import { ethers } from 'ethers'
import { find } from 'src'
import { mock, resetMocks } from '@depay/web3-mock'
import { mockPair, mockToken, mockTokenAccounts, mockMarket, mockTransactionKeys } from 'tests/mocks/raydium'
import { provider, resetCache } from '@depay/web3-client'

describe('raydium', () => {
  
  let blockchain = 'solana'
  const accounts = ['2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1']
  beforeEach(resetMocks)
  beforeEach(resetCache)
  beforeEach(()=>mock({ provider: provider(blockchain), blockchain, accounts: { return: accounts } }))

  let exchange = find('solana', 'raydium')
  let fromAddress = '2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1'
  let toAddress = '2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1'

  describe('getAmounts', ()=>{

    it('provides amounts for the route', async ()=> {

      let tokenIn = CONSTANTS[blockchain].USD
      let decimalsIn = CONSTANTS[blockchain].USD_DECIMALS
      let tokenOut = CONSTANTS[blockchain].WRAPPED
      let decimalsOut = CONSTANTS[blockchain].DECIMALS
      let path = [tokenIn, tokenOut]
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
      
      let { amountIn } = await exchange.getAmounts({ path, amountOut: amountOutBN.toString() })

      expect(amountIn.toString()).toEqual('33416986')
    })
  })
})

import UniswapV2 from 'src/exchanges/uniswap_v2'
import { ethers } from 'ethers'
import { findByName } from 'src'
import { mock, resetMocks } from '@depay/web3-mock'
import { provider, resetCache } from '@depay/web3-client'

describe('uniswap_v2', () => {
  
  let blockchain = 'ethereum'
  const accounts = ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045']
  beforeEach(resetMocks)
  beforeEach(resetCache)
  beforeEach(()=>mock({ provider: provider(blockchain), blockchain, accounts: { return: accounts } }))

  let exchange = findByName('ethereum', 'uniswap_v2')
  let pair = '0xEF8cD6Cb5c841A4f02986e8A8ab3cC545d1B8B6d'
  let fromAddress = '0x5Af489c8786A018EC4814194dC8048be1007e390'
  let toAddress = '0x5Af489c8786A018EC4814194dC8048be1007e390'

  describe('getAmountIn', ()=>{

    it('allows to pass the specific block you need to getAmountIn for', async ()=> {

      const path = ['0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb', '0xdAC17F958D2ee523a2206206994597C13D831ec7']
      const amountOut = '100000000000'
      const block = 14904658
      const amountsIn = ['222222222222', '100000000000']
      
      mock({
        provider: provider(blockchain),
        blockchain,
        block,
        request: {
          to: UniswapV2.contracts.router.address,
          api: UniswapV2.contracts.router.api,
          method: 'getAmountsIn',
          params: { amountOut, path },
          return: amountsIn
        }
      })

      let amountIn = await exchange.getAmountIn({
        path,
        amountOut,
        block
      })

      expect(amountIn.toString()).toEqual('222222222222')
    })
  })
})

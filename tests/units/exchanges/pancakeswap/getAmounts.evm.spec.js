import PancakeSwap from 'src/exchanges/pancakeswap/index.evm'
import { ethers } from 'ethers'
import { find } from 'src/index.evm'
import { mock, resetMocks } from '@depay/web3-mock'
import { getProvider, resetCache } from '@depay/web3-client-evm'

describe('pancakeswap', () => {
  
  const blockchain = 'bsc'
  const accounts = ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045']
  const exchange = find('bsc', 'pancakeswap')
  const pair = '0xEF8cD6Cb5c841A4f02986e8A8ab3cC545d1B8B6d'
  const fromAddress = '0x5Af489c8786A018EC4814194dC8048be1007e390'
  const toAddress = '0x5Af489c8786A018EC4814194dC8048be1007e390'
  
  let provider
  beforeEach(async ()=>{
    resetMocks()
    resetCache()
    provider = await getProvider(blockchain)
    mock({ blockchain, accounts: { return: accounts } })
  })

  describe('getAmounts', ()=>{

    it('allows to pass the specific block you need to getAmountsIn for', async ()=> {

      const path = ['0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb', '0xdAC17F958D2ee523a2206206994597C13D831ec7']
      const amountOut = '100000000000'
      const block = 14904658
      const amountsIn = ['222222222222', '100000000000']
      
      mock({
        provider,
        blockchain,
        block,
        request: {
          to: PancakeSwap.router.address,
          api: PancakeSwap.router.api,
          method: 'getAmountsIn',
          params: { amountOut, path },
          return: amountsIn
        }
      })

      let { amountIn } = await exchange.getAmounts({
        path,
        amountOut,
        block
      })

      expect(amountIn.toString()).toEqual('222222222222')
    })
  })
})

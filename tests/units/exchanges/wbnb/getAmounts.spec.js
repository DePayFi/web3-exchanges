import { CONSTANTS } from '@depay/web3-constants'
import { find } from 'src'

describe('wbnb', () => {
  
  const blockchain = 'bsc'
  const accounts = ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045']
  const exchange = find('bsc', 'wbnb')
  const fromAddress = '0x5Af489c8786A018EC4814194dC8048be1007e390'
  const toAddress = '0x5Af489c8786A018EC4814194dC8048be1007e390'
  
  describe('getAmounts', ()=>{

    it('provides the same amounts (amountIn==amountOut) for ETH<>WETH', async ()=> {

      const path = ['0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', CONSTANTS.bsc.WRAPPED]
      const amountOut = '100000000000'
      
      let { amountIn } = await exchange.getAmounts({
        path,
        amountOut
      })

      expect(amountIn.toString()).toEqual(amountOut)
    })

    it('provides the same amounts (amountIn==amountOut) for WETH<>ETH', async ()=> {

      const path = [CONSTANTS.bsc.WRAPPED, '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE']
      const amountOut = '100000000000'
      
      let { amountIn } = await exchange.getAmounts({
        path,
        amountOut
      })

      expect(amountIn.toString()).toEqual(amountOut)
    })
  })
})

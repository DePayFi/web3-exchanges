import Blockchains from '@depay/web3-blockchains'
import Exchanges from 'src'
import { mock, resetMocks } from '@depay/web3-mock'

describe('weth', () => {

  const exchange = Exchanges.weth
  const blockchain = 'ethereum'

  describe('pathExists', ()=>{

    it('returns false immediatelly if path length <= 1', async()=>{
      expect(await exchange.pathExists({ blockchain, path: [Blockchains[blockchain].currency.address] })).toEqual(false)
    })

    it('returns false immediatelly if path length >= 3', async()=>{
      expect(await exchange.pathExists({ blockchain, path: [Blockchains[blockchain].currency.address, Blockchains[blockchain].wrapped.address, '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb' ]})).toEqual(false)
    })

    it('returns true if path is ETH<>WETH', async()=>{
      expect(await exchange.pathExists({ blockchain, path: [Blockchains[blockchain].currency.address, Blockchains[blockchain].wrapped.address] })).toEqual(true)
    })

    it('returns true if path is WETH<>ETH', async()=>{
      expect(await exchange.pathExists({ blockchain, path: [Blockchains[blockchain].wrapped.address, Blockchains[blockchain].currency.address] })).toEqual(true)
    })
  })

  describe('findPath', ()=>{

    it('returns { path, exchangePath } for ETH<>WETH', async()=>{
      expect(await exchange.findPath({ blockchain, tokenIn: Blockchains[blockchain].currency.address, tokenOut: Blockchains[blockchain].wrapped.address })).toEqual({
        path: [Blockchains[blockchain].currency.address, Blockchains[blockchain].wrapped.address],
        exchangePath: [Blockchains[blockchain].currency.address, Blockchains[blockchain].wrapped.address],
      })
    })

    it('returns { path, exchangePath } for WETH<>ETH', async()=>{
      expect(await exchange.findPath({ blockchain, tokenIn: Blockchains[blockchain].wrapped.address, tokenOut: Blockchains[blockchain].currency.address })).toEqual({
        path: [Blockchains[blockchain].wrapped.address, Blockchains[blockchain].currency.address],
        exchangePath: [Blockchains[blockchain].wrapped.address, Blockchains[blockchain].currency.address],
      })
    })

    it('returns { path: undefined, exchangePath: undefined } for anything else', async()=>{
      expect(await exchange.findPath({ blockchain, tokenIn: Blockchains[blockchain].wrapped.address, tokenOut: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb' })).toEqual({
        path: undefined,
        exchangePath: undefined,
      })
    })
  })
})

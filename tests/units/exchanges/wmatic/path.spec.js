import Blockchains from '@depay/web3-blockchains'
import { find } from 'src'
import { mock, resetMocks } from '@depay/web3-mock'

describe('wmatic', () => {

  const exchange = find('polygon', 'wmatic')
  const blockchain = 'polygon'

  describe('pathExists', ()=>{

    it('returns false immediatelly if path length <= 1', async()=>{
      expect(await exchange.pathExists([CONSTANTS[blockchain].NATIVE])).toEqual(false)
    })

    it('returns false immediatelly if path length >= 3', async()=>{
      expect(await exchange.pathExists([CONSTANTS[blockchain].NATIVE, Blockchains[blockchain].wrapped.address, '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb'])).toEqual(false)
    })

    it('returns true if path is ETH<>WETH', async()=>{
      expect(await exchange.pathExists([CONSTANTS[blockchain].NATIVE, Blockchains[blockchain].wrapped.address])).toEqual(true)
    })

    it('returns true if path is WETH<>ETH', async()=>{
      expect(await exchange.pathExists([Blockchains[blockchain].wrapped.address, CONSTANTS[blockchain].NATIVE])).toEqual(true)
    })
  })

  describe('findPath', ()=>{

    it('returns { path, fixedPath } for ETH<>WETH', async()=>{
      expect(await exchange.findPath({ tokenIn: CONSTANTS[blockchain].NATIVE, tokenOut: Blockchains[blockchain].wrapped.address })).toEqual({
        path: [CONSTANTS[blockchain].NATIVE, Blockchains[blockchain].wrapped.address],
        fixedPath: [CONSTANTS[blockchain].NATIVE, Blockchains[blockchain].wrapped.address],
      })
    })

    it('returns { path, fixedPath } for WETH<>ETH', async()=>{
      expect(await exchange.findPath({ tokenIn: Blockchains[blockchain].wrapped.address, tokenOut: CONSTANTS[blockchain].NATIVE })).toEqual({
        path: [Blockchains[blockchain].wrapped.address, CONSTANTS[blockchain].NATIVE],
        fixedPath: [Blockchains[blockchain].wrapped.address, CONSTANTS[blockchain].NATIVE],
      })
    })

    it('returns { path: undefined, fixedPath: undefined } for anything else', async()=>{
      expect(await exchange.findPath({ tokenIn: Blockchains[blockchain].wrapped.address, tokenOut: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb' })).toEqual({
        path: undefined,
        fixedPath: undefined,
      })
    })
  })
})
